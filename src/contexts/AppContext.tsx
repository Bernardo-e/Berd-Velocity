import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, HistoryEntry, Achievement, TestStats } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  history: HistoryEntry[];
  saveTestRun: (stats: TestStats) => Achievement[];
  achievements: Achievement[];
  resetAllData: () => void;
  activeTab: 'landing' | 'practice' | 'dashboard' | 'results';
  setActiveTab: (tab: 'landing' | 'practice' | 'dashboard' | 'results') => void;
  activeTestStats: TestStats | null;
  setActiveTestStats: (stats: TestStats | null) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  font: 'Geist',
  animationLevel: 'high',
  soundType: 'linear',
  volume: 0.5,
  duration: 30,
  wordCount: 25,
  testMode: 'time',
  textCategory: 'quotes',
  autoRestart: false,
  customText: '',
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_run', name: 'First Milestone', description: 'Complete your first typing practice session.', icon: 'trophy', unlockedAt: null, category: 'misc' },
  { id: 'speed_60', name: 'Sixty Club', description: 'Reach 60 Words Per Minute.', icon: 'speed', unlockedAt: null, category: 'speed' },
  { id: 'speed_100', name: 'Century Speed', description: 'Reach 100 Words Per Minute.', icon: 'bolt', unlockedAt: null, category: 'speed' },
  { id: 'speed_120', name: 'Sonic Blast', description: 'Reach 120 Words Per Minute.', icon: 'rocket', unlockedAt: null, category: 'speed' },
  { id: 'speed_150', name: 'Godspeed', description: 'Reach 150 Words Per Minute.', icon: 'local_fire_department', unlockedAt: null, category: 'speed' },
  { id: 'accuracy_95', name: 'Marksman', description: 'Achieve 95% accuracy or higher.', icon: 'track_changes', unlockedAt: null, category: 'accuracy' },
  { id: 'accuracy_100', name: 'Perfect Rhythm', description: 'Achieve 100% accuracy on a test (min 40 chars).', icon: 'grade', unlockedAt: null, category: 'accuracy' },
  { id: 'ten_runs', name: 'Relentless Practice', description: 'Complete 10 typing practice sessions.', icon: 'star', unlockedAt: null, category: 'misc' },
  { id: 'custom_mode', name: 'Custom Builder', description: 'Complete a typing test using custom text or a PDF.', icon: 'history_edu', unlockedAt: null, category: 'misc' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('velocity_settings', DEFAULT_SETTINGS);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('velocity_history', []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('velocity_achievements', DEFAULT_ACHIEVEMENTS);
  
  const [activeTab, setActiveTab] = useState<'landing' | 'practice' | 'dashboard' | 'results'>('landing');
  const [activeTestStats, setActiveTestStats] = useState<TestStats | null>(null);
  const [userName, setUserNameState] = useLocalStorage<string>('velocity_username', '');

  const setUserName = (name: string) => setUserNameState(name);

  // Sync theme to document body class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-cyber', 'theme-ocean', 'theme-forest');
    root.classList.add(`theme-${settings.theme}`);
    
    // Also toggle standard 'dark' class for basic Tailwind utilities
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const checkAndUnlockAchievements = (stats: TestStats, totalRuns: number): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];
    const timestamp = new Date().toISOString();

    const updatedAchievements = achievements.map(ach => {
      // If already unlocked, keep as is
      if (ach.unlockedAt) return ach;

      let shouldUnlock = false;

      switch (ach.id) {
        case 'first_run':
          shouldUnlock = true; // Any complete run
          break;
        case 'speed_60':
          shouldUnlock = stats.wpm >= 60;
          break;
        case 'speed_100':
          shouldUnlock = stats.wpm >= 100;
          break;
        case 'speed_120':
          shouldUnlock = stats.wpm >= 120;
          break;
        case 'speed_150':
          shouldUnlock = stats.wpm >= 150;
          break;
        case 'accuracy_95':
          shouldUnlock = stats.accuracy >= 95;
          break;
        case 'accuracy_100':
          shouldUnlock = stats.accuracy === 100 && stats.completedChars >= 40;
          break;
        case 'ten_runs':
          shouldUnlock = totalRuns >= 10;
          break;
        case 'custom_mode':
          shouldUnlock = settings.textCategory === 'custom' || settings.textCategory === 'pdf';
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        const unlockedAch = { ...ach, unlockedAt: timestamp };
        newlyUnlocked.push(unlockedAch);
        return unlockedAch;
      }

      return ach;
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
    }

    return newlyUnlocked;
  };

  const saveTestRun = (stats: TestStats): Achievement[] => {
    // 1. Create history entry
    const modeString = settings.testMode === 'time' 
      ? `Time ${settings.duration}s` 
      : `Words ${settings.wordCount}`;
      
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      category: settings.textCategory,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      duration: stats.elapsedTime,
      mode: modeString,
    };

    const newHistory = [newEntry, ...history];
    setHistory(newHistory);

    // 2. Perform achievement validation
    const newlyUnlocked = checkAndUnlockAchievements(stats, newHistory.length);

    // 3. Update active session tracking
    setActiveTestStats(stats);
    
    return newlyUnlocked;
  };

  const resetAllData = () => {
    setHistory([]);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setSettings(DEFAULT_SETTINGS);
    setActiveTestStats(null);
    setActiveTab('landing');
  };

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      history,
      saveTestRun,
      achievements,
      resetAllData,
      activeTab,
      setActiveTab,
      activeTestStats,
      setActiveTestStats,
      userName,
      setUserName,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
