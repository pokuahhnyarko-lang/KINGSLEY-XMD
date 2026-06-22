const { searchYoutube, downloadYoutubeAudio, downloadYoutubeVideo, searchMusic } = require('../lib/downloader');
const { textToSpeech } = require('../lib/tts');
const { sendAudio, sendVideo, sendReply } = require('../lib/message');
const { PREFIX } = require('../config');

module.exports = [
  {
    name: 'play',
    aliases: ['music', 'song'],
    desc: 'Play/download a song',
    category: 'media',
    async handler(sock, m, { args, sendReply: reply }) {
      if (!args[0]) return reply(sock, m, `Usage: ${PREFIX}play <song name>`);
      const query = args.join(' ');
      await reply(sock, m, `🔍 Searching for *${query}*...`);
      try {
        const results = await searchYoutube(query);
        if (!results.length) return reply(sock, m, '❌ No results found.');
        const top = results[0];
        await reply(sock, m, `🎵 Found: *${top.title}*\n⏱️ Duration: ${top.duration}\n👁️ Views: ${top.views}\n⬇️ Downloading...`);
        const buffer = await downloadYoutubeAudio(top.url);
        await sendAudio(sock, m.key.remoteJid, buffer, false);
      } catch (err) {
        await reply(sock, m, `❌ Error: ${err.message}`);
      }
    }
  },
  {
    name: 'video',
    aliases: ['ytvideo'],
    desc: 'Download a YouTube video',
    category: 'media',
    async handler(sock, m, { args, sendReply: reply }) {
      if (!args[0]) return reply(sock, m, `Usage: ${PREFIX}video <video name>`);
      const query = args.join(' ');
      await reply(sock, m, `🔍 Searching for *${query}*...`);
      try {
        const results = await searchYoutube(query);
        if (!results.length) return reply(sock, m, '❌ No results found.');
        const top = results[0];
        await reply(sock, m, `🎬 Found: *${top.title}*\n⬇️ Downloading...`);
        const buffer = await downloadYoutubeVideo(top.url);
        await sendVideo(sock, m.key.remoteJid, buffer, top.title);
      } catch (err) {
        await reply(sock, m, `❌ Error: ${err.message}`);
      }
    }
  },
  {
    name: 'tts',
    aliases: ['speak'],
    desc: 'Text to speech',
    category: 'media',
    async handler(sock, m, { args, sendReply: reply }) {
      if (!args[0]) return reply(sock, m, `Usage: ${PREFIX}tts <text>`);
      const text = args.join(' ');
      try {
        const buffer = await textToSpeech(text);
        await sendAudio(sock, m.key.remoteJid, buffer, true);
      } catch (err) {
        await reply(sock, m, `❌ TTS Error: ${err.message}`);
      }
    }
  },
  {
    name: 'ytsearch',
    aliases: ['yts'],
    desc: 'Search YouTube',
    category: 'media',
    async handler(sock, m, { args, sendReply: reply }) {
      if (!args[0]) return reply(sock, m, `Usage: ${PREFIX}ytsearch <query>`);
      const query = args.join(' ');
      try {
        const results = await searchYoutube(query);
        if (!results.length) return reply(sock, m, '❌ No results found.');
        const text = results.map((v, i) =>
          `${i + 1}. *${v.title}*\n⏱️ ${v.duration} | 👁️ ${v.views}\n🔗 ${v.url}`
        ).join('\n\n');
        await reply(sock, m, `🔍 *YouTube Results:*\n\n${text}`);
      } catch (err) {
        await reply(sock, m, `❌ Error: ${err.message}`);
      }
    }
  },
];
