import { useEffect, useRef, useState } from 'react';
import { ExportModal } from './components/ExportModal';
import { LanguagePromptModal } from './components/LanguagePromptModal';
import { ProjectsPage } from './components/ProjectsPage';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Topbar, type AppView } from './components/Topbar';
import { VideoStage } from './components/VideoStage';
import { StudioProvider } from './context/StudioContext';
import type { ProjectRecord } from './core/projectStore';
import { useStudioController } from './hooks/useStudioController';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studio = useStudioController();

  // Listen to hash changes (supports back/forward browser buttons and direct links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#settings') {
        setCurrentView('settings');
      } else if (hash === '#editor' || hash === '#studio') {
        setCurrentView('studio');
      } else {
        setCurrentView('projects');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view === 'settings') {
      window.location.hash = 'settings';
    } else if (view === 'studio') {
      window.location.hash = 'editor';
    } else {
      if (window.location.hash) {
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

  const handleContinueWithFile = (file: File) => {
    navigateTo('studio');
    studio.loadVideoFile(file);
  };

  const handleLoadDemoFromProjects = async () => {
    navigateTo('studio');
    await studio.handleLoadDemoVideo();
  };

  const handleOpenSavedProject = async (project: ProjectRecord) => {
    const ok = await studio.openSavedProject(project);
    if (ok) {
      navigateTo('studio');
    }
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
            if (file) {
              navigateTo('studio');
              studio.loadVideoFile(file);
            }
            e.target.value = '';
          }}
        />

        <Topbar
          hasVideo={studio.hasVideo}
          currentView={currentView}
          onNavigate={navigateTo}
          onTriggerUpload={openFilePicker}
          onExport={() => void studio.triggerExport()}
        />

        {currentView === 'projects' && (
          <ProjectsPage
            projects={studio.projects}
            isGeneratingDemo={studio.isGeneratingDemo}
            onContinueWithFile={handleContinueWithFile}
            onLoadDemo={() => void handleLoadDemoFromProjects()}
            onOpenProject={(proj) => void handleOpenSavedProject(proj)}
            onDeleteProject={studio.deleteProject}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage
            onBack={() => navigateTo('studio')}
            silenceEnabled={studio.silenceEnabled}
            silenceThreshold={studio.silenceThreshold}
            groqApiKey={studio.groqApiKey}
            onToggleSilence={studio.handleToggleSilence}
            onChangeSilenceThreshold={studio.handleChangeSilenceThreshold}
            onUpdateGroqApiKey={studio.handleUpdateGroqApiKey}
          />
        )}

        {/* Keep Studio Editor workspace mounted so <video> and <canvas> refs persist across view switches */}
        <div
          className={`workspace${currentView === 'studio' ? '' : ' hidden'}`}
        >
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

        <ExportModal state={studio.exportModal} onClose={studio.closeExportModal} />

        <LanguagePromptModal
          open={studio.languagePromptOpen}
          selectedLanguage={studio.captionLanguage}
          selectedDensity={studio.captionDensity}
          translateToEnglish={studio.translateToEnglish}
          videoUrl={studio.videoPreviewUrl}
          videoFilename={studio.videoFilename}
          videoDuration={studio.duration}
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
