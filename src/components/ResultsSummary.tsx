import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { RotateCcw, Share2, Zap, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

// ── Grade calculator ───────────────────────────────────────────────
interface Grade {
  letter: string;
  label: string;
  color: string;
  shadow: string;
  isGood: boolean; // used to decide confetti + phrasing
}

function getTestGrade(wpm: number, accuracy: number): Grade {
  if (wpm >= 120 && accuracy === 100) {
    return { letter: 'S+', label: 'Legendary',     color: 'text-secondary', shadow: 'var(--secondary)', isGood: true };
  }
  if (wpm >= 100 && accuracy >= 98) {
    return { letter: 'S',  label: 'Elite',          color: 'text-primary',   shadow: 'var(--primary)',   isGood: true };
  }
  if (wpm >= 80 && accuracy >= 95) {
    return { letter: 'A',  label: 'Advanced',       color: 'text-primary',   shadow: 'var(--primary)',   isGood: true };
  }
  if (wpm >= 60 && accuracy >= 90) {
    return { letter: 'B',  label: 'Proficient',     color: 'text-on-surface',shadow: 'var(--on-surface)',isGood: true };
  }
  if (wpm >= 40 && accuracy >= 80) {
    return { letter: 'C',  label: 'Developing',     color: 'text-tertiary',  shadow: 'var(--outline)',   isGood: false };
  }
  return   { letter: 'D',  label: 'Keep Practicing',color: 'text-outline',   shadow: 'var(--outline)',   isGood: false };
}

// Motivational message for low results
function getMotivationMessage(wpm: number, accuracy: number): string {
  if (accuracy < 70) return 'Focus on accuracy first — speed will follow naturally.';
  if (wpm < 30)      return 'Every expert was once a beginner. Keep going! 💪';
  if (wpm < 50)      return 'You\'re building the foundation. Consistency is key!';
  return 'Good effort! Try again to beat your score.';
}

export const ResultsSummary: React.FC = () => {
  const { activeTestStats, setActiveTab, settings } = useApp();
  const [copied, setCopied] = useState(false);

  const grade = activeTestStats ? getTestGrade(activeTestStats.wpm, activeTestStats.accuracy) : null;

  // Confetti only for good results
  useEffect(() => {
    if (!activeTestStats || !grade?.isGood) return;

    const end = Date.now() + 1.2 * 1000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors: ['#c0c1ff', '#44e2cd', '#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#c0c1ff', '#44e2cd', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [activeTestStats]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeTestStats) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-outline">No test results loaded.</h3>
        <button
          onClick={() => setActiveTab('practice')}
          className="mt-4 bg-primary text-background px-6 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
        >
          Start Practice
        </button>
      </div>
    );
  }

  const { wpm, rawWpm, accuracy, mistakes, elapsedTime, completedChars, wpmHistory } = activeTestStats;

  // Copy shareable results
  const handleShare = () => {
    const gradeLabel = grade?.letter ?? '—';
    const text =
      `⚡ Velocity Typing\n` +
      `🏎 Speed: ${wpm} WPM  (Raw: ${rawWpm} WPM)\n` +
      `🎯 Accuracy: ${accuracy}%\n` +
      `❌ Errors: ${mistakes}\n` +
      `⏱ Time: ${elapsedTime}s\n` +
      `🏁 Grade: ${gradeLabel}\n` +
      `github.com/Bernardo-e/Berd-Velocity`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SVG chart
  const svgW = 600, svgH = 150, pad = 20;
  const points  = wpmHistory.length > 1 ? wpmHistory : [wpm];
  const maxVal  = Math.max(...points, 1);
  const minVal  = Math.min(...points, 0);

  const getSvgPath = (): string => {
    if (points.length < 2) return `M ${pad} ${svgH / 2} L ${svgW - pad} ${svgH / 2}`;
    return points.map((val, idx) => {
      const x = pad + (idx / (points.length - 1)) * (svgW - 2 * pad);
      const range = maxVal - minVal;
      const pct   = range > 0 ? (val - minVal) / range : 0.5;
      const y     = svgH - pad - pct * (svgH - 2 * pad);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const linePath = getSvgPath();
  const areaPath = points.length >= 2
    ? `${linePath} L ${(pad + svgW - 2 * pad).toFixed(1)} ${(svgH - pad).toFixed(1)} L ${pad.toFixed(1)} ${(svgH - pad).toFixed(1)} Z`
    : '';

  const isGoodRun = grade?.isGood ?? false;

  return (
    <div className="w-full max-w-[900px] mx-auto py-8 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Typing Sprint Complete
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            {isGoodRun ? 'Great Performance! 🎉' : 'Session Summary'}
          </h2>
          {!isGoodRun && (
            <p className="mt-3 text-base text-on-surface-variant max-w-md mx-auto">
              {getMotivationMessage(wpm, accuracy)}
            </p>
          )}
        </div>

        {/* ── Scorecard ──────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Stats block */}
          <div className="glass-card linear-border rounded-2xl p-6 flex flex-col justify-between md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Speed (Net)</span>
                <span className="font-mono text-4xl text-primary font-bold">{wpm} <span className="text-xs text-outline font-normal">WPM</span></span>
              </div>
              <div>
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Speed (Raw)</span>
                <span className="font-mono text-4xl text-on-surface font-bold">{rawWpm} <span className="text-xs text-outline font-normal">WPM</span></span>
              </div>
              <div>
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Accuracy</span>
                <span className="font-mono text-4xl text-secondary font-bold">{accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Time</span>
                <span className="font-mono text-4xl text-on-surface font-bold">{elapsedTime}s</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 text-xs text-on-surface-variant font-medium">
              <div>
                <span className="text-outline block mb-1">Category</span>
                <span className="capitalize text-on-surface">{settings.textCategory}</span>
              </div>
              <div>
                <span className="text-outline block mb-1">Characters</span>
                <span className="text-on-surface">{completedChars} typed</span>
              </div>
              <div>
                <span className="text-outline block mb-1">Mistakes</span>
                <span className="text-on-surface">{mistakes} total</span>
              </div>
            </div>
          </div>

          {/* Grade card */}
          <div className="glass-card linear-border rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-10 blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-700"
              style={{ backgroundColor: grade?.shadow ?? 'var(--primary)' }}
            />
            <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-2 z-10">Performance Grade</span>
            <span
              className={`font-black z-10 ${grade?.color ?? 'text-outline'} ${
                (grade?.letter.length ?? 0) > 1 ? 'text-6xl' : 'text-8xl'
              }`}
              style={{ textShadow: `0 0 40px ${grade?.shadow ?? 'transparent'}` }}
            >
              {grade?.letter ?? '—'}
            </span>
            <span className="text-xs text-on-surface-variant mt-2 font-semibold z-10 uppercase tracking-wider">
              {grade?.label ?? ''}
            </span>
            <span className="text-[11px] text-outline/70 mt-2 z-10">
              {wpm >= 100 ? 'Elite typing level' : wpm >= 60 ? 'Pro competency' : 'Keep building speed'}
            </span>
          </div>
        </div>

        {/* ── Improve prompt for bad results ─────────────────── */}
        {!isGoodRun && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card linear-border rounded-2xl p-5 mb-8 flex items-start gap-4 border-l-4"
            style={{ borderLeftColor: 'var(--secondary)' }}
          >
            <TrendingUp className="w-8 h-8 text-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-1">Tips to improve</h4>
              <ul className="text-xs text-on-surface-variant space-y-1">
                {accuracy < 90 && <li>• Slow down and prioritize accuracy — aim for 95%+ before pushing speed.</li>}
                {wpm < 50     && <li>• Practice home row position: ASDF and JKL; fingers resting naturally.</li>}
                {mistakes > 10 && <li>• When you make an error, pause briefly — don't rush through it.</li>}
                <li>• Consistent daily practice of 10–15 min builds muscle memory fast.</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* ── WPM Chart ──────────────────────────────────────── */}
        <div className="glass-card linear-border rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-bold text-on-surface mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Speed Trajectory (WPM over time)
          </h3>

          {wpmHistory.length > 1 ? (
            <div className="w-full">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[160px] overflow-visible">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"  />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={pad} y1={pad}         x2={svgW - pad} y2={pad}         stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                <line x1={pad} y1={svgH / 2}    x2={svgW - pad} y2={svgH / 2}    stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                <line x1={pad} y1={svgH - pad}  x2={svgW - pad} y2={svgH - pad}  stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

                {/* Area fill */}
                {areaPath && <path d={areaPath} fill="url(#chartGlow)" />}

                {/* Animated line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Labels */}
                <text x={pad + 4} y={pad + 11}         fill="var(--outline)" fontSize="9" fontFamily="monospace">MAX: {maxVal} WPM</text>
                <text x={pad + 4} y={svgH - pad - 4}   fill="var(--outline)" fontSize="9" fontFamily="monospace">MIN: {minVal} WPM</text>
              </svg>
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center text-outline/40 font-mono text-xs">
              Not enough data points for this run.
            </div>
          )}
        </div>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('practice')}
            className="bg-primary text-background px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_-2px_var(--primary-glow)] text-base"
          >
            <RotateCcw className="w-4 h-4" />
            {isGoodRun ? 'Play Again' : 'Try Again'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleShare}
            className="glass-card hover:bg-white/5 text-on-surface px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-base"
          >
            <Share2 className="w-4 h-4 text-secondary" />
            {copied ? '✓ Copied!' : 'Copy Results'}
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
};
