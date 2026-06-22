import dotenv from "dotenv";
dotenv.config();

export const config = {
  botName: process.env.BOT_NAME || "KINGSLEY-XMD",
  developer: "KINGSLEY-XMD",
  version: "2.0.0",
  prefix: process.env.PREFIX || ".",
  ownerNumber: process.env.OWNER_NUMBER || "",
  sessionId: process.env.SESSION_ID || "",
  botMode: process.env.BOT_MODE || "public",
  autoRead: process.env.AUTO_READ !== "false",
  autoTyping: process.env.AUTO_TYPING !== "false",
  autoRecording: process.env.AUTO_RECORDING === "true",
  antiSpam: parseInt(process.env.ANTI_SPAM || "10"),
  timezone: process.env.TIMEZONE || "Africa/Lagos",
  logLevel: process.env.LOG_LEVEL || "info",
  pairPort: parseInt(process.env.PAIR_PORT || "5000"),
  github: "https://github.com/KINGSLEY-XMD/KINGSLEY-XMD",
  supportGroup: "https://chat.whatsapp.com/KINGSLEY-XMD",
  thumbnail: "https://raw.githubusercontent.com/KINGSLEY-XMD/KINGSLEY-XMD/main/assets/thumbnail.jpg",
  wm: "KINGSLEY-XMD © 2024",
  readyMessage: `
╔══════════════════════════╗
║     KINGSLEY-XMD BOT     ║
║   Developer: KINGSLEY    ║
║   Version: 2.0.0         ║
╚══════════════════════════╝

> Bot is now Online!
> Prefix: ${process.env.PREFIX || "."}
> Mode: ${process.env.BOT_MODE || "public"}
`,
};

export default config;
