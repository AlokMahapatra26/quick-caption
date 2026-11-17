import type { ExportResult } from '../types/caption';
import type { SilenceDetector } from './silenceDetector';

type CapturableVideo = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

/**
 * Client-Side Video Exporter
 * Burns the canvas subtitle overlay onto video frames locally,
 * composites the audio track, and exports a downloadable MP4 / WebM file.
 */
export class VideoExporter {
  private canvas: HTMLCanvasElement;
  private video: CapturableVideo;
  private silenceDetector: SilenceDetector | null;
  isExporting = false;

  constructor(
    canvas: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
    silenceDetector: SilenceDetector | null = null
  ) {
    this.canvas = canvas;
    this.video = videoElement as CapturableVideo;
    this.silenceDetector = silenceDetector;
  }

  async exportVideo(
    onProgress: (percent: number) => void = () => {}
  ): Promise<ExportResult> {
    if (this.isExporting) {
      throw new Error('Export already in progress.');
    }
    this.isExporting = true;

    const originalTime = this.video.currentTime;
    const wasPlaying = !this.video.paused;
    this.video.pause();

    let interval: ReturnType<typeof setInterval> | null = null;

    try {
      const canvasStream = this.canvas.captureStream(30);

      let combinedStream: MediaStream = canvasStream;
      const captureFn =
        this.video.captureStream || this.video.mozCaptureStream;
      if (captureFn) {
        const videoStream = captureFn.call(this.video);
        const audioTracks = videoStream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            audioTracks[0],
          ]);
        }
      }

      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      const duration = this.video.duration || 10;
      this.video.currentTime = 0;
      await new Promise((r) => setTimeout(r, 200));

      const exportPromise = new Promise<ExportResult>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const extension: 'mp4' | 'webm' = mimeType.includes('mp4')
            ? 'mp4'
            : 'webm';
          resolve({ url, blob, extension });
        };
      });

      recorder.start();
      await this.video.play();

      interval = setInterval(() => {
        if (this.silenceDetector?.isEnabled) {
          const jumpTarget = this.silenceDetector.getJumpTarget(
            this.video.currentTime
          );
          if (jumpTarget !== null && jumpTarget > this.video.currentTime + 0.05) {
            this.video.currentTime = jumpTarget;
          }
        }

        const percent = Math.min(
          99,
          Math.round((this.video.currentTime / duration) * 100)
        );
        onProgress(percent);

        if (this.video.currentTime >= duration || this.video.ended) {
          if (interval) clearInterval(interval);
          this.video.pause();
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 50);

      const result = await exportPromise;
      onProgress(100);

      this.video.currentTime = originalTime;
      if (wasPlaying) void this.video.play();
      this.isExporting = false;

      return result;
    } catch (err) {
      if (interval) clearInterval(interval);
      this.isExporting = false;
      this.video.currentTime = originalTime;
      throw err;
    }
  }
}
