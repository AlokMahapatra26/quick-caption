import {
  ArrowLeftIcon,
  BrandLogoIcon,
  DownloadIcon,
  SettingsIcon,
  UploadIcon,
} from './Icons';

interface TopbarProps {
  hasVideo: boolean;
  currentView?: 'studio' | 'settings';
  onNavigate?: (view: 'studio' | 'settings') => void;
  onTriggerUpload: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
}

export function Topbar({
  hasVideo,
  currentView = 'studio',
  onNavigate,
  onTriggerUpload,
  onOpenSettings,
  onExport,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div
        className="brand"
        style={{ cursor: 'pointer' }}
        onClick={() => onNavigate?.('studio')}
        title="AutoCaption Studio"
      >
        <BrandLogoIcon />
        <span className="brand-name">AutoCaption</span>
      </div>

      <div className="topbar-actions">
        {currentView === 'settings' ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate?.('studio')}
          >
            <ArrowLeftIcon size={14} />
            Back to Studio
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onTriggerUpload}
            >
              <UploadIcon />
              New Video
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              title="Settings & AI Quota"
              onClick={onOpenSettings}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={!hasVideo}
              onClick={onExport}
            >
              <DownloadIcon />
              Export MP4
            </button>
          </>
        )}
      </div>
    </header>
  );
}
