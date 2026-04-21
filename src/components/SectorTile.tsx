import { motion } from 'framer-motion';
import { Globe, TrendingUp, Cpu, MapPin, Brain, Settings } from 'lucide-react';
import type { SectorId } from '../types';

interface Props {
  id: SectorId;
  label: string;
  description: string;
  onClick: () => void;
  index: number;
}

const ICONS: Record<SectorId, React.ElementType> = {
  world: Globe,
  finance: TrendingUp,
  tech: Cpu,
  region: MapPin,
  mainframe: Brain,
  settings: Settings,
};

const COLORS: Record<SectorId, { primary: string; glow: string }> = {
  world: { primary: '#00d2ff', glow: 'rgba(0,210,255,0.3)' },
  finance: { primary: '#00ff88', glow: 'rgba(0,255,136,0.3)' },
  tech: { primary: '#9d50bb', glow: 'rgba(157,80,187,0.3)' },
  region: { primary: '#ffaa00', glow: 'rgba(255,170,0,0.3)' },
  mainframe: { primary: '#ff6b6b', glow: 'rgba(255,107,107,0.3)' },
  settings: { primary: '#a0aec0', glow: 'rgba(160,174,192,0.3)' },
};

export default function SectorTile({ id, label, description, onClick, index }: Props) {
  const Icon = ICONS[id];
  const { primary, glow } = COLORS[id];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full text-left rounded-xl overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${glow} 0%, transparent 70%)`,
          border: `1px solid ${primary}40`,
        }}
      />

      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `0 0 20px ${glow}, inset 0 0 20px ${glow}` }}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${primary}15`,
              border: `1px solid ${primary}30`,
              boxShadow: `0 0 12px ${glow}`,
            }}
          >
            <Icon size={18} style={{ color: primary }} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm tracking-wide" style={{ color: primary }}>
              {label}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(180,200,220,0.6)' }}>
              {description}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: primary }}
          />
          <span className="text-xs font-mono" style={{ color: `${primary}80` }}>ACTIVE</span>
        </div>
      </div>
    </motion.button>
  );
}
