import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Clock, Zap, AlertCircle, Sparkles } from 'lucide-react';
import type { MainframeMessage } from '../../types';
import { useRateLimit } from '../../hooks/useRateLimit';

interface Props {
  title: string;
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onKeyword: (text: string) => void;
  onSpeak: (text: string) => void;
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (msg: string, opts?: { model?: string }) => Promise<string | { message?: { content?: string } }>;
      };
    };
  }
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

const BOOT_LINES = [
  'A.R.C.H.I.E. MAINFRAME v3.7.2 — AUTONOMOUS REASONING ENGINE',
  'Neural pathways: INITIALIZED',
  'Semantic processors: CALIBRATED',
  'Knowledge base: SYNCHRONIZED',
  'Agentic reasoning engine: READY',
];

const REASONING_STEPS = [
  'Initializing reasoning engine...',
  'Parsing input semantics...',
  'Cross-referencing knowledge base...',
  'Synthesizing contextual response...',
  'Validating logical consistency...',
  'Preparing verbal output...',
];

function formatCooldown(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MainframeSector({ title, onLog, onKeyword, onSpeak }: Props) {
  const [messages, setMessages] = useState<MainframeMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [cooldownDisplay, setCooldownDisplay] = useState(0);
  const [reasoningStep, setReasoningStep] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { remaining, isLimited, cooldownMs, tryRequest } = useRateLimit();

  useEffect(() => {
    const existing = document.getElementById('puter-sdk');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'puter-sdk';
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        setPuterReady(true);
        onLog('Puter.js AI module loaded', 'success');
      };
      script.onerror = () => onLog('Puter.js load failed — using fallback mode', 'warning');
      document.head.appendChild(script);
    } else if (window.puter) {
      setPuterReady(true);
    }
  }, [onLog]);

  useEffect(() => {
    if (!isLimited) return;
    const interval = setInterval(() => {
      setCooldownDisplay(cooldownMs);
    }, 500);
    return () => clearInterval(interval);
  }, [isLimited, cooldownMs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, reasoningStep]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    if (isLimited) return;
    if (!tryRequest()) return;

    const userMsg: MainframeMessage = {
      id: makeId(), role: 'user', content: input.trim(), timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    onKeyword(input);
    const query = input.trim();
    setInput('');
    setIsTyping(true);
    onLog(`Processing: "${query.slice(0, 50)}..."`, 'processing');

    try {
      let responseText = '';

      if (puterReady && window.puter?.ai?.chat) {
        for (let i = 0; i < REASONING_STEPS.length; i++) {
          setReasoningStep(REASONING_STEPS[i]);
          await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        }

        const systemPrompt = `You are A.R.C.H.I.E. (Autonomous Reasoning & Comprehensive High Intelligence Engine). Address the user as "${title}". Provide intelligent, concise analysis. Be authoritative but helpful.`;
        const result = await window.puter.ai.chat(`${systemPrompt}\n\nUser: ${query}`);

        if (typeof result === 'string') responseText = result;
        else if (result?.message?.content) responseText = result.message.content;
        else responseText = String(result);
      } else {
        for (let i = 0; i < REASONING_STEPS.length; i++) {
          setReasoningStep(REASONING_STEPS[i]);
          await new Promise(r => setTimeout(r, 250 + Math.random() * 350));
        }
        responseText = `Certainly, ${title}. I've analyzed your query: "${query}". While my Puter.js AI module is calibrating, I'm operating in analytical reasoning mode. This demonstrates A.R.C.H.I.E.'s core capability to process complex requests and synthesize coherent responses. For production use, ensure you have internet connectivity to unlock the full agentic reasoning pipeline.`;
      }

      const assistantMsg: MainframeMessage = {
        id: makeId(), role: 'assistant', content: responseText, timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setReasoningStep(null);
      onLog(`Query processed. ${remaining - 1} API calls remaining.`, 'success');

      if (responseText.length > 0) {
        onSpeak(responseText.slice(0, 300));
      }
    } catch (err) {
      const errMsg: MainframeMessage = {
        id: makeId(), role: 'assistant',
        content: `I encountered an anomaly, ${title}: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again momentarily.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
      setReasoningStep(null);
      onLog('Mainframe error encountered', 'warning');
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, isLimited, puterReady, title, tryRequest, remaining, onKeyword, onLog, onSpeak]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} style={{ color: '#ff6b6b' }} />
        <span className="font-mono text-sm font-bold" style={{ color: '#ff6b6b' }}>MAINFRAME AI TERMINAL</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded"
            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)' }}>
            <Zap size={10} style={{ color: '#ff6b6b' }} />
            <span className="text-xs font-mono" style={{ color: isLimited ? '#ff4444' : '#ff6b6b' }}>
              {isLimited ? `RATE LIMITED` : `${remaining}/${15} REQ`}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-400' : 'bg-yellow-400'}`}
            style={{ boxShadow: `0 0 6px ${puterReady ? '#00ff88' : '#ffaa00'}` }}
          />
        </div>
      </div>

      {isLimited && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
          style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}
        >
          <AlertCircle size={14} style={{ color: '#ff4444' }} />
          <span className="text-xs font-mono" style={{ color: '#ff8888' }}>
            Rate limit: {formatCooldown(cooldownDisplay || cooldownMs)} remaining
          </span>
          <Clock size={12} style={{ color: 'rgba(255,100,100,0.6)' }} />
        </motion.div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl p-3 font-mono text-xs space-y-4 mb-3"
        style={{
          background: 'rgba(0,5,10,0.8)',
          border: '1px solid rgba(255,107,107,0.15)',
          scrollbarWidth: 'thin',
        }}
      >
        <div className="space-y-1">
          {BOOT_LINES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{ color: i === 0 ? '#ff6b6b' : i === BOOT_LINES.length - 1 ? '#00ff88' : 'rgba(200,150,150,0.6)' }}
            >
              {i === 0 ? '' : '> '}{line}
            </motion.div>
          ))}
        </div>

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-lg rounded-lg px-3 py-2"
                style={msg.role === 'user' ? {
                  background: 'rgba(255,107,107,0.12)',
                  border: '1px solid rgba(255,107,107,0.25)',
                  color: 'rgba(255,200,200,0.9)',
                } : {
                  background: 'rgba(0,210,255,0.06)',
                  border: '1px solid rgba(0,210,255,0.15)',
                  color: 'rgba(200,230,255,0.9)',
                }}
              >
                <div className="text-xs mb-1 opacity-50" style={{ color: msg.role === 'user' ? 'rgba(255,180,180,0.6)' : 'rgba(150,200,255,0.6)' }}>
                  {msg.role === 'user' ? `${title} [${msg.timestamp.toLocaleTimeString()}]` : `A.R.C.H.I.E. [${msg.timestamp.toLocaleTimeString()}]`}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {reasoningStep && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
              style={{ color: 'rgba(157,80,187,0.8)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={12} />
              </motion.div>
              <span className="text-xs">{reasoningStep}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isTyping && !reasoningStep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"
            style={{ color: 'rgba(0,210,255,0.6)' }}>
            <span>Processing</span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}>▋</motion.span>
          </motion.div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={isLimited || isTyping}
          placeholder={isLimited ? 'Rate limit active — please wait...' : `Query A.R.C.H.I.E., ${title}...`}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none transition-all"
          style={{
            background: 'rgba(0,5,15,0.9)',
            border: `1px solid ${isLimited ? 'rgba(255,68,68,0.3)' : 'rgba(255,107,107,0.25)'}`,
            color: 'rgba(200,230,255,0.9)',
            caretColor: '#ff6b6b',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping || isLimited}
          className="px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,107,107,0.15)',
            border: '1px solid rgba(255,107,107,0.3)',
            color: '#ff6b6b',
          }}
        >
          <Send size={12} />
          SEND
        </button>
      </div>
    </div>
  );
}
