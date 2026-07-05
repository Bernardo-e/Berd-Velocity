import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { Bolt, Cpu, Sparkles, Terminal, Volume2, Trophy, HelpCircle, FileText, ChevronDown } from 'lucide-react';

const THEMES = [
  { id: 'dark',   label: 'Obsidian', dot: '#c0c1ff' },
  { id: 'cyber',  label: 'Cyber',    dot: '#a855f7' },
  { id: 'ocean',  label: 'Ocean',    dot: '#38bdf8' },
  { id: 'forest', label: 'Forest',   dot: '#4ade80' },
  { id: 'light',  label: 'Light',    dot: '#6366f1' },
];

const FEATURES = [
  {
    icon: <Terminal className="w-6 h-6 text-primary" />,
    title: "Technical Content Modes",
    description: "Practice programming logic in JS, TS, Rust, Python, or type technology articles, historical archives, and general quotes."
  },
  {
    icon: <Volume2 className="w-6 h-6 text-secondary" />,
    title: "Tactile Key Synth",
    description: "Engage auditory muscle memory with synthetic mechanical linear switches, clicky tactile leaf snaps, or classic typewriter strikes."
  },
  {
    icon: <FileText className="w-6 h-6 text-primary" />,
    title: "Client-Side PDF Mode",
    description: "Upload local documents and novels. Text extraction happens fully in-browser, giving you customized passages with complete privacy."
  },
  {
    icon: <Trophy className="w-6 h-6 text-secondary" />,
    title: "Milestone Achievements",
    description: "Unlock beautiful badging milestones based on speed bursts, perfect accuracy streaks, and consistent training schedules."
  },
  {
    icon: <Cpu className="w-6 h-6 text-primary" />,
    title: "Performance Telemetry",
    description: "Examine detailed charts of WPM and accuracy progression mapped second-by-second for every complete practice session."
  },
  {
    icon: <Sparkles className="w-6 h-6 text-secondary" />,
    title: "Custom Aesthetic Themes",
    description: "Instantly swap between Dark (Obsidian space), Light (Slate high-contrast), Cyber (Neon violet), Ocean, or Forest themes."
  }
];

const FAQS = [
  {
    q: "Is any data stored on a backend server?",
    a: "No. Velocity is designed to run entirely client-side. Your practice history, personal bests, achievement records, settings, and PDF contents are saved in local storage. We do not use databases, and no login is required."
  },
  {
    q: "How does the PDF Mode work?",
    a: "When you upload a PDF file, our client-side parser reads the raw binary, parses the characters using PDF.js text blocks, cleans up double spacing/line breaks, and converts it into scrollable practice sections. It happens instantly in your browser."
  },
  {
    q: "How does the audio synthesis work?",
    a: "Instead of requesting static audio asset files which add lag and load overhead, we synthesize key clicks in real time using the browser's Web Audio API. This ensures zero latency and absolute sync with your typing."
  },
  {
    q: "What fonts are available?",
    a: "We support Geist Sans (a highly legible geometric typeface built for code environments) and JetBrains Mono (specifically spaced for rhythmic, consistent key patterns)."
  }
];

export const LandingPage: React.FC = () => {
  const { setActiveTab, settings, updateSettings } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-typing preview state
  const [typedText, setTypedText] = useState('');
  const [previewWpm, setPreviewWpm] = useState(0);
  const [previewAcc, setPreviewAcc] = useState(100);
  const targetText = "const speedTest = () => { const velocity = true; return 'Elite Performance'; };";

  useEffect(() => {
    let index = 0;
    let charsTyped = 0;
    let errorsCount = 0;
    
    const interval = setInterval(() => {
      if (index < targetText.length) {
        // Occasionally simulate a typo and backspace correction
        const nextChar = targetText[index];
        charsTyped++;
        
        // Simulating a typo on the word 'velocity'
        if (index === 26 && Math.random() < 0.6 && !typedText.endsWith('x')) {
          setTypedText(prev => prev + 'x');
          errorsCount++;
          setPreviewAcc(Math.round(((charsTyped - errorsCount) / charsTyped) * 100));
          return;
        }

        // Correcting the typo
        if (typedText.endsWith('x')) {
          setTypedText(prev => prev.slice(0, -1));
          return;
        }

        setTypedText(prev => prev + nextChar);
        index++;
        
        // Simulating progressive stats
        setPreviewWpm(Math.round(75 + Math.sin(index * 0.1) * 25));
        setPreviewAcc(Math.round(((charsTyped - errorsCount) / charsTyped) * 100));
      } else {
        // Loop back
        setTimeout(() => {
          setTypedText('');
          setPreviewWpm(0);
          setPreviewAcc(100);
          index = 0;
          charsTyped = 0;
          errorsCount = 0;
        }, 3000);
      }
    }, 90);

    return () => clearInterval(interval);
  }, [typedText]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 px-6 md:px-12 text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[900px] z-10 flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-white/10 text-primary text-label-sm uppercase tracking-widest mb-6 shadow-inner">
            <Sparkles className="w-4.5 h-4.5 animate-pulse text-secondary" />
            Obsidian Velocity 2.0
          </span>

          <h1 className="font-display-xl text-4xl md:text-6xl text-on-surface mb-6 leading-[1.08] tracking-tighter max-w-[800px] font-bold">
            The Premium Engine for <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-sm">
              Elite Typing Performance
            </span>
          </h1>

          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-[650px] mb-10 leading-relaxed font-normal">
            Improve your focus, typing rhythm, and programming speed on a distraction-free, beautifully glassmorphic dashboard built for power users.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 z-20">
            <button
              onClick={() => setActiveTab('practice')}
              className="bg-on-surface text-background px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_-2px_var(--primary-glow)] hover:bg-primary transition-all duration-300 active:scale-95"
            >
              <Bolt className="w-5 h-5 fill-current" />
              Enter Practice Mode
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="glass-card hover:bg-white/5 text-on-surface px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
            >
              View Dashboard
            </button>
          </div>

          {/* Theme switcher — try themes right from the hero */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <span className="text-xs text-outline uppercase tracking-widest font-semibold">Try a theme</span>
            <div className="flex items-center gap-1.5 bg-surface-container/60 rounded-full px-2.5 py-2 border border-white/10 flex-wrap justify-center">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id as any })}
                  title={t.label}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === t.id
                      ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm scale-105'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.dot }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Typing Preview Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-[800px] glass-card linear-border rounded-2xl p-6 md:p-8 text-left shadow-2xl relative z-10 mb-10"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
              <span className="text-outline text-xs font-mono ml-2">velocity_runtime_preview.ts</span>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase text-outline block tracking-widest font-semibold">SPEED</span>
                <span className="font-mono text-primary font-bold">{previewWpm} WPM</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-outline block tracking-widest font-semibold">ACCURACY</span>
                <span className="font-mono text-secondary font-bold">{previewAcc}%</span>
              </div>
            </div>
          </div>

          {/* Typing Area */}
          <div className="font-mono-input text-xl md:text-2xl min-h-[70px] leading-relaxed selection:bg-transparent">
            {typedText.split('').map((char, index) => {
              const expectedChar = targetText[index];
              const isCorrect = char === expectedChar;
              return (
                <span
                  key={index}
                  className={isCorrect ? 'text-secondary' : 'text-error bg-error/10'}
                >
                  {char}
                </span>
              );
            })}
            {/* Blinking caret */}
            <span className="inline-block w-[2px] h-[1.3em] bg-primary align-middle ml-[1px] caret-blink" />
            <span className="text-outline/40">
              {targetText.substring(typedText.length)}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">
            Engineered for Precision
          </h2>
          <p className="text-on-surface-variant max-w-[500px] mx-auto">
            A premium collection of toolsets designed to refine muscle memory and elevate your typing speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card linear-border p-6 rounded-2xl flex flex-col gap-4 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-on-surface mt-2">{feat.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-lowest/50 border-y border-white/5 relative">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-display-xl text-4xl md:text-5xl font-bold block text-primary mb-2">12M+</span>
            <span className="text-xs uppercase text-outline tracking-wider font-semibold">Total Characters Processed</span>
          </div>
          <div>
            <span className="text-display-xl text-4xl md:text-5xl font-bold block text-secondary mb-2">98.4%</span>
            <span className="text-xs uppercase text-outline tracking-wider font-semibold">Average Accuracy</span>
          </div>
          <div>
            <span className="text-display-xl text-4xl md:text-5xl font-bold block text-primary mb-2">84 WPM</span>
            <span className="text-xs uppercase text-outline tracking-wider font-semibold">Top User WPM</span>
          </div>
          <div>
            <span className="text-display-xl text-4xl md:text-5xl font-bold block text-secondary mb-2">100%</span>
            <span className="text-xs uppercase text-outline tracking-wider font-semibold">Client-Side Isolation</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">
            Loved by Developers
          </h2>
          <p className="text-on-surface-variant max-w-[450px] mx-auto">
            See why technical users prefer the clean aesthetics and layout of Velocity Typing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-normal">
              "The custom programming mode is a game changer. Most typing sites use weird sentence structures, but practice with standard semicolons, brackets, and code fragments actually speeds up coding."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">AS</div>
              <div>
                <span className="font-semibold text-sm block">Alex S.</span>
                <span className="text-outline text-xs">Staff Engineer</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-normal">
              "Synthetic key sound clickers are incredibly responsive. I get the mechanical clicky keyboard confirmation even when I am traveling and writing code on my laptop. Zero lag."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">ML</div>
              <div>
                <span className="font-semibold text-sm block">Morgan L.</span>
                <span className="text-outline text-xs">UX Specialist</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-normal">
              "The design looks like a modern SaaS product like Linear or Stripe, rather than some educational game. I actually keep a tab open just to warm up my hands before work."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">DH</div>
              <div>
                <span className="font-semibold text-sm block">Dan H.</span>
                <span className="text-outline text-xs">Rust Developer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-24 px-6 md:px-12 max-w-[800px] mx-auto border-t border-white/5">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-on-surface hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-outline-variant" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-outline-variant'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/5 bg-white/[0.01]"
                    >
                      <p className="p-5 text-sm text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing CTA Footer Banner */}
      <section className="py-20 px-6 text-center border-t border-white/5 bg-surface-container-lowest/20">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start Improving Your Rhythm</h2>
          <p className="text-on-surface-variant mb-8 text-sm md:text-base">
            No installation, no authentication, 100% free. Customize your themes, load your text, and start practicing in seconds.
          </p>
          <button
            onClick={() => setActiveTab('practice')}
            className="bg-primary text-on-primary-container hover:scale-105 transition-all px-8 py-4 rounded-xl font-bold shadow-lg"
          >
            Launch Live Typing Practice
          </button>
        </div>
      </section>
    </div>
  );
};
