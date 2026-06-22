const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');
const { logger } = require('./logger');

const SESSION_DIR = path.join(process.cwd(), 'session');

async function loadSessionFromId(sessionId) {
  if (!sessionId || sessionId.trim() === '') return false;
  try {
    await fs.ensureDir(SESSION_DIR);
    // If SESSION_ID is a base64 encoded zip
    if (sessionId.startsWith('data:')) {
      const base64Data = sessionId.split(',')[1];
      const zipBuffer = Buffer.from(base64Data, 'base64');
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(SESSION_DIR, true);
      logger.info('Session loaded from SESSION_ID (zip)');
      return true;
    }
    // If it's a URL
    if (sessionId.startsWith('http')) {
      const response = await axios.get(sessionId, { responseType: 'arraybuffer' });
      const zip = new AdmZip(Buffer.from(response.data));
      zip.extractAllTo(SESSION_DIR, true);
      logger.info('Session loaded from SESSION_ID (URL)');
      return true;
    }
    return false;
  } catch (err) {
    logger.error({ err }, 'Failed to load session from SESSION_ID');
    return false;
  }
}

async function saveSessionAsZip() {
  try {
    const zip = new AdmZip();
    const files = await fs.readdir(SESSION_DIR);
    for (const file of files) {
      zip.addLocalFile(path.join(SESSION_DIR, file));
    }
    const zipBase64 = zip.toBuffer().toString('base64');
    return `data:application/zip;base64,${zipBase64}`;
  } catch (err) {
    logger.error({ err }, 'Failed to save session as zip');
    return null;
  }
}

module.exports = { loadSessionFromId, saveSessionAsZip, SESSION_DIR };
