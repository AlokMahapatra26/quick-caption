import type { CaptionLanguage, RawWord } from '../types/caption';

export interface LanguageOption {
  id: CaptionLanguage;
  label: string;
  whisperCode: string;
  samplePreview: string;
}

export const PRIMARY_LANGUAGES: LanguageOption[] = [
  {
    id: 'hinglish',
    label: 'Hinglish',
    whisperCode: 'hi',
    samplePreview: 'Aap kaise ho?',
  },
  {
    id: 'english',
    label: 'English',
    whisperCode: 'en',
    samplePreview: 'How are you doing?',
  },
  {
    id: 'hindi',
    label: 'Hindi',
    whisperCode: 'hi',
    samplePreview: 'आप कैसे हैं?',
  },
  {
    id: 'punjabi',
    label: 'Punjabi',
    whisperCode: 'pa',
    samplePreview: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',
  },
  {
    id: 'urdu',
    label: 'Urdu',
    whisperCode: 'ur',
    samplePreview: 'آپ کیسے ہیں؟',
  },
  {
    id: 'gujarati',
    label: 'Gujarati',
    whisperCode: 'gu',
    samplePreview: 'તમે કેમ છો?',
  },
];

export const MORE_LANGUAGES: LanguageOption[] = [
  { id: 'marathi', label: 'Marathi', whisperCode: 'mr', samplePreview: 'तुम्ही कसे आहात?' },
  { id: 'tamil', label: 'Tamil', whisperCode: 'ta', samplePreview: 'நீங்கள் எப்படி இருக்கிறீர்கள்?' },
  { id: 'telugu', label: 'Telugu', whisperCode: 'te', samplePreview: 'మీరు ఎలా ఉన్నారు?' },
  { id: 'bengali', label: 'Bengali', whisperCode: 'bn', samplePreview: 'আপনি কেমন আছেন?' },
  { id: 'kannada', label: 'Kannada', whisperCode: 'kn', samplePreview: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?' },
  { id: 'malayalam', label: 'Malayalam', whisperCode: 'ml', samplePreview: 'സുഖമാണോ?' },
  { id: 'spanish', label: 'Spanish', whisperCode: 'es', samplePreview: '¿Cómo estás?' },
  { id: 'french', label: 'French', whisperCode: 'fr', samplePreview: 'Comment allez-vous ?' },
  { id: 'german', label: 'German', whisperCode: 'de', samplePreview: 'Wie geht es dir?' },
  { id: 'arabic', label: 'Arabic', whisperCode: 'ar', samplePreview: 'كيف حالك؟' },
  { id: 'portuguese', label: 'Portuguese', whisperCode: 'pt', samplePreview: 'Como você está?' },
  { id: 'italian', label: 'Italian', whisperCode: 'it', samplePreview: 'Come stai?' },
  { id: 'japanese', label: 'Japanese', whisperCode: 'ja', samplePreview: 'お元気ですか？' },
  { id: 'korean', label: 'Korean', whisperCode: 'ko', samplePreview: '어떻게 지내세요?' },
  { id: 'russian', label: 'Russian', whisperCode: 'ru', samplePreview: 'Как дела?' },
  { id: 'indonesian', label: 'Indonesian', whisperCode: 'id', samplePreview: 'Apa kabar?' },
  { id: 'turkish', label: 'Turkish', whisperCode: 'tr', samplePreview: 'Nasılsın?' },
  { id: 'dutch', label: 'Dutch', whisperCode: 'nl', samplePreview: 'Hoe gaat het?' },
  { id: 'vietnamese', label: 'Vietnamese', whisperCode: 'vi', samplePreview: 'Bạn khỏe không?' },
  { id: 'thai', label: 'Thai', whisperCode: 'th', samplePreview: 'สบายดีไหม?' },
];

export const ALL_LANGUAGES: LanguageOption[] = [
  ...PRIMARY_LANGUAGES,
  ...MORE_LANGUAGES,
];

export function getLanguageOption(id: CaptionLanguage): LanguageOption {
  return (
    ALL_LANGUAGES.find((l) => l.id === id) ?? {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      whisperCode: id.slice(0, 2).toLowerCase(),
      samplePreview: 'How are you doing?',
    }
  );
}

const STOP_WORDS = new Set([
  // English fillers & common function words
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'am', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'that', 'this',
  'these', 'those', 'it', 'its', 'so', 'just', 'like', 'uh', 'um', 'erm',
  'actually', 'basically', 'literally', 'you', 'know', 'i', 'mean', 'well',
  // Hinglish / Hindi fillers & postpositions
  'hai', 'hain', 'ho', 'tha', 'the', 'thi', 'ki', 'ka', 'ke', 'ko', 'se',
  'me', 'mein', 'par', 'pe', 'aur', 'ya', 'toh', 'to', 'bhi', 'hi', 'na',
  'kya', 'ye', 'yeh', 'wo', 'woh', 'ek', 'matlab', 'acha', 'accha', 'haan',
  'है', 'हैं', 'हो', 'था', 'थे', 'थी', 'की', 'का', 'के', 'को', 'से', 'में', 'पर', 'और', 'या', 'तो', 'भी', 'ही',
]);

/**
 * Condenses full word-level captions into "Important only" key moments
 * (one punchy 2-4 word caption per idea/clause) while preserving original timestamps.
 */
export function extractImportantCaptions(words: RawWord[]): RawWord[] {
  if (words.length <= 6) return words;

  // 1. Group words into natural idea chunks by pause (> 0.45s), sentence punctuation, or max length
  const ideas: RawWord[][] = [];
  let current: RawWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = current[current.length - 1];
    const gap = prev ? w.start - prev.end : 0;

    if (
      current.length > 0 &&
      (gap >= 0.45 || current.length >= 10)
    ) {
      ideas.push(current);
      current = [];
    }

    current.push(w);

    if (/[.?!।]$/.test(w.word.trim())) {
      ideas.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    ideas.push(current);
  }

  // 2. From each idea, pick the highest-signal 2-4 words in chronological order
  const result: RawWord[] = [];
  let idx = 0;

  for (const idea of ideas) {
    if (idea.length <= 3) {
      for (const w of idea) {
        result.push({ ...w, id: `imp-${idx++}` });
      }
      continue;
    }

    const scored = idea.map((w, pos) => {
      const clean = w.word
        .toLowerCase()
        .replace(/[.,!?;:'"()[\]{}।]/g, '')
        .trim();
      let score = 0;
      if (!STOP_WORDS.has(clean)) score += 3;
      if (/\d/.test(clean)) score += 3; // numbers/metrics are high-signal
      if (clean.length >= 6) score += 2;
      if (clean.length >= 4) score += 1;
      if (/^[A-Z]/.test(w.word) && pos > 0) score += 2; // proper nouns
      return { w, pos, score };
    });

    const targetCount = Math.min(4, Math.max(2, Math.ceil(idea.length * 0.4)));
    const topPositions = new Set(
      [...scored]
        .sort((a, b) => b.score - a.score || a.pos - b.pos)
        .slice(0, targetCount)
        .map((item) => item.pos)
    );

    for (let p = 0; p < idea.length; p++) {
      if (topPositions.has(p)) {
        result.push({ ...idea[p], id: `imp-${idx++}` });
      }
    }
  }

  return result.length > 0 ? result : words;
}

