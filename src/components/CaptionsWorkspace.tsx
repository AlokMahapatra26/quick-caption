import { memo, useMemo, useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { getLanguageOption } from '../core/languages';
import type { SubtitleSegment } from '../types/caption';
import { formatTime } from '../utils/formatTime';
import { MicIcon } from './Icons';

interface CaptionLineRowProps {
  index: number;
  segment: SubtitleSegment;
  isActiveSegment: boolean;
  activeWordId: string | null;
  onSeek: (time: number) => void;
  onWordChange: (wordId: string, text: string) => void;
}

const CaptionLineRow = memo(function CaptionLineRow({
  index,
  segment,
  isActiveSegment,
  activeWordId,
  onSeek,
  onWordChange,
}: CaptionLineRowProps) {
  return (
    <div
      className={`cap-line-row${isActiveSegment ? ' active' : ''}`}
      onClick={() => onSeek(segment.start)}
    >
      <div className="cap-line-num">{index + 1}</div>

      <button
        type="button"
        className="cap-line-time"
        title={`Jump to ${formatTime(segment.start)}`}
        onClick={(e) => {
          e.stopPropagation();
          onSeek(segment.start);
        }}
      >
        {formatTime(segment.start)}
      </button>

      <div className="cap-line-words">
        {segment.words.map((w) => {
          const isActiveWord = isActiveSegment && activeWordId === w.id;
          return (
            <span
              key={`${w.id}-${w.emoji ?? ''}`}
              className={`word-chip${isActiveWord ? ' active-word' : ''}`}
              contentEditable
              suppressContentEditableWarning
              title={`Seek (${w.start.toFixed(1)}s) • Click to edit`}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(w.start);
              }}
              onInput={(e) => {
                onWordChange(w.id, e.currentTarget.textContent ?? '');
              }}
            >
              {w.emoji ? `${w.word} ${w.emoji}` : w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
});

export function CaptionsWorkspace() {
  const studio = useStudio();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSegments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return studio.segments;
    return studio.segments.filter((seg) =>
      seg.words.some((w) => w.word.toLowerCase().includes(q))
    );
  }, [studio.segments, searchQuery]);

  const langLabel = getLanguageOption(studio.captionLanguage).label;

  return (
    <section className="captions-pane" aria-label="Captions Editor">
      {/* Clean Header */}
      <div className="captions-pane-header">
        <div className="captions-pane-title-group">
          <h2 className="captions-pane-title">Captions</h2>
          {studio.wordCount > 0 && (
            <span className="captions-count-pill">
              {studio.wordCount} words
            </span>
          )}
          <span className="captions-lang-pill">{langLabel}</span>
        </div>

        <div className="captions-pane-actions">
          <div className="captions-search-input">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Find word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary captions-action-btn"
            onClick={() => {
              if (studio.hasVideo) {
                studio.openLanguagePrompt();
              } else {
                void studio.runSpeechRecognition();
              }
            }}
            title="Configure language & transcribe"
          >
            <MicIcon size={13} />
            <span>{studio.segments.length > 0 ? 'Re-transcribe' : 'Transcribe'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Caption Lines */}
      <div className="captions-pane-list">
        {studio.segments.length === 0 ? (
          <div className="captions-empty">
            <p>No captions yet.</p>
            <span>
              Upload a video or load sample captions to start editing text and
              timestamps.
            </span>
            <div className="captions-empty-btns">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={studio.loadSampleCaptions}
              >
                Load Sample Captions
              </button>
            </div>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="captions-empty">
            <p>No matching words for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          filteredSegments.map((seg, i) => {
            const isActiveSeg = studio.activeSegmentId === seg.id;
            return (
              <CaptionLineRow
                key={seg.id}
                index={i}
                segment={seg}
                isActiveSegment={isActiveSeg}
                activeWordId={isActiveSeg ? studio.activeWordId : null}
                onSeek={studio.seekToTime}
                onWordChange={studio.updateWordText}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
export default CaptionsWorkspace;

