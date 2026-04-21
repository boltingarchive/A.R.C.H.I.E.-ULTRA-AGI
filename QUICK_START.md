# A.R.C.H.I.E. Quick Start Guide

## ⚡ Launch in 30 Seconds

```bash
npm install
npm run dev
```

Your dashboard is live at `http://localhost:5173/`

---

## 🎙 First Time Setup

1. **Allow Microphone Access** — Click "Allow" when browser asks
2. **Enable Always-Listening** — Click the 🎤 button in header
3. **Say Your First Command** — Try: *"Archie, show me finance"*
4. **Hear Archie Respond** — Volume should turn on 🔊

---

## 📝 Voice Commands Cheat Sheet

| Command | Action |
|---------|--------|
| "Show me [World/Finance/Tech/Region]" | Opens sector |
| "I'm a woman" | Switches to "Ma'am" protocol |
| "Summarize" | (In World sector) Reads news aloud |
| "Settings" | Opens settings panel |
| "Help" | Opens documentation |

---

## 🎮 6 Sectors at a Glance

### 🌍 WORLD
- **3D rotating globe** with pulsing hotspots
- Real-time global news feeds
- Click any headline → AI summarizes + reads aloud
- **"Show me world"** to open

### 📈 FINANCE
- Live crypto prices from CoinGecko
- Financial news from Yahoo Finance
- Market trends and volatility
- **"Show me finance"** to open

### 🧪 TECH
- Hacker News top stories
- Points + comments per story
- List/Grid toggle view
- **"Show me tech"** to open

### 🚩 REGION
- BBC/NYT regional feeds
- Region filter tabs
- Local news aggregation
- **"Show me region"** to open

### 🖥 MAINFRAME
- AI query engine (15 requests/10 min limit)
- Watch real-time reasoning steps
- Rate limit counter + cooldown timer
- Ask: *"What is Bitcoin?"*
- **"Show me mainframe"** to open

### ⚙️ SETTINGS
- Dark/Light mode toggle
- Voice speed & pitch sliders
- Persona (Sir/Ma'am) selector
- System info display

---

## 🎯 Must-Try Features

### 1. Click a News Story
```
World Sector → Click BBC headline → SUMMARIZE button → Hear Archie read it
```

### 2. Ask the Mainframe
```
Mainframe → Type: "What's the relationship between AI and jobs?"
→ Watch reasoning steps → Get answer + vocal response
```

### 3. Trigger Priority Alert
```
World Sector → Look for "Breakthrough" in headlines
→ Red glow overlay + Archie says "PRIORITY ALERT!"
```

### 4. Watch Galaxy Nodes
```
Say any multi-word phrase (e.g., "bitcoin market crash")
→ Watch 3 glowing nodes appear in central galaxy
→ Nodes pulse and connect
```

### 5. Adjust Voice Settings
```
Settings → Voice Speed slider → Hear Archie say "Test" faster/slower
Settings → Voice Pitch slider → Make Archie sound higher/lower
```

---

## 🔌 What's Working

✅ **Voice Recognition** — Speak naturally, Archie listens  
✅ **Voice Synthesis** — Archie talks back to you  
✅ **News Summaries** — Click any headline, get AI summary + voice  
✅ **AI Reasoning** — Ask complex questions in Mainframe  
✅ **Rate Limiting** — 15 requests per 10 minutes (shown in UI)  
✅ **Priority Alerts** — Red screen + vocal warning on keywords  
✅ **Galaxy Visualization** — Every keyword creates a glowing node  
✅ **3D Globe** — Rotating world with pulsing hotspots  
✅ **Settings** — Customize voice & theme  

---

## ⚠️ Common Issues & Fixes

### "Archie won't listen"
- Check browser permissions (microphone)
- Try a different browser (Chrome recommended)
- Make sure WiFi is stable
- Refresh page and try again

### "No voice output"
- Check volume isn't muted
- Enable Voice in Settings
- Make sure TTS is available in your region

### "Rate limit says 0 requests"
- Wait 10 minutes for window to reset
- Or refresh page (counter resets in localStorage)

### "Mainframe shows 'fallback mode'"
- Puter.js AI module is loading
- Wait 3–5 seconds and try again
- Check internet connectivity

### "News headlines not loading"
- RSS feeds may be temporarily unavailable
- Try refreshing World sector
- Check network tab in DevTools

---

## 🎨 UI Shortcuts

| Element | Interaction |
|---------|------------|
| 🎤 Header Button | Toggle Always-Listening |
| 🔊 Header Button | Toggle Voice Output |
| Sector Tile | Click to open full-screen sector |
| News Item | Click to expand + summarize |
| ⚙️ Icon | Open Settings |
| X Button | Close modal |
| Outside Modal | Click to close |

---

## 📊 Dashboard Zones

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo | Listening | Voice | Status          │
├──────────────────────┬────────────────────────────────┤
│   Galaxy Map         │  Sector Tiles (2x3 grid)       │
│   (Starfield +       │  - World                       │
│    Pulsing Nodes)    │  - Finance                     │
│                      │  - Tech                        │
│                      │  - Region                      │
│                      │  - Mainframe                   │
│                      │  - Settings                    │
├──────────────────────┴────────────────────────────────┤
│  System Status Bar: Voice | Listen | Nodes | Time    │
├─────────────────────────────────────────────────────┤
│  Thinking Terminal: Logs | Transcript | Live Status  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Explore all 6 sectors** — Each has unique data
2. **Try voice commands** — Talk to it like a smart assistant
3. **Ask Mainframe complex questions** — Test reasoning engine
4. **Customize settings** — Adjust voice to your preference
5. **Read the full README** — For technical details

---

## 💾 Data & Privacy

- All voice processing is **local** (no cloud logging)
- No mandatory signup or accounts
- News data from public, free APIs
- Rate limiter stored in your browser (localStorage)
- **Zero tracking, zero analytics**

---

## 🔗 Links

- **Full README** → `README.md`
- **System Check** → `SYSTEM_CHECK.md`
- **License** → `LICENSE` (MIT)
- **GitHub Issues** → Report bugs

---

## 🎯 TL;DR

1. Enable listening 🎤
2. Say *"Show me Finance"*
3. Click a news headline
4. Click *"SUMMARIZE"*
5. Listen to Archie read it aloud
6. Go to Mainframe & ask a question
7. Watch AI think in real-time
8. Enjoy a $0 intelligence dashboard

---

**Welcome to the future of dashboards. 🚀**

Made with ⚡ intelligence.
