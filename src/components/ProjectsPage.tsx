import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { getLanguageOption } from '../core/languages';
import { formatFileSize, type ProjectRecord } from '../core/projectStore';
import { formatTime } from '../utils/formatTime';
import { CloudUploadIcon, PlayIcon, TrashIcon, UploadIcon } from './Icons';

interface ProjectsPageProps {
  projects: ProjectRecord[];
  isGeneratingDemo: boolean;
  onContinueWithFile: (file: File) => void;
  onLoadDemo: () => void;
  onOpenProject: (project: ProjectRecord) => void;
  onDeleteProject: (projectId: string) => void;
}

type SortMode = 'newest' | 'oldest' | 'name';

function formatRelativeTime(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function ProjectsPage({
  projects,
  isGeneratingDemo,
  onContinueWithFile,
  onLoadDemo,
  onOpenProject,
  onDeleteProject,
}: ProjectsPageProps) {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const localInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (stagedUrl) URL.revokeObjectURL(stagedUrl);
    };
  }, [stagedUrl]);

  const stageFile = (file: File) => {
    if (stagedUrl) URL.revokeObjectURL(stagedUrl);
    const url = URL.createObjectURL(file);
    setStagedFile(file);
    setStagedUrl(url);
  };

  const clearStagedFile = () => {
    if (stagedUrl) URL.revokeObjectURL(stagedUrl);
    setStagedFile(null);
    setStagedUrl(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const isVideo =
        file.type.startsWith('video/') ||
        /\.(mp4|webm|mov|m4v|mkv|avi|quicktime)$/i.test(file.name);
      if (isVideo) {
        stageFile(file);
      }
    }
  };

  const handleContinue = () => {
    if (!stagedFile) return;
    const fileToLoad = stagedFile;
    clearStagedFile();
    onContinueWithFile(fileToLoad);
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : [...projects];

    if (sortMode === 'newest') {
      list.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sortMode === 'oldest') {
      list.sort((a, b) => a.updatedAt - b.updatedAt);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [projects, searchQuery, sortMode]);

  return (
    <main className="projects-page">
      <input
        ref={localInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mov,.m4v,.mkv,.avi"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) stageFile(file);
          e.target.value = '';
        }}
      />

      <div className="projects-container">
        {/* Top Search & Sort Bar */}
        <div className="projects-toolbar">
          <div className="projects-heading-group">
            <h1 className="projects-title">Projects</h1>
            <span className="projects-count-pill">{projects.length}</span>
          </div>

          <div className="projects-filters">
            <div className="projects-search-box">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="projects-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sort projects"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Staged Video Card OR Dropzone Card */}
        <div
          className={`projects-stage-box${isDragging ? ' dragover' : ''}`}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {stagedFile && stagedUrl ? (
            <div className="staged-video-row">
              <div className="staged-video-info">
                <div className="staged-thumb-box">
                  <video
                    src={stagedUrl}
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="staged-meta">
                  <div className="staged-filename" title={stagedFile.name}>
                    {stagedFile.name}
                  </div>
                  <div className="staged-submeta">
                    {formatFileSize(stagedFile.size)} &bull; Ready to caption
                  </div>
                </div>
              </div>

              <div className="staged-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearStagedFile}
                >
                  &times; Change video
                </button>
                <button
                  type="button"
                  className="btn btn-primary staged-continue-btn"
                  onClick={handleContinue}
                >
                  <span>Continue</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="projects-drop-empty">
              <div className="projects-drop-left">
                <div className="projects-drop-icon">
                  <CloudUploadIcon />
                </div>
                <div>
                  <div className="projects-drop-title">
                    Drop a video here to create a project
                  </div>
                  <div className="projects-drop-desc">
                    MP4, MOV, or WebM &bull; 9:16 vertical or landscape
                  </div>
                </div>
              </div>

              <div className="projects-drop-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isGeneratingDemo}
                  onClick={onLoadDemo}
                >
                  <PlayIcon size={13} filled={false} />
                  {isGeneratingDemo ? 'Generating...' : 'Try Sample'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => localInputRef.current?.click()}
                >
                  <UploadIcon />
                  New project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects List / Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="projects-empty-state">
            <div className="projects-empty-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="m10 15.5 4-2.5-4-2.5v5Z" />
              </svg>
            </div>
            <h3>
              {searchQuery.trim()
                ? 'No matching projects'
                : 'No projects yet'}
            </h3>
            <p>
              {searchQuery.trim()
                ? 'Try clearing your search filter.'
                : 'Upload a video and captions are ready in about a minute.'}
            </p>
            {!searchQuery.trim() && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => localInputRef.current?.click()}
              >
                + New project
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((proj) => {
              const langLabel = getLanguageOption(proj.language).label;
              return (
                <div
                  key={proj.id}
                  className="project-card"
                  onClick={() => onOpenProject(proj)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenProject(proj);
                    }
                  }}
                >
                  <div className="project-card-thumb">
                    {proj.thumbnailDataUrl ? (
                      <img src={proj.thumbnailDataUrl} alt={proj.name} />
                    ) : (
                      <div className="project-card-thumb-placeholder">
                        <PlayIcon size={20} filled={false} />
                      </div>
                    )}
                    {proj.duration > 0 && (
                      <span className="project-card-duration">
                        {formatTime(proj.duration)}
                      </span>
                    )}
                    <button
                      type="button"
                      className="project-card-delete"
                      title="Delete project"
                      aria-label={`Delete ${proj.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>

                  <div className="project-card-body">
                    <div className="project-card-name" title={proj.name}>
                      {proj.name}
                    </div>
                    <div className="project-card-meta">
                      <span className="project-lang-badge">{langLabel}</span>
                      <span>
                        {proj.wordCount > 0
                          ? `${proj.wordCount} words`
                          : formatFileSize(proj.fileSize)}
                      </span>
                      <span>&bull;</span>
                      <span>{formatRelativeTime(proj.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
export default ProjectsPage;

