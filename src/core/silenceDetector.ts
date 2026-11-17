import type {
  RawWord,
  SilenceDetectionResult,
  SilenceZone,
} from '../types/caption';

/**
 * Smart Silence Remover & Auto Jump-Cutter
 * Detects dead-air pauses (> thresholdSecs) from speech timestamps.
 */
export class SilenceDetector {
  thresholdSecs: number;
  paddingSecs: number;
  silenceZones: SilenceZone[] = [];
  totalTimeSaved = 0;
  isEnabled = false;

  constructor(thresholdSecs = 0.4, paddingSecs = 0.06) {
    this.thresholdSecs = thresholdSecs;
    this.paddingSecs = paddingSecs;
  }

  setThreshold(thresholdSecs: number): void {
    this.thresholdSecs = thresholdSecs;
  }

  detectFromWords(
    words: RawWord[],
    totalDuration = 0
  ): SilenceDetectionResult {
    this.silenceZones = [];
    this.totalTimeSaved = 0;

    if (!words || words.length === 0) {
      return { zones: [], timeSaved: 0, count: 0 };
    }

    // 1. Initial silence before first word
    if (words[0].start > this.thresholdSecs + this.paddingSecs) {
      const zoneStart = 0;
      const zoneEnd = Math.max(0, words[0].start - this.paddingSecs);
      this.silenceZones.push({
        start: zoneStart,
        end: zoneEnd,
        duration: zoneEnd - zoneStart,
      });
    }

    // 2. Inter-word silences
    for (let i = 0; i < words.length - 1; i++) {
      const curWord = words[i];
      const nextWord = words[i + 1];

      const gap = nextWord.start - curWord.end;
      if (gap > this.thresholdSecs) {
        const zoneStart = curWord.end + this.paddingSecs;
        const zoneEnd = nextWord.start - this.paddingSecs;

        if (zoneEnd > zoneStart) {
          this.silenceZones.push({
            start: zoneStart,
            end: zoneEnd,
            duration: zoneEnd - zoneStart,
          });
        }
      }
    }

    // 3. Trailing silence after last word
    const lastWord = words[words.length - 1];
    if (totalDuration > lastWord.end + this.thresholdSecs) {
      const zoneStart = lastWord.end + this.paddingSecs;
      const zoneEnd = totalDuration;
      if (zoneEnd > zoneStart) {
        this.silenceZones.push({
          start: zoneStart,
          end: zoneEnd,
          duration: zoneEnd - zoneStart,
        });
      }
    }

    this.totalTimeSaved = this.silenceZones.reduce(
      (acc, z) => acc + z.duration,
      0
    );

    return {
      zones: this.silenceZones,
      timeSaved: Number(this.totalTimeSaved.toFixed(1)),
      count: this.silenceZones.length,
    };
  }

  getJumpTarget(currentTime: number): number | null {
    if (!this.isEnabled) return null;
    for (let i = 0; i < this.silenceZones.length; i++) {
      const zone = this.silenceZones[i];
      if (currentTime >= zone.start && currentTime < zone.end) {
        return zone.end;
      }
    }
    return null;
  }
}
