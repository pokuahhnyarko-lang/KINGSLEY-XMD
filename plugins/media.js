import gis from "g-i-s";
import axios from "axios";
import { sendReply, sendImage, sendSticker } from "../lib/message.js";
import { promisify } from "util";

const searchGoogle = promisify(gis);

async function imageSearch(query) {
  return new Promise((resolve, reject) => {
    gis(query, (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
}

export const mediaPlugins = [
  {
    command: ["image", "img", "photo"],
    description: "Search and send an image",
    category: "media",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const query = args.join(" ");
      if (!query) return reply("Usage: .image <search query>");
      try {
        await reply("Searching for image...");
        const results = await imageSearch(query);
        if (!results.length) return reply("No images found.");
        const imageUrl = results[0].url;
        const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(res.data);
        await sendImage(sock, jid, buffer, query, msg);
      } catch (e) {
        await reply(`Error: ${e.message}`);
      }
    },
  },
  {
    command: ["tts", "speak"],
    description: "Convert text to speech",
    category: "media",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const text = args.join(" ");
      if (!text) return reply("Usage: .tts <text>");
      try {
        const { default: gTTS } = await import("gtts");
        const fileName = `/tmp/tts_${Date.now()}.mp3`;
        await new Promise((resolve, reject) => {
          const tts = new gTTS(text, "en");
          tts.save(fileName, (err) => (err ? reject(err) : resolve()));
        });
        const { readFileSync, unlinkSync } = await import("fs");
        const buffer = readFileSync(fileName);
        unlinkSync(fileName);
        await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
      } catch (e) {
        await reply(`TTS Error: ${e.message}`);
      }
    },
  },
  {
    command: ["sticker", "s"],
    description: "Convert image/video to sticker",
    category: "media",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imageMsg) return reply("Reply to an image to convert to sticker.");
      try {
        const buffer = await sock.downloadMediaMessage(
          quoted ? { message: quoted } : msg,
          "buffer"
        );
        await sendSticker(sock, jid, buffer, msg);
      } catch (e) {
        await reply(`Error creating sticker: ${e.message}`);
      }
    },
  },
  {
    command: ["meme"],
    description: "Get a random meme",
    category: "media",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      try {
        const res = await axios.get("https://meme-api.com/gimme");
        const meme = res.data;
        const imageRes = await axios.get(meme.url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(imageRes.data);
        await sendImage(sock, jid, buffer, meme.title, msg);
      } catch (e) {
        await reply(`Could not fetch meme: ${e.message}`);
      }
    },
  },
];
