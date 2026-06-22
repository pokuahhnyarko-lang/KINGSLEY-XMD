import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { botLog } from "./logger.js";
import config from "../config.js";

const SESSION_DIR = "./session";
const CREDS_FILE = path.join(SESSION_DIR, "creds.json");

export function ensureSessionDir() {
  if (!existsSync(SESSION_DIR)) {
    mkdirSync(SESSION_DIR, { recursive: true });
  }
}

export function hasExistingSession() {
  return existsSync(CREDS_FILE);
}

export function loadSessionFromEnv() {
  const sessionId = config.sessionId;
  if (!sessionId || sessionId.trim() === "") return false;
  try {
    ensureSessionDir();
    const decoded = Buffer.from(sessionId, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    writeFileSync(CREDS_FILE, JSON.stringify(parsed, null, 2));
    botLog.success("Session loaded from SESSION_ID env variable");
    return true;
  } catch (e) {
    botLog.warn("SESSION_ID is set but could not be decoded:", e.message);
    return false;
  }
}

export function encodeSessionToBase64() {
  try {
    if (!existsSync(CREDS_FILE)) return null;
    const creds = readFileSync(CREDS_FILE, "utf-8");
    return Buffer.from(creds).toString("base64");
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    if (existsSync(SESSION_DIR)) {
      const { rmSync } = await import("fs");
      rmSync(SESSION_DIR, { recursive: true, force: true });
    }
    ensureSessionDir();
    botLog.info("Session cleared");
  } catch (e) {
    botLog.error("Could not clear session:", e.message);
  }
}
