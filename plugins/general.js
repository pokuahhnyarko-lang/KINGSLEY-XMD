import config from "../config.js";
import { getDateTime, getDate, getTime, sleep } from "../lib/utils.js";

export const generalPlugins = [
  {
    command: ["menu", "help"],
    description: "Show bot menu",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply, plugins }) => {
      const categories = {};
      for (const p of plugins) {
        const cat = p.category || "general";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(p.command[0]);
      }
      let text = `*${config.botName} Menu*\n`;
      text += `Prefix: ${config.prefix} | Mode: ${config.botMode}\n\n`;
      for (const [cat, cmds] of Object.entries(categories)) {
        text += `*[${cat.toUpperCase()}]*\n`;
        text += cmds.map((c) => `  ${config.prefix}${c}`).join("\n") + "\n\n";
      }
      text += `\nDeveloper: ${config.developer}`;
      await reply(text);
    },
  },
  {
    command: ["ping"],
    description: "Check bot response time",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      const start = Date.now();
      await reply("Pinging...");
      const end = Date.now();
      await reply(`Pong! Response time: ${end - start}ms`);
    },
  },
  {
    command: ["time", "date"],
    description: "Get current time and date",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(`Date: ${getDate()}\nTime: ${getTime()}\nTimezone: ${config.timezone}`);
    },
  },
  {
    command: ["alive"],
    description: "Check if bot is alive",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(`*${config.botName} is Online!*\n\nVersion: ${config.version}\nDeveloper: ${config.developer}`);
    },
  },
  {
    command: ["info", "botinfo"],
    description: "Get bot information",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      const text = [
        `*${config.botName} Info*`,
        ``,
        `Name: ${config.botName}`,
        `Version: ${config.version}`,
        `Developer: ${config.developer}`,
        `Prefix: ${config.prefix}`,
        `Mode: ${config.botMode}`,
        `Platform: WhatsApp`,
        `Library: @whiskeysockets/baileys`,
        `GitHub: ${config.github}`,
      ].join("\n");
      await reply(text);
    },
  },
  {
    command: ["speed", "speedtest"],
    description: "Test bot processing speed",
    category: "general",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      const t1 = Date.now();
      for (let i = 0; i < 1e6; i++) {}
      const t2 = Date.now();
      await reply(`Speed test: ${t2 - t1}ms for 1M operations`);
    },
  },
];
