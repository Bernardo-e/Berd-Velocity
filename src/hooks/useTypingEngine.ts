import { useState, useEffect, useRef, useCallback } from 'react';
import { TestStats, TestMode } from '../types/index';

interface UseTypingEngineProps {
  text: string;
  testMode: TestMode;
  duration: number;
  autoRestart: boolean;
  onComplete: (stats: TestStats) => void;
  playClick: (isSpace: boolean) => void;
  playError: () => void;
}

export function useTypingEngine({
  text,
  testMode,
  duration,
  onComplete,
  playClick,
  playError,
}: UseTypingEngineProps) {
  // ── Render-triggering state (kept minimal for performance) ──
  const [charIndex, setCharIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // ── Refs: updated synchronously, never trigger re-renders ──
  const typedRef = useRef('');          // actual typed string
  const charIndexRef = useRef(0);       // mirrors charIndex without closure lag
  const mistakesRef = useRef(0);
  const totalTypedRef = useRef(0);      // total raw keystrokes (for raw WPM)
  const correctRef = useRef(0);         // correct chars typed
  const isPlayingRef = useRef(false);
  const isFinishedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const historyTimerRef = useRef<any>(null);
  const wpmHistoryRef = useRef<number[]>([]);
  const accHistoryRef = useRef<number[]>([]);

  // ── Expose typed text for rendering without being in hot path ──
  const [typedTextSnapshot, setTypedTextSnapshot] = useState('');

  const getElapsed = () =>
    startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;

  const buildStats = useCallback((): TestStats => {
    const elapsed = getElapsed();
    const minutes = elapsed / 60 || 0.0001;
    const currentWpm = Math.round((typedRef.current.length / 5) / minutes);
    const currentRawWpm = Math.round((totalTypedRef.current / 5) / minutes);
    const currentAcc =
      typedRef.current.length > 0
        ? Math.round((correctRef.current / typedRef.current.length) * 100)
        : 100;
    return {
      wpm: currentWpm,
      rawWpm: currentRawWpm,
      accuracy: currentAcc,
      mistakes: mistakesRef.current,
      elapsedTime: Math.round(elapsed),
      completedChars: typedRef.current.length,
      totalChars: text.length,
      wpmHistory: [...wpmHistoryRef.current],
      accuracyHistory: [...accHistoryRef.current],
    };
  }, [text]);

  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return;
    // If nothing was typed at all, just reset — don't pollute history
    if (typedRef.current.length === 0) {
      resetEngine();
      return;
    }
    isFinishedRef.current = true;
    isPlayingRef.current = false;
    setIsFinished(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (historyTimerRef.current) clearInterval(historyTimerRef.current);
    const final = buildStats();
    onComplete(final);
  }, [buildStats, onComplete]);

  const resetEngine = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (historyTimerRef.current) clearInterval(historyTimerRef.current);

    typedRef.current = '';
    charIndexRef.current = 0;
    mistakesRef.current = 0;
    totalTypedRef.current = 0;
    correctRef.current = 0;
    isPlayingRef.current = false;
    isFinishedRef.current = false;
    startTimeRef.current = null;
    wpmHistoryRef.current = [];
    accHistoryRef.current = [];

    setTypedTextSnapshot('');
    setCharIndex(0);
    setMistakes(0);
    setIsPlaying(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setCountdown(null);
    setTimeLeft(testMode === 'time' ? duration : 0);
  }, [testMode, duration]);

  // ── Pre-test countdown ──
  const triggerCountdown = useCallback((callback: () => void) => {
    resetEngine();
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown(0);
      } else {
        clearInterval(interval);
        setCountdown(null);
        isPlayingRef.current = true;
        startTimeRef.current = Date.now();
        setIsPlaying(true);
        callback();
      }
    }, 850);
  }, [resetEngine]);

  // ── Core key processor: all ref-based, minimal setState calls ──
  const processKey = useCallback((key: string) => {
    if (isFinishedRef.current) return;
    if (countdown !== null) return;

    // Auto-start on first keypress
    if (!isPlayingRef.current && startTimeRef.current === null) {
      isPlayingRef.current = true;
      startTimeRef.current = Date.now();
      setIsPlaying(true);
    }

    if (key === 'Backspace') {
      if (charIndexRef.current > 0) {
        charIndexRef.current -= 1;
        typedRef.current = typedRef.current.slice(0, -1);
        setCharIndex(charIndexRef.current);
        setTypedTextSnapshot(typedRef.current);
        playClick(false);
      }
      return;
    }

    if (key.length !== 1 || charIndexRef.current >= text.length) return;

    totalTypedRef.current += 1;
    const expected = text[charIndexRef.current];
    const isCorrect = key === expected;

    if (isCorrect) {
      correctRef.current += 1;
      playClick(key === ' ');
    } else {
      mistakesRef.current += 1;
      setMistakes(mistakesRef.current);
      playError();
    }

    typedRef.current += key;
    charIndexRef.current += 1;
    setCharIndex(charIndexRef.current);
    setTypedTextSnapshot(typedRef.current);

    // Finish as soon as all text is typed — regardless of mode
    if (charIndexRef.current >= text.length) {
      setTimeout(finishTest, 30);
    }
  }, [text, countdown, playClick, playError, finishTest]);

  // ── Time-mode ticker ──
  useEffect(() => {
    if (isPlaying && testMode === 'time') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, testMode, finishTest]);

  // ── WPM/Accuracy update ticker (every 500ms to stay responsive) ──
  useEffect(() => {
    if (isPlaying) {
      historyTimerRef.current = setInterval(() => {
        const elapsed = getElapsed();
        const minutes = elapsed / 60 || 0.0001;
        const currentWpm = Math.round((typedRef.current.length / 5) / minutes);
        const currentAcc =
          typedRef.current.length > 0
            ? Math.round((correctRef.current / typedRef.current.length) * 100)
            : 100;
        setWpm(currentWpm);
        setAccuracy(currentAcc);
        wpmHistoryRef.current.push(currentWpm);
        accHistoryRef.current.push(currentAcc);
      }, 500);
    }
    return () => { if (historyTimerRef.current) clearInterval(historyTimerRef.current); };
  }, [isPlaying]);

  // Sync timeLeft when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, testMode]);

  return {
    typedText: typedTextSnapshot,
    charIndex,
    mistakes,
    isPlaying,
    isFinished,
    timeLeft,
    countdown,
    wpm,
    accuracy,
    processKey,
    triggerCountdown,
    resetEngine,
  };
}
