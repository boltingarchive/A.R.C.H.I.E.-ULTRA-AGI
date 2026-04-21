import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, Radio, Loader, MapPin, Send, Brain } from 'lucide-react';
import type { NewsItem, MainframeMessage } from '../../types';
import { fetchCountryNews, fetchWorldNews, MAJOR_NATIONS } from '../../utils/newsApi';
import { summarizeNews } from '../../utils/aiSummarize';

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (msg: string, opts?: { model?: string }) => Promise<string | { message?: { content?: string } }>;
      };
    };
  }
}

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onSpeak: (text: string) => void;
  title: string;
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function WorldSector({ onLog, onSpeak, title }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<typeof MAJOR_NATIONS[0] | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [hoveredNation, setHoveredNation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MainframeMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);

  // Initialize World Intelligence API status
  useEffect(() => {
    setPuterReady(true);
    onLog('World Intelligence API initialized', 'success');
  }, [onLog]);

  // Load world news on mount
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      onLog('Scanning global news networks...', 'processing');
      const items = await fetchWorldNews();
      setNews(items);
      setLoading(false);
      onLog(`Global intelligence: ${items.length} headlines loaded`, 'success');
    };
    loadNews();
  }, [onLog]);

  // Load country-specific news
  const handleCountrySelect = async (country: typeof MAJOR_NATIONS[0]) => {
    setSelectedCountry(country);
    setSelected(null);
    setLoading(true);
    onLog(`Fetching news from ${country.name}...`, 'processing');
    const items = await fetchCountryNews(country.code, country.name);
    setNews(items);
    setLoading(false);
    onLog(`${country.name}: ${items.length} headlines loaded`, 'success');
  };

  const handleNewsClick = async (item: NewsItem) => {
    setSelected(item);
    setSummarizing(true);
    onLog(`Bypassing CORS for World Feed...`, 'processing');
    onLog(`Analyzing: "${item.title.slice(0, 40)}..."`, 'processing');

    try {
      const summary = await summarizeNews(item.title, item.summary, 30);
      setSummarizing(false);
      onLog(`Summary prepared`, 'success');
      onLog(`Synthesizing voice output...`, 'processing');
      onSpeak(`Certainly, here is the intelligence brief: ${summary}`);
      onLog(`Voice briefing delivered`, 'success');
    } catch (err) {
      setSummarizing(false);
      onLog('Summarization error', 'warning');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: MainframeMessage = {
      id: makeId(), role: 'user', content: input.trim(), timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const query = input.trim();
    setInput('');
    setIsTyping(true);
    onLog(`Processing global intelligence request: "${query.slice(0, 50)}..."`, 'processing');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/world-intelligence`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'X-Client-Info': 'archie/1.0',
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.response || 'Unable to process query at this time.';

      const assistantMsg: MainframeMessage = {
        id: makeId(), role: 'assistant', content: responseText, timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      onLog(`Intelligence analysis completed`, 'success');

      if (responseText.length > 0) {
        onSpeak(`Certainly, here is the global intelligence briefing: ${responseText.slice(0, 280)}`);
      }
    } catch (err) {
      const errMsg: MainframeMessage = {
        id: makeId(), role: 'assistant',
        content: `Intelligence processing unavailable, ${title}. Error: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your connection and try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
      onLog('World intelligence error', 'warning');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Canvas globe animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const R = () => Math.min(W(), H()) * 0.38;

    const project = (lat: number, lng: number, rot: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + rot) * (Math.PI / 180);
      const x = W() / 2 + R() * Math.sin(phi) * Math.cos(theta);
      const y = H() / 2 + R() * Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      return { x, y, z };
    };

    const drawGlobe = () => {
      ctx.clearRect(0, 0, W(), H());
      const cx = W() / 2, cy = H() / 2;
      const r = R();

      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, 'rgba(0,40,80,0.95)');
      grad.addColorStop(0.5, 'rgba(0,20,50,0.98)');
      grad.addColorStop(1, 'rgba(0,5,20,1)');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,210,255,0.1)';
      ctx.lineWidth = 0.6;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 5) {
          const p = project(lat, lng, rotRef.current);
          if (p.z < -0.1) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const p = project(lat, lng, rotRef.current);
          if (p.z < -0.1) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      const time = Date.now() / 1000;
      const hotspots = selectedCountry ? [{ lat: selectedCountry.lat, lng: selectedCountry.lng, label: selectedCountry.name, intensity: 1.0 }] : MAJOR_NATIONS.slice(0, 12);
      hotspots.forEach((hs) => {
        const p = project(hs.lat, hs.lng, rotRef.current);
        if (p.z < -0.05) return;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + hs.lng * 0.02);
        const size = selectedCountry && hs.label === selectedCountry.name ? 5 : 2.5 + hs.intensity * 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = selectedCountry && hs.label === selectedCountry.name
          ? `rgba(0,255,136,${0.8})`
          : `rgba(255,${40 + Math.floor(pulse * 60)},30,${0.7 + pulse * 0.3})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.2 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = selectedCountry && hs.label === selectedCountry.name
          ? `rgba(0,255,136,${0.35 * pulse})`
          : `rgba(255,80,60,${0.35 * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const atmosphereGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.2);
      atmosphereGrad.addColorStop(0, 'rgba(0,210,255,0.06)');
      atmosphereGrad.addColorStop(1, 'rgba(0,210,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmosphereGrad;
      ctx.fill();

      rotRef.current += 0.08;
      animRef.current = requestAnimationFrame(drawGlobe);
    };
    drawGlobe();

    return () => cancelAnimationFrame(animRef.current);
  }, [selectedCountry]);

  return (
    <div className="flex h-full gap-4 p-4 flex-col">
      {/* Top: News Headlines - Elevated */}
      <div className="h-1/3 flex flex-col min-h-0 rounded-xl p-4" style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.1)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Globe size={16} style={{ color: '#00d2ff' }} />
          <span className="font-mono text-sm font-bold" style={{ color: '#00d2ff' }}>
            {selectedCountry ? selectedCountry.name.toUpperCase() : 'GLOBAL HEADLINES'}
          </span>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto flex items-center gap-1.5"
          >
            <Radio size={12} style={{ color: '#00d2ff' }} />
            <span className="text-xs font-mono" style={{ color: '#00d2ff' }}>LIVE</span>
          </motion.div>
        </div>

        {/* Nation Selector - Compact */}
        <div className="mb-2 p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,255,0.08)' }}>
          <div className="text-xs font-mono mb-1" style={{ color: 'rgba(0,210,255,0.5)' }}>SELECT NATION</div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-0.5 max-h-12 overflow-y-auto">
            {MAJOR_NATIONS.map(nation => (
              <button
                key={nation.code}
                onMouseEnter={() => setHoveredNation(nation.code)}
                onMouseLeave={() => setHoveredNation(null)}
                onClick={() => handleCountrySelect(nation)}
                className="px-1.5 py-0.5 rounded text-xs font-mono transition-all"
                style={{
                  background: selectedCountry?.code === nation.code
                    ? 'rgba(0,210,255,0.25)'
                    : hoveredNation === nation.code
                    ? 'rgba(0,210,255,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  color: selectedCountry?.code === nation.code ? '#00d2ff' : 'rgba(200,220,240,0.6)',
                  border: `1px solid ${selectedCountry?.code === nation.code ? 'rgba(0,210,255,0.4)' : 'rgba(0,210,255,0.1)'}`,
                  fontSize: '10px',
                }}
              >
                {nation.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,210,255,0.4) rgba(0,5,15,0.5)' }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                className="h-14 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
            ))
          ) : (
            news.slice(0, 6).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 2, scale: 1.005 }}
                onClick={() => handleNewsClick(item)}
                className="rounded-lg p-2 cursor-pointer transition-all"
                style={{
                  background: selected?.id === item.id ? 'rgba(0,210,255,0.15)' : item.priority ? 'rgba(255,30,30,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected?.id === item.id ? 'rgba(0,210,255,0.4)' : item.priority ? 'rgba(255,30,30,0.3)' : 'rgba(0,210,255,0.1)'}`,
                }}
              >
                <div className="flex items-start gap-1.5">
                  {item.priority && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1 h-1 rounded-full bg-red-500 mt-1 shrink-0"
                      style={{ boxShadow: '0 0 4px #ff3030' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight" style={{ color: item.priority ? '#ff8888' : 'rgba(200,230,255,0.9)' }}>
                      {item.title.length > 60 ? item.title.slice(0, 60) + '...' : item.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs font-mono" style={{ color: 'rgba(0,210,255,0.5)' }}>{item.source}</span>
                      <span className="text-xs" style={{ color: 'rgba(150,170,190,0.4)' }}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Bottom: Mainframe AI + Globe */}
      <div className="flex-1 flex gap-4 min-h-0 min-w-0">
        {/* Left: Mainframe Chat */}
        <div className="flex-1 flex flex-col min-h-0 rounded-xl p-4" style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} style={{ color: '#ff6b6b' }} />
            <span className="font-mono text-sm font-bold" style={{ color: '#ff6b6b' }}>WORLD AI ANALYSIS</span>
            <div className={`w-2 h-2 rounded-full ml-auto ${puterReady ? 'bg-green-400' : 'bg-yellow-400'}`}
              style={{ boxShadow: `0 0 6px ${puterReady ? '#00ff88' : '#ffaa00'}` }}
            />
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,210,255,0.4) rgba(0,5,15,0.5)' }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-center" style={{ color: 'rgba(200,220,240,0.4)' }}>Ask about global trends, news analysis, or geopolitical events</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs leading-relaxed p-2 rounded-lg"
                  style={{
                    background: msg.role === 'user' ? 'rgba(0,210,255,0.1)' : 'rgba(255,107,107,0.06)',
                    color: msg.role === 'user' ? 'rgba(200,230,255,0.9)' : 'rgba(200,220,240,0.85)',
                  }}
                >
                  <span style={{ color: msg.role === 'user' ? '#00d2ff' : '#ff6b6b', fontWeight: 'bold' }}>
                    {msg.role === 'user' ? 'You' : 'A.R.C.H.I.E.'}:
                  </span>
                  <span className="ml-1">{msg.content}</span>
                </motion.div>
              ))
            )}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs p-2 rounded-lg flex items-center gap-1"
                style={{ background: 'rgba(255,107,107,0.06)', color: 'rgba(200,220,240,0.6)' }}
              >
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  <div className="w-1 h-1 rounded-full" style={{ background: '#ff6b6b' }} />
                </motion.div>
                Thinking...
              </motion.div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={isTyping}
              placeholder="Ask about world news..."
              className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-xs font-mono placeholder-gray-500"
              style={{
                borderColor: 'rgba(255,107,107,0.2)',
                color: 'rgba(200,230,255,0.9)',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              className="p-2 rounded-lg transition-all"
              style={{
                background: isTyping || !input.trim() ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,107,0.2)',
                color: isTyping || !input.trim() ? 'rgba(255,107,107,0.4)' : '#ff6b6b',
                border: `1px solid ${isTyping || !input.trim() ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,107,0.3)'}`,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Right: Globe */}
        <div className="w-80 shrink-0 flex flex-col min-h-0">
          <div className="flex-1 rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,5,20,0.8)', border: '1px solid rgba(0,210,255,0.15)' }}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          {selectedCountry && (
            <button
              onClick={() => { setSelectedCountry(null); setNews([]); }}
              className="mt-2 w-full py-2 rounded-lg text-xs font-mono transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#00d2ff',
                border: '1px solid rgba(0,210,255,0.2)',
              }}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
