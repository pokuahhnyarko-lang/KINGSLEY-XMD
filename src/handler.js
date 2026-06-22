const { PREFIX, AUTO_READ, AUTO_TYPING, OWNER_NUMBER, ANTI_SPAM } = require('./config');
const { logger } = require('./lib/logger');
const { sendReply, sendMessage, sendContact, sendReaction } = require('./lib/message');
const store = require('./lib/store');
const { antiSpamCache } = require('./lib/cache');
const path = require('path');
const fs = require('fs-extra');

const commands = new Map();

function loadPlugins() {
  const pluginDir = path.join(__dirname, 'plugins');
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const plugin = require(path.join(pluginDir, file));
      const cmds = Array.isArray(plugin) ? plugin : [plugin];
      for (const cmd of cmds) {
        commands.set(cmd.name, cmd);
        if (cmd.aliases) cmd.aliases.forEach(a => commands.set(a, cmd));
      }
      logger.info(`Loaded plugin: ${file}`);
    } catch (err) {
      logger.error({ err }, `Failed to load plugin: ${file}`);
    }
  }
  logger.info(`Total commands loaded: ${commands.size}`);
}

function extractText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.documentMessage?.caption ||
    ''
  );
}

async function messageHandler(sock, m) {
  try {
    if (!m.message || m.key.fromMe) return;

    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const isGroup = jid.endsWith('@g.us');
    const body = extractText(m);
    const isOwner = sender.includes(OWNER_NUMBER);

    // Auto read
    if (AUTO_READ) {
      await sock.readMessages([m.key]);
    }

    // Check banned
    if (store.isBanned(sender) && !isOwner) return;

    // Check AFK mention
    if (isGroup) {
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      for (const jid of mentioned) {
        const afk = store.isAfk(jid);
        if (afk) {
          const diff = Math.floor((Date.now() - afk.time) / 1000);
          await sendReply(sock, m, `💤 @${jid.split('@')[0]} is AFK\n📝 Reason: ${afk.reason}\n⏱️ Since: ${diff}s ago`);
        }
      }
      // Remove AFK if person sends a message
      const senderAfk = store.isAfk(sender);
      if (senderAfk) {
        store.removeAfk(sender);
        await sendReply(sock, m, `✅ Welcome back @${sender.split('@')[0]}! AFK removed.`);
      }
    }

    // Anti-spam check
    if (ANTI_SPAM && !isOwner) {
      const spamKey = `spam_${sender}`;
      const spamCount = antiSpamCache.get(spamKey) || 0;
      if (spamCount >= 10) {
        return;
      }
      antiSpamCache.set(spamKey, spamCount + 1);
    }

    if (!body.startsWith(PREFIX)) return;

    // Auto typing
    if (AUTO_TYPING) {
      await sock.sendPresenceUpdate('composing', jid);
    }

    const args = body.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) {
      await sock.sendPresenceUpdate('available', jid);
      return;
    }

    // Permission checks
    if (command.ownerOnly && !isOwner) {
      await sendReply(sock, m, '❌ This command is for the owner only!');
      await sock.sendPresenceUpdate('available', jid);
      return;
    }

    if (command.groupOnly && !isGroup) {
      await sendReply(sock, m, '❌ This command can only be used in groups!');
      await sock.sendPresenceUpdate('available', jid);
      return;
    }

    if (command.adminOnly && isGroup) {
      const meta = await sock.groupMetadata(jid);
      const isAdmin = meta.participants.find(p => p.id === sender && p.admin);
      if (!isAdmin && !isOwner) {
        await sendReply(sock, m, '❌ This command is for group admins only!');
        await sock.sendPresenceUpdate('available', jid);
        return;
      }
    }

    // Execute command
    logger.info({ command: commandName, sender, jid }, 'Command executed');
    await command.handler(sock, m, {
      args,
      sender,
      isGroup,
      isOwner,
      mentioned: m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
      sendReply,
      sendMessage,
      sendContact,
      sendReaction,
    });

    await sock.sendPresenceUpdate('available', jid);

  } catch (err) {
    logger.error({ err }, 'Handler error');
  }
}

module.exports = { loadPlugins, messageHandler, commands };
