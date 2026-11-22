import { useEffect, useRef, useState } from 'react';
import { ExportModal } from './components/ExportModal';
import { LanguagePromptModal } from './components/LanguagePromptModal';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { VideoStage } from './components/VideoStage';
import { useStudioController } from './hooks/useStudioController';

export function App() {
  const studio = useStudioController();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentView, setCurrentView] = useState<'studio' | 'settings'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#settings') {
      return 'settings';
    }
    return 'studio';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#settings') {
        setCurrentView('settings');
      } else {
        setCurrentView('studio');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: 'studio' | 'settings') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'settings') {
        window.location.hash = '#settings';
      } else if (window.location.hash === '#settings') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

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
        accept="video/*,.mp4,.webm,.mov,.m4v,.mkv,.avi"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) studio.loadVideoFile(file);
          e.target.value = '';
        }}
      />

      <Topbar
        hasVideo={studio.hasVideo}
        currentView={currentView}
        onNavigate={navigateTo}
        onTriggerUpload={openFilePicker}
        onOpenSettings={() => navigateTo('settings')}
        onExport={() => void studio.triggerExport()}
      />

      {currentView === 'settings' ? (
        <SettingsPage
          onBack={() => navigateTo('studio')}
          silenceEnabled={studio.silenceEnabled}
          silenceThreshold={studio.silenceThreshold}
          groqApiKey={studio.groqApiKey}
          onToggleSilence={studio.handleToggleSilence}
          onChangeSilenceThreshold={studio.handleChangeSilenceThreshold}
          onUpdateGroqApiKey={studio.handleUpdateGroqApiKey}
        />
      ) : (
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
      )}

      <ExportModal state={studio.exportModal} onClose={studio.closeExportModal} />

      <LanguagePromptModal
        open={studio.languagePromptOpen}
        selectedLanguage={studio.captionLanguage}
        groqApiKey={studio.groqApiKey}
        onUpdateGroqApiKey={studio.handleUpdateGroqApiKey}
        onConfirm={studio.confirmLanguageAndTranscribe}
        onClose={studio.closeLanguagePrompt}
      />
    </div>
  );
}
export default App;
