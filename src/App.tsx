import { useEffect, useRef, useState } from 'react';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { VideoStage } from './components/VideoStage';
import { useStudioController } from './hooks/useStudioController';

export function App() {
  const studio = useStudioController();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Spacebar play/pause shortcut (ignores form inputs & contentEditable word chips)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      studio.togglePlay();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [studio.togglePlay]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="app-layout">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) studio.loadVideoFile(file);
          e.target.value = '';
        }}
      />

      <Topbar
        hasVideo={studio.hasVideo}
        onTriggerUpload={openFilePicker}
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={() => void studio.triggerExport()}
      />

      <div className="workspace">
        <VideoStage
          videoRef={studio.videoRef}
          canvasRef={studio.canvasRef}
          hasVideo={studio.hasVideo}
          isGeneratingDemo={studio.isGeneratingDemo}
          isPlaying={studio.isPlaying}
          isMuted={studio.isMuted}
          isLooping={studio.isLooping}
          currentTime={studio.currentTime}
          duration={studio.duration}
          loader={studio.loader}
          onBrowseClick={openFilePicker}
          onFileDrop={(file) => studio.loadVideoFile(file)}
          onLoadDemo={() => void studio.handleLoadDemoVideo()}
          onLoadedMetadata={studio.handleLoadedMetadata}
          onTimeUpdate={studio.handleTimeUpdate}
          onEnded={studio.handleVideoEnded}
          onTogglePlay={studio.togglePlay}
          onSeekPercent={studio.seekToPercent}
          onToggleMute={studio.toggleMute}
          onToggleLoop={studio.toggleLoop}
        />

        <Sidebar
          hasVideo={studio.hasVideo}
          wordCount={studio.wordCount}
          activePreset={studio.activePreset}
          styleConfig={studio.styleConfig}
          useUppercase={studio.useUppercase}
          useEmojis={studio.useEmojis}
          transitionConfig={studio.transitionConfig}
          segmenterStatus={studio.segmenterStatus}
          silenceEnabled={studio.silenceEnabled}
          silenceThreshold={studio.silenceThreshold}
          jumpcutStats={studio.jumpcutStats}
          segments={studio.segments}
          activeSegmentId={studio.activeSegmentId}
          activeWordId={studio.activeWordId}
          captionLanguage={studio.captionLanguage}
          multilingualModelSize={studio.multilingualModelSize}
          onChangeLanguage={studio.handleChangeCaptionLanguage}
          onSelectPreset={studio.applyPreset}
          onUpdateStyle={studio.updateStyleParam}
          onToggleUppercase={studio.toggleUppercase}
          onToggleEmojis={studio.toggleEmojis}
          onUpdateTransition={studio.updateTransition}
          onPreviewTransition={studio.previewTransition}
          onToggleSilence={studio.handleToggleSilence}
          onChangeSilenceThreshold={studio.handleChangeSilenceThreshold}
          onRunWhisper={() => void studio.runSpeechRecognition()}
          onLoadSample={studio.loadSampleCaptions}
          onSeek={studio.seekToTime}
          onWordChange={studio.updateWordText}
        />
      </div>

      <ExportModal state={studio.exportModal} onClose={studio.closeExportModal} />

      <SettingsModal
        open={settingsOpen}
        silenceEnabled={studio.silenceEnabled}
        silenceThreshold={studio.silenceThreshold}
        multilingualModelSize={studio.multilingualModelSize}
        onClose={() => setSettingsOpen(false)}
        onToggleSilence={studio.handleToggleSilence}
        onChangeSilenceThreshold={studio.handleChangeSilenceThreshold}
        onChangeMultilingualModelSize={studio.handleChangeMultilingualModelSize}
      />
    </div>
  );
}
export default App;
