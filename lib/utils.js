import { parsePhoneNumberFromString } from "libphonenumber-js";
import moment from "moment-timezone";
import config from "../config.js";

export function formatPhone(phone) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const parsed = parsePhoneNumberFromString(cleaned.startsWith("+") ? cleaned : `+${cleaned}`);
  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${phone}`);
  }
  return parsed.number.replace("+", "") + "@s.whatsapp.net";
}

export function getJidFromPhone(phone) {
  return formatPhone(phone);
}

export function getPhoneFromJid(jid) {
  return jid.split("@")[0];
}

export function isGroup(jid) {
  return jid.endsWith("@g.us");
}

export function isOwner(jid) {
  const phone = getPhoneFromJid(jid);
  return phone === config.ownerNumber;
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export function getTime() {
  return moment().tz(config.timezone).format("HH:mm:ss");
}

export function getDate() {
  return moment().tz(config.timezone).format("DD/MM/YYYY");
}

export function getDateTime() {
  return moment().tz(config.timezone).format("DD/MM/YYYY HH:mm:ss");
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseArgs(text, prefix) {
  const body = text.startsWith(prefix) ? text.slice(prefix.length).trim() : text.trim();
  const [cmd, ...args] = body.split(/\s+/);
  return { cmd: cmd.toLowerCase(), args, body: args.join(" ") };
}

export function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

export function base64ToBuffer(b64) {
  return Buffer.from(b64, "base64");
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
