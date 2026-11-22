import type { CaptionLanguage } from '../types/caption';
import {
  BrandLogoIcon,
  DownloadIcon,
  SettingsIcon,
  UploadIcon,
} from './Icons';

interface TopbarProps {
  hasVideo: boolean;
  captionLanguage: CaptionLanguage;
  onChangeLanguage: (lang: CaptionLanguage) => void;
  onTriggerUpload: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
}

export function Topbar({
  hasVideo,
  captionLanguage,
  onChangeLanguage,
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

      <div className="topbar-lang-toggle" role="group" aria-label="Speech Language">
        <button
          type="button"
          className={`topbar-lang-chip${captionLanguage === 'english' ? ' active' : ''}`}
          onClick={() => onChangeLanguage('english')}
          title="Switch to English (whisper-tiny.en ~39MB)"
        >
          ⚡ English (39MB)
        </button>
        <button
          type="button"
          className={`topbar-lang-chip${captionLanguage !== 'english' ? ' active' : ''}`}
          onClick={() => onChangeLanguage('hinglish')}
          title="Switch to Non-English / Multilingual (whisper-base ~75MB)"
        >
          🌐 Non-English (75MB)
        </button>
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
