import { config } from "../config.js";
import { isOwner, isGroup, getPhoneFromJid } from "./utils.js";

export async function sendReply(sock, msg, text) {
  const jid = msg.key.remoteJid;
  await sock.sendMessage(jid, { text }, { quoted: msg });
}

export async function sendText(sock, jid, text) {
  return await sock.sendMessage(jid, { text });
}

export async function sendImage(sock, jid, buffer, caption = "", quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { image: buffer, caption }, options);
}

export async function sendVideo(sock, jid, buffer, caption = "", quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { video: buffer, caption }, options);
}

export async function sendAudio(sock, jid, buffer, quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg" }, options);
}

export async function sendVoiceNote(sock, jid, buffer, quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/ogg; codecs=opus", ptt: true }, options);
}

export async function sendSticker(sock, jid, buffer, quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { sticker: buffer }, options);
}

export async function sendDocument(sock, jid, buffer, fileName, mimetype, quoted = null) {
  const options = quoted ? { quoted } : {};
  return await sock.sendMessage(jid, { document: buffer, fileName, mimetype }, options);
}

export async function sendReaction(sock, msg, emoji) {
  return await sock.sendMessage(msg.key.remoteJid, {
    react: { text: emoji, key: msg.key },
  });
}

export async function sendPresence(sock, jid, type = "composing") {
  await sock.sendPresenceUpdate(type, jid);
}

export function extractMessageContent(msg) {
  const content = msg.message;
  if (!content) return null;

  if (content.conversation) return { type: "text", text: content.conversation };
  if (content.extendedTextMessage) return { type: "text", text: content.extendedTextMessage.text };
  if (content.imageMessage) return { type: "image", caption: content.imageMessage.caption };
  if (content.videoMessage) return { type: "video", caption: content.videoMessage.caption };
  if (content.audioMessage) return { type: "audio" };
  if (content.stickerMessage) return { type: "sticker" };
  if (content.documentMessage) return { type: "document", fileName: content.documentMessage.fileName };
  if (content.buttonsResponseMessage) return { type: "text", text: content.buttonsResponseMessage.selectedDisplayText };
  if (content.listResponseMessage) return { type: "text", text: content.listResponseMessage.singleSelectReply?.selectedRowId };

  return null;
}

export function buildMessageContext(msg) {
  const sender = msg.key.remoteJid;
  const participant = msg.key.participant || msg.key.remoteJid;
  const pushName = msg.pushName || "Unknown";
  const isGroup_ = isGroup(sender);
  const isOwner_ = isOwner(participant);
  const body = extractMessageContent(msg);

  return {
    jid: sender,
    sender: participant,
    senderPhone: getPhoneFromJid(participant),
    pushName,
    isGroup: isGroup_,
    isOwner: isOwner_,
    body,
    key: msg.key,
    msg,
  };
}
