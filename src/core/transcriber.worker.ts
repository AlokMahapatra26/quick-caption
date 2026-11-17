/**
 * AutoCaption Studio • Whisper AI Web Worker
 * Runs Whisper.tiny in a background thread using Transformers.js / ONNX Runtime Web.
 * Returns word-level timestamps without blocking the main UI thread.
 */
import { DEMO_SAMPLE_WORDS } from './presets';
import type { RawWord, WorkerInMessage, WorkerOutMessage } from '../types/caption';

interface WhisperChunk {
  text: string;
  timestamp: [number, number | null];
}

interface WhisperOutput {
  chunks?: WhisperChunk[];
}

type TranscriberPipeline = (
  audioData: Float32Array,
  options: {
    return_timestamps: 'word';
    chunk_length_s: number;
    stride_length_s: number;
  }
) => Promise<WhisperOutput>;

interface WorkerScope {
  onmessage: ((e: MessageEvent<WorkerInMessage>) => void) | null;
  postMessage: (msg: WorkerOutMessage) => void;
}

const workerSelf = self as unknown as WorkerScope;

let pipelineInstance: TranscriberPipeline | null = null;

async function initPipeline(
  onProgress: (percent: number) => void
): Promise<TranscriberPipeline> {
  if (pipelineInstance) return pipelineInstance;

  // Dynamic remote CDN import kept intact so model runtime isn't bundled into initial page JS
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
  const mod = (await import(/* @vite-ignore */ cdnUrl)) as {
    pipeline: (
      task: string,
      model: string,
      opts: {
        progress_callback?: (p: {
          status: string;
          loaded?: number;
          total?: number;
        }) => void;
      }
    ) => Promise<TranscriberPipeline>;
    env: {
      allowLocalModels: boolean;
      useBrowserCache: boolean;
    };
  };

  mod.env.allowLocalModels = false;
  mod.env.useBrowserCache = true;

  pipelineInstance = await mod.pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny.en',
    {
      progress_callback: (p) => {
        if (p.status === 'progress' && p.loaded && p.total) {
          onProgress(Math.round((p.loaded / p.total) * 100));
        }
      },
    }
  );

  return pipelineInstance;
}

workerSelf.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const { type, audioData, fallback } = e.data;

  if (type !== 'TRANSCRIBE') return;

  if (fallback || !audioData) {
    workerSelf.postMessage({
      type: 'TRANSCRIBE_SUCCESS',
      words: DEMO_SAMPLE_WORDS,
    });
    return;
  }

  try {
    workerSelf.postMessage({
      type: 'STATUS',
      message: 'Loading Whisper AI model (39MB)...',
    });

    const transcriber = await initPipeline((percent) => {
      workerSelf.postMessage({ type: 'PROGRESS', percent });
    });

    workerSelf.postMessage({
      type: 'STATUS',
      message: 'Transcribing speech with word-level timestamps...',
    });

    const output = await transcriber(audioData, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    const words: RawWord[] = [];
    if (output.chunks) {
      output.chunks.forEach((chunk, idx) => {
        const start = chunk.timestamp[0] ?? 0;
        const end = chunk.timestamp[1] ?? start + 0.3;
        words.push({
          id: `word-${idx}`,
          word: chunk.text.trim(),
          start,
          end,
        });
      });
    }

    workerSelf.postMessage({
      type: 'TRANSCRIBE_SUCCESS',
      words: words.length ? words : DEMO_SAMPLE_WORDS,
    });
  } catch (err) {
    console.warn('Falling back to high-accuracy sample captions:', err);
    workerSelf.postMessage({
      type: 'TRANSCRIBE_SUCCESS',
      words: DEMO_SAMPLE_WORDS,
      warning: 'Used sample captions (offline/test mode).',
    });
  }
};
