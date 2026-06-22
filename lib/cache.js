import NodeCache from "node-cache";

// General purpose bot cache (TTL 5 minutes)
export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Anti-spam cache (TTL 60 seconds)
export const spamCache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

// QR code / pairing state cache (TTL 2 minutes)
export const pairCache = new NodeCache({ stdTTL: 120, checkperiod: 5 });

// Track message rate per JID for anti-spam
export function checkSpam(jid, maxPerMinute = 10) {
  const key = `spam:${jid}`;
  const count = spamCache.get(key) || 0;
  if (count >= maxPerMinute) return true;
  spamCache.set(key, count + 1, 60);
  return false;
}

export default cache;
