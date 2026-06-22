const gTTS = require('gtts');
const path = require('path');
const fs = require('fs-extra');
const { TEMP_DIR } = require('./downloader');

async function textToSpeech(text, lang = 'en') {
  const filename = path.join(TEMP_DIR, `tts_${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    const gtts = new gTTS(text, lang);
    gtts.save(filename, (err) => {
      if (err) return reject(err);
      fs.readFile(filename).then(buffer => {
        fs.remove(filename);
        resolve(buffer);
      }).catch(reject);
    });
  });
}

module.exports = { textToSpeech };
