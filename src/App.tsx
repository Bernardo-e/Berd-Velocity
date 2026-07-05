import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { BackgroundShader } from './components/BackgroundShader';
import { LandingPage } from './components/LandingPage';
import { PracticeMode } from './components/PracticeMode';
import { ResultsSummary } from './components/ResultsSummary';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { Settings as SettingsIcon, User, Palette, X, Check, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Theme config ───────────────────────────────────────────────
const THEMES = [
  { id: 'dark',   label: 'Obsidian', dot: '#c0c1ff' },
  { id: 'cyber',  label: 'Cyber',    dot: '#a855f7' },
  { id: 'ocean',  label: 'Ocean',    dot: '#38bdf8' },
  { id: 'forest', label: 'Forest',   dot: '#4ade80' },
  { id: 'light',  label: 'Light',    dot: '#6366f1' },
];

// ── Simple modal shell ─────────────────────────────────────────
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  open, onClose, title, children,
}) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[500] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg glass-card linear-border rounded-2xl p-7 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ── Main app content ───────────────────────────────────────────
const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, settings, updateSettings, userName, setUserName } = useApp();

  const [nameOpen, setNameOpen]       = useState(false);
  const [nameInput, setNameInput]     = useState('');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen]     = useState(false);

  const openNameModal = () => { setNameInput(userName); setNameOpen(true); };
  const saveName = () => { setUserName(nameInput.trim()); setNameOpen(false); };

  const fontClass = settings.font === 'JetBrains Mono' ? 'font-mono' : 'font-sans';

  const navItems: Array<{ id: 'practice' | 'dashboard'; label: string }> = [
    { id: 'practice',  label: 'Practice' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <div className={`min-h-screen flex flex-col relative z-10 transition-colors duration-300 ${fontClass}`}>
      <BackgroundShader />

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-white/10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]">
        <div className="flex items-center px-6 md:px-12 py-3.5 max-w-[1200px] mx-auto w-full">

          {/* Logo — left */}
          <button
            onClick={() => setActiveTab('landing')}
            className="font-display-xl text-xl tracking-tighter text-primary font-bold hover:opacity-85 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            ⚡ Velocity
          </button>

          {/* Nav links — centered absolutely */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-container/60 rounded-xl px-1.5 py-1 border border-white/8">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-background text-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2.5">

            {/* Theme quick-switcher */}
            <div className="relative">
              <button
                onClick={() => setThemeOpen(v => !v)}
                title="Change Theme"
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors bg-white/5 border border-white/8 hover:border-white/15 cursor-pointer"
              >
                <Palette className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-card linear-border rounded-xl p-2 shadow-2xl min-w-[140px] z-50"
                  >
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { updateSettings({ theme: t.id as any }); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                          settings.theme === t.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.dot }} />
                        {t.label}
                        {settings.theme === t.id && <Check className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('dashboard')}
              title="Settings"
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors bg-white/5 border border-white/8 hover:border-white/15 cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* User name badge */}
            <button
              onClick={openNameModal}
              title={userName ? `Logged in as ${userName}` : 'Set your name'}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-surface-container border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors">
                {userName
                  ? <span className="text-xs font-bold leading-none">{userName.slice(0, 2).toUpperCase()}</span>
                  : <User className="w-3.5 h-3.5" />
                }
              </div>
              <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
                {userName || 'Set Name'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ──────────────────────────────────── */}
      <main className="flex-grow pt-20 pb-12 relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22 }}
            className="w-full h-full flex flex-col items-center"
          >
            {activeTab === 'landing'    && <LandingPage />}
            {activeTab === 'practice'  && <PracticeMode />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'results'   && <ResultsSummary />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Settings drawer at bottom of dashboard */}
      {activeTab === 'dashboard' && (
        <section className="border-t border-white/5 py-12 bg-surface-container-lowest/20">
          <SettingsPanel />
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="w-full bg-surface-container-lowest border-t border-white/5 py-5 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-12 gap-3 max-w-[1200px] mx-auto text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="text-outline">© 2026 Velocity Typing</span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5 text-outline/70">
              Made by{' '}
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">berd</span>
              {' '}⚡
            </span>
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <button onClick={() => setPrivacyOpen(true)} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setTermsOpen(true)}   className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
            <a
              href="https://www.linkedin.com/in/bernardo-e-092aaa387/"
              target="_blank" rel="noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <a href="https://github.com/Bernardo-e" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* ── Name modal ────────────────────────────────────── */}
      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Your Display Name">
        <p className="text-sm text-on-surface-variant mb-4">
          Set a name to personalize your Velocity experience. It's stored locally on your device.
        </p>
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveName()}
          placeholder="e.g. MasterTypist…"
          maxLength={24}
          autoFocus
          className="w-full border border-primary/45 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all mb-5 font-semibold"
          style={{ color: '#000000', backgroundColor: '#ffffff' }}
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setNameOpen(false)} className="px-5 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={saveName} className="px-6 py-2.5 rounded-xl text-sm bg-primary text-background font-bold hover:scale-105 active:scale-95 transition-all">Save Name</button>
        </div>
      </Modal>



      {/* ── Privacy Policy modal ──────────────────────────── */}
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy">
        <div className="text-sm text-on-surface-variant leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p><strong className="text-on-surface">Last updated:</strong> July 2026</p>
          <p>Velocity Typing is a fully client-side application. We do not collect, transmit, or store any personal data on external servers.</p>
          <h4 className="text-on-surface font-semibold">What we store locally</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your typing history (WPM, accuracy, timestamps)</li>
            <li>Your display name and settings preferences</li>
            <li>Unlocked achievements and custom text/PDF content</li>
          </ul>
          <p>All data is saved in your browser's <code className="text-primary bg-primary/10 px-1 rounded">localStorage</code>. It never leaves your device. You can delete all data at any time via the Dashboard's "Clear Local Data" button.</p>
          <h4 className="text-on-surface font-semibold">Third-party services</h4>
          <p>We do not use analytics, tracking pixels, or advertising networks. No cookies are set. No login is required.</p>
          <h4 className="text-on-surface font-semibold">Changes to this policy</h4>
          <p>Any future changes will be reflected here. Continued use of the app constitutes acceptance of the current policy.</p>
        </div>
      </Modal>

      {/* ── Terms of Service modal ────────────────────────── */}
      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Terms of Service">
        <div className="text-sm text-on-surface-variant leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p><strong className="text-on-surface">Last updated:</strong> July 2026</p>
          <p>By using Velocity Typing, you agree to these terms. The service is provided free of charge for personal, educational use.</p>
          <h4 className="text-on-surface font-semibold">Acceptable use</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the app for personal typing practice and skill development</li>
            <li>Share your results and invite others to improve their speed</li>
            <li>Provide feedback to help improve the product</li>
          </ul>
          <h4 className="text-on-surface font-semibold">Prohibited use</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reverse-engineering or redistributing the source without credit</li>
            <li>Using the app to process and expose confidential documents to third parties</li>
          </ul>
          <h4 className="text-on-surface font-semibold">Disclaimer</h4>
          <p>Velocity Typing is provided "as-is" without warranty of any kind. The authors are not liable for any data loss or damages arising from use of the application.</p>
          <h4 className="text-on-surface font-semibold">Governing law</h4>
          <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Chennai, Tamil Nadu.</p>
        </div>
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
