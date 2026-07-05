import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { getParagraph } from '../utils/textGenerators';
import { extractTextFromPdf } from '../utils/pdfExtractor';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { } from '../types/index';
import {
  Keyboard, RotateCcw, FileText, AlertCircle, Sparkles,
  Code2, Quote, FlaskConical, BookOpen, Upload, Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Category metadata ──────────────────────────────────────────
const CATEGORIES = [
  { id: 'quotes',      label: 'Quotes',      icon: Quote },
  { id: 'programming', label: 'Code',        icon: Code2 },
  { id: 'technology',  label: 'Technology',  icon: Type },
  { id: 'science',     label: 'Science',     icon: FlaskConical },
  { id: 'history',     label: 'History',     icon: BookOpen },
  { id: 'custom',      label: 'Custom',      icon: Sparkles },
  { id: 'pdf',         label: 'PDF',         icon: FileText },
];

// ── Memoized character renderer (avoids full re-render on keypress) ──
const TextDisplay = React.memo(({
  text,
  typedText,
  charIndex,
}: {
  text: string;
  typedText: string;
  charIndex: number;
}) => {
  return (
    <>
      {text.split('').map((char, i) => {
        let cls = 'char-neutral';
        if (i < typedText.length) {
          cls = typedText[i] === char ? 'char-correct' : 'char-wrong';
        } else if (i === charIndex) {
          cls = 'char-active';
        }
        return (
          <span key={i} className={cls}>
            {char}
            {i === charIndex && (
              <span className="typing-caret" />
            )}
          </span>
        );
      })}
    </>
  );
});

// ── Main component ─────────────────────────────────────────────
export const PracticeMode: React.FC = () => {
  const { settings, updateSettings, saveTestRun, setActiveTab } = useApp();

  const [testText, setTestText]           = useState('');
  const [isFocused, setIsFocused]         = useState(false);
  const [customOpen, setCustomOpen]       = useState(false);
  const [customInput, setCustomInput]     = useState('');
  const [pdfLoading, setPdfLoading]       = useState(false);
  const [pdfError, setPdfError]           = useState<string | null>(null);
  const [pdfFileName, setPdfFileName]     = useState<string>('');

  const zoneRef  = useRef<HTMLDivElement>(null);
  const pdfRef   = useRef<HTMLInputElement>(null);

  const { playClick, playError } = useSoundEffects(settings);

  // ── Load passage ──
  const loadPassage = useCallback((
    cat = settings.textCategory,
    mode = settings.testMode,
  ) => {
    if (cat === 'custom' || cat === 'pdf') {
      setTestText(settings.customText || '');
      return;
    }
    const wc = mode === 'words' ? settings.wordCount : 80;
    setTestText(getParagraph(cat, wc));
  }, [settings.textCategory, settings.testMode, settings.wordCount, settings.customText]);

  useEffect(() => { loadPassage(); }, [loadPassage]);

  // ── Engine ──
  const handleComplete = useCallback((finalStats: any) => {
    saveTestRun(finalStats);
    setTimeout(() => setActiveTab('results'), 200);
  }, [saveTestRun, setActiveTab]);

  const {
    typedText, charIndex, mistakes,
    isPlaying, isFinished, timeLeft, countdown,
    wpm, accuracy, processKey, triggerCountdown, resetEngine,
  } = useTypingEngine({
    text: testText,
    testMode: settings.testMode,
    duration: settings.duration,
    autoRestart: settings.autoRestart,
    onComplete: handleComplete,
    playClick,
    playError,
  });

  // Reset engine when text changes
  useEffect(() => { resetEngine(); }, [testText]); // eslint-disable-line

  // ── Keyboard handler on the focus zone ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Escape') { triggerCountdown(() => zoneRef.current?.focus()); return; }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    processKey(e.key);
  }, [processKey, triggerCountdown]);

  // ── Global key listener for ESC ──
  useEffect(() => {
    if (customOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); triggerCountdown(() => zoneRef.current?.focus()); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [customOpen, triggerCountdown]);

  // ── PDF upload ──
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    setPdfError(null);
    setPdfFileName(file.name);
    try {
      const extracted = await extractTextFromPdf(file);
      updateSettings({ customText: extracted, textCategory: 'pdf' });
      setTestText(extracted);
    } catch (err: any) {
      setPdfError(err.message || 'Error parsing PDF.');
    } finally {
      setPdfLoading(false);
      if (pdfRef.current) pdfRef.current.value = '';
    }
  };

  // ── Custom text submit ──
  const submitCustom = () => {
    if (!customInput.trim()) return;
    updateSettings({ customText: customInput.trim(), textCategory: 'custom' });
    setTestText(customInput.trim());
    setCustomOpen(false);
  };

  // ── Stats progress bar ──
  const progressPct = testText.length > 0
    ? Math.min(100, Math.round((charIndex / testText.length) * 100))
    : 0;

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">

      {/* ── TOP CONTROL STRIP ─────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = settings.textCategory === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id === 'custom') { setCustomInput(settings.customText || ''); setCustomOpen(true); return; }
                  updateSettings({ textCategory: id as any });
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  border transition-all duration-200 cursor-pointer
                  ${active
                    ? 'bg-primary text-background border-primary shadow-[0_0_16px_rgba(192,193,255,0.3)]'
                    : 'bg-surface-container border-white/10 text-on-surface-variant hover:border-primary/40 hover:text-on-surface'}
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Mode + Duration row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time / Words toggle */}
          <div className="flex items-center bg-surface-container rounded-xl p-1 border border-white/10">
            {(['time', 'words'] as const).map(m => (
              <button
                key={m}
                onClick={() => updateSettings({ testMode: m })}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all cursor-pointer ${
                  settings.testMode === m
                    ? 'bg-background text-primary shadow'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Duration / word count pills + custom input */}
          <div className="flex items-center gap-2 flex-wrap">
            {settings.testMode === 'time'
              ? [15, 30, 60, 120].map(d => (
                  <button key={d}
                    onClick={() => updateSettings({ duration: d })}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      settings.duration === d
                        ? 'border-secondary/50 bg-secondary/15 text-secondary'
                        : 'border-white/10 text-on-surface-variant hover:border-white/20 hover:text-on-surface'
                    }`}
                  >{d}s</button>
                ))
              : [10, 25, 50, 100].map(n => (
                  <button key={n}
                    onClick={() => updateSettings({ wordCount: n })}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      settings.wordCount === n
                        ? 'border-secondary/50 bg-secondary/15 text-secondary'
                        : 'border-white/10 text-on-surface-variant hover:border-white/20 hover:text-on-surface'
                    }`}
                  >{n}</button>
                ))
            }

            {/* Custom value input */}
            <div className="flex items-center gap-1.5">
              <span className="text-outline/50 text-xs font-semibold">or</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={settings.testMode === 'time' ? 5 : 5}
                  max={settings.testMode === 'time' ? 600 : 500}
                  value={settings.testMode === 'time' ? settings.duration : settings.wordCount}
                  onChange={e => {
                    const val = Math.max(5, parseInt(e.target.value) || 5);
                    if (settings.testMode === 'time') updateSettings({ duration: val });
                    else updateSettings({ wordCount: val });
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-lg text-sm font-bold border border-white/10 bg-surface-container text-center focus:border-secondary/50 focus:outline-none transition-all"
                />
                <span className="absolute right-2 text-xs text-outline/60 pointer-events-none">
                  {settings.testMode === 'time' ? 's' : 'w'}
                </span>
              </div>
            </div>
          </div>

          {/* PDF upload button (always visible, not just when pdf mode active) */}
          <label className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer
            transition-all hover:scale-[1.02] active:scale-95
            ${settings.textCategory === 'pdf'
              ? 'bg-secondary/10 border-secondary/30 text-secondary'
              : 'bg-surface-container border-white/10 text-on-surface-variant hover:border-white/20'}
          `}>
            <Upload className="w-4 h-4" />
            {pdfLoading ? 'Parsing…' : pdfFileName ? pdfFileName.substring(0, 16) + '…' : 'Upload PDF'}
            <input
              ref={pdfRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />
          </label>

          {pdfError && (
            <div className="flex items-center gap-1.5 text-error text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {pdfError}
            </div>
          )}
        </div>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'WPM',      value: isPlaying ? wpm : 0,    color: 'text-primary',    unit: '' },
          { label: 'Accuracy', value: accuracy,                color: 'text-secondary',  unit: '%' },
          { label: settings.testMode === 'time' ? 'TIME' : 'CHARS',
            value: settings.testMode === 'time' ? timeLeft : charIndex,
            color: 'text-on-surface', unit: settings.testMode === 'time' ? 's' : '' },
          { label: 'ERRORS',   value: mistakes,               color: 'text-error',      unit: '' },
        ].map(({ label, value, color, unit }) => (
          <div key={label} className="glass-card linear-border rounded-2xl p-4 text-center">
            <span className="block text-[10px] text-outline font-bold uppercase tracking-widest mb-1">{label}</span>
            <span className={`font-mono text-3xl font-bold ${color}`}>
              {value}<span className="text-sm font-normal text-outline ml-0.5">{unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── TYPING ZONE ────────────────────────────────────── */}
      <div
        ref={zoneRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          glass-card linear-border rounded-2xl p-8 md:p-10 min-h-[220px]
          flex items-center justify-center relative cursor-text
          outline-none transition-all duration-200
          ${isFocused ? 'ring-2 ring-primary/30 border-primary/20' : 'border-white/10'}
        `}
      >
        {/* Unfocused prompt */}
        {!isFocused && !isFinished && countdown === null && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-background/40 rounded-2xl z-10 cursor-pointer"
            onClick={() => zoneRef.current?.focus()}
          >
            <Keyboard className="w-10 h-10 text-primary" />
            <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
              Click here or press any key to start
            </p>
          </div>
        )}

        {/* Empty PDF/custom prompt */}
        {isFocused && !testText && (settings.textCategory === 'pdf' || settings.textCategory === 'custom') && (
          <div className="flex flex-col items-center gap-3 text-center">
            <FileText className="w-10 h-10 text-outline" />
            <p className="text-on-surface-variant text-sm">
              {settings.textCategory === 'pdf'
                ? 'Upload a PDF using the button above to start practicing.'
                : 'Click "Custom" to paste your own practice text.'}
            </p>
          </div>
        )}

        {/* Text display */}
        {testText && (
          <div className="w-full typing-text-area select-none leading-[2.4] tracking-wide text-xl md:text-[22px] font-mono relative overflow-hidden">
            <TextDisplay
              text={testText}
              typedText={typedText}
              charIndex={charIndex}
            />
          </div>
        )}
      </div>

      {/* ── BOTTOM HINT ROW ────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-outline/60">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded border border-outline/20 font-mono">ESC</span>
          <span>restart</span>
          <span className="text-white/10 mx-1">|</span>
          <button
            onClick={() => triggerCountdown(() => zoneRef.current?.focus())}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Test
          </button>
        </div>
        <span className="text-outline/40 font-mono">
          {charIndex} / {testText.length} chars
        </span>
      </div>

      {/* ── COUNTDOWN OVERLAY ─────────────────────────────── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.4, 1.15, 1], opacity: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="text-[120px] md:text-[180px] font-black text-primary leading-none"
              style={{ textShadow: '0 0 60px var(--primary-glow)' }}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CUSTOM TEXT MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {customOpen && (
          <div className="fixed inset-0 z-[300] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl glass-card linear-border rounded-2xl p-7 shadow-2xl"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Custom Practice Text</h3>
              </div>
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Paste or type any text you want to practice with…"
                rows={7}
                autoFocus
                className="w-full bg-background/60 border border-white/10 rounded-xl p-4 text-base text-on-surface focus:outline-none focus:border-primary transition-all font-mono resize-none mb-5 leading-relaxed"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCustomOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/5 transition-colors"
                >Cancel</button>
                <button
                  onClick={submitCustom}
                  className="px-6 py-2.5 rounded-xl text-sm bg-primary text-background font-bold hover:scale-105 active:scale-95 transition-all"
                >Use This Text</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
