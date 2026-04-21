import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalaxyNode } from '../types';

interface Props {
  nodes: GalaxyNode[];
}

export default function GalaxyMap({ nodes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: { x: number; y: number; r: number; opacity: number; speed: number }[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      opacity: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.opacity = 0.3 + Math.sin(frame * star.speed * 0.05) * 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,210,255,${star.opacity * 0.5})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map(node =>
          node.connections.map(connId => {
            const target = nodes.find(n => n.id === connId);
            if (!target) return null;
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2={`${target.x}%`} y2={`${target.y}%`}
                stroke="rgba(0,210,255,0.15)"
                strokeWidth="1"
              />
            );
          })
        )}
      </svg>

      <AnimatePresence>
        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1 + node.pulseIntensity * 0.4, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex items-center justify-center"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#00d2ff',
                  boxShadow: `0 0 ${8 + node.pulseIntensity * 12}px #00d2ff, 0 0 ${16 + node.pulseIntensity * 24}px rgba(0,210,255,0.4)`,
                }}
              />
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full border border-cyan-400"
              />
              <div
                className="absolute top-3 left-3 text-xs font-mono whitespace-nowrap px-1.5 py-0.5 rounded"
                style={{
                  color: '#00d2ff',
                  background: 'rgba(0,5,15,0.85)',
                  border: '1px solid rgba(0,210,255,0.3)',
                  fontSize: '9px',
                  textShadow: '0 0 8px #00d2ff',
                }}
              >
                {node.keyword}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="w-48 h-48 rounded-full"
          style={{ border: '1px solid rgba(0,210,255,0.08)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-32 h-32 rounded-full"
          style={{ border: '1px solid rgba(157,80,187,0.1)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute"
        >
          <div
            className="w-6 h-6 rounded-full"
            style={{
              background: 'radial-gradient(circle, #00d2ff, #9d50bb)',
              boxShadow: '0 0 20px #00d2ff, 0 0 40px rgba(157,80,187,0.5)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
