import { useEffect, useRef, useState } from 'react';
import { ExportModal } from './components/ExportModal';
import { LanguagePromptModal } from './components/LanguagePromptModal';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { VideoStage } from './components/VideoStage';
import { StudioProvider } from './context/StudioContext';
import { useStudioController } from './hooks/useStudioController';

export function App() {
  const [currentView, setCurrentView] = useState<'studio' | 'settings'>('studio');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studio = useStudioController();

  // Listen to hash changes (supports back/forward browser buttons and direct links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#settings') {
        setCurrentView('settings');
      } else {
        setCurrentView('studio');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: 'studio' | 'settings') => {
    setCurrentView(view);
    if (view === 'settings') {
      window.location.hash = 'settings';
    } else {
      if (window.location.hash === '#settings') {
        // Cleanly remove #settings from the URL without triggering a page reload
        window.history.pushState(
          '',
          document.title,
          window.location.pathname + window.location.search
        );
      }
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <StudioProvider value={studio}>
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

            <Sidebar />
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
    </StudioProvider>
  );
}
export default App;
