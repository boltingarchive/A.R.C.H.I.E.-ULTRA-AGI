import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink, Clock, Loader } from 'lucide-react';
import type { NewsItem } from '../../types';
import { fetchRegionNews } from '../../utils/newsApi';
import { summarizeNews } from '../../utils/aiSummarize';

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onSpeak?: (text: string) => void;
  title?: string;
}

const REGIONS = ['All', 'UK', 'US', 'Europe', 'Asia', 'Americas'];

export default function RegionSector({ onLog, onSpeak, title }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('All');
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    onLog('Triangulating regional data feeds...', 'processing');
    fetchRegionNews().then(items => {
      setNews(items);
      setLoading(false);
      onLog(`Region sector: ${items.length} local stories aggregated`, 'success');
    });
  }, []);

  const handleNewsClick = async (item: NewsItem) => {
    setSelected(item);
    setSummarizing(true);
    onLog(`Bypassing CORS for Region Feed...`, 'processing');
    onLog(`Analyzing: "${item.title.slice(0, 40)}..."`, 'processing');

    try {
      const summary = await summarizeNews(item.title, item.summary, 30);
      setSummarizing(false);
      onLog(`Summary prepared`, 'success');
      onLog(`Synthesizing voice output...`, 'processing');
      if (onSpeak) {
        onSpeak(`Certainly, here is the intelligence brief: ${summary}`);
      }
      onLog(`Voice briefing delivered`, 'success');
    } catch (err) {
      setSummarizing(false);
      onLog('Summarization error', 'warning');
    }
  };

  const filtered = news;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} style={{ color: '#ffaa00' }} />
        <span className="font-mono text-sm font-bold" style={{ color: '#ffaa00' }}>REGIONAL INTELLIGENCE</span>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className="px-3 py-1 rounded-lg text-xs font-mono transition-all"
            style={activeRegion === r ? {
              background: 'rgba(255,170,0,0.2)',
              color: '#ffaa00',
              border: '1px solid rgba(255,170,0,0.5)',
              boxShadow: '0 0 10px rgba(255,170,0,0.2)',
            } : {
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(200,180,150,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,210,255,0.4) rgba(0,5,15,0.5)' }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
              className="h-18 rounded-lg"
              style={{ background: 'rgba(255,170,0,0.05)', height: '72px' }}
            />
          ))
        ) : (
          filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 4 }}
              onClick={() => handleNewsClick(item)}
              className="rounded-lg p-3 cursor-pointer transition-all"
              style={{
                background: selected?.id === item.id ? 'rgba(255,170,0,0.12)' : item.priority ? 'rgba(255,100,100,0.08)' : 'rgba(255,170,0,0.05)',
                border: `1px solid ${selected?.id === item.id ? 'rgba(255,170,0,0.3)' : item.priority ? 'rgba(255,100,100,0.25)' : 'rgba(255,170,0,0.12)'}`,
              }}
            >
              <p className="text-xs font-medium leading-relaxed mb-1.5" style={{ color: item.priority ? '#ff8888' : 'rgba(240,220,180,0.9)' }}>
                {item.title}
              </p>
              {selected?.id === item.id && summarizing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mb-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <Loader size={11} style={{ color: '#ffaa00' }} />
                  </motion.div>
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,170,0,0.6)' }}>Summarizing...</span>
                </motion.div>
              )}
              {!summarizing && (
              <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(190,170,140,0.6)' }}>
                {item.summary.slice(0, 120)}{item.summary.length > 120 ? '...' : ''}
              </p>
              )}
              <div className="flex items-center gap-2">
                <Clock size={9} style={{ color: 'rgba(255,170,0,0.5)' }} />
                <span className="text-xs font-mono" style={{ color: 'rgba(255,170,0,0.5)' }}>
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-mono" style={{ color: 'rgba(200,180,150,0.4)' }}>·</span>
                <span className="text-xs font-mono" style={{ color: 'rgba(200,180,150,0.5)' }}>{item.source}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto"
                  style={{ color: 'rgba(255,170,0,0.5)' }}
                  onClick={e => e.stopPropagation()}>
                  <ExternalLink size={10} />
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
