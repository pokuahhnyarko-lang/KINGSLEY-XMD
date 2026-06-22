const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const { TEMP_DIR } = require('./downloader');

async function convertToOpus(buffer) {
  const inputPath = path.join(TEMP_DIR, `in_${Date.now()}.mp3`);
  const outputPath = path.join(TEMP_DIR, `out_${Date.now()}.opus`);
  await fs.writeFile(inputPath, buffer);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .format('ogg')
      .save(outputPath)
      .on('end', async () => {
        const buf = await fs.readFile(outputPath);
        await fs.remove(inputPath);
        await fs.remove(outputPath);
        resolve(buf);
      })
      .on('error', reject);
  });
}

async function convertToMp4(buffer) {
  const inputPath = path.join(TEMP_DIR, `in_${Date.now()}.webm`);
  const outputPath = path.join(TEMP_DIR, `out_${Date.now()}.mp4`);
  await fs.writeFile(inputPath, buffer);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions('-c:v libx264')
      .outputOptions('-c:a aac')
      .save(outputPath)
      .on('end', async () => {
        const buf = await fs.readFile(outputPath);
        await fs.remove(inputPath);
        await fs.remove(outputPath);
        resolve(buf);
      })
      .on('error', reject);
  });
}

async function extractAudio(buffer) {
  const inputPath = path.join(TEMP_DIR, `in_${Date.now()}.mp4`);
  const outputPath = path.join(TEMP_DIR, `out_${Date.now()}.mp3`);
  await fs.writeFile(inputPath, buffer);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .save(outputPath)
      .on('end', async () => {
        const buf = await fs.readFile(outputPath);
        await fs.remove(inputPath);
        await fs.remove(outputPath);
        resolve(buf);
      })
      .on('error', reject);
  });
}

module.exports = { convertToOpus, convertToMp4, extractAudio };
