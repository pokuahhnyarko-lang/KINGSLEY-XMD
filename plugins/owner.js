import { sendReply, sendText } from "../lib/message.js";
import { encodeSessionToBase64 } from "../lib/session.js";
import { formatUptime } from "../lib/utils.js";
import config from "../config.js";
import os from "os";
import performanceNow from "performance-now";

const startTime = performanceNow();

export const ownerPlugins = [
  {
    command: ["owner", "dev"],
    description: "Show bot owner information",
    category: "owner",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      const text = `*KINGSLEY-XMD Bot Owner*\n\nDeveloper: ${config.developer}\nContact: wa.me/${config.ownerNumber}\nGitHub: ${config.github}`;
      await reply(text);
    },
  },
  {
    command: ["getsession", "session"],
    description: "Get current session ID",
    category: "owner",
    ownerOnly: true,
    handler: async (sock, msg, { sendReply: reply }) => {
      const sessionId = encodeSessionToBase64();
      if (!sessionId) return reply("No active session found.");
      await reply(`*Session ID:*\n\`\`\`\n${sessionId}\n\`\`\`\n\nKeep this safe — do not share!`);
    },
  },
  {
    command: ["stats", "uptime"],
    description: "Show bot statistics",
    category: "owner",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      const uptimeMs = performanceNow() - startTime;
      const uptimeSec = Math.floor(uptimeMs / 1000);
      const text = [
        `*${config.botName} Stats*`,
        ``,
        `Uptime: ${formatUptime(uptimeSec)}`,
        `Platform: ${os.platform()}`,
        `Node: ${process.version}`,
        `Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        `CPU: ${os.cpus()[0]?.model || "Unknown"}`,
        `Developer: ${config.developer}`,
        `Version: ${config.version}`,
      ].join("\n");
      await reply(text);
    },
  },
  {
    command: ["restart"],
    description: "Restart the bot",
    category: "owner",
    ownerOnly: true,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply("Restarting bot...");
      process.exit(0);
    },
  },
  {
    command: ["setprefix"],
    description: "Change command prefix",
    category: "owner",
    ownerOnly: true,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      if (!args[0]) return reply("Usage: .setprefix <prefix>");
      config.prefix = args[0];
      await reply(`Prefix changed to: ${args[0]}`);
    },
  },
  {
    command: ["setmode"],
    description: "Change bot mode (public/private)",
    category: "owner",
    ownerOnly: true,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      const mode = args[0]?.toLowerCase();
      if (!["public", "private"].includes(mode)) return reply("Usage: .setmode public|private");
      config.botMode = mode;
      await reply(`Bot mode set to: ${mode}`);
    },
  },
];
