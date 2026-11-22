import { useState } from 'react';
import { useStudio } from '../context/StudioContext';
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

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates');
  const studio = useStudio();

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
          <span className="tab-label">Transcript</span>
          {studio.wordCount > 0 && (
            <span className="tab-badge">{studio.wordCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'templates' && (
        <TemplatesPanel
          activePreset={studio.activePreset}
          segmenterStatus={studio.segmenterStatus}
          onSelectPreset={studio.applyPreset}
          onCustomizeClick={() => setActiveTab('style')}
        />
      )}

      {activeTab === 'style' && (
        <StylePanel
          activePreset={studio.activePreset}
          styleConfig={studio.styleConfig}
          useUppercase={studio.useUppercase}
          useEmojis={studio.useEmojis}
          silenceEnabled={studio.silenceEnabled}
          silenceThreshold={studio.silenceThreshold}
          jumpcutStats={studio.jumpcutStats}
          onChangeTemplateClick={() => setActiveTab('templates')}
          onUpdateStyle={studio.updateStyleParam}
          onToggleUppercase={studio.toggleUppercase}
          onToggleEmojis={studio.toggleEmojis}
          onToggleSilence={studio.handleToggleSilence}
          onChangeSilenceThreshold={studio.handleChangeSilenceThreshold}
        />
      )}

      {activeTab === 'motion' && (
        <TransitionsPanel
          hasVideo={studio.hasVideo}
          config={studio.transitionConfig}
          onUpdateTransition={studio.updateTransition}
          onPreview={studio.previewTransition}
        />
      )}

      {activeTab === 'transcript' && (
        <TranscriptPanel
          segments={studio.segments}
          activeSegmentId={studio.activeSegmentId}
          activeWordId={studio.activeWordId}
          captionLanguage={studio.captionLanguage}
          onChangeLanguage={studio.handleChangeCaptionLanguage}
          onRunWhisper={() => void studio.runSpeechRecognition()}
          onLoadSample={studio.loadSampleCaptions}
          onSeek={studio.seekToTime}
          onWordChange={studio.updateWordText}
        />
      )}
    </aside>
  );
}
export default Sidebar;
