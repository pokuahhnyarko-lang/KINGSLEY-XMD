const express = require('express');
const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const AdmZip = require('adm-zip');
const fs = require('fs-extra');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessions = new Map();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/pair', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const sessionDir = path.join(__dirname, 'tmp_sessions', cleanPhone);
  await fs.ensureDir(sessionDir);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: ['KINGSLEY-XMD', 'Chrome', '3.0.0'],
    });

    sessions.set(cleanPhone, { sock, sessionDir });

    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(cleanPhone);
      res.json({ success: true, code, message: 'Enter this code in WhatsApp > Linked Devices > Link a Device' });
    } else {
      res.json({ success: true, code: null, message: 'Already registered' });
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        await saveCreds();
        const zip = new AdmZip();
        const files = await fs.readdir(sessionDir);
        for (const file of files) {
          zip.addLocalFile(path.join(sessionDir, file));
        }
        const sessionId = `data:application/zip;base64,${zip.toBuffer().toString('base64')}`;
        sessions.set(cleanPhone + '_id', sessionId);
        setTimeout(() => fs.remove(sessionDir), 60000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    await fs.remove(sessionDir);
    res.status(500).json({ error: err.message });
  }
});

app.get('/session/:phone', (req, res) => {
  const phone = req.params.phone.replace(/[^0-9]/g, '');
  const sessionId = sessions.get(phone + '_id');
  if (!sessionId) return res.json({ ready: false, message: 'Session not ready yet, please wait...' });
  res.json({ ready: true, sessionId });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Pair site running on port ${PORT}`));
