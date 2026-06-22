import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import NodeCache from "node-cache";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

import config from "./config.js";
import { botLog } from "./lib/logger.js";
import { hasExistingSession, loadSessionFromEnv, ensureSessionDir } from "./lib/session.js";
import { checkSpam } from "./lib/cache.js";
import { buildMessageContext, sendReply, sendPresence } from "./lib/message.js";
import { parseArgs, isOwner, isGroup, sleep } from "./lib/utils.js";

// Load all plugins
import { ownerPlugins } from "./plugins/owner.js";
import { generalPlugins } from "./plugins/general.js";
import { downloaderPlugins } from "./plugins/downloader.js";
import { funPlugins } from "./plugins/fun.js";
import { groupPlugins } from "./plugins/group.js";
import { mediaPlugins } from "./plugins/media.js";

const ALL_PLUGINS = [
  ...ownerPlugins,
  ...generalPlugins,
  ...downloaderPlugins,
  ...funPlugins,
  ...groupPlugins,
  ...mediaPlugins,
];

const msgRetryCounterCache = new NodeCache();

let botStats = {
  messagesHandled: 0,
  startedAt: new Date().toISOString(),
  status: "connecting",
  phone: null,
};

export function getStats() {
  return {
    ...botStats,
    uptime: Math.floor((Date.now() - new Date(botStats.startedAt).getTime()) / 1000),
  };
}

export let globalSock = null;
export let pairState = {
  status: "disconnected",
  qr: null,
  pairingCode: null,
  phone: null,
  connectedAt: null,
};

async function startBot() {
  botLog.banner();

  ensureSessionDir();

  // Try to load session from env var first
  if (!hasExistingSession()) {
    const loaded = loadSessionFromEnv();
    if (!loaded) {
      botLog.warn("No session found. Start pair.js to get a session ID first.");
      botLog.info("Or set SESSION_ID in your .env file.");
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  botLog.info(`Baileys version: ${version.join(".")} | Latest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    browser: ["KINGSLEY-XMD", "Chrome", "1.0.0"],
  });

  globalSock = sock;
  pairState.status = "connecting";
  botStats.status = "connecting";

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      pairState.qr = qr;
      pairState.status = "pending";
      botLog.info("QR Code updated — scan with WhatsApp");
      const { default: qrTerminal } = await import("qrcode-terminal");
      qrTerminal.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      botLog.warn(`Connection closed. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);

      pairState.status = "disconnected";
      pairState.qr = null;
      botStats.status = "offline";
      globalSock = null;

      if (shouldReconnect) {
        botLog.info("Reconnecting in 5 seconds...");
        await sleep(5000);
        startBot();
      } else {
        botLog.error("Logged out. Delete the session folder and restart.");
        process.exit(1);
      }
    }

    if (connection === "open") {
      botLog.success("WhatsApp connected!");
      pairState.status = "connected";
      pairState.connectedAt = new Date().toISOString();
      pairState.phone = sock.user?.id?.split(":")[0] || null;
      botStats.status = "online";
      botStats.phone = pairState.phone;
      console.log(chalk.green(config.readyMessage));
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      const ctx = buildMessageContext(msg);
      if (!ctx.body) continue;
      if (ctx.body.type !== "text") continue;

      const text = ctx.body.text || "";
      if (!text.startsWith(config.prefix)) continue;

      const { cmd, args, body: argBody } = parseArgs(text, config.prefix);

      // Anti-spam
      if (checkSpam(ctx.sender, config.antiSpam)) {
        await sock.sendMessage(ctx.jid, { text: "Slow down! You are sending messages too fast." });
        continue;
      }

      // Find plugin
      const plugin = ALL_PLUGINS.find((p) => p.command.includes(cmd));
      if (!plugin) continue;

      // Checks
      if (plugin.ownerOnly && !ctx.isOwner) {
        await sendReply(sock, msg, "This command is owner-only.");
        continue;
      }
      if (plugin.groupOnly && !ctx.isGroup) {
        await sendReply(sock, msg, "This command can only be used in groups.");
        continue;
      }
      if (config.botMode === "private" && !ctx.isOwner) {
        await sendReply(sock, msg, "Bot is in private mode. Only owner can use commands.");
        continue;
      }

      if (plugin.adminOnly && ctx.isGroup) {
        const groupMeta = await sock.groupMetadata(ctx.jid);
        const isAdmin = groupMeta.participants.find((p) => p.id === ctx.sender)?.admin;
        if (!isAdmin && !ctx.isOwner) {
          await sendReply(sock, msg, "This command requires admin privileges.");
          continue;
        }
      }

      // Auto-typing / recording
      if (config.autoTyping) {
        await sendPresence(sock, ctx.jid, plugin.category === "media" ? "recording" : "composing");
      }
      if (config.autoRead) {
        await sock.readMessages([msg.key]);
      }

      botStats.messagesHandled++;

      try {
        await plugin.handler(sock, msg, {
          args,
          body: argBody,
          jid: ctx.jid,
          sender: ctx.sender,
          isOwner: ctx.isOwner,
          isGroup: ctx.isGroup,
          pushName: ctx.pushName,
          plugins: ALL_PLUGINS,
          sendReply: (text) => sendReply(sock, msg, text),
          msg,
        });
      } catch (e) {
        botLog.error(`Plugin error [${cmd}]: ${e.message}`);
        await sendReply(sock, msg, `Error: ${e.message}`);
      }

      if (config.autoTyping) {
        await sendPresence(sock, ctx.jid, "paused");
      }
    }
  });
}

startBot().catch((e) => {
  botLog.error("Fatal error:", e.message);
  process.exit(1);
});
