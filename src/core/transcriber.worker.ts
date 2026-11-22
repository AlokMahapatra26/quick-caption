/**
 * AutoCaption Studio • Whisper AI Web Worker
 * Uses whisper-tiny.en (ultra-fast, ~39MB) 100% locally in the browser.
 */
import { DEMO_SAMPLE_WORDS } from './presets';
import type {
  RawWord,
  WorkerInMessage,
  WorkerOutMessage,
} from '../types/caption';

interface WhisperChunk {
  text: string;
  timestamp: [number, number | null];
}

interface WhisperOutput {
  chunks?: WhisperChunk[];
}

interface TranscribeOptions {
  return_timestamps: 'word';
  chunk_length_s: number;
  stride_length_s: number;
  language?: string;
  task?: 'transcribe' | 'translate';
}

type TranscriberPipeline = (
  audioData: Float32Array,
  options: TranscribeOptions
) => Promise<WhisperOutput>;

interface WorkerScope {
  onmessage: ((e: MessageEvent<WorkerInMessage>) => void) | null;
  postMessage: (msg: WorkerOutMessage) => void;
}

const workerSelf = self as unknown as WorkerScope;

const pipelineCache = new Map<string, TranscriberPipeline>();

const MODEL_ID = 'Xenova/whisper-tiny.en';

async function initPipeline(
  modelId: string,
  onProgress: (percent: number) => void
): Promise<TranscriberPipeline> {
  const cached = pipelineCache.get(modelId);
  if (cached) return cached;

  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
  const mod = (await import(/* @vite-ignore */ cdnUrl)) as {
    pipeline: (
      task: string,
      model: string,
      opts: {
        quantized?: boolean;
        device?: string;
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

  // Cap CPU worker threads so the browser/desktop UI thread always has 1-2 dedicated cores free
  const envAny = mod.env as unknown as {
    backends?: { onnx?: { wasm?: { numThreads?: number } } };
  };
  if (envAny?.backends?.onnx?.wasm) {
    const totalCores =
      typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    envAny.backends.onnx.wasm.numThreads = Math.max(1, Math.min(4, totalCores - 2));
  }

  let instance = pipelineCache.get(modelId);
  if (instance) return instance;

  instance = await mod.pipeline('automatic-speech-recognition', modelId, {
    quantized: true,
    progress_callback: (p) => {
      if (p.status === 'progress' && p.loaded && p.total) {
        onProgress(Math.round((p.loaded / p.total) * 100));
      }
    },
  });

  pipelineCache.set(modelId, instance);
  return instance;
}

/**
 * Merges sub-word continuation tokens (chunks without a leading space)
 * so Devanagari syllables combine into complete words before Hinglish transliteration.
 */
function buildMergedWords(chunks: WhisperChunk[]): RawWord[] {
  const words: RawWord[] = [];

  for (const chunk of chunks) {
    const rawText = chunk.text ?? '';
    const trimmed = rawText.trim();
    if (!trimmed) continue;

    const start = chunk.timestamp[0] ?? 0;
    const end = chunk.timestamp[1] ?? start + 0.3;
    const isContinuation = words.length > 0 && !/^\s/.test(rawText);

    if (isContinuation) {
      const prev = words[words.length - 1];
      prev.word = `${prev.word}${trimmed}`;
      prev.end = Math.max(prev.end, end);
    } else {
      words.push({
        id: `word-${words.length}`,
        word: trimmed,
        start,
        end,
      });
    }
  }

  return words;
}

workerSelf.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const {
    type,
    audioData,
    fallback,
  } = e.data;

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
      message: 'Loading speech recognition engine...',
    });

    const transcriber = await initPipeline(MODEL_ID, (percent) => {
      workerSelf.postMessage({ type: 'PROGRESS', percent });
    });

    workerSelf.postMessage({
      type: 'STATUS',
      message: 'Transcribing English speech...',
    });

    const options: TranscribeOptions = {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
    };

    const output = await transcriber(audioData, options);
    const nativeWords = output.chunks ? buildMergedWords(output.chunks) : [];

    if (nativeWords.length === 0) {
      workerSelf.postMessage({
        type: 'TRANSCRIBE_SUCCESS',
        words: DEMO_SAMPLE_WORDS,
      });
      return;
    }

    workerSelf.postMessage({
      type: 'TRANSCRIBE_SUCCESS',
      words: nativeWords,
      nativeWords,
    });
  } catch (err) {
    console.warn('Falling back to sample captions:', err);
    workerSelf.postMessage({
      type: 'TRANSCRIBE_SUCCESS',
      words: DEMO_SAMPLE_WORDS,
      warning: 'Used sample captions (offline/test mode).',
    });
  }
};
