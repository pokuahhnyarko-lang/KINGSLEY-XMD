import ytSearch from "yt-search";
import axios from "axios";
import { sendReply, sendAudio, sendVideo } from "../lib/message.js";
import config from "../config.js";

async function searchYoutube(query) {
  const result = await ytSearch(query);
  return result.videos.slice(0, 5);
}

async function downloadFromUrl(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

export const downloaderPlugins = [
  {
    command: ["yts", "ytsearch"],
    description: "Search YouTube",
    category: "downloader",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      const query = args.join(" ");
      if (!query) return reply("Usage: .yts <query>");
      try {
        await reply("Searching YouTube...");
        const videos = await searchYoutube(query);
        if (!videos.length) return reply("No results found.");
        let text = `*YouTube Search: ${query}*\n\n`;
        videos.forEach((v, i) => {
          text += `${i + 1}. *${v.title}*\n`;
          text += `   Channel: ${v.author.name}\n`;
          text += `   Duration: ${v.duration.timestamp}\n`;
          text += `   URL: ${v.url}\n\n`;
        });
        await reply(text);
      } catch (e) {
        await reply(`Error: ${e.message}`);
      }
    },
  },
  {
    command: ["ytmp3", "ytaudio", "song"],
    description: "Download YouTube audio",
    category: "downloader",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const query = args.join(" ");
      if (!query) return reply("Usage: .ytmp3 <song name or URL>");
      try {
        await reply("Searching and downloading audio...");
        const videos = await searchYoutube(query);
        if (!videos.length) return reply("No results found.");
        const video = videos[0];
        await reply(`Found: *${video.title}*\nDownloading...`);
        const apiUrl = `https://api.nexoracle.com/downloader/ytmp3?apikey=free_key&url=${encodeURIComponent(video.url)}`;
        const res = await axios.get(apiUrl);
        if (!res.data?.result?.download_url) return reply("Could not get download URL. Try again.");
        const audioBuffer = await downloadFromUrl(res.data.result.download_url);
        await sendAudio(sock, jid, audioBuffer, msg);
        await reply(`*${video.title}*\nDuration: ${video.duration.timestamp}\nChannel: ${video.author.name}`);
      } catch (e) {
        await reply(`Download failed: ${e.message}`);
      }
    },
  },
  {
    command: ["ytmp4", "ytvideo"],
    description: "Download YouTube video",
    category: "downloader",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const query = args.join(" ");
      if (!query) return reply("Usage: .ytmp4 <video name or URL>");
      try {
        await reply("Searching and downloading video...");
        const videos = await searchYoutube(query);
        if (!videos.length) return reply("No results found.");
        const video = videos[0];
        if (video.duration.seconds > 600) return reply("Video too long (max 10 minutes).");
        await reply(`Found: *${video.title}*\nDownloading...`);
        const apiUrl = `https://api.nexoracle.com/downloader/ytmp4?apikey=free_key&url=${encodeURIComponent(video.url)}`;
        const res = await axios.get(apiUrl);
        if (!res.data?.result?.download_url) return reply("Could not get download URL.");
        const videoBuffer = await downloadFromUrl(res.data.result.download_url);
        await sendVideo(sock, jid, videoBuffer, video.title, msg);
      } catch (e) {
        await reply(`Download failed: ${e.message}`);
      }
    },
  },
  {
    command: ["tiktok", "tt"],
    description: "Download TikTok video (no watermark)",
    category: "downloader",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const url = args[0];
      if (!url || !url.includes("tiktok")) return reply("Usage: .tiktok <tiktok url>");
      try {
        await reply("Downloading TikTok video...");
        const apiUrl = `https://api.nexoracle.com/downloader/tiktok?apikey=free_key&url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);
        if (!res.data?.result?.download_url) return reply("Could not download. Try again.");
        const buffer = await downloadFromUrl(res.data.result.download_url);
        await sendVideo(sock, jid, buffer, "TikTok Video", msg);
      } catch (e) {
        await reply(`Error: ${e.message}`);
      }
    },
  },
  {
    command: ["instagram", "ig"],
    description: "Download Instagram post/reel",
    category: "downloader",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      const url = args[0];
      if (!url || !url.includes("instagram")) return reply("Usage: .ig <instagram url>");
      try {
        await reply("Downloading Instagram content...");
        const apiUrl = `https://api.nexoracle.com/downloader/instagram?apikey=free_key&url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);
        if (!res.data?.result) return reply("Could not download. Check the URL.");
        const buffer = await downloadFromUrl(res.data.result.download_url);
        await sendVideo(sock, jid, buffer, "Instagram Reel", msg);
      } catch (e) {
        await reply(`Error: ${e.message}`);
      }
    },
  },
];
