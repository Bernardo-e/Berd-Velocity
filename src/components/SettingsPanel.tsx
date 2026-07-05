import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings as SettingsIcon, Volume2, Type, Sparkles, RefreshCw, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const themes = [
    { id: 'dark', name: 'Dark Space', color: 'bg-[#0b1326] border-[#c0c1ff]/20' },
    { id: 'light', name: 'Slate Light', color: 'bg-[#f8fafc] border-[#4f46e5]/20 text-[#0f172a]' },
    { id: 'cyber', name: 'Neon Cyber', color: 'bg-[#0f051d] border-[#ff007f]/20 text-[#00ffff]' },
    { id: 'ocean', name: 'Abyssal Ocean', color: 'bg-[#020c1b] border-[#38bdf8]/20' },
    { id: 'forest', name: 'Deep Forest', color: 'bg-[#060c07] border-[#a3e635]/20' },
  ];

  return (
    <div className="w-full max-w-[800px] mx-auto py-8 px-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Options & Preferences</h2>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 1. Theme Configuration selector */}
        <div className="glass-card linear-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Visual Aesthetic Theme
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {themes.map((t) => {
              const isActive = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id as any })}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${t.color} ${
                    isActive ? 'ring-2 ring-primary scale-105' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="text-[10px] font-bold block">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Typography font chooser */}
        <div className="glass-card linear-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            Workspace Typography
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings({ font: 'Geist' })}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                settings.font === 'Geist'
                  ? 'border-primary/20 bg-primary/5 text-on-surface'
                  : 'border-white/5 bg-white/[0.01] hover:border-white/10 text-on-surface-variant'
              }`}
            >
              <div>
                <span className="font-bold text-sm block">Geist Sans</span>
                <span className="text-[10px] text-outline mt-1 block">Geometric precision, high legibility.</span>
              </div>
              <span className="font-body-md text-sm pr-2">Aa</span>
            </button>

            <button
              onClick={() => updateSettings({ font: 'JetBrains Mono' })}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                settings.font === 'JetBrains Mono'
                  ? 'border-primary/20 bg-primary/5 text-on-surface'
                  : 'border-white/5 bg-white/[0.01] hover:border-white/10 text-on-surface-variant'
              }`}
            >
              <div>
                <span className="font-bold text-sm block">JetBrains Mono</span>
                <span className="font-mono text-[10px] text-outline mt-1 block">Spaced specifically for code structure.</span>
              </div>
              <span className="font-mono-input text-sm pr-2">Aa</span>
            </button>
          </div>
        </div>

        {/* 3. Audio & Key Synthesizer options */}
        <div className="glass-card linear-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-secondary" />
            Tactile Audio Click Synthesizer
          </h3>
          <div className="flex flex-col gap-6">
            
            {/* Audio click type select */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'none', label: 'Muted', desc: 'Silent execution' },
                { id: 'linear', label: 'Linear Click', desc: 'High pitch switch' },
                { id: 'tactile', label: 'Tactile Snap', desc: 'Double leaf snap' },
                { id: 'typewriter', label: 'Typewriter', desc: 'Metallic bell return' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => updateSettings({ soundType: sound.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.soundType === sound.id
                      ? 'border-secondary/20 bg-secondary/5 text-on-surface'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10 text-on-surface-variant'
                  }`}
                >
                  <span className="font-bold text-xs block">{sound.label}</span>
                  <span className="text-[9px] text-outline mt-0.5 block">{sound.desc}</span>
                </button>
              ))}
            </div>

            {/* Volume slider */}
            {settings.soundType !== 'none' && (
              <div className="flex items-center gap-4 bg-background/50 border border-white/5 rounded-xl p-4">
                {settings.volume === 0 ? <VolumeX className="w-5 h-5 text-outline" /> : <Volume2 className="w-5 h-5 text-primary" />}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-outline font-bold">VOLUME: {Math.round(settings.volume * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 4. Motion / Animation speed parameters */}
        <div className="glass-card linear-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Interactive Animation Quality
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'high', label: 'High Depth', desc: 'WebGL + key animations' },
              { id: 'low', label: 'Low Impact', desc: 'Subtle shader overlays' },
              { id: 'none', label: 'Static Mode', desc: 'No active canvas background' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => updateSettings({ animationLevel: anim.id as any })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.animationLevel === anim.id
                    ? 'border-primary/20 bg-primary/5 text-on-surface'
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                }`}
              >
                <span className="font-bold text-xs block">{anim.label}</span>
                <span className="text-[9px] text-outline mt-0.5 block">{anim.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Auto restart switch */}
        <div className="glass-card linear-border rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-secondary" />
            <div>
              <span className="font-bold text-sm block">Auto Restart Session</span>
              <span className="text-[10px] text-outline block mt-0.5">Automatically restart the test with a new text block on ESC or run termination.</span>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ autoRestart: !settings.autoRestart })}
            className={`w-12 h-6 rounded-full transition-all relative flex items-center p-0.5 cursor-pointer ${
              settings.autoRestart ? 'bg-primary' : 'bg-surface-container border border-white/10'
            }`}
          >
            <motion.div
              layout
              className="w-5 h-5 bg-background rounded-full shadow-md"
              animate={{ x: settings.autoRestart ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

      </div>

    </div>
  );
};
