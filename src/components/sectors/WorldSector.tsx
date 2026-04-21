import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, Radio, Loader, MapPin } from 'lucide-react';
import type { NewsItem } from '../../types';
import { fetchCountryNews, fetchWorldNews, MAJOR_NATIONS } from '../../utils/newsApi';
import { summarizeNews } from '../../utils/aiSummarize';

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onSpeak: (text: string) => void;
  title: string;
}

export default function WorldSector({ onLog, onSpeak, title }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<typeof MAJOR_NATIONS[0] | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [hoveredNation, setHoveredNation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);

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
    onLog(`Analyzing: "${item.title.slice(0, 40)}..."`, 'processing');

    try {
      const summary = await summarizeNews(item.title, item.summary, 30);
      setSummarizing(false);
      onLog(`Summary prepared`, 'success');
      onSpeak(`${title}, here is the briefing: ${summary}`);
    } catch (err) {
      setSummarizing(false);
      onLog('Summarization error', 'warning');
    }
  };

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
    <div className="flex h-full gap-4 p-4 flex-col lg:flex-row">
      {/* Left: News Feed */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} style={{ color: '#00d2ff' }} />
          <span className="font-mono text-sm font-bold" style={{ color: '#00d2ff' }}>
            {selectedCountry ? selectedCountry.name.toUpperCase() : 'GLOBAL INTELLIGENCE'}
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

        {/* Nation Selector */}
        <div className="mb-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,255,0.08)' }}>
          <div className="text-xs font-mono mb-2" style={{ color: 'rgba(0,210,255,0.5)' }}>SELECT NATION</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
            {MAJOR_NATIONS.map(nation => (
              <button
                key={nation.code}
                onMouseEnter={() => setHoveredNation(nation.code)}
                onMouseLeave={() => setHoveredNation(null)}
                onClick={() => handleCountrySelect(nation)}
                className="px-2 py-1 rounded text-xs font-mono transition-all"
                style={{
                  background: selectedCountry?.code === nation.code
                    ? 'rgba(0,210,255,0.25)'
                    : hoveredNation === nation.code
                    ? 'rgba(0,210,255,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  color: selectedCountry?.code === nation.code ? '#00d2ff' : 'rgba(200,220,240,0.6)',
                  border: `1px solid ${selectedCountry?.code === nation.code ? 'rgba(0,210,255,0.4)' : 'rgba(0,210,255,0.1)'}`,
                }}
              >
                {nation.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
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
            news.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4, scale: 1.01 }}
                onClick={() => handleNewsClick(item)}
                className="rounded-lg p-3 cursor-pointer transition-all"
                style={{
                  background: selected?.id === item.id ? 'rgba(0,210,255,0.15)' : item.priority ? 'rgba(255,30,30,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected?.id === item.id ? 'rgba(0,210,255,0.4)' : item.priority ? 'rgba(255,30,30,0.3)' : 'rgba(0,210,255,0.1)'}`,
                }}
              >
                <div className="flex items-start gap-2">
                  {item.priority && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"
                      style={{ boxShadow: '0 0 6px #ff3030' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-relaxed" style={{ color: item.priority ? '#ff8888' : 'rgba(200,230,255,0.9)' }}>
                      {item.title}
                    </p>
                    {selected?.id === item.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(150,180,210,0.7)' }}>
                          {item.summary}
                        </p>
                        {summarizing && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mt-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                              <Loader size={11} style={{ color: '#00d2ff' }} />
                            </motion.div>
                            <span className="text-xs font-mono" style={{ color: 'rgba(0,210,255,0.6)' }}>Summarizing...</span>
                          </motion.div>
                        )}
                        {!summarizing && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs mt-2"
                            style={{ color: '#00d2ff' }}
                            onClick={e => e.stopPropagation()}
                          >
                            Read article <ExternalLink size={10} />
                          </a>
                        )}
                      </motion.div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
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

      {/* Right: Globe */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col">
        <div className="rounded-xl overflow-hidden w-full aspect-square"
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
  );
}
