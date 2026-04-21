import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import type { SectorId } from './types';
import { useArchieState } from './hooks/useArchieState';
import { useVoice } from './hooks/useVoice';
import GalaxyMap from './components/GalaxyMap';
import SectorTile from './components/SectorTile';
import ThinkingTerminal from './components/ThinkingTerminal';
import PriorityAlert from './components/PriorityAlert';
import WorldSector from './components/sectors/WorldSector';
import FinanceSector from './components/sectors/FinanceSector';
import TechSector from './components/sectors/TechSector';
import RegionSector from './components/sectors/RegionSector';
import MainframeSector from './components/sectors/MainframeSector';
import SettingsSector from './components/sectors/SettingsSector';

const SECTORS: { id: SectorId; label: string; description: string }[] = [
  { id: 'world', label: 'WORLD', description: 'Global intelligence & live hotspot map' },
  { id: 'finance', label: 'FINANCE', description: 'Crypto markets & financial headlines' },
  { id: 'tech', label: 'TECH', description: 'Hacker News & tech intelligence' },
  { id: 'region', label: 'REGION', description: 'National & local news streams' },
  { id: 'mainframe', label: 'MAINFRAME', description: 'Agentic AI terminal interface' },
  { id: 'settings', label: 'SETTINGS', description: 'System config & voice tuning' },
];

const AUTO_LOGS = [
  'Decrypting data streams...',
  'Analyzing global sentiment vectors...',
  'Cross-referencing intelligence feeds...',
  'Calibrating semantic pulse frequencies...',
  'Neural pathway synchronization active.',
  'Scanning tech volatility indices...',
  'Monitoring financial anomaly patterns...',
  'Regional signal triangulation online...',
  'Maintaining secure uplink to data nodes...',
  'Processing contextual awareness layer...',
  'Quantum entropy filtering in progress...',
  'Threat matrix updated.',
];

interface SectorPanelProps {
  id: SectorId;
  title: string;
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
  onKeyword: (text: string) => void;
  settings: ReturnType<typeof useArchieState>['settings'];
  onSettingsUpdate: ReturnType<typeof useArchieState>['updateSettings'];
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

function SectorPanel({ id, title, onLog, onKeyword, settings, onSettingsUpdate, onClose, onSpeak }: SectorPanelProps & { onSpeak: (t: string) => void }) {
  const renderContent = () => {
    switch (id) {
      case 'world': return <WorldSector onLog={onLog} onSpeak={onSpeak} title={title} />;
      case 'finance': return <FinanceSector onLog={onLog} />;
      case 'tech': return <TechSector onLog={onLog} />;
      case 'region': return <RegionSector onLog={onLog} />;
      case 'mainframe': return <MainframeSector title={title} onLog={onLog} onKeyword={onKeyword} onSpeak={onSpeak} />;
      case 'settings': return <SettingsSector settings={settings} onUpdate={onSettingsUpdate} onLog={onLog} />;
    }
  };

  const sector = SECTORS.find(s => s.id === id)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative rounded-2xl overflow-hidden flex flex-col"
        style={{
          width: 'min(1100px, 95vw)',
          height: 'min(750px, 90vh)',
          background: 'rgba(3,8,20,0.97)',
          border: '1px solid rgba(0,210,255,0.15)',
          boxShadow: '0 0 80px rgba(0,210,255,0.06), 0 40px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div
          className="flex items-center px-5 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,210,255,0.1)', background: 'rgba(0,5,15,0.8)' }}
        >
          <div>
            <h2 className="font-mono text-sm font-bold" style={{ color: '#00d2ff' }}>
              SECTOR: {sector.label}
            </h2>
            <p className="text-xs font-mono" style={{ color: 'rgba(0,210,255,0.4)' }}>{sector.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(0,210,255,0.6)' }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const archie = useArchieState();
  const {
    activeSector, setActiveSector,
    galaxyNodes,
    logs, addLog,
    settings, updateSettings,
    priorityAlert, setPriorityAlert,
    title,
    addGalaxyKeywords,
    checkPriorityKeywords,
    processVoiceCommand,
    detectGenderChange,
  } = archie;

  const [booting, setBooting] = useState(true);
  const [voiceRef, setVoiceRef] = useState<{ speak: (t: string) => void } | null>(null);

  const handleTranscript = useCallback((text: string) => {
    addLog(`Voice input: "${text.slice(0, 50)}"`, 'info');
    addGalaxyKeywords(text);

    const genderChange = detectGenderChange(text);
    if (genderChange) {
      updateSettings({ gender: genderChange });
      const newTitle = genderChange === 'sir' ? 'Sir' : "Ma'am";
      addLog(`Protocol updated: ${newTitle} mode activated`, 'success');
      voiceRef?.speak(`Understood. Protocol updated to ${newTitle}.`);
      return;
    }

    const sector = processVoiceCommand(text);
    if (sector) {
      setActiveSector(sector);
      addLog(`Navigating to ${sector} sector`, 'success');
      voiceRef?.speak(`Certainly, ${title}. Opening the ${sector} sector now.`);
      return;
    }

    checkPriorityKeywords(text, keyword => {
      voiceRef?.speak(`PRIORITY ALERT, ${title}! ${keyword.toUpperCase()} detected. Immediate attention required.`);
      addLog(`PRIORITY ALERT: ${keyword} detected`, 'warning');
    });
  }, [addGalaxyKeywords, detectGenderChange, updateSettings, processVoiceCommand, setActiveSector, checkPriorityKeywords, title, addLog, voiceRef]);

  const voice = useVoice(settings, handleTranscript);

  useEffect(() => {
    setVoiceRef({ speak: voice.speak });
  }, [voice.speak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      addLog(`Dashboard online. Welcome, ${title}.`, 'success');
      setTimeout(() => {
        if (settings.voiceEnabled && voiceRef) {
          voiceRef.speak(`Good day, ${title}. A.R.C.H.I.E. is fully operational and at your service.`);
        }
      }, 600);
    }, 2200);
    return () => clearTimeout(timer);
  }, [title, settings.voiceEnabled, voiceRef, addLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = AUTO_LOGS[Math.floor(Math.random() * AUTO_LOGS.length)];
      addLog(msg, Math.random() > 0.65 ? 'processing' : 'info');
    }, 3500 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [addLog]);

  const openSector = (id: SectorId) => {
    setActiveSector(id);
    addGalaxyKeywords(id);
    addLog(`Opening ${id} sector`, 'info');
    voice.speak(`At your service, ${title}. Opening the ${id} sector.`);
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: '#050505', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,210,255,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(157,80,187,0.04) 0%, transparent 50%)' }} />
      </div>

      {/* Boot screen */}
      <AnimatePresence>
        {booting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: '#050505' }}
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full mx-auto"
                style={{
                  background: 'radial-gradient(circle, #00d2ff 0%, #9d50bb 100%)',
                  boxShadow: '0 0 40px rgba(0,210,255,0.6), 0 0 80px rgba(157,80,187,0.3)',
                }}
              />
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold tracking-widest font-mono"
                style={{ color: '#00d2ff', textShadow: '0 0 30px #00d2ff' }}
              >
                A.R.C.H.I.E.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs font-mono tracking-widest px-4"
                style={{ color: 'rgba(0,210,255,0.5)' }}
              >
                AUTONOMOUS REASONING & COMPREHENSIVE HIGH INTELLIGENCE ENGINE
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#9d50bb' }}
                />
                <span className="text-xs font-mono" style={{ color: 'rgba(157,80,187,0.7)' }}>INITIALIZING NEURAL PATHWAYS...</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="relative z-10 flex flex-col" style={{ height: '100vh' }}>
        {/* Header */}
        <header
          className="flex items-center px-5 py-2.5 shrink-0"
          style={{
            borderBottom: '1px solid rgba(0,210,255,0.08)',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="w-7 h-7 rounded-full shrink-0"
              style={{
                background: 'radial-gradient(circle, #00d2ff, #9d50bb)',
                boxShadow: '0 0 14px rgba(0,210,255,0.5)',
              }}
            />
            <div>
              <div className="font-mono font-bold text-sm tracking-widest" style={{ color: '#00d2ff' }}>
                A.R.C.H.I.E.
              </div>
              <div className="font-mono" style={{ color: 'rgba(0,210,255,0.35)', fontSize: '9px', letterSpacing: '0.1em' }}>
                AUTONOMOUS REASONING ENGINE
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <ChevronDown size={10} style={{ color: 'rgba(0,210,255,0.4)' }} />
              <span className="text-xs font-mono" style={{ color: 'rgba(0,210,255,0.4)' }}>
                Say "Archie, show me Finance"
              </span>
            </div>

            <button
              onClick={() => updateSettings({ listeningEnabled: !settings.listeningEnabled })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
              style={settings.listeningEnabled ? {
                background: 'rgba(157,80,187,0.18)',
                border: '1px solid rgba(157,80,187,0.45)',
                color: '#9d50bb',
                boxShadow: '0 0 12px rgba(157,80,187,0.15)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(150,170,190,0.5)',
              }}
            >
              {settings.listeningEnabled
                ? <><Mic size={11} /><span>LISTENING</span></>
                : <><MicOff size={11} /><span>MIC OFF</span></>
              }
            </button>

            <button
              onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
              className="p-2 rounded-lg transition-all"
              style={settings.voiceEnabled ? {
                background: 'rgba(0,210,255,0.1)',
                border: '1px solid rgba(0,210,255,0.25)',
                color: '#00d2ff',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(150,170,190,0.4)',
              }}
            >
              {settings.voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88' }}
              />
              <span className="text-xs font-mono hidden sm:block" style={{ color: 'rgba(0,255,136,0.65)' }}>
                NOMINAL
              </span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Galaxy col */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 min-h-0">
            <div
              className="flex-1 rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(0,5,18,0.65)',
                border: '1px solid rgba(0,210,255,0.1)',
                boxShadow: 'inset 0 0 40px rgba(0,210,255,0.02)',
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 shrink-0"
                style={{ borderBottom: '1px solid rgba(0,210,255,0.07)' }}
              >
                <span className="text-xs font-mono font-bold" style={{ color: '#00d2ff' }}>
                  SEMANTIC GALAXY MAP
                </span>
                <span className="ml-auto text-xs font-mono" style={{ color: 'rgba(0,210,255,0.35)' }}>
                  {galaxyNodes.length} active nodes
                </span>
              </div>
              <div className="flex-1 p-2" style={{ minHeight: 0 }}>
                <GalaxyMap nodes={galaxyNodes} />
              </div>
            </div>

            {/* Status strip */}
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-4 shrink-0"
              style={{ background: 'rgba(0,5,15,0.7)', border: '1px solid rgba(0,210,255,0.07)' }}
            >
              <span className="text-xs font-mono shrink-0" style={{ color: 'rgba(0,210,255,0.4)', fontSize: '9px', letterSpacing: '0.1em' }}>
                SYS STATUS
              </span>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {[
                  { k: 'VOICE', v: settings.voiceEnabled ? 'ON' : 'OFF', c: settings.voiceEnabled ? '#00d2ff' : '#444' },
                  { k: 'STT', v: settings.listeningEnabled ? 'LIVE' : 'IDLE', c: settings.listeningEnabled ? '#9d50bb' : '#444' },
                  { k: 'NODES', v: String(galaxyNodes.length), c: '#00ff88' },
                  { k: 'MODE', v: settings.gender === 'sir' ? 'SIR' : 'MAAM', c: '#ffaa00' },
                ].map(({ k, v, c }) => (
                  <div key={k} className="text-center">
                    <div className="font-mono" style={{ color: 'rgba(150,170,190,0.35)', fontSize: '8px' }}>{k}</div>
                    <div className="text-xs font-mono font-bold" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector tiles col */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
              {SECTORS.map((sector, i) => (
                <SectorTile
                  key={sector.id}
                  id={sector.id}
                  label={sector.label}
                  description={sector.description}
                  index={i}
                  onClick={() => openSector(sector.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Thinking Terminal */}
        <div className="shrink-0 px-3 pb-3">
          <ThinkingTerminal
            logs={logs}
            transcript={voice.transcript}
            isListening={voice.isListening}
          />
        </div>
      </div>

      {/* Sector panel */}
      <AnimatePresence>
        {activeSector && (
          <SectorPanel
            id={activeSector}
            title={title}
            onLog={addLog}
            onKeyword={addGalaxyKeywords}
            settings={settings}
            onSettingsUpdate={updateSettings}
            onClose={() => setActiveSector(null)}
            onSpeak={voice.speak}
          />
        )}
      </AnimatePresence>

      {/* Priority Alert */}
      <PriorityAlert
        alert={priorityAlert}
        onDismiss={() => setPriorityAlert({ active: false, keyword: '', message: '' })}
      />
    </div>
  );
}
