import {
  BrandLogoIcon,
  DownloadIcon,
  SettingsIcon,
  UploadIcon,
} from './Icons';

interface TopbarProps {
  hasVideo: boolean;
  onTriggerUpload: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
}

export function Topbar({
  hasVideo,
  onTriggerUpload,
  onOpenSettings,
  onExport,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <BrandLogoIcon />
        <span className="brand-name">AutoCaption</span>
      </div>

      <div className="topbar-actions">
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
          className="btn btn-secondary btn-icon-only"
          title="Settings"
          onClick={onOpenSettings}
        >
          <SettingsIcon />
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
      </div>
    </header>
  );
}
