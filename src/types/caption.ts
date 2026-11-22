export type PresetKey =
  | 'hormozi'
  | 'editorial'
  | 'mrbeast'
  | 'minimal'
  | 'terminal'
  | 'broadcast'
  | 'capsule'
  | 'cinema'
  | 'behind'
  | 'liquidGlass'
  | 'aliPill'
  | 'editorialStack'
  | 'chrome'
  | 'scribble'
  | 'haloArc'
  | 'kineticBlur'
  | 'swissGrid'
  | 'auraPoster'
  | 'anchorage'
  | 'bigRed'
  | 'cleanShadow'
  | 'pixel'
  | 'deepGlow'
  | 'hollowImpact';

export type AnimationType = 'bounce' | 'glow' | 'none';
export type TextTransform = 'uppercase' | 'none' | 'capitalize';

export type CaptionLanguage = 'english' | 'hinglish';
export type MultilingualModelSize = 'base' | 'small';

export type TransitionScope = 'all' | 'emphasized';
export type TransitionPhase = 'in' | 'hold' | 'out';

export type InOutTransitionId =
  | 'none'
  | 'fade'
  | 'pop'
  | 'zoom'
  | 'scale'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'riseUp'
  | 'riseDown'
  | 'blurRise'
  | 'hookLeft'
  | 'hookRight'
  | 'punch'
  | 'slam'
  | 'wobble'
  | 'drop'
  | 'bounce'
  | 'spinIn'
  | 'typewriter'
  | 'typeOn'
  | 'expand'
  | 'flicker'
  | 'glitch'
  | 'softFocus';

export type HoldTransitionId =
  | 'template'
  | 'none'
  | 'float'
  | 'pulse'
  | 'heartbeat'
  | 'shake'
  | 'swing'
  | 'breathe'
  | 'jello';

export interface PhaseTransitionSet {
  in: InOutTransitionId;
  hold: HoldTransitionId;
  out: InOutTransitionId;
}

export interface TransitionConfig {
  all: PhaseTransitionSet;
  emphasized: PhaseTransitionSet;
}

export interface RawWord {
  id?: string;
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface WordTimestamp {
  id: string;
  word: string;
  start: number;
  end: number;
  emoji: string | null;
}

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  words: WordTimestamp[];
}

export interface SubtitleStyleConfig {
  presetName: PresetKey;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textTransform: TextTransform;
  textColor: string;
  activeWordColor: string;
  highlightTapeColor?: string;
  strokeColor: string;
  strokeWidth: number;
  animationType: AnimationType;
  positionYPercent: number;
  tiltAngle: number;
  bgBox: boolean;
  markerTape: boolean;
  activeWordPill?: boolean;
  progressiveReveal?: boolean;
  behindPerson?: boolean;
  liquidGlass?: boolean;
  whitePill?: boolean;
  editorialStack?: boolean;
  chromeGradient?: boolean;
  scribbleStyle?: boolean;
  haloArc?: boolean;
  kineticBlur?: boolean;
  swissGrid?: boolean;
  auraPoster?: boolean;
  sharpBoxPill?: boolean;
  bigRedPoster?: boolean;
  heavyShadow?: boolean;
  pixelStyle?: boolean;
  deepNeon?: boolean;
  hollowImpact?: boolean;
}

export interface SilenceZone {
  start: number;
  end: number;
  duration: number;
}

export interface SilenceDetectionResult {
  zones: SilenceZone[];
  timeSaved: number;
  count: number;
}

export interface AudioExtractionResult {
  audioData: Float32Array;
  duration: number;
  sampleRate: number;
}

export interface ExportResult {
  url: string;
  blob: Blob;
  extension: 'mp4' | 'webm';
}

export type WorkerInMessage = {
  type: 'TRANSCRIBE';
  audioData?: Float32Array;
  language?: CaptionLanguage;
  modelSize?: MultilingualModelSize;
  fallback?: boolean;
};

export type WorkerOutMessage =
  | { type: 'STATUS'; message: string }
  | { type: 'PROGRESS'; percent: number }
  | {
      type: 'TRANSCRIBE_SUCCESS';
      words: RawWord[];
      nativeWords?: RawWord[];
      warning?: string;
    };
