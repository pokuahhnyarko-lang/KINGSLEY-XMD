const { KeyedDB } = require('@adiwajshing/keyed-db');
const fs = require('fs-extra');
const path = require('path');

const STORE_PATH = path.join(process.cwd(), 'store.json');

class BotStore {
  constructor() {
    this.data = {
      chats: {},
      contacts: {},
      messages: {},
      groups: {},
      warnings: {},
      banned: [],
      afk: {},
      settings: {},
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        this.data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      }
    } catch {}
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2));
    } catch {}
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  get(key) {
    return this.data[key];
  }

  addWarning(jid) {
    if (!this.data.warnings[jid]) this.data.warnings[jid] = 0;
    this.data.warnings[jid]++;
    this.save();
    return this.data.warnings[jid];
  }

  clearWarnings(jid) {
    delete this.data.warnings[jid];
    this.save();
  }

  getWarnings(jid) {
    return this.data.warnings[jid] || 0;
  }

  ban(jid) {
    if (!this.data.banned.includes(jid)) {
      this.data.banned.push(jid);
      this.save();
    }
  }

  unban(jid) {
    this.data.banned = this.data.banned.filter(b => b !== jid);
    this.save();
  }

  isBanned(jid) {
    return this.data.banned.includes(jid);
  }

  setAfk(jid, reason) {
    this.data.afk[jid] = { reason, time: Date.now() };
    this.save();
  }

  removeAfk(jid) {
    delete this.data.afk[jid];
    this.save();
  }

  isAfk(jid) {
    return this.data.afk[jid] || null;
  }
}

module.exports = new BotStore();
