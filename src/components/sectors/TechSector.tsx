import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ExternalLink, MessageSquare, ArrowUp, RefreshCw } from 'lucide-react';
import type { NewsItem } from '../../types';
import { fetchTechNews } from '../../utils/newsApi';

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
}

export default function TechSector({ onLog }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const load = async () => {
    setRefreshing(true);
    onLog('Scanning tech intelligence networks...', 'processing');
    const items = await fetchTechNews();
    setNews(items);
    setLoading(false);
    setRefreshing(false);
    onLog(`Tech sector: ${items.length} stories indexed`, 'success');
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={16} style={{ color: '#9d50bb' }} />
        <span className="font-mono text-sm font-bold" style={{ color: '#9d50bb' }}>TECH INTELLIGENCE HUB</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setView(v => v === 'list' ? 'grid' : 'list')}
            className="text-xs font-mono px-2 py-1 rounded transition-colors"
            style={{ background: 'rgba(157,80,187,0.15)', color: 'rgba(157,80,187,0.8)', border: '1px solid rgba(157,80,187,0.3)' }}
          >
            {view === 'list' ? 'GRID' : 'LIST'}
          </button>
          <button onClick={load} disabled={refreshing} className="p-1 rounded hover:bg-white/10 transition-colors">
            <motion.div animate={refreshing ? { rotate: 360 } : {}}>
              <RefreshCw size={12} style={{ color: 'rgba(157,80,187,0.6)' }} />
            </motion.div>
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${view === 'grid' ? 'grid grid-cols-2 gap-3 content-start' : 'space-y-2'}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              className="h-16 rounded-lg"
              style={{ background: 'rgba(157,80,187,0.08)' }}
            />
          ))
        ) : (
          news.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="rounded-lg p-3 cursor-pointer"
              style={{
                background: item.priority ? 'rgba(255,100,100,0.08)' : 'rgba(157,80,187,0.06)',
                border: `1px solid ${item.priority ? 'rgba(255,100,100,0.3)' : 'rgba(157,80,187,0.15)'}`,
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-relaxed" style={{ color: 'rgba(210,180,240,0.9)' }}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <ArrowUp size={10} style={{ color: '#9d50bb' }} />
                      <span className="text-xs font-mono" style={{ color: 'rgba(157,80,187,0.7)' }}>
                        {item.summary.match(/(\d+) points/)?.[1] ?? '—'} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={10} style={{ color: 'rgba(157,80,187,0.5)' }} />
                      <span className="text-xs font-mono" style={{ color: 'rgba(157,80,187,0.5)' }}>
                        {item.summary.match(/(\d+) comments/)?.[1] ?? '—'}
                      </span>
                    </div>
                    <a
                      href={item.url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs"
                      style={{ color: 'rgba(157,80,187,0.6)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
