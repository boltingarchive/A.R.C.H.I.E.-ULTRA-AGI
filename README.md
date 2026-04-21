# A.R.C.H.I.E. — Autonomous Reasoning & Comprehensive High Intelligence Engine

> *A high-end, open-source agentic intelligence dashboard. Zero sign-up. Zero paywalls. Pure browser-native intelligence.*

---

## 🎯 What is A.R.C.H.I.E.?

A.R.C.H.I.E. is a **real-time intelligence command center** designed to aggregate global news, financial markets, tech breakthroughs, and regional insights—all while maintaining a two-way conversation with you. It combines voice control, agentic reasoning, semantic visualization, and priority alerts into a single, unified dashboard.

**No mandatory login. No API keys required. Just open it and talk to it.**

### Core Features

✅ **Voice Control** — Always-listening mode. Speak naturally to navigate sectors, ask questions, trigger commands  
✅ **AI Summarization** — Click any news story; A.R.C.H.I.E. summarizes and reads it back to you  
✅ **Agentic Mainframe** — Full-screen terminal powered by Puter.js/Gemini. Rate-limited to 15 requests per 10 minutes  
✅ **Semantic Galaxy Map** — Every keyword you mention creates a glowing node. Watch your thoughts visualized in real time  
✅ **Priority Alerts** — If data contains "Crash", "Crisis", or "Breakthrough", Archie triggers a red HUD overlay + verbal warning  
✅ **6 Dynamic Sectors** — World (Globe), Finance (Crypto), Tech (Hacker News), Region (Local), Mainframe (AI), Settings  
✅ **Glassmorphic UI** — Cyber-aesthetic with neon blue (#00d2ff) and violet (#9d50bb) accents  
✅ **Thought Terminal** — Real-time internal logs showing Archie's reasoning ("Analyzing sentiment...", "Synthesizing response...")  

---

## 🛠 Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| **Frontend** | React 18 + TypeScript + Vite | Free |
| **Styling** | Tailwind CSS + Framer Motion | Free |
| **Voice** | Web Speech API (STT & TTS) | Free |
| **AI Engine** | Puter.js (Gemini) | Free (tier) |
| **Database** | Supabase | Free (tier) |
| **Icons** | Lucide React | Free |
| **Fonts** | Google Fonts (Inter + JetBrains Mono) | Free |

**Total operational cost: $0.00 USD**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Modern browser with Web Speech API support (Chrome, Edge, Safari 15+)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/archie-engine.git
cd archie-engine

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:5173/`

---

## 🎮 How to Use A.R.C.H.I.E.

### Voice Commands

Enable **Always-Listening** mode in the header. Then try:

- **"Archie, show me Finance"** → Opens the Finance sector
- **"Archie, show me Tech"** → Switches to Tech news
- **"I am a woman"** → Changes protocol to "Ma'am" (default is "Sir")
- **"Crash in markets"** → Triggers priority alert if keywords detected

### Clicking News

1. Go to **World**, **Finance**, **Tech**, or **Region** sector
2. Click any news headline
3. A.R.C.H.I.E. will **summarize it in 1-2 sentences** and **read it aloud**

### The Mainframe

1. Click the **MAINFRAME** tile
2. Type a complex question (e.g., "What is the relationship between Bitcoin and inflation?")
3. Watch the **Reasoning Steps** stream in the terminal as Archie thinks
4. Get back a synthesized answer + verbal delivery
5. Limited to **15 requests per 10 minutes** to maintain free-tier stability

### Settings

- **Dark Mode** — Toggle light/dark theme
- **Persona** — Switch between "Sir" and "Ma'am" protocols
- **Voice Speed** — Adjust TTS playback speed (0.5x to 2.0x)
- **Voice Pitch** — Fine-tune TTS tone (0.5 to 2.0)
- **Voice On/Off** — Toggle text-to-speech
- **Listening On/Off** — Toggle speech recognition

---

## 🏗 Architecture

### Components Structure

```
src/
├── components/
│   ├── GalaxyMap.tsx         # Central semantic visualization with animated nodes
│   ├── SectorTile.tsx         # 6 sector tiles with glassmorphic design
│   ├── ThinkingTerminal.tsx   # Real-time log output + live transcript
│   ├── PriorityAlert.tsx      # Red HUD overlay for critical keywords
│   └── sectors/
│       ├── WorldSector.tsx    # 3D rotating globe + live news + AI summarization
│       ├── FinanceSector.tsx  # CoinGecko crypto markets + Yahoo Finance
│       ├── TechSector.tsx     # Hacker News top stories
│       ├── RegionSector.tsx   # BBC/NYT RSS regional feeds
│       ├── MainframeSector.tsx # Puter.js AI engine with rate limiting
│       └── SettingsSector.tsx # UI config + voice tuning
├── hooks/
│   ├── useVoice.ts            # Web Speech API wrapper
│   ├── useRateLimit.ts        # Client-side rate limiter (15 req/10 min)
│   └── useArchieState.ts      # Global state + command parsing
├── utils/
│   ├── newsApi.ts             # RSS & API data fetchers
│   └── aiSummarize.ts         # Puter.js summarization wrapper
├── types/
│   └── index.ts               # TypeScript definitions
└── App.tsx                    # Main orchestrator
```

### Data Flow

```
User Voice Input
    ↓
useVoice (Web Speech API)
    ↓
handleTranscript → useArchieState
    ↓
Command Parser (extract keywords, gender, sector)
    ↓
Visual Feedback:
  • Galaxy nodes pulse
  • Thinking Terminal logs update
  • Priority alerts trigger
  • Sectors open
  ↓
Voice Output (speechSynthesis API)
```

---

## 🔐 Privacy & Security

- **No cloud logging** — All voice data is processed locally
- **No tracking** — Zero analytics, zero telemetry
- **Open source** — Audit the code yourself
- **RLS enabled** — Supabase tables use Row Level Security (future expansion)

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Obsidian | #050505 | Background |
| Neon Blue | #00d2ff | Primary accent, borders, glows |
| Violet | #9d50bb | Secondary accent |
| Green | #00ff88 | Success states |
| Red | #ff3030 | Alerts, priority |
| Orange | #ffaa00 | Warnings, attention |
| Glass | rgba(255,255,255,0.04) | Card backgrounds |

### Typography

- **Display**: Inter (system default, 16-700 weights)
- **Mono**: JetBrains Mono (terminals, logs, code)
- **Line Spacing**: 150% for body, 120% for headings
- **Max 3 font weights** per component

### Spacing

- **8px grid system**
- **Padding**: 4px to 32px in 4px increments
- **Gaps**: Consistent 4-16px between elements

---

## 🧪 Testing the System

### Voice Recognition Test

1. Open DevTools → Console
2. Enable "Always-Listening" in header
3. Say: "Archie, show me Finance"
4. Check: Finance sector should open + verbal acknowledgment plays

### Rate Limiter Test

1. Open Mainframe sector
2. Send 16 queries in rapid succession
3. Check: Counter shows "0/15 REQ" + cooldown timer displays
4. Verify: Inputs are disabled until cooldown expires

### Priority Alert Test

1. Go to World sector
2. Create a news feed containing "Breakthrough"
3. Check: Red glow overlay + verbal alert triggers

### Summarization Test

1. World sector → click any news item
2. Click "SUMMARIZE" button
3. Check: Loader appears, then summary is spoken

---

## 🤝 Contributing

A.R.C.H.I.E. is **fully open source**. We welcome contributions:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Ideas for Contribution

- Add more news sources (Reuters, Bloomberg, Al Jazeera)
- Implement historical data tracking via Supabase
- Create custom voice profiles
- Add chart visualizations for financial data
- Extend Mainframe reasoning with custom models

---

## 📚 API Sources

A.R.C.H.I.E. uses free, public APIs:

- **BBC/NYT News** — RSS2JSON converter (free tier)
- **Hacker News** — Official Firebase API (free, no auth)
- **CoinGecko** — Crypto market data (free API)
- **Puter.js** — Browser-native AI (free tier)

All APIs are queried client-side; no backend proxy needed.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file (optional, for future extensions):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Currently, A.R.C.H.I.E. runs **zero-config** — no env vars required.

---

## 🐛 Known Limitations

1. **Voice Recognition** — Requires HTTPS in production (browsers block HTTP for security)
2. **Puter.js Availability** — Free tier may rate-limit or be temporarily unavailable
3. **RSS Feeds** — Some news sources block RSS; fallback to public APIs
4. **Browser Support** — Web Speech API not available on Firefox (uses polyfills)

---

## 📖 License

MIT License — See `LICENSE` file for details.

Built with ⚡ by the A.R.C.H.I.E. community.

---

## 🎯 Roadmap

- [ ] Persistent user profiles via Supabase Auth
- [ ] Custom theme builder
- [ ] Time-series data for financial trends
- [ ] Integration with more data sources (Twitter, LinkedIn, GitHub)
- [ ] Mobile-responsive design refinement
- [ ] Offline mode with local caching
- [ ] Custom voice profiles (clone your own voice)
- [ ] Dark/Light mode with custom color schemes

---

## 📞 Support

- **Issues** — Report bugs in the GitHub Issues tab
- **Discussions** — Ask questions in Discussions
- **Email** — [your-email@example.com]

**A.R.C.H.I.E. is maintained by volunteers. Please be patient with responses.**

---

Made with 🤖 intelligence and ❤️ passion. No AI was harmed in the making of this dashboard.
