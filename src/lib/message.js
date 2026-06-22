const { generateWAMessageFromContent, proto, generateWAMessage } = require('@whiskeysockets/baileys');

async function sendReply(sock, m, text) {
  return sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
}

async function sendMessage(sock, jid, text) {
  return sock.sendMessage(jid, { text });
}

async function sendImage(sock, jid, buffer, caption = '') {
  return sock.sendMessage(jid, { image: buffer, caption });
}

async function sendVideo(sock, jid, buffer, caption = '') {
  return sock.sendMessage(jid, { video: buffer, caption });
}

async function sendAudio(sock, jid, buffer, ptt = false) {
  return sock.sendMessage(jid, { audio: buffer, ptt, mimetype: 'audio/mpeg' });
}

async function sendDocument(sock, jid, buffer, filename, mimetype = 'application/octet-stream') {
  return sock.sendMessage(jid, { document: buffer, filename, mimetype });
}

async function sendSticker(sock, jid, buffer) {
  return sock.sendMessage(jid, { sticker: buffer });
}

async function sendContact(sock, jid, name, number) {
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
  return sock.sendMessage(jid, { contacts: { displayName: name, contacts: [{ vcard }] } });
}

async function sendReaction(sock, m, emoji) {
  return sock.sendMessage(m.key.remoteJid, {
    react: { text: emoji, key: m.key }
  });
}

module.exports = {
  sendReply, sendMessage, sendImage, sendVideo,
  sendAudio, sendDocument, sendSticker, sendContact, sendReaction
};
