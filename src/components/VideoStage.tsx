import { useState } from 'react';
import type { DragEvent, RefObject } from 'react';
import type { LoaderState } from '../hooks/useStudioController';
import { formatTime } from '../utils/formatTime';
import {
  CloudUploadIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  UploadIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from './Icons';

interface VideoStageProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasVideo: boolean;
  isGeneratingDemo: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isLooping: boolean;
  currentTime: number;
  duration: number;
  loader: LoaderState;
  onBrowseClick: () => void;
  onFileDrop: (file: File) => void;
  onLoadDemo: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
  onTogglePlay: () => void;
  onSeekPercent: (percent: number) => void;
  onToggleMute: () => void;
  onToggleLoop: () => void;
}

export function VideoStage({
  videoRef,
  canvasRef,
  hasVideo,
  isGeneratingDemo,
  isPlaying,
  isMuted,
  isLooping,
  currentTime,
  duration,
  loader,
  onBrowseClick,
  onFileDrop,
  onLoadDemo,
  onLoadedMetadata,
  onTimeUpdate,
  onEnded,
  onTogglePlay,
  onSeekPercent,
  onToggleMute,
  onToggleLoop,
}: VideoStageProps) {
  const [isDragging, setIsDragging] = useState(false);

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
        onFileDrop(file);
      }
    }
  };

  const scrubberPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <main className="stage-container">
      <div className="ambient-mesh-glow" />

      <div className="viewport-wrapper">
        {!hasVideo && (
          <div
            className={`dropzone-frame${isDragging ? ' dragover' : ''}`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-box">
              <div className="dropzone-icon-ring">
                <CloudUploadIcon />
              </div>
              <h3 className="dropzone-title">Drop your video to caption</h3>
              <p className="dropzone-subtitle">
                Hardware-accelerated speech recognition and animated typography
                for short-form video
              </p>

              <div className="dropzone-meta">
                <span>9:16 VERTICAL</span>
                <span>•</span>
                <span>MP4 / MOV / WEBM</span>
              </div>

              <div className="dropzone-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={onBrowseClick}
                >
                  <UploadIcon />
                  Browse Video File
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  disabled={isGeneratingDemo}
                  onClick={onLoadDemo}
                >
                  <PlayIcon size={14} filled={false} />
                  {isGeneratingDemo ? 'Generating Sample...' : 'Load Sample Clip'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Always mounted so refs stay attached before metadata loads */}
        <div className={`player-container${hasVideo ? '' : ' hidden'}`}>
          <canvas ref={canvasRef} id="preview-canvas" />
          <video
            ref={videoRef}
            id="source-video"
            playsInline
            loop={isLooping}
            preload="auto"
            className="hidden-source-video"
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
          />

          <div className={`canvas-loader${loader.visible ? '' : ' hidden'}`}>
            <div className="spinner" />
            <span>{loader.text}</span>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${loader.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`playback-bar${hasVideo ? '' : ' hidden'}`}>
        <button
          type="button"
          className="btn-icon"
          title="Play/Pause (Space)"
          onClick={onTogglePlay}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="scrubber-wrapper">
          <input
            type="range"
            min={0}
            max={100}
            step={0.05}
            value={scrubberPercent}
            onChange={(e) => onSeekPercent(Number(e.target.value))}
          />
        </div>

        <button
          type="button"
          className={`btn-icon${isLooping ? ' active' : ''}`}
          title={isLooping ? 'Loop: On' : 'Loop: Off'}
          aria-pressed={isLooping}
          onClick={onToggleLoop}
        >
          <RepeatIcon />
        </button>

        <button
          type="button"
          className="btn-icon"
          title="Mute/Unmute"
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>
      </div>
    </main>
  );
}
