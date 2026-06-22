require('dotenv').config();

module.exports = {
  SESSION_ID: process.env.SESSION_ID || '',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '',
  BOT_NAME: process.env.BOT_NAME || 'KINGSLEY-XMD',
  PREFIX: process.env.PREFIX || '.',
  TIMEZONE: process.env.TIMEZONE || 'Africa/Lagos',
  AUTO_READ: process.env.AUTO_READ === 'true',
  AUTO_TYPING: process.env.AUTO_TYPING === 'true',
  AUTO_RECORDING: process.env.AUTO_RECORDING === 'true',
  ANTI_SPAM: process.env.ANTI_SPAM === 'true',
  WARN_COUNT: parseInt(process.env.WARN_COUNT || '3'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: parseInt(process.env.PORT || '3000'),
};
