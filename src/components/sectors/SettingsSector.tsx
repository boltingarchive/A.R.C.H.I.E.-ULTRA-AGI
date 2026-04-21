import { motion } from 'framer-motion';
import { Settings, Mic, Volume2, Sun, Moon, User, Radio } from 'lucide-react';
import type { ArchieSettings } from '../../types';

interface Props {
  settings: ArchieSettings;
  onUpdate: (patch: Partial<ArchieSettings>) => void;
  onLog: (msg: string, type?: 'info' | 'warning' | 'success' | 'processing') => void;
}

function Slider({ label, value, min, max, step, onChange, color }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: 'rgba(180,200,220,0.8)' }}>{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(1)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 0%)` }}
      />
    </div>
  );
}

function Toggle({ label, icon: Icon, value, onChange, color }: {
  label: string; icon: React.ElementType; value: boolean; onChange: (v: boolean) => void; color: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all"
      style={{
        background: value ? `${color}15` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <Icon size={16} style={{ color: value ? color : 'rgba(150,170,190,0.5)' }} />
      <span className="text-sm font-medium flex-1 text-left" style={{ color: value ? 'rgba(220,240,255,0.9)' : 'rgba(150,170,190,0.7)' }}>
        {label}
      </span>
      <div
        className="w-10 h-5 rounded-full relative transition-all duration-300"
        style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
        />
      </div>
    </button>
  );
}

export default function SettingsSector({ settings, onUpdate, onLog }: Props) {
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} style={{ color: '#a0aec0' }} />
        <span className="font-mono text-sm font-bold" style={{ color: '#a0aec0' }}>SYSTEM CONFIGURATION</span>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-widest mb-3" style={{ color: 'rgba(160,174,192,0.6)' }}>
            DISPLAY
          </h3>
          <Toggle
            label="Dark Mode"
            icon={settings.darkMode ? Moon : Sun}
            value={settings.darkMode}
            onChange={v => { onUpdate({ darkMode: v }); onLog(`Display mode: ${v ? 'Dark' : 'Light'}`, 'info'); }}
            color="#a0aec0"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-widest mb-3" style={{ color: 'rgba(160,174,192,0.6)' }}>
            PERSONA
          </h3>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['sir', 'maam'] as const).map(g => (
              <button
                key={g}
                onClick={() => { onUpdate({ gender: g }); onLog(`Protocol updated: addressing as ${g === 'sir' ? 'Sir' : "Ma'am"}`, 'success'); }}
                className="flex items-center gap-3 w-full px-4 py-3 transition-all"
                style={{
                  background: settings.gender === g ? 'rgba(0,210,255,0.1)' : 'transparent',
                  borderBottom: g === 'sir' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <User size={14} style={{ color: settings.gender === g ? '#00d2ff' : 'rgba(150,170,190,0.5)' }} />
                <span className="text-sm font-mono" style={{ color: settings.gender === g ? '#00d2ff' : 'rgba(150,170,190,0.7)' }}>
                  {g === 'sir' ? 'Sir (Male Protocol)' : "Ma'am (Female Protocol)"}
                </span>
                {settings.gender === g && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ background: '#00d2ff', boxShadow: '0 0 6px #00d2ff' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 col-span-2">
          <h3 className="text-xs font-mono font-bold tracking-widest" style={{ color: 'rgba(160,174,192,0.6)' }}>
            VOICE INTERFACE
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Toggle
              label="Archie-Speak (TTS)"
              icon={Volume2}
              value={settings.voiceEnabled}
              onChange={v => { onUpdate({ voiceEnabled: v }); onLog(`TTS ${v ? 'enabled' : 'disabled'}`, 'info'); }}
              color="#00d2ff"
            />
            <Toggle
              label="Always-Listening (STT)"
              icon={settings.listeningEnabled ? Radio : Mic}
              value={settings.listeningEnabled}
              onChange={v => { onUpdate({ listeningEnabled: v }); onLog(`Voice input ${v ? 'activated' : 'deactivated'}`, 'info'); }}
              color="#9d50bb"
            />
          </div>
          <div
            className="rounded-xl p-4 space-y-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Slider
              label="Voice Speed" value={settings.voiceSpeed} min={0.5} max={2} step={0.1}
              onChange={v => onUpdate({ voiceSpeed: v })}
              color="#00d2ff"
            />
            <Slider
              label="Voice Pitch" value={settings.voicePitch} min={0.5} max={2} step={0.1}
              onChange={v => onUpdate({ voicePitch: v })}
              color="#9d50bb"
            />
          </div>
        </div>

        <div className="col-span-2">
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.1)' }}
          >
            <h3 className="text-xs font-mono font-bold tracking-widest mb-3" style={{ color: 'rgba(0,210,255,0.7)' }}>
              SYSTEM INFO
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              {[
                ['VERSION', 'v3.7.2'],
                ['AI ENGINE', 'Puter.js'],
                ['COST', '$0.00'],
                ['PROTOCOL', settings.gender === 'sir' ? 'ALPHA-M' : 'ALPHA-F'],
                ['LICENSE', 'MIT'],
                ['STATUS', 'NOMINAL'],
              ].map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <div style={{ color: 'rgba(0,210,255,0.4)', fontSize: '10px' }}>{k}</div>
                  <div style={{ color: 'rgba(200,230,255,0.8)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
