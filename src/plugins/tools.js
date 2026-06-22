const store = require('../lib/store');
const { PREFIX } = require('../config');
const axios = require('axios');
const { getDateTime } = require('../lib/utils');
const gis = require('g-i-s');

module.exports = [
  {
    name: 'ban',
    aliases: [],
    desc: 'Ban a user from using the bot',
    category: 'tools',
    ownerOnly: true,
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}ban <number>`);
      const jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      store.ban(jid);
      await sendReply(sock, m, `✅ Banned ${args[0]} from using the bot.`);
    }
  },
  {
    name: 'unban',
    aliases: [],
    desc: 'Unban a user',
    category: 'tools',
    ownerOnly: true,
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}unban <number>`);
      const jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      store.unban(jid);
      await sendReply(sock, m, `✅ Unbanned ${args[0]}.`);
    }
  },
  {
    name: 'afk',
    aliases: [],
    desc: 'Set AFK status',
    category: 'tools',
    async handler(sock, m, { sendReply, args, sender }) {
      const reason = args.join(' ') || 'No reason';
      store.setAfk(sender, reason);
      await sendReply(sock, m, `💤 You are now AFK\n📝 Reason: ${reason}`);
    }
  },
  {
    name: 'weather',
    aliases: ['w'],
    desc: 'Get weather information',
    category: 'tools',
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}weather <city>`);
      const city = args.join(' ');
      try {
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
        await sendReply(sock, m, `🌤️ *Weather:*\n${res.data}`);
      } catch {
        await sendReply(sock, m, '❌ Could not fetch weather data.');
      }
    }
  },
  {
    name: 'tr',
    aliases: ['translate'],
    desc: 'Translate text',
    category: 'tools',
    async handler(sock, m, { sendReply, args }) {
      if (args.length < 2) return sendReply(sock, m, `Usage: ${PREFIX}tr <lang> <text>\nExample: ${PREFIX}tr es Hello world`);
      const lang = args[0];
      const text = args.slice(1).join(' ');
      try {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
        const translated = res.data[0].map(t => t[0]).join('');
        await sendReply(sock, m, `🌐 *Translated to ${lang}:*\n${translated}`);
      } catch {
        await sendReply(sock, m, '❌ Translation failed.');
      }
    }
  },
  {
    name: 'imgsearch',
    aliases: ['img'],
    desc: 'Search for images',
    category: 'tools',
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}imgsearch <query>`);
      const query = args.join(' ');
      gis(query, async (err, results) => {
        if (err || !results || !results.length) return sendReply(sock, m, '❌ No images found.');
        try {
          const res = await axios.get(results[0].url, { responseType: 'arraybuffer' });
          await sock.sendMessage(m.key.remoteJid, {
            image: Buffer.from(res.data),
            caption: `🖼️ *${query}*`
          }, { quoted: m });
        } catch {
          await sendReply(sock, m, `🖼️ Image: ${results[0].url}`);
        }
      });
    }
  },
  {
    name: 'datetime',
    aliases: ['time', 'date'],
    desc: 'Get current date and time',
    category: 'tools',
    async handler(sock, m, { sendReply }) {
      await sendReply(sock, m, `📅 *Date & Time*\n${getDateTime()}`);
    }
  },
];
