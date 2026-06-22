# 🤖 KINGSLEY-XMD

<p align="center">
  <img src="https://img.shields.io/badge/WhatsApp%20Bot-KINGSLEY--XMD-25d366?style=for-the-badge&logo=whatsapp&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Baileys-Powered-128c7e?style=for-the-badge"/>
  <img src="https://img.shields.io/github/stars/Pokuahhnyarko-lang/KINGSLEY-XMD?style=for-the-badge&color=gold"/>
</p>

<p align="center">
  <b>Advanced, feature-packed WhatsApp Bot built with @whiskeysockets/baileys</b><br/>
  Music downloads • Group management • Anti-spam • TTS • Translator • And much more
</p>

---

## ✨ Features

| Category | Commands |
|---|---|
| 🎵 Music | `.play`, `.song`, `.video`, `.ytsearch` |
| 👥 Groups | `.kick`, `.add`, `.promote`, `.demote`, `.mute`, `.unmute`, `.invite`, `.tagall`, `.warn`, `.groupinfo` |
| 🛡️ Protection | Anti-spam, warn system, ban/unban |
| 🌐 Tools | `.weather`, `.tr` (translate), `.calc`, `.imgsearch` |
| 🔊 Media | `.tts` (text-to-speech), `.sticker` |
| 💤 AFK | `.afk` with auto-notification |
| ℹ️ General | `.menu`, `.ping`, `.alive`, `.info`, `.owner`, `.runtime` |

---

## 🚀 Quick Deploy

### 1. Get Your Session ID

Visit the **[Pair Site](https://kingsley-xmd.netlify.app)** or run locally:

```bash
npm run pair
```

### 2. Deploy to Your Platform

| Platform | Button |
|---|---|
| **Render** (Free) | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Pokuahhnyarko-lang/KINGSLEY-XMD) |
| **Railway** (Free) | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Pokuahhnyarko-lang/KINGSLEY-XMD) |
| **Heroku** | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Pokuahhnyarko-lang/KINGSLEY-XMD) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Pokuahhnyarko-lang/KINGSLEY-XMD) |
| **Katabump** | See [Katabump Setup](#katabump-setup) below |

---

## 🔧 Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- ffmpeg installed on system

### Installation

```bash
# Clone the repo
git clone https://github.com/Pokuahhnyarko-lang/KINGSLEY-XMD
cd KINGSLEY-XMD

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Edit .env with your details
nano .env

# Start the bot
npm start
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_ID` | ✅ | Your WhatsApp session (from pair site) |
| `OWNER_NUMBER` | ✅ | Your number with country code e.g. `2348012345678` |
| `BOT_NAME` | ❌ | Bot name (default: `KINGSLEY-XMD`) |
| `PREFIX` | ❌ | Command prefix (default: `.`) |
| `TIMEZONE` | ❌ | Timezone (default: `Africa/Lagos`) |
| `AUTO_READ` | ❌ | Auto read messages (default: `true`) |
| `AUTO_TYPING` | ❌ | Show typing indicator (default: `true`) |
| `ANTI_SPAM` | ❌ | Enable anti-spam (default: `true`) |
| `WARN_COUNT` | ❌ | Warnings before kick (default: `3`) |

---

## 📋 Pairing Guide

### Method 1: Pair Site (Recommended)
1. Visit the pair site
2. Enter your WhatsApp number with country code
3. Enter the 8-digit code shown into WhatsApp → Linked Devices → Link with phone number
4. Copy your Session ID
5. Paste it as `SESSION_ID` in your deployment

### Method 2: Terminal
```bash
npm run pair
```
Follow the on-screen prompts.

---

## 🚀 Platform Setup Guides

### Render
1. Fork this repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub and select this repo
4. Set environment variables in the Render dashboard
5. Deploy!

### Railway
1. Fork this repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your forked repo
4. Add environment variables in Variables tab
5. Railway auto-deploys!

### Heroku
1. Click the Heroku button above
2. Fill in your environment variables
3. Click Deploy
4. Go to Resources → Enable the web dyno

### Netlify
1. Fork this repo
2. Click the Netlify button above (best for the pair/deploy site frontend)
3. Configure env vars in Site Settings → Environment Variables

### Katabump Setup
1. Go to [katabump.com](https://katabump.com)
2. Create a new Node.js project
3. Upload the repo files or connect GitHub
4. Set your environment variables
5. Set start command to `node src/index.js`

---

## 📁 Project Structure

```
KINGSLEY-XMD/
├── src/
│   ├── index.js          # Bot entry point
│   ├── handler.js        # Message handler & command loader
│   ├── config.js         # Configuration
│   ├── pair.js           # Session pairing script
│   ├── lib/
│   │   ├── logger.js     # Logging
│   │   ├── session.js    # Session management
│   │   ├── cache.js      # Node-cache instances
│   │   ├── store.js      # Persistent data store
│   │   ├── utils.js      # Utility functions
│   │   ├── message.js    # Message helpers
│   │   ├── downloader.js # YouTube downloader
│   │   ├── tts.js        # Text-to-speech
│   │   └── ffmpeg.js     # FFmpeg utilities
│   └── plugins/
│       ├── menu.js       # Menu command
│       ├── general.js    # General commands
│       ├── media.js      # Music/video commands
│       ├── group.js      # Group management
│       └── tools.js      # Utility tools
├── pair-site/            # Web pairing interface
├── deploy-site/          # Deployment guide site
├── public/               # Bot status page
├── .env.example          # Environment template
├── render.yaml           # Render config
├── railway.toml          # Railway config
├── app.json              # Heroku config
├── netlify.toml          # Netlify config
└── Procfile              # Process config
```

---

## 🛠️ Adding Custom Commands

Create a new file in `src/plugins/`:

```js
module.exports = {
  name: 'hello',
  aliases: ['hi', 'hey'],
  desc: 'Say hello',
  category: 'custom',
  async handler(sock, m, { sendReply, args }) {
    await sendReply(sock, m, `Hello! You said: ${args.join(' ')}`);
  }
};
```

Restart the bot — it auto-loads all plugins!

---

## 📜 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Developer

**KINGSLEY-XMD** — Built with ❤️

> ⭐ Star this repo if you find it useful!
