import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { PriorityAlert as PriorityAlertType } from '../types';

interface Props {
  alert: PriorityAlertType;
  onDismiss: () => void;
}

export default function PriorityAlert({ alert, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {alert.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,30,30,0.15) 0%, transparent 70%)' }}
          />

          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: 'linear-gradient(90deg, transparent, #ff2020, transparent)' }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1"
            style={{ background: 'linear-gradient(90deg, transparent, #ff2020, transparent)' }}
          />
          <div
            className="absolute inset-y-0 left-0 w-1"
            style={{ background: 'linear-gradient(180deg, transparent, #ff2020, transparent)' }}
          />
          <div
            className="absolute inset-y-0 right-0 w-1"
            style={{ background: 'linear-gradient(180deg, transparent, #ff2020, transparent)' }}
          />

          <div className="absolute top-8 inset-x-0 flex justify-center pointer-events-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative px-6 py-4 rounded-xl max-w-lg mx-4"
              style={{
                background: 'rgba(10,0,0,0.95)',
                border: '1px solid rgba(255,30,30,0.6)',
                boxShadow: '0 0 30px rgba(255,30,30,0.4), 0 0 60px rgba(255,30,30,0.2), inset 0 0 20px rgba(255,30,30,0.05)',
              }}
            >
              <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 rounded hover:bg-red-900/30 transition-colors"
                style={{ color: 'rgba(255,100,100,0.7)' }}
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <AlertTriangle size={24} style={{ color: '#ff3030' }} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,30,30,0.2)', color: '#ff5050', border: '1px solid rgba(255,30,30,0.3)' }}
                    >
                      PRIORITY ALERT
                    </span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: '#ff3030', textShadow: '0 0 10px #ff3030' }}
                    >
                      [{alert.keyword}]
                    </span>
                  </div>
                  <p className="text-sm font-mono" style={{ color: 'rgba(255,180,180,0.9)' }}>
                    {alert.message.slice(0, 150)}{alert.message.length > 150 ? '...' : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
