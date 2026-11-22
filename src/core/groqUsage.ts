import { useEffect, useState } from 'react';

export interface GroqUsageData {
  date: string; // YYYY-MM-DD UTC
  requestsUsedToday: number;
  audioSecondsUsedToday: number;
  remainingDailyRequests: number;
  resetTime: string | null;
  lastUpdated: number;
}

export const GROQ_LIMITS = {
  DAILY_REQUESTS: 2000,
  DAILY_AUDIO_SECONDS: 28800, // 8 hours = 28,800 seconds
  HOURLY_AUDIO_SECONDS: 7200, // 2 hours
  REQUESTS_PER_MINUTE: 20,
};

function getTodayUTCDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadGroqUsage(): GroqUsageData {
  if (typeof window === 'undefined') {
    return {
      date: getTodayUTCDate(),
      requestsUsedToday: 0,
      audioSecondsUsedToday: 0,
      remainingDailyRequests: GROQ_LIMITS.DAILY_REQUESTS,
      resetTime: null,
      lastUpdated: Date.now(),
    };
  }

  try {
    const raw = localStorage.getItem('autocaption_groq_usage');
    if (raw) {
      const parsed: GroqUsageData = JSON.parse(raw);
      if (parsed.date === getTodayUTCDate()) {
        return parsed;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  // Reset for a fresh UTC day
  const fresh: GroqUsageData = {
    date: getTodayUTCDate(),
    requestsUsedToday: 0,
    audioSecondsUsedToday: 0,
    remainingDailyRequests: GROQ_LIMITS.DAILY_REQUESTS,
    resetTime: null,
    lastUpdated: Date.now(),
  };
  saveGroqUsage(fresh);
  return fresh;
}

export function saveGroqUsage(data: GroqUsageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('autocaption_groq_usage', JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent('groq-usage-updated', { detail: data })
    );
  } catch {
    // Ignore localStorage quota errors
  }
}

export function recordGroqTranscription(
  durationSeconds: number,
  headers?: {
    remainingRequests?: string | null;
    resetRequests?: string | null;
  }
): GroqUsageData {
  const current = loadGroqUsage();
  const dur = Math.max(0, Math.round(durationSeconds));

  current.requestsUsedToday += 1;
  current.audioSecondsUsedToday += dur;
  current.lastUpdated = Date.now();

  if (headers?.remainingRequests) {
    const parsed = parseInt(headers.remainingRequests, 10);
    if (!isNaN(parsed)) {
      current.remainingDailyRequests = parsed;
    }
  } else {
    current.remainingDailyRequests = Math.max(
      0,
      GROQ_LIMITS.DAILY_REQUESTS - current.requestsUsedToday
    );
  }

  if (headers?.resetRequests) {
    current.resetTime = headers.resetRequests;
  }

  saveGroqUsage(current);
  return current;
}

/**
 * Human readable formatter for seconds: "45s", "2m 15s", "1h 30m".
 */
export function formatAudioSeconds(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  const remainingSecs = sec % 60;
  if (mins < 60) {
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * React hook to subscribe to live Groq usage updates.
 */
export function useGroqUsage(): GroqUsageData {
  const [usage, setUsage] = useState<GroqUsageData>(loadGroqUsage);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent<GroqUsageData>;
      if (custom.detail) {
        setUsage(custom.detail);
      } else {
        setUsage(loadGroqUsage());
      }
    };

    window.addEventListener('groq-usage-updated', onUpdate);
    return () => window.removeEventListener('groq-usage-updated', onUpdate);
  }, []);

  return usage;
}

