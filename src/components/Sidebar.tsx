import { useState } from 'react';
import type { SegmenterStatus } from '../core/personSegmenter';
import type {
  HoldTransitionId,
  InOutTransitionId,
  PresetKey,
  SubtitleSegment,
  SubtitleStyleConfig,
  TransitionConfig,
  TransitionPhase,
  TransitionScope,
} from '../types/caption';
import {
  MotionIcon,
  StyleIcon,
  TemplatesIcon,
  TranscriptIcon,
} from './Icons';
import { StylePanel } from './StylePanel';
import { TemplatesPanel } from './TemplatesPanel';
import { TranscriptPanel } from './TranscriptPanel';
import { TransitionsPanel } from './TransitionsPanel';

type SidebarTab = 'templates' | 'style' | 'motion' | 'transcript';

interface SidebarProps {
  hasVideo: boolean;
  wordCount: number;
  activePreset: PresetKey;
  styleConfig: SubtitleStyleConfig;
  useUppercase: boolean;
  useEmojis: boolean;
  transitionConfig: TransitionConfig;
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
  onUpdateTransition: (
    scope: TransitionScope,
    phase: TransitionPhase,
    value: InOutTransitionId | HoldTransitionId
  ) => void;
  onPreviewTransition: (
    phase: TransitionPhase,
    scope: TransitionScope
  ) => void;
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
          <span className="tab-icon" aria-hidden="true">
            <TemplatesIcon />
          </span>
          <span className="tab-label">Templates</span>
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'style' ? ' active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          <span className="tab-icon" aria-hidden="true">
            <StyleIcon />
          </span>
          <span className="tab-label">Style</span>
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'motion' ? ' active' : ''}`}
          onClick={() => setActiveTab('motion')}
        >
          <span className="tab-icon" aria-hidden="true">
            <MotionIcon />
          </span>
          <span className="tab-label">Motion</span>
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'transcript' ? ' active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          <span className="tab-icon" aria-hidden="true">
            <TranscriptIcon />
          </span>
          <span className="tab-label">Text</span>
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

      {activeTab === 'motion' && (
        <TransitionsPanel
          hasVideo={props.hasVideo}
          config={props.transitionConfig}
          onUpdateTransition={props.onUpdateTransition}
          onPreview={props.onPreviewTransition}
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
