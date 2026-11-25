import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useStudio } from '../context/StudioContext';
import { formatTime } from '../utils/formatTime';

type TimelineMode = 'word' | 'line';

export function TimelinePanel() {
  const studio = useStudio();
  const [mode, setMode] = useState<TimelineMode>('word');
  const [zoom, setZoom] = useState(1);
  const trackScrollRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);

  const safeDuration = Math.max(studio.duration || 10, 1);
  const playheadPercent = Math.min(
    100,
    Math.max(0, (studio.currentTime / safeDuration) * 100)
  );

  // Use time-scaled pixel width (56px per second * zoom) so words have breathing room
  const timelinePxWidth = Math.round(safeDuration * 56 * zoom);

  // Ruler ticks spaced cleanly based on zoom & duration
  const ticks = useMemo(() => {
    const step = zoom >= 1.75 ? 1 : safeDuration > 90 ? 10 : safeDuration > 35 ? 4 : 2;
    const out: number[] = [];
    for (let t = 0; t <= safeDuration; t += step) {
      out.push(t);
    }
    return out;
  }, [safeDuration, zoom]);

  // Flatten words for WORD mode and clamp end times so blocks never overlap
  const wordBlocks = useMemo(() => {
    const raw = studio.segments.flatMap((seg) => seg.words);
    return raw.map((w, idx) => {
      const nextStart = raw[idx + 1]?.start ?? safeDuration;
      const clampedEnd = Math.max(w.start + 0.08, Math.min(w.end, nextStart));
      return {
        id: w.id,
        label: w.word,
        start: w.start,
        end: Math.min(safeDuration, clampedEnd),
      };
    });
  }, [studio.segments, safeDuration]);

  const lineBlocks = useMemo(() => {
    return studio.segments.map((seg, idx) => {
      const nextStart = studio.segments[idx + 1]?.start ?? safeDuration;
      const clampedEnd = Math.max(seg.start + 0.15, Math.min(seg.end, nextStart));
      return {
        id: seg.id,
        label: seg.words.map((w) => w.word).join(' '),
        start: seg.start,
        end: Math.min(safeDuration, clampedEnd),
      };
    });
  }, [studio.segments, safeDuration]);

  // Keep playhead gently in view during playback
  useEffect(() => {
    const scroller = trackScrollRef.current;
    if (!scroller || !studio.isPlaying || isScrubbingRef.current) return;
    const contentWidth = Math.max(scroller.clientWidth, timelinePxWidth);
    const playheadX = (playheadPercent / 100) * contentWidth;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    if (playheadX < viewLeft + 24 || playheadX > viewRight - 48) {
      scroller.scrollLeft = Math.max(0, playheadX - scroller.clientWidth * 0.25);
    }
  }, [playheadPercent, studio.isPlaying, timelinePxWidth]);

  const seekFromPointer = (clientX: number, targetEl: HTMLElement) => {
    const rect = targetEl.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    studio.seekToTime(ratio * safeDuration);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.tl-block')) return;
    isScrubbingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromPointer(e.clientX, e.currentTarget);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    seekFromPointer(e.clientX, e.currentTarget);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const peaks =
    studio.waveformPeaks.length > 0
      ? studio.waveformPeaks
      : Array.from({ length: 100 }, (_, i) =>
          0.16 + Math.abs(Math.sin(i * 0.35)) * 0.38
        );

  const activeBlocks = mode === 'word' ? wordBlocks : lineBlocks;

  return (
    <section className="timeline-pane" aria-label="Timeline">
      {/* Compact Timeline Toolbar */}
      <div className="tl-toolbar">
        <div className="tl-toolbar-left">
          <div className="tl-mode-toggle" role="group" aria-label="Timeline granularity">
            <button
              type="button"
              className={`tl-mode-btn${mode === 'word' ? ' active' : ''}`}
              onClick={() => setMode('word')}
            >
              Word
            </button>
            <button
              type="button"
              className={`tl-mode-btn${mode === 'line' ? ' active' : ''}`}
              onClick={() => setMode('line')}
            >
              Line
            </button>
          </div>

          <span className="tl-timecode">
            {formatTime(studio.currentTime)} / {formatTime(studio.duration)}
          </span>
        </div>

        <div className="tl-toolbar-right">
          <span className="tl-zoom-label">Zoom</span>
          <input
            type="range"
            className="tl-zoom-slider"
            min={0.5}
            max={2.5}
            step={0.25}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Timeline zoom"
          />
        </div>
      </div>

      {/* Fixed Left Track Gutter + Scrollable Tracks */}
      <div className="tl-body">
        <div className="tl-gutter" aria-hidden="true">
          <div className="tl-gutter-ruler" />
          <div className="tl-gutter-label">Captions</div>
          <div className="tl-gutter-label tl-gutter-audio">Audio</div>
        </div>

        <div className="tl-scroll" ref={trackScrollRef}>
          <div
            className="tl-canvas"
            style={{ width: `max(100%, ${timelinePxWidth}px)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Playhead */}
            <div
              className="tl-playhead"
              style={{ left: `${playheadPercent}%` }}
              aria-hidden="true"
            >
              <span className="tl-playhead-knob" />
            </div>

            {/* Time Ruler */}
            <div className="tl-ruler">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="tl-tick"
                  style={{ left: `${(t / safeDuration) * 100}%` }}
                >
                  {formatTime(t)}
                </span>
              ))}
            </div>

            {/* Captions Track */}
            <div className="tl-track">
              <div className="tl-track-lane">
                {activeBlocks.map((blk) => {
                  const leftPct = (blk.start / safeDuration) * 100;
                  const widthPct = ((blk.end - blk.start) / safeDuration) * 100;
                  const isActive =
                    mode === 'word'
                      ? studio.activeWordId === blk.id
                      : studio.activeSegmentId === blk.id;
                  return (
                    <button
                      key={blk.id}
                      type="button"
                      className={`tl-block${isActive ? ' active' : ''}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 2px)`,
                      }}
                      title={`${blk.label} (${formatTime(blk.start)})`}
                      onClick={() => studio.seekToTime(blk.start)}
                    >
                      {blk.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Waveform Track */}
            <div className="tl-track tl-track-audio">
              <div className="tl-waveform-lane" aria-hidden="true">
                {peaks.map((amp, idx) => (
                  <span
                    key={idx}
                    className="tl-wave-bar"
                    style={{ height: `${Math.max(10, Math.round(amp * 100))}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TimelinePanel;
