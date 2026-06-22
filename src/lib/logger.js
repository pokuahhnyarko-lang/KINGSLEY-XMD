const pino = require('pino');
const chalk = require('chalk');
const { LOG_LEVEL } = require('../config');

const logger = pino({
  level: LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

const banner = () => {
  console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════╗
║         KINGSLEY-XMD  v1.0.0          ║
║    Advanced WhatsApp Bot by Baileys    ║
╚═══════════════════════════════════════╝
  `));
};

module.exports = { logger, banner };
