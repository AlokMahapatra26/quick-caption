import { useLayoutEffect, useRef, useState } from 'react';
import {
  BrandLogoIcon,
  DownloadIcon,
  SettingsIcon,
  UploadIcon,
} from './Icons';

export type AppView = 'projects' | 'studio' | 'settings';

interface TopbarProps {
  hasVideo: boolean;
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onTriggerUpload: () => void;
  onExport: () => void;
}

export function Topbar({
  hasVideo,
  currentView = 'projects',
  onNavigate,
  onTriggerUpload,
  onExport,
}: TopbarProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<AppView, HTMLButtonElement | null>>({
    projects: null,
    studio: null,
    settings: null,
  });

  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({ left: 0, width: 0, ready: false });
  const [jellyPulse, setJellyPulse] = useState(0);
  const prevViewRef = useRef<AppView>(currentView);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const navEl = navRef.current;
      const activeBtn = tabRefs.current[currentView];
      if (!navEl || !activeBtn) return;

      setIndicator({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        ready: true,
      });
    };

    updateIndicator();

    if (prevViewRef.current !== currentView) {
      prevViewRef.current = currentView;
      setJellyPulse((n) => n + 1);
    }

    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [currentView]);

  return (
    <header className="topbar">
      <div
        className="brand"
        style={{ cursor: 'pointer' }}
        onClick={() => onNavigate?.('projects')}
        title="AutoCaption Projects"
      >
        <BrandLogoIcon />
        <span className="brand-name">AutoCaption</span>
      </div>

      {/* Center Navigation Tabs with Fluid Jelly Sliding Pill */}
      <nav className="topbar-nav" ref={navRef} aria-label="Primary navigation">
        <span
          className={`topbar-nav-indicator${indicator.ready ? ' ready' : ''}`}
          style={{
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            width: `${indicator.width}px`,
          }}
          aria-hidden="true"
        >
          <span
            key={jellyPulse}
            className={`topbar-nav-jelly-fill${jellyPulse > 0 ? ' is-moving' : ''}`}
          />
        </span>

        <button
          ref={(el) => {
            tabRefs.current.projects = el;
          }}
          type="button"
          className={`topbar-nav-tab${currentView === 'projects' ? ' active' : ''}`}
          onClick={() => onNavigate?.('projects')}
        >
          Projects
        </button>
        <button
          ref={(el) => {
            tabRefs.current.studio = el;
          }}
          type="button"
          className={`topbar-nav-tab${currentView === 'studio' ? ' active' : ''}`}
          onClick={() => onNavigate?.('studio')}
        >
          Editor
        </button>
        <button
          ref={(el) => {
            tabRefs.current.settings = el;
          }}
          type="button"
          className={`topbar-nav-tab${currentView === 'settings' ? ' active' : ''}`}
          onClick={() => onNavigate?.('settings')}
        >
          <SettingsIcon size={13} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="topbar-actions">
        {currentView === 'studio' && (
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
