export type Theme = 'dark' | 'light' | 'cyber' | 'ocean' | 'forest';

export type TestMode = 'time' | 'words';

export type TextCategory = 'programming' | 'technology' | 'history' | 'science' | 'quotes' | 'custom' | 'pdf';

export interface Settings {
  theme: Theme;
  font: 'Geist' | 'JetBrains Mono';
  animationLevel: 'high' | 'low' | 'none';
  soundType: 'none' | 'linear' | 'tactile' | 'typewriter';
  volume: number; // 0 to 1
  duration: number; // 15 | 30 | 60 | 120
  wordCount: number; // 10 | 25 | 50 | 100
  testMode: TestMode;
  textCategory: TextCategory;
  autoRestart: boolean;
  customText: string;
}

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mistakes: number;
  elapsedTime: number;
  completedChars: number;
  totalChars: number;
  wpmHistory: number[];
  accuracyHistory: number[];
}

export interface HistoryEntry {
  id: string;
  date: string;
  category: TextCategory;
  wpm: number;
  accuracy: number;
  duration: number;
  mode: string; // e.g., "time 30s", "words 25"
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO string when unlocked, or null
  category: 'speed' | 'accuracy' | 'streak' | 'misc';
}
