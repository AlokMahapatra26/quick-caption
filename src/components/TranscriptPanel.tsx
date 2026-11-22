import { memo } from 'react';
import type {
  CaptionLanguage,
  MultilingualModelSize,
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
  captionLanguage: CaptionLanguage;
  multilingualModelSize: MultilingualModelSize;
  onChangeLanguage: (lang: CaptionLanguage) => void;
  onRunWhisper: () => void;
  onLoadSample: () => void;
  onSeek: (time: number) => void;
  onWordChange: (wordId: string, text: string) => void;
}

const LANGUAGE_OPTIONS = [
  { id: 'english' as const, label: 'English', icon: LanguageIcon },
  { id: 'hinglish' as const, label: 'Non-English', icon: GlobeIcon },
];

export function TranscriptPanel({
  segments,
  activeSegmentId,
  activeWordId,
  captionLanguage,
  onChangeLanguage,
  onRunWhisper,
  onLoadSample,
  onSeek,
  onWordChange,
}: TranscriptPanelProps) {
  return (
    <div className="tab-pane active">
      {/* Speech Language Switcher: English | Non-English */}
      <div className="lang-segmented" role="group" aria-label="Caption Language">
        {LANGUAGE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              className={`lang-seg-btn${captionLanguage === opt.id ? ' active' : ''}`}
              onClick={() => onChangeLanguage(opt.id)}
            >
              <Icon size={13} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="transcript-header-actions">
        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={onRunWhisper}
        >
          <MicIcon />
          Transcribe Speech
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
