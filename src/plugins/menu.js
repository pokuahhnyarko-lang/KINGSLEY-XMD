const { getTime, getDate, runtime } = require('../lib/utils');
const { BOT_NAME, PREFIX } = require('../config');
const os = require('os');
const now = require('performance-now');

const startTime = now();

module.exports = {
  name: 'menu',
  aliases: ['help', 'start'],
  desc: 'Show bot menu',
  category: 'general',
  async handler(sock, m, { sendReply }) {
    const uptime = runtime((now() - startTime));
    const mem = process.memoryUsage();
    const menu = `
╔══════════════════════════╗
║     *${BOT_NAME}*       ║
╚══════════════════════════╝

> *Date:* ${getDate()}
> *Time:* ${getTime()}
> *Uptime:* ${uptime}
> *RAM:* ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB

╔══════════════════════════╗
║      *GENERAL CMDS*      ║
╚══════════════════════════╝
${PREFIX}menu - Show this menu
${PREFIX}ping - Check bot speed
${PREFIX}alive - Check if bot is alive
${PREFIX}info - Bot information
${PREFIX}owner - Contact owner
${PREFIX}runtime - Bot uptime

╔══════════════════════════╗
║      *MEDIA CMDS*        ║
╚══════════════════════════╝
${PREFIX}play <song> - Play music
${PREFIX}song <name> - Download mp3
${PREFIX}video <name> - Download video
${PREFIX}tts <text> - Text to speech
${PREFIX}ytinfo <url> - YouTube info

╔══════════════════════════╗
║      *GROUP CMDS*        ║
╚══════════════════════════╝
${PREFIX}kick @user - Kick member
${PREFIX}add <number> - Add member
${PREFIX}promote @user - Make admin
${PREFIX}demote @user - Remove admin
${PREFIX}mute - Mute group
${PREFIX}unmute - Unmute group
${PREFIX}invite - Get invite link
${PREFIX}tagall - Tag all members
${PREFIX}warn @user - Warn user
${PREFIX}unwarn @user - Remove warning

╔══════════════════════════╗
║      *TOOLS CMDS*        ║
╚══════════════════════════╝
${PREFIX}sticker - Create sticker
${PREFIX}toimg - Sticker to image
${PREFIX}calc <expr> - Calculator
${PREFIX}weather <city> - Weather info
${PREFIX}tr <lang> <text> - Translate
${PREFIX}afk <reason> - Set AFK
${PREFIX}ban <number> - Ban user
${PREFIX}unban <number> - Unban user

> Powered by *${BOT_NAME}*
`.trim();
    await sendReply(sock, m, menu);
  }
};
