const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const AdmZip = require('adm-zip');
const chalk = require('chalk');

const SESSION_DIR = path.join(process.cwd(), 'session');

async function generateSessionId() {
  await fs.ensureDir(SESSION_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(resolve => rl.question(q, resolve));

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: ['KINGSLEY-XMD', 'Chrome', '3.0.0'],
  });

  console.log(chalk.cyan('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan('║    KINGSLEY-XMD Pair Generator   ║'));
  console.log(chalk.cyan('╚══════════════════════════════════╝\n'));

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question(chalk.yellow('Enter your WhatsApp number (with country code, e.g. 2348000000000): '));
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    console.log(chalk.blue('\nRequesting pairing code...'));
    const code = await sock.requestPairingCode(cleanNumber);
    console.log(chalk.green(`\n✅ Your pairing code: ${chalk.bold(code)}`));
    console.log(chalk.yellow('Enter this code in WhatsApp > Linked Devices > Link a Device > Link with phone number\n'));
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log(chalk.green('\n✅ Connected! Generating session ID...'));
      await saveCreds();

      // Create session zip
      const zip = new AdmZip();
      const files = await fs.readdir(SESSION_DIR);
      for (const file of files) {
        zip.addLocalFile(path.join(SESSION_DIR, file));
      }
      const sessionBase64 = `data:application/zip;base64,${zip.toBuffer().toString('base64')}`;

      console.log(chalk.cyan('\n╔══════════════════════════════════╗'));
      console.log(chalk.cyan('║         YOUR SESSION ID           ║'));
      console.log(chalk.cyan('╚══════════════════════════════════╝'));
      console.log(chalk.green('\n' + sessionBase64.substring(0, 80) + '...\n'));
      console.log(chalk.yellow('📋 Full session ID saved to: session_id.txt'));

      await fs.writeFile('session_id.txt', sessionBase64);
      console.log(chalk.green('✅ Session ID saved! Copy it to your .env as SESSION_ID\n'));

      rl.close();
      process.exit(0);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) ?
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
      if (!shouldReconnect) {
        console.log(chalk.red('Logged out.'));
        rl.close();
        process.exit(1);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

generateSessionId().catch(console.error);
