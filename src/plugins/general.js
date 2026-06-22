const { getDateTime, runtime, bytesToSize } = require('../lib/utils');
const { BOT_NAME, OWNER_NUMBER, PREFIX } = require('../config');
const os = require('os');
const now = require('performance-now');
const startTime = now();

module.exports = [
  {
    name: 'ping',
    aliases: ['speed'],
    desc: 'Check bot response speed',
    category: 'general',
    async handler(sock, m, { sendReply }) {
      const start = now();
      await sendReply(sock, m, '🏓 Pinging...');
      const end = now();
      await sendReply(sock, m, `🏓 *Pong!*\n⚡ Speed: ${(end - start).toFixed(2)}ms`);
    }
  },
  {
    name: 'alive',
    aliases: ['bot'],
    desc: 'Check if bot is alive',
    category: 'general',
    async handler(sock, m, { sendReply }) {
      await sendReply(sock, m, `✅ *${BOT_NAME}* is alive and running!\n🕐 ${getDateTime()}`);
    }
  },
  {
    name: 'info',
    aliases: ['botinfo'],
    desc: 'Bot information',
    category: 'general',
    async handler(sock, m, { sendReply }) {
      const mem = process.memoryUsage();
      const info = `
╔══════════════════════════╗
║       *BOT INFO*         ║
╚══════════════════════════╝

🤖 *Name:* ${BOT_NAME}
👤 *Owner:* ${OWNER_NUMBER}
⚙️ *Prefix:* ${PREFIX}
📅 *Date:* ${getDateTime()}
⏱️ *Uptime:* ${runtime((now() - startTime))}
💾 *RAM:* ${bytesToSize(mem.heapUsed)} / ${bytesToSize(os.totalmem())}
💻 *Platform:* ${os.platform()} ${os.arch()}
🟢 *Node.js:* ${process.version}
`.trim();
      await sendReply(sock, m, info);
    }
  },
  {
    name: 'owner',
    aliases: ['dev', 'creator'],
    desc: 'Get owner contact',
    category: 'general',
    async handler(sock, m, { sendReply, sendContact }) {
      await sendContact(sock, m.key.remoteJid, BOT_NAME + ' Owner', OWNER_NUMBER);
      await sendReply(sock, m, `📞 *Owner:* wa.me/${OWNER_NUMBER}`);
    }
  },
  {
    name: 'runtime',
    aliases: ['uptime'],
    desc: 'Check bot uptime',
    category: 'general',
    async handler(sock, m, { sendReply }) {
      await sendReply(sock, m, `⏱️ *Uptime:* ${runtime((now() - startTime))}`);
    }
  },
  {
    name: 'calc',
    aliases: ['calculate', 'math'],
    desc: 'Calculator',
    category: 'tools',
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}calc <expression>\nExample: ${PREFIX}calc 5*5+2`);
      try {
        const expr = args.join(' ').replace(/[^0-9+\-*/().% ]/g, '');
        const result = Function('"use strict"; return (' + expr + ')')();
        await sendReply(sock, m, `🧮 *${expr}* = *${result}*`);
      } catch {
        await sendReply(sock, m, '❌ Invalid expression!');
      }
    }
  },
];
