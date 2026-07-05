import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Award, Trash2, Clock, BarChart2, Target, Zap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { history, achievements, resetAllData, setActiveTab, updateSettings, userName } = useApp();

  const totalSessions = history.length;
  const peakWpm   = totalSessions > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
  const avgWpm    = totalSessions > 0 ? Math.round(history.reduce((s, h) => s + h.wpm, 0)      / totalSessions) : 0;
  const avgAcc    = totalSessions > 0 ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / totalSessions) : 0;
  const totalTime = history.reduce((s, h) => s + h.duration, 0);

  const calculateStreak = (): number => {
    if (!history.length) return 0;
    const dates = Array.from(new Set(history.map(h => new Date(h.date).toDateString())));
    const today = new Date();
    let streak = 0;
    let cur = new Date(dates[0]);
    if (Math.abs(today.getTime() - cur.getTime()) / 86400000 > 1.8) return 0;
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i]);
      const diff = (cur.getTime() - prev.getTime()) / 86400000;
      if (diff >= 0.8 && diff <= 1.2) { streak++; cur = prev; }
      else if (diff > 1.2) break;
    }
    return streak;
  };

  const streak = calculateStreak();

  const launchDailyChallenge = () => {
    updateSettings({ testMode: 'time', duration: 30, textCategory: 'programming' });
    setActiveTab('practice');
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const topStats = [
    { label: 'Sessions',        value: totalSessions,        unit: '',    color: 'text-primary',   icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Peak Speed',      value: peakWpm,              unit: 'WPM', color: 'text-secondary', icon: <Zap className="w-5 h-5" /> },
    { label: 'Average Speed',   value: avgWpm,               unit: 'WPM', color: 'text-primary',   icon: <Target className="w-5 h-5" /> },
    { label: 'Avg Accuracy',    value: avgAcc,               unit: '%',   color: 'text-secondary', icon: <Award className="w-5 h-5" /> },
    { label: 'Practice Streak', value: streak,               unit: 'days',color: 'text-primary',   icon: <Flame className="w-5 h-5" /> },
    { label: 'Total Time',      value: Math.round(totalTime / 60), unit: 'min', color: 'text-secondary', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto py-10 px-6 md:px-12 space-y-10">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            {userName ? `${userName}'s Dashboard` : 'Typist Dashboard'}
          </h2>
          <p className="text-base text-on-surface-variant mt-2">
            Review your performance metrics and unlock milestones.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={launchDailyChallenge}
          className="bg-primary text-background font-bold px-6 py-3.5 rounded-xl flex items-center gap-2.5 shadow-[0_4px_24px_-4px_var(--primary-glow)] text-base"
        >
          <Flame className="w-5 h-5 fill-current" />
          Daily Challenge
        </motion.button>
      </div>

      {/* ── Top stats grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topStats.map(({ label, value, unit, color, icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card linear-border rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className={`${color} opacity-70`}>{icon}</div>
            <div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest block mb-1">{label}</span>
              <span className={`font-mono text-3xl font-bold ${color}`}>
                {value}
                {unit && <span className="text-xs text-outline font-normal ml-1">{unit}</span>}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main content grid ───────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* Recent sessions — takes 3 cols */}
        <div className="lg:col-span-3 glass-card linear-border rounded-2xl p-7">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Clock className="w-5 h-5 text-primary" />
            Recent Practice Runs
          </h3>

          {totalSessions > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-outline border-b border-white/5">
                    <th className="py-3 font-semibold">Date</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Mode</th>
                    <th className="py-3 font-semibold text-right">Speed</th>
                    <th className="py-3 font-semibold text-right">Accuracy</th>
                    <th className="py-3 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.slice(0, 12).map((run) => (
                    <tr key={run.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3.5 text-on-surface-variant">{formatDate(run.date)}</td>
                      <td className="py-3.5 capitalize font-semibold text-on-surface">{run.category}</td>
                      <td className="py-3.5 text-outline text-xs font-mono">{run.mode}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-primary text-base">{run.wpm} <span className="text-xs text-outline font-normal">WPM</span></td>
                      <td className="py-3.5 text-right font-mono font-bold text-secondary text-base">{run.accuracy}%</td>
                      <td className="py-3.5 text-right font-mono text-on-surface-variant">{run.duration}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <BarChart2 className="w-14 h-14 text-outline/20" />
              <p className="text-outline/50 font-mono text-sm">No data yet — start your first session!</p>
              <button
                onClick={() => setActiveTab('practice')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold border border-primary/20 hover:bg-primary/20 transition-all"
              >
                Go Practice
              </button>
            </div>
          )}
        </div>

        {/* Right column — Achievements + Danger zone */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Milestones */}
          <div className="glass-card linear-border rounded-2xl p-7">
            <h3 className="text-base font-bold mb-5 flex items-center gap-2.5 border-b border-white/5 pb-4">
              <Award className="w-5 h-5 text-secondary" />
              Milestones
            </h3>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {achievements.map((ach) => {
                const unlocked = ach.unlockedAt !== null;
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
                      unlocked
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-white/5 bg-white/[0.01] opacity-35'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      unlocked ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-container border-white/5 text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{ach.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm block text-on-surface truncate">{ach.name}</span>
                      <span className="text-xs text-on-surface-variant block mt-0.5 leading-snug">{ach.description}</span>
                      {unlocked && (
                        <span className="text-[10px] text-secondary font-mono block mt-1">
                          ✓ {new Date(ach.unlockedAt!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass-card linear-border rounded-2xl p-6 text-center border border-error/10">
            <h4 className="text-sm font-bold text-error/80 mb-2">Danger Zone</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-5">
              This will permanently clear all history, achievements, custom texts, and settings.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Delete ALL typing stats, achievements, and settings? This cannot be undone.')) {
                  resetAllData();
                }
              }}
              className="border border-error/25 hover:bg-error/10 text-error px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
