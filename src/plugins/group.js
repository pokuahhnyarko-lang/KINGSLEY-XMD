const store = require('../lib/store');
const { PREFIX, WARN_COUNT } = require('../config');

function jidNormalize(jid) {
  return jid.includes('@') ? jid : jid + '@s.whatsapp.net';
}

module.exports = [
  {
    name: 'kick',
    aliases: ['remove'],
    desc: 'Kick a member from group',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, mentioned }) {
      const targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || mentioned || [];
      if (!targets.length) return sendReply(sock, m, `Usage: ${PREFIX}kick @user`);
      for (const jid of targets) {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [jid], 'remove');
      }
      await sendReply(sock, m, `✅ Kicked ${targets.length} member(s).`);
    }
  },
  {
    name: 'add',
    aliases: [],
    desc: 'Add a member to group',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, args }) {
      if (!args[0]) return sendReply(sock, m, `Usage: ${PREFIX}add <number>`);
      const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      try {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [number], 'add');
        await sendReply(sock, m, `✅ Added ${args[0]}.`);
      } catch (err) {
        await sendReply(sock, m, `❌ Failed to add: ${err.message}`);
      }
    }
  },
  {
    name: 'promote',
    aliases: ['admin'],
    desc: 'Promote member to admin',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, mentioned }) {
      const targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || mentioned || [];
      if (!targets.length) return sendReply(sock, m, `Usage: ${PREFIX}promote @user`);
      await sock.groupParticipantsUpdate(m.key.remoteJid, targets, 'promote');
      await sendReply(sock, m, `✅ Promoted ${targets.length} member(s) to admin.`);
    }
  },
  {
    name: 'demote',
    aliases: [],
    desc: 'Demote admin to member',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, mentioned }) {
      const targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || mentioned || [];
      if (!targets.length) return sendReply(sock, m, `Usage: ${PREFIX}demote @user`);
      await sock.groupParticipantsUpdate(m.key.remoteJid, targets, 'demote');
      await sendReply(sock, m, `✅ Demoted ${targets.length} member(s).`);
    }
  },
  {
    name: 'mute',
    aliases: [],
    desc: 'Mute group (admins only)',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply }) {
      await sock.groupSettingUpdate(m.key.remoteJid, 'announcement');
      await sendReply(sock, m, '🔇 Group muted. Only admins can send messages.');
    }
  },
  {
    name: 'unmute',
    aliases: ['open'],
    desc: 'Unmute group',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply }) {
      await sock.groupSettingUpdate(m.key.remoteJid, 'not_announcement');
      await sendReply(sock, m, '🔊 Group unmuted. Everyone can send messages.');
    }
  },
  {
    name: 'invite',
    aliases: ['link'],
    desc: 'Get group invite link',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply }) {
      const code = await sock.groupInviteCode(m.key.remoteJid);
      await sendReply(sock, m, `🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
    }
  },
  {
    name: 'tagall',
    aliases: ['everyone', 'all'],
    desc: 'Tag all group members',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, args }) {
      const meta = await sock.groupMetadata(m.key.remoteJid);
      const members = meta.participants.map(p => p.id);
      const message = args.join(' ') || '📢 Attention everyone!';
      const text = message + '\n\n' + members.map(j => `@${j.split('@')[0]}`).join(' ');
      await sock.sendMessage(m.key.remoteJid, { text, mentions: members });
    }
  },
  {
    name: 'warn',
    aliases: [],
    desc: 'Warn a member',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, mentioned }) {
      const targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || mentioned || [];
      if (!targets.length) return sendReply(sock, m, `Usage: ${PREFIX}warn @user`);
      for (const jid of targets) {
        const count = store.addWarning(jid);
        if (count >= WARN_COUNT) {
          await sock.groupParticipantsUpdate(m.key.remoteJid, [jid], 'remove');
          store.clearWarnings(jid);
          await sendReply(sock, m, `⛔ @${jid.split('@')[0]} has been kicked after ${WARN_COUNT} warnings.`);
        } else {
          await sendReply(sock, m, `⚠️ *Warning ${count}/${WARN_COUNT}* for @${jid.split('@')[0]}`);
        }
      }
    }
  },
  {
    name: 'unwarn',
    aliases: [],
    desc: 'Remove warnings from a member',
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, m, { sendReply, mentioned }) {
      const targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || mentioned || [];
      if (!targets.length) return sendReply(sock, m, `Usage: ${PREFIX}unwarn @user`);
      for (const jid of targets) {
        store.clearWarnings(jid);
        await sendReply(sock, m, `✅ Warnings cleared for @${jid.split('@')[0]}`);
      }
    }
  },
  {
    name: 'groupinfo',
    aliases: ['ginfo'],
    desc: 'Group information',
    category: 'group',
    groupOnly: true,
    async handler(sock, m, { sendReply }) {
      const meta = await sock.groupMetadata(m.key.remoteJid);
      const admins = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(', ');
      await sendReply(sock, m, `
📋 *Group Info*
─────────────
🏷️ *Name:* ${meta.subject}
👥 *Members:* ${meta.participants.length}
👑 *Admins:* ${admins}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}
📝 *Description:* ${meta.desc || 'None'}
      `.trim());
    }
  },
];
