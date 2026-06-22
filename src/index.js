const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  PHONENUMBER_MCC,
} = require('@whiskeysockets/baileys');

const path = require('path');
const fs = require('fs-extra');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const express = require('express');
const chalk = require('chalk');

const { logger, banner } = require('./lib/logger');
const { loadSessionFromId, SESSION_DIR } = require('./lib/session');
const { loadPlugins, messageHandler } = require('./handler');
const { msgRetryCache } = require('./lib/cache');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'running', bot: config.BOT_NAME, uptime: process.uptime() });
});

const store = makeInMemoryStore({
  logger: pino({ level: 'silent' }),
});

let sock;
let qr;
let connectionState = 'close';

async function startBot() {
  banner();

  // Load session from SESSION_ID if available
  await loadSessionFromId(config.SESSION_ID);

  await fs.ensureDir(SESSION_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Using Baileys v${version.join('.')}`);

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    msgRetryCounterCache: msgRetryCache,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    browser: ['KINGSLEY-XMD', 'Chrome', '3.0.0'],
  });

  store.bind(sock.ev);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr: qrCode } = update;

    if (qrCode) {
      qr = qrCode;
      connectionState = 'qr';
      const qrTerminal = require('qrcode-terminal');
      qrTerminal.generate(qrCode, { small: true });
      logger.info(chalk.yellow('Scan the QR code above with WhatsApp'));
    }

    if (connection === 'close') {
      connectionState = 'close';
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) ?
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
      logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      } else {
        logger.error('Logged out. Please re-authenticate.');
        process.exit(1);
      }
    }

    if (connection === 'open') {
      connectionState = 'open';
      qr = null;
      logger.info(chalk.green(`✅ ${config.BOT_NAME} connected to WhatsApp!`));
      loadPlugins();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      await messageHandler(sock, m);
    }
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action === 'add') {
      for (const jid of participants) {
        const name = jid.split('@')[0];
        await sock.sendMessage(id, {
          text: `👋 Welcome @${name} to the group!\nEnjoy your stay 🎉`,
          mentions: [jid],
        });
      }
    } else if (action === 'remove') {
      for (const jid of participants) {
        const name = jid.split('@')[0];
        await sock.sendMessage(id, { text: `👋 Goodbye @${name}!`, mentions: [jid] });
      }
    }
  });

  return sock;
}

// HTTP Server for health checks and QR display
app.get('/qr', (req, res) => {
  if (connectionState === 'open') {
    return res.json({ status: 'connected', message: 'Bot is already connected' });
  }
  if (!qr) {
    return res.json({ status: 'waiting', message: 'QR not yet generated, please wait...' });
  }
  res.json({ status: 'qr', qr });
});

app.get('/status', (req, res) => {
  res.json({ status: connectionState, bot: config.BOT_NAME });
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  logger.info(chalk.blue(`🌐 HTTP server running on port ${PORT}`));
});

startBot().catch(err => {
  logger.error({ err }, 'Failed to start bot');
  process.exit(1);
});
