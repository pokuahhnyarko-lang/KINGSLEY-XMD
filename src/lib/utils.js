const moment = require('moment-timezone');
const { parsePhoneNumber } = require('libphonenumber-js');
const now = require('performance-now');
const { TIMEZONE } = require('../config');

function getTime() {
  return moment().tz(TIMEZONE).format('HH:mm:ss');
}

function getDate() {
  return moment().tz(TIMEZONE).format('DD/MM/YYYY');
}

function getDateTime() {
  return moment().tz(TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
}

function runtime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

function formatPhone(number) {
  try {
    const parsed = parsePhoneNumber('+' + number.replace(/[^0-9]/g, ''));
    return parsed.formatInternational();
  } catch {
    return number;
  }
}

function isValidPhone(number) {
  try {
    const parsed = parsePhoneNumber('+' + number.replace(/[^0-9]/g, ''));
    return parsed.isValid();
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function truncate(str, len = 100) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

module.exports = {
  getTime, getDate, getDateTime, runtime, formatPhone,
  isValidPhone, sleep, randomChoice, truncate, bytesToSize, now,
};
