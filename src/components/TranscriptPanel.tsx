import { memo } from 'react';
import { useGroqUsage } from '../core/groqUsage';
import type {
  CaptionLanguage,
  SubtitleSegment,
} from '../types/caption';
import { formatTime } from '../utils/formatTime';
import { GlobeIcon, LanguageIcon, MicIcon } from './Icons';

interface TranscriptCardProps {
  segment: SubtitleSegment;
  isActiveSegment: boolean;
  activeWordId: string | null;
  onSeek: (time: number) => void;
  onWordChange: (wordId: string, text: string) => void;
}

/**
 * Memoized segment card so only the 1-2 cards whose active state changes re-render on playback.
 */
const TranscriptCard = memo(function TranscriptCard({
  segment,
  isActiveSegment,
  activeWordId,
  onSeek,
  onWordChange,
}: TranscriptCardProps) {
  return (
    <div
      className={`transcript-card${isActiveSegment ? ' active-segment' : ''}`}
      onClick={() => onSeek(segment.start)}
    >
      <div className="transcript-meta">
        {formatTime(segment.start)} - {formatTime(segment.end)}
      </div>
      <div className="transcript-words-row">
        {segment.words.map((w) => {
          const isActiveWord = isActiveSegment && activeWordId === w.id;
          return (
            <span
              key={`${w.id}-${w.emoji ?? ''}`}
              className={`word-chip${isActiveWord ? ' active-word' : ''}`}
              contentEditable
              suppressContentEditableWarning
              title={`Click to seek (${w.start.toFixed(1)}s) • Click again to edit`}
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

interface TranscriptPanelProps {
  segments: SubtitleSegment[];
  activeSegmentId: string | null;
  activeWordId: string | null;
  captionLanguage?: CaptionLanguage;
  onChangeLanguage?: (lang: CaptionLanguage) => void;
  onRunWhisper: () => void;
  onLoadSample: () => void;
  onSeek: (time: number) => void;
  onWordChange: (wordId: string, text: string) => void;
}

export function TranscriptPanel({
  segments,
  activeSegmentId,
  activeWordId,
  captionLanguage = 'english',
  onChangeLanguage,
  onRunWhisper,
  onLoadSample,
  onSeek,
  onWordChange,
}: TranscriptPanelProps) {
  const groqUsage = useGroqUsage();

  return (
    <div className="tab-pane active">
      {/* Speech Language Mode Switcher */}
      <div className="transcript-script-header">
        <div className="script-header-row">
          <span className="script-header-title">Speech Language</span>
          {captionLanguage === 'hinglish' && (
            <span
              className="groq-quota-pill"
              title="Groq Whisper Large v3 daily remaining requests"
            >
              <span className="quota-dot" />
              {groqUsage.remainingDailyRequests} left today
            </span>
          )}
        </div>
        <div
          className="script-segmented"
          role="radiogroup"
          aria-label="Speech Language"
        >
          <button
            type="button"
            className={`script-seg-btn${
              captionLanguage === 'english' ? ' active' : ''
            }`}
            onClick={() => onChangeLanguage?.('english')}
            title="Fast In-Browser AI (100% Offline)"
          >
            <LanguageIcon size={13} />
            <span>English (Local)</span>
          </button>
          <button
            type="button"
            className={`script-seg-btn${
              captionLanguage === 'hinglish' ? ' active' : ''
            }`}
            onClick={() => onChangeLanguage?.('hinglish')}
            title="Groq Whisper Large v3 (Studio Accuracy)"
          >
            <GlobeIcon size={13} />
            <span>Hinglish (Groq AI)</span>
          </button>
        </div>
      </div>

      <div className="transcript-header-actions">
        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={onRunWhisper}
        >
          <MicIcon />
          Transcribe {captionLanguage === 'hinglish' ? 'Hinglish' : 'English'}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-full mt-2"
          onClick={onLoadSample}
        >
          Load Sample
        </button>
      </div>

      <div className="transcript-list">
        {segments.length === 0 ? (
          <div className="empty-transcript">
            <p>No captions loaded yet.</p>
            <span>
              Click &quot;Transcribe with Whisper AI&quot; or load sample
              captions to edit words.
            </span>
          </div>
        ) : (
          segments.map((seg) => {
            const isActiveSeg = activeSegmentId === seg.id;
            return (
              <TranscriptCard
                key={seg.id}
                segment={seg}
                isActiveSegment={isActiveSeg}
                activeWordId={isActiveSeg ? activeWordId : null}
                onSeek={onSeek}
                onWordChange={onWordChange}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
