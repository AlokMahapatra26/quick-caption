import type { ImageSegmenter } from '@mediapipe/tasks-vision';

export type SegmenterStatus = 'idle' | 'loading' | 'ready' | 'error';

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';

const SELFIE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Lazy-loaded real-time in-browser person cutout engine powered by MediaPipe ImageSegmenter.
 * Runs completely outside React and reuses offscreen canvases to avoid GC pressure at 60fps.
 */
export class PersonSegmenter {
  private segmenter: ImageSegmenter | null = null;
  private initPromise: Promise<void> | null = null;
  status: SegmenterStatus = 'idle';

  // Reusable offscreen buffers
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;
  private maskImageData: ImageData | null = null;

  private fgCanvas: HTMLCanvasElement;
  private fgCtx: CanvasRenderingContext2D;

  // Monotonic timestamp guard (MediaPipe VIDEO mode rejects non-increasing timestamps on seek/loop)
  private lastTimestampMs = 0;
  private lastSegmentedVideoTime = -1;
  private hasCachedCutout = false;

  constructor() {
    this.maskCanvas = document.createElement('canvas');
    const mCtx = this.maskCanvas.getContext('2d');
    if (!mCtx) throw new Error('Unable to create offscreen mask 2D context.');
    this.maskCtx = mCtx;

    this.fgCanvas = document.createElement('canvas');
    const fCtx = this.fgCanvas.getContext('2d');
    if (!fCtx) throw new Error('Unable to create offscreen foreground 2D context.');
    this.fgCtx = fCtx;
  }

  async init(onStatus?: (status: SegmenterStatus) => void): Promise<void> {
    if (this.status === 'ready') return;
    if (this.initPromise) return this.initPromise;

    this.status = 'loading';
    onStatus?.('loading');

    this.initPromise = (async () => {
      try {
        // Dynamically imported so @mediapipe/tasks-vision stays out of the initial JS bundle
        const { FilesetResolver, ImageSegmenter: MPImageSegmenter } =
          await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        try {
          this.segmenter = await MPImageSegmenter.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: SELFIE_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch {
          // Graceful CPU fallback when WebGL2 GPU delegate isn't available
          this.segmenter = await MPImageSegmenter.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: SELFIE_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        }

        this.status = 'ready';
        onStatus?.('ready');
      } catch (err) {
        console.warn('Person segmentation initialization failed:', err);
        this.status = 'error';
        this.initPromise = null;
        onStatus?.('error');
      }
    })();

    return this.initPromise;
  }

  invalidateCache(): void {
    this.lastSegmentedVideoTime = -1;
    this.hasCachedCutout = false;
  }

  /**
   * Produces an offscreen canvas containing ONLY the segmented person foreground
   * with soft anti-aliased edges, ready to composite on top of behind-head captions.
   */
  getForegroundCutout(
    video: HTMLVideoElement,
    width: number,
    height: number
  ): HTMLCanvasElement | null {
    if (
      this.status !== 'ready' ||
      !this.segmenter ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    // Resize foreground canvas only when dimensions change
    const sizeChanged =
      this.fgCanvas.width !== width || this.fgCanvas.height !== height;
    if (sizeChanged) {
      this.fgCanvas.width = width;
      this.fgCanvas.height = height;
      this.hasCachedCutout = false;
    }

    // Reuse cached cutout if video is paused at the exact same timestamp
    const curTime = video.currentTime;
    if (
      this.hasCachedCutout &&
      Math.abs(curTime - this.lastSegmentedVideoTime) < 0.001
    ) {
      return this.fgCanvas;
    }

    // Strictly monotonic timestamp in ms for MediaPipe VIDEO mode
    const nowMs = Math.round(performance.now());
    const timestampMs =
      nowMs > this.lastTimestampMs ? nowMs : this.lastTimestampMs + 1;
    this.lastTimestampMs = timestampMs;

    let maskReady = false;

    try {
      this.segmenter.segmentForVideo(video, timestampMs, (result) => {
        const masks = result.confidenceMasks;
        if (!masks || masks.length === 0) return;

        // For selfie_multiclass (6 classes), index 0 is Background -> person = 1 - bg.
        // For binary selfie_segmenter (2 classes), index 1 is Person.
        // For single-mask models (1 class), index 0 is Person.
        const isInvertBg = masks.length > 2;
        const targetMask = masks.length === 2 ? masks[1] : masks[0];
        const maskW = targetMask.width;
        const maskH = targetMask.height;
        const probs = targetMask.getAsFloat32Array();

        if (
          this.maskCanvas.width !== maskW ||
          this.maskCanvas.height !== maskH
        ) {
          this.maskCanvas.width = maskW;
          this.maskCanvas.height = maskH;
          this.maskImageData = this.maskCtx.createImageData(maskW, maskH);
        }

        const imgData =
          this.maskImageData ?? this.maskCtx.createImageData(maskW, maskH);
        this.maskImageData = imgData;
        const data = imgData.data;

        for (let i = 0; i < probs.length; i++) {
          const personProb = isInvertBg ? 1 - probs[i] : probs[i];
          // Soft ramp eliminates jagged edges around hair and shoulders
          const alpha = Math.round(smoothstep(0.32, 0.72, personProb) * 255);
          const p = i * 4;
          data[p] = 255;
          data[p + 1] = 255;
          data[p + 2] = 255;
          data[p + 3] = alpha;
        }

        this.maskCtx.putImageData(imgData, 0, 0);
        maskReady = true;
      });
    } catch (err) {
      console.warn('Segmentation frame skipped:', err);
      return this.hasCachedCutout ? this.fgCanvas : null;
    }

    if (!maskReady) {
      return this.hasCachedCutout ? this.fgCanvas : null;
    }

    // Composite video clipped to the feathered person alpha mask
    const fCtx = this.fgCtx;
    fCtx.save();
    fCtx.clearRect(0, 0, width, height);
    fCtx.globalCompositeOperation = 'source-over';
    fCtx.drawImage(video, 0, 0, width, height);

    fCtx.globalCompositeOperation = 'destination-in';
    fCtx.filter = 'blur(1.2px)';
    fCtx.drawImage(this.maskCanvas, 0, 0, width, height);
    fCtx.filter = 'none';
    fCtx.restore();

    this.lastSegmentedVideoTime = curTime;
    this.hasCachedCutout = true;
    return this.fgCanvas;
  }

  dispose(): void {
    this.segmenter?.close();
    this.segmenter = null;
    this.initPromise = null;
    this.status = 'idle';
    this.hasCachedCutout = false;
  }
}
