import { useState } from 'react';
import type { SegmenterStatus } from '../core/personSegmenter';
import type {
  PresetKey,
  SubtitleSegment,
  SubtitleStyleConfig,
} from '../types/caption';
import { StylePanel } from './StylePanel';
import { TemplatesPanel } from './TemplatesPanel';
import { TranscriptPanel } from './TranscriptPanel';

type SidebarTab = 'templates' | 'style' | 'transcript';

interface SidebarProps {
  wordCount: number;
  activePreset: PresetKey;
  styleConfig: SubtitleStyleConfig;
  useUppercase: boolean;
  useEmojis: boolean;
  segmenterStatus: SegmenterStatus;
  silenceEnabled: boolean;
  silenceThreshold: number;
  jumpcutStats: string;
  segments: SubtitleSegment[];
  activeSegmentId: string | null;
  activeWordId: string | null;
  onSelectPreset: (preset: PresetKey) => void;
  onUpdateStyle: <K extends keyof SubtitleStyleConfig>(
    key: K,
    value: SubtitleStyleConfig[K]
  ) => void;
  onToggleUppercase: (checked: boolean) => void;
  onToggleEmojis: (checked: boolean) => void;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
  onRunWhisper: () => void;
  onLoadSample: () => void;
  onSeek: (time: number) => void;
  onWordChange: (wordId: string, text: string) => void;
}

export function Sidebar(props: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates');

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          type="button"
          className={`tab-btn${activeTab === 'templates' ? ' active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'style' ? ' active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'transcript' ? ' active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          Transcript
          {props.wordCount > 0 && (
            <span className="tab-count-pill">{props.wordCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'templates' && (
        <TemplatesPanel
          activePreset={props.activePreset}
          segmenterStatus={props.segmenterStatus}
          onSelectPreset={props.onSelectPreset}
          onCustomizeClick={() => setActiveTab('style')}
        />
      )}

      {activeTab === 'style' && (
        <StylePanel
          activePreset={props.activePreset}
          styleConfig={props.styleConfig}
          useUppercase={props.useUppercase}
          useEmojis={props.useEmojis}
          silenceEnabled={props.silenceEnabled}
          silenceThreshold={props.silenceThreshold}
          jumpcutStats={props.jumpcutStats}
          onChangeTemplateClick={() => setActiveTab('templates')}
          onUpdateStyle={props.onUpdateStyle}
          onToggleUppercase={props.onToggleUppercase}
          onToggleEmojis={props.onToggleEmojis}
          onToggleSilence={props.onToggleSilence}
          onChangeSilenceThreshold={props.onChangeSilenceThreshold}
        />
      )}

      {activeTab === 'transcript' && (
        <TranscriptPanel
          segments={props.segments}
          activeSegmentId={props.activeSegmentId}
          activeWordId={props.activeWordId}
          onRunWhisper={props.onRunWhisper}
          onLoadSample={props.onLoadSample}
          onSeek={props.onSeek}
          onWordChange={props.onWordChange}
        />
      )}
    </aside>
  );
}
