const ytSearch = require('yt-search');
const youtubedl = require('youtubedl-core');
const youtubeMusicApi = require('node-youtube-music');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const TEMP_DIR = path.join(process.cwd(), 'temp');
fs.ensureDirSync(TEMP_DIR);

async function searchYoutube(query) {
  const result = await ytSearch(query);
  return result.videos.slice(0, 5).map(v => ({
    title: v.title,
    url: v.url,
    duration: v.timestamp,
    views: v.views,
    thumbnail: v.thumbnail,
    author: v.author.name,
  }));
}

async function downloadYoutubeAudio(url) {
  const filename = path.join(TEMP_DIR, `audio_${Date.now()}.mp3`);
  await new Promise((resolve, reject) => {
    youtubedl(url, {
      output: filename,
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0,
    }).on('end', resolve).on('error', reject);
  });
  const buffer = await fs.readFile(filename);
  await fs.remove(filename);
  return buffer;
}

async function downloadYoutubeVideo(url) {
  const filename = path.join(TEMP_DIR, `video_${Date.now()}.mp4`);
  await new Promise((resolve, reject) => {
    youtubedl(url, {
      output: filename,
      format: 'mp4',
      quality: '18',
    }).on('end', resolve).on('error', reject);
  });
  const buffer = await fs.readFile(filename);
  await fs.remove(filename);
  return buffer;
}

async function searchMusic(query) {
  try {
    const results = await youtubeMusicApi.searchMusics(query);
    return results.slice(0, 5);
  } catch {
    return [];
  }
}

async function downloadFile(url, ext = 'bin') {
  const filename = path.join(TEMP_DIR, `file_${Date.now()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(filename, response.data);
  return { buffer: Buffer.from(response.data), path: filename };
}

module.exports = {
  searchYoutube, downloadYoutubeAudio, downloadYoutubeVideo,
  searchMusic, downloadFile, TEMP_DIR
};
