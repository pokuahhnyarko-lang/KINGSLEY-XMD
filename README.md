# KINGSLEY-XMD — Advanced WhatsApp Bot

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Developer-KINGSLEY--XMD-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Library-Baileys-25D366?style=flat-square" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square" />
</p>

An extreme, powerful and advanced WhatsApp bot built with [@whiskeysockets/baileys](https://github.com/whiskeysockets/baileys).

---

## Deploy in One Click

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KINGSLEY-XMD/KINGSLEY-XMD)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/KINGSLEY-XMD/KINGSLEY-XMD)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KINGSLEY-XMD/KINGSLEY-XMD)

---

## Features

- **WhatsApp Pairing** — pair via pairing code or QR code
- **Session Management** — encoded session ID for easy re-deployment
- **Plugin System** — extensible command architecture
- **100+ Commands** across categories:
  - General (menu, ping, alive, info, time)
  - Downloader (YouTube audio/video, TikTok, Instagram)
  - Fun (jokes, facts, quotes, 8ball, dice, calculator)
  - Media (image search, TTS, sticker converter, memes)
  - Group (kick, add, promote, demote, tagall, mute)
  - Owner (stats, session, setprefix, setmode, restart)
- **Anti-Spam** protection
- **Auto-Read & Auto-Typing** indicators
- **Multi-platform deployment** (Render, Railway, Heroku, Katabump, Koyebu)

---

## Quick Start

### 1. Get Your Session ID

Visit the **[Pair Site](https://kingsley-xmd-pair.onrender.com)** to pair your WhatsApp and get a session ID.

### 2. Deploy the Bot

Click one of the deploy buttons above, then set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_ID` | ✅ | Base64 session from pair site |
| `OWNER_NUMBER` | ✅ | Your WhatsApp number (no +) |
| `PREFIX` | ✅ | Command prefix (default: `.`) |
| `BOT_NAME` | ❌ | Bot display name |
| `BOT_MODE` | ❌ | `public` or `private` |
| `AUTO_READ` | ❌ | Auto-read messages (default: `true`) |
| `TIMEZONE` | ❌ | Your timezone (default: `Africa/Lagos`) |

### 3. That's it!

Send `.menu` to your bot to see all available commands.

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/KINGSLEY-XMD/KINGSLEY-XMD.git
cd KINGSLEY-XMD

# Install dependencies
npm install

# Copy env template
cp .env.example .env

# Edit .env with your settings
nano .env

# Start the pair server (first run)
npm run pair

# After pairing, start the bot
npm start
```

---

## Commands

| Command | Description |
|---------|-------------|
| `.menu` | Show all commands |
| `.ping` | Check response time |
| `.alive` | Check bot status |
| `.ytmp3 <song>` | Download YouTube audio |
| `.ytmp4 <video>` | Download YouTube video |
| `.tiktok <url>` | Download TikTok video |
| `.ig <url>` | Download Instagram post |
| `.image <query>` | Search and send image |
| `.sticker` | Convert image to sticker |
| `.tts <text>` | Text to speech |
| `.joke` | Random joke |
| `.fact` | Random fun fact |
| `.8ball <q>` | Magic 8-ball |
| `.tagall` | Tag all group members |
| `.kick @user` | Kick group member |
| `.stats` | Bot statistics |
| `.getsession` | Get session ID (owner only) |

---

## Developer

**KINGSLEY-XMD**  
GitHub: [github.com/KINGSLEY-XMD](https://github.com/KINGSLEY-XMD)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
