import pino from "pino";
import chalk from "chalk";
import config from "../config.js";

export const logger = pino({
  level: config.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

export const botLog = {
  info: (msg, ...args) => console.log(chalk.cyan(`[INFO] ${msg}`), ...args),
  success: (msg, ...args) => console.log(chalk.green(`[OK] ${msg}`), ...args),
  warn: (msg, ...args) => console.log(chalk.yellow(`[WARN] ${msg}`), ...args),
  error: (msg, ...args) => console.log(chalk.red(`[ERROR] ${msg}`), ...args),
  debug: (msg, ...args) => {
    if (config.logLevel === "debug") {
      console.log(chalk.gray(`[DEBUG] ${msg}`), ...args);
    }
  },
  banner: () => {
    console.log(chalk.green(`
╔═══════════════════════════════════╗
║         KINGSLEY-XMD BOT         ║
║     Advanced WhatsApp Bot         ║
║     Developer: KINGSLEY-XMD       ║
║     Version: 2.0.0                ║
╚═══════════════════════════════════╝
    `));
  },
};

export default logger;
