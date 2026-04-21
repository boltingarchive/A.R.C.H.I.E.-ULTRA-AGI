import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, ExternalLink } from 'lucide-react';
import type { FinanceItem, NewsItem } from '../../types';
import { fetchCryptoData, fetchFinanceNews } from '../../utils/newsApi';

interface Props {
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(6)}`;
}

function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function FinanceSector({ onLog }: Props) {
  const [crypto, setCrypto] = useState<FinanceItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    onLog('Accessing financial markets data...', 'processing');
    const [c, n] = await Promise.all([fetchCryptoData(), fetchFinanceNews()]);
    setCrypto(c);
    setNews(n);
    setLoading(false);
    setRefreshing(false);
    onLog(`Finance sector: ${c.length} assets, ${n.length} headlines loaded`, 'success');
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex h-full gap-4 p-4">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={16} style={{ color: '#00ff88' }} />
          <span className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>CRYPTO MARKETS</span>
          <button onClick={load} disabled={refreshing} className="ml-auto p-1 rounded hover:bg-white/10 transition-colors">
            <motion.div animate={refreshing ? { rotate: 360 } : {}}>
              <RefreshCw size={12} style={{ color: 'rgba(0,255,136,0.6)' }} />
            </motion.div>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(0,255,136,0.1)' }}>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(0,255,136,0.05)', borderBottom: '1px solid rgba(0,255,136,0.1)' }}>
                {['#', 'Asset', 'Price', '24h%', 'Mkt Cap'].map(h => (
                  <th key={h} className="px-3 py-2 text-left" style={{ color: 'rgba(0,255,136,0.6)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-3 py-2">
                      <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className="h-4 rounded"
                        style={{ background: 'rgba(255,255,255,0.08)', width: j === 1 ? '80px' : '60px' }}
                      />
                    </td>
                  ))}
                </tr>
              )) : crypto.map((asset, i) => (
                <motion.tr
                  key={asset.symbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-white/5 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-3 py-2" style={{ color: 'rgba(150,180,200,0.5)' }}>{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {asset.image && <img src={asset.image} alt="" className="w-4 h-4 rounded-full" />}
                      <div>
                        <div style={{ color: 'rgba(220,240,255,0.9)' }}>{asset.symbol}</div>
                        <div className="text-xs" style={{ color: 'rgba(150,170,190,0.5)', fontSize: '10px' }}>{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'rgba(220,240,255,0.85)' }}>{formatPrice(asset.price)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1"
                      style={{ color: asset.changePercent >= 0 ? '#00ff88' : '#ff4444' }}
                    >
                      {asset.changePercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(asset.changePercent).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'rgba(150,180,200,0.6)' }}>
                    {asset.marketCap ? formatMarketCap(asset.marketCap) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-72 shrink-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: '#00ff88' }} />
          <span className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>MARKET NEWS</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin' }}>
          {news.map(item => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ x: 3 }}
              className="block rounded-lg p-3 group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,255,136,0.08)' }}
            >
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,230,210,0.85)' }}>{item.title}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-xs font-mono" style={{ color: 'rgba(0,255,136,0.5)' }}>{item.source}</span>
                <ExternalLink size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#00ff88' }} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
