import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu } from 'lucide-react';
import type { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
  transcript: string;
  isListening: boolean;
}

const TYPE_COLORS: Record<LogEntry['type'], string> = {
  info: '#00d2ff',
  success: '#00ff88',
  warning: '#ffaa00',
  processing: '#9d50bb',
};

const TYPE_PREFIXES: Record<LogEntry['type'], string> = {
  info: '[INFO]',
  success: '[OK]',
  warning: '[WARN]',
  processing: '[PROC]',
};

export default function ThinkingTerminal({ logs, transcript, isListening }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,5,15,0.9)',
        border: '1px solid rgba(0,210,255,0.2)',
        boxShadow: '0 0 20px rgba(0,210,255,0.05)',
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(0,210,255,0.15)' }}
      >
        <Cpu size={12} style={{ color: '#9d50bb' }} />
        <span className="text-xs font-mono font-semibold" style={{ color: '#00d2ff' }}>
          A.R.C.H.I.E. THOUGHT STREAM
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {isListening && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs font-mono" style={{ color: '#ff4444' }}>LIVE</span>
            </motion.div>
          )}
          <Terminal size={10} style={{ color: 'rgba(0,210,255,0.4)' }} />
        </div>
      </div>

      {transcript && (
        <div
          className="px-3 py-1.5 font-mono text-xs"
          style={{
            background: 'rgba(157,80,187,0.1)',
            borderBottom: '1px solid rgba(157,80,187,0.2)',
            color: '#9d50bb',
          }}
        >
          <span style={{ color: 'rgba(157,80,187,0.6)' }}>{'> '}</span>
          {transcript}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >_</motion.span>
        </div>
      )}

      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: '120px' }}>
        <AnimatePresence initial={false}>
          {logs.slice(0, 20).map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2 px-3 py-1 font-mono text-xs hover:bg-white/5"
            >
              <span className="shrink-0 text-gray-600">
                {log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="shrink-0" style={{ color: TYPE_COLORS[log.type], fontSize: '10px' }}>
                {TYPE_PREFIXES[log.type]}
              </span>
              <span style={{ color: 'rgba(200,230,255,0.7)' }}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
