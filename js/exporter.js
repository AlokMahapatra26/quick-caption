/**
 * AutoCaption Studio • Client-Side Video Exporter
 * Burns the canvas subtitle overlay directly onto video frames in the browser,
 * composites the audio track, and exports a downloadable MP4 / WebM file.
 */

export class VideoExporter {
  constructor(canvas, videoElement, subtitleEngine, silenceDetector = null) {
    this.canvas = canvas;
    this.video = videoElement;
    this.subtitleEngine = subtitleEngine;
    this.silenceDetector = silenceDetector;
    this.isExporting = false;
  }

  async exportVideo(onProgress = () => {}) {
    if (this.isExporting) return;
    this.isExporting = true;

    const originalTime = this.video.currentTime;
    const wasPlaying = !this.video.paused;
    this.video.pause();

    try {
      // 1. Capture stream from canvas (30 FPS)
      const canvasStream = this.canvas.captureStream(30);

      // 2. Capture audio track from video
      let combinedStream = canvasStream;
      if (this.video.captureStream || this.video.mozCaptureStream) {
        const videoStream = (this.video.captureStream || this.video.mozCaptureStream).call(this.video);
        const audioTracks = videoStream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            audioTracks[0]
          ]);
        }
      }

      // Check supported MIME type (prefer MP4, fallback to WebM)
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000 // High 6 Mbps quality
      });

      const recordedChunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      const duration = this.video.duration || 10;
      this.video.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));

      const exportPromise = new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          resolve({ url, blob, extension });
        };
      });

      recorder.start();
      await this.video.play();

      // Render loop during recording
      const interval = setInterval(() => {
        // Auto-skip silences during export if enabled
        if (this.silenceDetector && this.silenceDetector.isEnabled) {
          const jumpTarget = this.silenceDetector.getJumpTarget(this.video.currentTime);
          if (jumpTarget !== null && jumpTarget > this.video.currentTime + 0.05) {
            this.video.currentTime = jumpTarget;
          }
        }

        const percent = Math.min(99, Math.round((this.video.currentTime / duration) * 100));
        onProgress(percent);

        if (this.video.currentTime >= duration || this.video.ended) {
          clearInterval(interval);
          this.video.pause();
          recorder.stop();
        }
      }, 50);

      const result = await exportPromise;
      onProgress(100);

      // Restore original state
      this.video.currentTime = originalTime;
      if (wasPlaying) this.video.play();
      this.isExporting = false;

      return result;
    } catch (err) {
      this.isExporting = false;
      this.video.currentTime = originalTime;
      throw err;
    }
  }
}

