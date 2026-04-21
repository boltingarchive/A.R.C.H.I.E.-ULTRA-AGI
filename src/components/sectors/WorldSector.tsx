import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, Radio, Zap, Play, Loader } from 'lucide-react';
import type { NewsItem, Hotspot } from '../../types';
import { fetchWorldNews, NEWS_HOTSPOTS } from '../../utils/newsApi';
import { summarizeNews } from '../../utils/aiSummarize';

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onSpeak: (text: string) => void;
  title: string;
}

export default function WorldSector({ onLog, onSpeak, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    onLog('Scanning global news networks...', 'processing');
    fetchWorldNews().then(items => {
      setNews(items);
      setLoading(false);
      onLog(`World sector: ${items.length} headlines loaded`, 'success');
    });
  }, [onLog]);

  const handleNewsClick = async (item: NewsItem) => {
    setSelected(item);
    setSummarizing(true);
    onLog(`Analyzing: "${item.title.slice(0, 40)}..."`, 'processing');

    try {
      const summary = await summarizeNews(item.title, item.summary, 30);
      setSummarizing(false);
      onLog(`Summary prepared for ${item.source}`, 'success');
      onSpeak(summary);
    } catch (err) {
      setSummarizing(false);
      onLog('Summarization error', 'warning');
    }
  };

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
      NEWS_HOTSPOTS.forEach((hs: Hotspot) => {
        const p = project(hs.lat, hs.lng, rotRef.current);
        if (p.z < -0.05) return;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + hs.lng * 0.02);
        const size = 2.5 + hs.intensity * 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${40 + Math.floor(pulse * 60)},30,${0.7 + pulse * 0.3})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.2 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,80,60,${0.35 * pulse})`;
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
  }, []);

  return (
    <div className="flex h-full gap-4 p-4">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} style={{ color: '#00d2ff' }} />
          <span className="font-mono text-sm font-bold" style={{ color: '#00d2ff' }}>GLOBAL INTELLIGENCE FEED</span>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto flex items-center gap-1.5"
          >
            <Radio size={12} style={{ color: '#00d2ff' }} />
            <span className="text-xs font-mono" style={{ color: '#00d2ff' }}>LIVE</span>
          </motion.div>
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
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 mt-2"
                          >
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
                            Read full article <ExternalLink size={10} />
                          </a>
                        )}
                      </motion.div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {selected?.id === item.id && !summarizing && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleNewsClick(item);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all"
                          style={{ background: 'rgba(0,210,255,0.2)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}
                        >
                          <Play size={10} />
                          SUMMARIZE
                        </button>
                      )}
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

      <div className="w-72 shrink-0">
        <div className="rounded-xl overflow-hidden w-full aspect-square"
          style={{ background: 'rgba(0,5,20,0.8)', border: '1px solid rgba(0,210,255,0.15)' }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="text-xs font-mono" style={{ color: 'rgba(0,210,255,0.4)', fontSize: '9px' }}>HOTSPOT ZONES</div>
          <div className="grid grid-cols-2 gap-1.5">
            {NEWS_HOTSPOTS.slice(0, 8).map(hs => (
              <div key={hs.label} className="flex items-center gap-1.5 px-2 py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,30,30,0.15)' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-red-500"
                />
                <span className="text-xs font-mono" style={{ color: 'rgba(200,220,240,0.6)' }}>{hs.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
