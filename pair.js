/**
 * KINGSLEY-XMD Pairing Server
 * Standalone Express server for generating session IDs via pairing codes or QR codes.
 * Deploy this separately on Render.com for the pair site.
 */
import express from "express";
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import NodeCache from "node-cache";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { parsePhoneNumberFromString } from "libphonenumber-js";
import config from "./config.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const SESSION_DIR = "./pair-session";
const msgRetryCounterCache = new NodeCache();

let pairState = {
  status: "disconnected",
  qr: null,
  pairingCode: null,
  phone: null,
  connectedAt: null,
  sessionId: null,
};
let sock = null;
let sockStarted = false;

async function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function encodeSession() {
  const credsPath = path.join(SESSION_DIR, "creds.json");
  if (!existsSync(credsPath)) return null;
  const creds = readFileSync(credsPath, "utf-8");
  return Buffer.from(creds).toString("base64");
}

async function startPairSock(phoneForCode = null) {
  if (sockStarted) return;
  sockStarted = true;

  await ensureDir(SESSION_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    msgRetryCounterCache,
    browser: ["KINGSLEY-XMD", "Chrome", "1.0.0"],
    printQRInTerminal: !phoneForCode,
  });

  sock.ev.on("creds.update", saveCreds);

  // If phone given, request pairing code
  if (phoneForCode && !sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneForCode);
        pairState.pairingCode = code;
        pairState.phone = phoneForCode;
        console.log(`Pairing code for ${phoneForCode}: ${code}`);
      } catch (e) {
        console.error("Pairing code error:", e.message);
      }
    }, 3000);
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      pairState.qr = qr;
      pairState.status = "pending";
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      pairState.status = "disconnected";
      sockStarted = false;
      sock = null;
      if (statusCode !== DisconnectReason.loggedOut) {
        setTimeout(() => startPairSock(), 3000);
      }
    }

    if (connection === "open") {
      pairState.status = "connected";
      pairState.connectedAt = new Date().toISOString();
      pairState.phone = sock.user?.id?.split(":")[0] || pairState.phone;
      const sessionId = encodeSession();
      pairState.sessionId = sessionId;
      console.log("Connected! Session ID generated.");
    }
  });
}

// ---- API Routes ----

app.post("/api/pair/code", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const cleaned = phone.replace(/\D/g, "");
  const parsed = parsePhoneNumberFromString(`+${cleaned}`);
  if (!parsed || !parsed.isValid()) {
    return res.status(400).json({ error: "Invalid phone number. Use international format." });
  }

  const jid = `${cleaned}@s.whatsapp.net`;

  // Reset state for fresh pairing
  if (sockStarted && sock) {
    try { await sock.end(); } catch {}
    sockStarted = false;
    sock = null;
  }
  if (existsSync(SESSION_DIR)) rmSync(SESSION_DIR, { recursive: true, force: true });
  pairState = { status: "connecting", qr: null, pairingCode: null, phone: cleaned, connectedAt: null, sessionId: null };

  startPairSock(cleaned).catch(console.error);

  // Wait up to 10s for code
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (pairState.pairingCode) break;
  }

  if (!pairState.pairingCode) {
    return res.status(500).json({ error: "Could not generate pairing code. Try again." });
  }

  return res.json({ code: pairState.pairingCode, phone: cleaned, expiresIn: 120 });
});

app.get("/api/pair/status", (req, res) => {
  res.json({
    status: pairState.status,
    phone: pairState.phone || null,
    sessionId: pairState.sessionId || null,
    connectedAt: pairState.connectedAt || null,
  });
});

app.get("/api/pair/qr", (req, res) => {
  if (!pairState.qr) return res.status(404).json({ error: "No QR code available yet. Start pairing first." });
  res.json({ qr: pairState.qr });
});

app.get("/api/pair/session", (req, res) => {
  if (!pairState.sessionId) return res.status(404).json({ error: "No active session. Pair first." });
  res.json({ sessionId: pairState.sessionId, phone: pairState.phone || null });
});

app.post("/api/pair/disconnect", async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    sockStarted = false;
    if (existsSync(SESSION_DIR)) rmSync(SESSION_DIR, { recursive: true, force: true });
    pairState = { status: "disconnected", qr: null, pairingCode: null, phone: null, connectedAt: null, sessionId: null };
    res.json({ success: true, message: "Disconnected and session cleared." });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

app.get("/api/bot/stats", (req, res) => {
  res.json({
    status: pairState.status === "connected" ? "online" : pairState.status === "connecting" ? "connecting" : "offline",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    messagesHandled: 0,
    developer: "KINGSLEY-XMD",
    botName: "KINGSLEY-XMD",
    version: "2.0.0",
    phone: pairState.phone || null,
    connectedAt: pairState.connectedAt || null,
  });
});

app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = parseInt(process.env.PAIR_PORT || process.env.PORT || "5000");
const startTime = Date.now();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`KINGSLEY-XMD Pair Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to pair`);
});
