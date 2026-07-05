import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { RotateCcw, Share2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

// Grade calculator helper
function getTestGrade(wpm: number, accuracy: number, theme: string): { letter: string; color: string; shadow: string } {
  const isLight = theme === 'light';
  if (wpm >= 120 && accuracy === 100) {
    return {
      letter: 'S+',
      color: 'text-secondary',
      shadow: isLight ? 'rgba(13, 148, 136, 0.25)' : 'rgba(68, 226, 205, 0.6)'
    };
  }
  if (wpm >= 100 && accuracy >= 98) {
    return {
      letter: 'S',
      color: 'text-primary',
      shadow: isLight ? 'rgba(79, 70, 229, 0.25)' : 'rgba(192, 193, 255, 0.6)'
    };
  }
  if (wpm >= 80 && accuracy >= 95) {
    return {
      letter: 'A',
      color: 'text-primary',
      shadow: isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(192, 193, 255, 0.4)'
    };
  }
  if (wpm >= 60 && accuracy >= 90) {
    return {
      letter: 'B',
      color: 'text-on-surface',
      shadow: isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.2)'
    };
  }
  return {
    letter: 'Improve',
    color: 'text-error',
    shadow: isLight ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 180, 171, 0.3)'
  };
}

export const ResultsSummary: React.FC = () => {
  const { activeTestStats, setActiveTab, settings } = useApp();
  const [copied, setCopied] = useState(false);

  // Trigger confetti burst on load
  useEffect(() => {
    if (activeTestStats) {
      // 3 confetti sprays
      const end = Date.now() + 1.2 * 1000;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#c0c1ff', '#44e2cd', '#ffffff']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#c0c1ff', '#44e2cd', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [activeTestStats]);

  if (!activeTestStats) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-outline">No test results loaded.</h3>
        <button onClick={() => setActiveTab('practice')} className="mt-4 bg-primary text-background px-6 py-2 rounded-xl font-bold">
          Start Practice
        </button>
      </div>
    );
  }

  const { wpm, rawWpm, accuracy, mistakes, elapsedTime, completedChars, wpmHistory } = activeTestStats;
  const grade = getTestGrade(wpm, accuracy, settings.theme);

  // Copy shareable results format
  const handleShare = () => {
    const text = `⚡ Velocity Typing Test Run\n🏎 Speed: ${wpm} WPM (Raw: ${rawWpm} WPM)\n🎯 Accuracy: ${accuracy}%\n❌ Errors: ${mistakes}\n⏱ Time: ${elapsedTime}s\n🏁 Grade: ${grade.letter}\nPlay at: d:\\Velocity Typing`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom SVG Line Chart coordinates rendering
  const width = 600;
  const height = 150;
  const padding = 20;

  const points = wpmHistory.length > 1 ? wpmHistory : [wpm];
  const maxVal = Math.max(...points, 100);
  const minVal = Math.min(...points, 0);

  const getSvgCoordinates = (): string => {
    if (points.length < 2) {
      return `M ${padding} ${height / 2} L ${width - padding} ${height / 2}`;
    }

    return points
      .map((val, idx) => {
        const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
        // Flip coordinates vertically since SVG 0 is top
        const range = maxVal - minVal;
        const percent = range > 0 ? (val - minVal) / range : 0.5;
        const y = height - padding - percent * (height - 2 * padding);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const getAreaPath = (linePath: string): string => {
    if (points.length < 2 || !linePath) return '';
    const lastX = padding + (width - 2 * padding);
    return `${linePath} L ${lastX.toFixed(1)} ${(height - padding).toFixed(1)} L ${padding.toFixed(1)} ${(height - padding).toFixed(1)} Z`;
  };

  const linePath = getSvgCoordinates();
  const areaPath = getAreaPath(linePath);

  return (
    <div className="w-full max-w-[900px] mx-auto py-8 px-6 md:px-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Banner Celebration */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5 fill-current" />
          Typing Sprint Completed
        </span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">Practice Performance Summary</h2>
      </div>

      {/* Main Scorecard Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        
        {/* Core Stats Block */}
        <div className="glass-card linear-border rounded-2xl p-6 flex flex-col justify-between md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">SPEED (NET)</span>
              <span className="font-mono text-4xl text-primary font-bold">{wpm} <span className="text-xs text-outline font-normal">WPM</span></span>
            </div>
            <div>
              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">SPEED (RAW)</span>
              <span className="font-mono text-4xl text-on-surface font-bold">{rawWpm} <span className="text-xs text-outline font-normal">WPM</span></span>
            </div>
            <div>
              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">ACCURACY</span>
              <span className="font-mono text-4xl text-secondary font-bold">{accuracy}%</span>
            </div>
            <div>
              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">ELAPSED TIME</span>
              <span className="font-mono text-4xl text-on-surface font-bold">{elapsedTime}s</span>
            </div>
          </div>

          {/* Details breakdown */}
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

        {/* Dynamic Grade Card */}
        <div className="glass-card linear-border rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Light glow aura */}
          <div 
            className="absolute inset-0 opacity-10 blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-700" 
            style={{ backgroundColor: grade.shadow }} 
          />
          <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-2 z-10">PERFORMANCE GRADE</span>
          <span 
            className={`font-black font-display-xl z-10 ${grade.color} ${grade.letter.length > 2 ? 'text-4xl md:text-5.5xl' : 'text-8xl'}`}
            style={{ textShadow: `0 0 40px ${grade.shadow}` }}
          >
            {grade.letter}
          </span>
          <span className="text-xs text-on-surface-variant mt-3 font-medium z-10">
            {wpm >= 100 ? 'Elite typing level' : wpm >= 60 ? 'Pro competency level' : 'Practice to build muscle memory'}
          </span>
        </div>
      </div>

      {/* SVG Performance Chart Block */}
      <div className="glass-card linear-border rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-bold text-on-surface mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Speed Trajectory (WPM over time)
        </h3>
        
        {wpmHistory.length > 1 ? (
          <div className="w-full relative">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-[180px] overflow-visible"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

              {/* Area path */}
              <path 
                d={areaPath} 
                fill="url(#chartGlow)"
              />

              {/* Line path */}
              <motion.path 
                d={linePath} 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />

              {/* Min/Max indicators */}
              <text x={padding + 5} y={padding + 12} fill="var(--outline)" fontSize="8px" className="font-mono">MAX: {maxVal} WPM</text>
              <text x={padding + 5} y={height - padding - 5} fill="var(--outline)" fontSize="8px" className="font-mono">MIN: {minVal} WPM</text>
            </svg>
          </div>
        ) : (
          <div className="h-[120px] flex items-center justify-center text-outline/40 font-mono text-xs">
            Not enough data points recorded for this run.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setActiveTab('practice')}
          className="bg-primary text-on-primary-container px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_-2px_var(--primary-glow)]"
        >
          <RotateCcw className="w-4 h-4" />
          Practice Again
        </button>
        <button
          onClick={handleShare}
          className="glass-card hover:bg-white/5 text-on-surface px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-secondary" />
          {copied ? 'Results Copied!' : 'Copy Summary'}
        </button>
      </div>

    </div>
  );
};
