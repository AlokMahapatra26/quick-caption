import type { CaptionLanguage, RawWord } from '../types/caption';
import { recordGroqTranscription } from './groqUsage';
import { toNaturalHinglish, urduToDevanagari } from './hinglish';
import { getLanguageOption } from './languages';

/**
 * Encodes Float32Array PCM samples into a standard 16kHz Mono 16-bit PCM WAV Blob.
 */
export function float32ToWavBlob(
  samples: Float32Array,
  sampleRate = 16000
): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw PCM = 1)
  view.setUint16(20, 1, true);
  // Channel count (1 = mono)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * blockAlign)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channels * bytes per sample)
  view.setUint16(32, 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM 16-bit samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export interface GroqTranscribeOptions {
  apiKey: string;
  language?: CaptionLanguage;
  translateToEnglish?: boolean;
  prompt?: string;
  onStatus?: (message: string) => void;
}

interface GroqWord {
  word: string;
  start: number;
  end: number;
}

interface GroqSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
}

interface GroqVerboseResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words?: GroqWord[];
  segments?: GroqSegment[];
}

/**
 * Transcribes audio via Groq Whisper Large v3 for ultra-fast, 95%+ accurate Hinglish.
 */
export async function transcribeWithGroq(
  audioData: Float32Array,
  options: GroqTranscribeOptions
): Promise<RawWord[]> {
  const {
    apiKey,
    language = 'hinglish',
    translateToEnglish = false,
    prompt,
    onStatus,
  } = options;
  const cleanKey = apiKey ? apiKey.trim() : '';
  if (!cleanKey) {
    throw new Error(
      'Groq API Key is missing. Please enter your free API key in Settings.'
    );
  }

  const shouldTranslate = translateToEnglish && language !== 'english';
  const langMeta = getLanguageOption(language);

  onStatus?.('Preparing 16kHz audio for Groq...');
  const wavBlob = float32ToWavBlob(audioData, 16000);

  const formData = new FormData();
  formData.append('file', wavBlob, 'audio.wav');
  // Use the full 1.55B foundation model for deep multilingual & Indian dialect comprehension
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'verbose_json');

  const endpoint = shouldTranslate
    ? 'https://api.groq.com/openai/v1/audio/translations'
    : 'https://api.groq.com/openai/v1/audio/transcriptions';

  if (shouldTranslate) {
    formData.append(
      'prompt',
      prompt || 'Translate spoken audio into clear, natural English captions.'
    );
    onStatus?.(`Translating ${langMeta.label} speech to English...`);
  } else {
    formData.append('timestamp_granularities[]', 'word');
    formData.append('language', langMeta.whisperCode);

    if (language === 'hinglish') {
      const defaultHinglishPrompt =
        'Hinglish conversation in Roman / Latin script: namaste doston, talash, subscribe, video, like, share, follow, creators, kya, kaise, kyun.';
      formData.append('prompt', prompt || defaultHinglishPrompt);
    } else if (language === 'english') {
      formData.append(
        'prompt',
        prompt || 'English speech with clear punctuation and grammar.'
      );
    } else if (prompt) {
      formData.append('prompt', prompt);
    }

    onStatus?.(`Transcribing ${langMeta.label} with Groq Whisper Large v3...`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = `Status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // ignore
    }
    if (response.status === 401) {
      throw new Error(
        'Invalid Groq API Key. Please verify your key at console.groq.com'
      );
    }
    if (response.status === 429) {
      throw new Error(
        'Groq rate limit reached. Please wait a few seconds and try again.'
      );
    }
    throw new Error(`Groq API Error: ${errorDetail}`);
  }

  const data: GroqVerboseResponse = await response.json();

  // Record live usage & read rate-limit headers
  const remainingHdr = response.headers.get('x-ratelimit-remaining-requests');
  const resetHdr = response.headers.get('x-ratelimit-reset-requests');
  const durationSec = data.duration || Math.round(audioData.length / 16000);
  recordGroqTranscription(durationSec, {
    remainingRequests: remainingHdr,
    resetRequests: resetHdr,
  });

  onStatus?.(
    shouldTranslate
      ? 'Formatting English captions...'
      : `Formatting ${langMeta.label} captions...`
  );

  const formatToken = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed || shouldTranslate || language === 'english') {
      return trimmed;
    }
    if (language === 'hinglish') {
      return toNaturalHinglish(trimmed);
    }
    if (language === 'hindi') {
      return urduToDevanagari(trimmed);
    }
    return trimmed;
  };

  let words: RawWord[] = [];

  if (data.words && data.words.length > 0) {
    words = data.words
      .map((w, index) => ({
        id: `word-${index}`,
        word: formatToken(w.word),
        start: Math.max(0, w.start),
        end: Math.max(w.start + 0.1, w.end),
      }))
      .filter((w) => w.word.length > 0);
  } else if (data.segments && data.segments.length > 0) {
    // If word timestamps weren't returned directly, interpolate across segment intervals
    let wordIdx = 0;
    for (const seg of data.segments) {
      const tokenList = seg.text.trim().split(/\s+/).filter(Boolean);
      if (tokenList.length === 0) continue;
      const segDuration = Math.max(0.2, seg.end - seg.start);
      const step = segDuration / tokenList.length;

      for (let i = 0; i < tokenList.length; i++) {
        const cleanWord = formatToken(tokenList[i]);
        if (!cleanWord) continue;
        const wStart = seg.start + i * step;
        const wEnd = wStart + step * 0.9;
        words.push({
          id: `word-${wordIdx++}`,
          word: cleanWord,
          start: Math.round(wStart * 100) / 100,
          end: Math.round(wEnd * 100) / 100,
        });
      }
    }
  }

  return words;
}

