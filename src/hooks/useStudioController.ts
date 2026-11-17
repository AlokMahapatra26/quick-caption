import { useCallback, useEffect, useRef, useState } from 'react';
import { extract16kHzMonoAudio } from '../core/audioExtractor';
import { generateSyntheticDemoVideo } from '../core/demoVideo';
import { VideoExporter } from '../core/exporter';
import {
  PersonSegmenter,
  type SegmenterStatus,
} from '../core/personSegmenter';
import { DEMO_SAMPLE_WORDS, PRESETS } from '../core/presets';
import { SilenceDetector } from '../core/silenceDetector';
import { SubtitleEngine } from '../core/subtitleEngine';
import { createDefaultTransitionConfig } from '../core/transitions';
import type {
  ExportResult,
  HoldTransitionId,
  InOutTransitionId,
  PresetKey,
  RawWord,
  SubtitleSegment,
  SubtitleStyleConfig,
  TransitionConfig,
  TransitionPhase,
  TransitionScope,
  WorkerOutMessage,
} from '../types/caption';

export interface LoaderState {
  visible: boolean;
  text: string;
  progress: number;
}

export interface ExportModalState {
  open: boolean;
  progress: number;
  statusDesc: string;
  downloadUrl: string | null;
  downloadFilename: string;
  error: string | null;
}

export function useStudioController() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pure imperative engines (zero React re-renders during 60fps canvas rendering)
  const engineRef = useRef<SubtitleEngine>(new SubtitleEngine());
  const silenceRef = useRef<SilenceDetector>(new SilenceDetector(0.4));
  const segmenterRef = useRef<PersonSegmenter>(new PersonSegmenter());
  const exporterRef = useRef<VideoExporter | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const currentFileRef = useRef<File | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const exportUrlRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isJumpingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const skipAutoTranscribeRef = useRef(false);

  // Reactive UI State
  const [hasVideo, setHasVideo] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [activePreset, setActivePreset] = useState<PresetKey>('hormozi');
  const [styleConfig, setStyleConfig] = useState<SubtitleStyleConfig>({
    ...PRESETS.hormozi,
  });
  const [useUppercase, setUseUppercase] = useState(true);
  const [useEmojis, setUseEmojis] = useState(true);
  const [transitionConfig, setTransitionConfig] = useState<TransitionConfig>(
    () => createDefaultTransitionConfig()
  );

  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  const [silenceEnabled, setSilenceEnabled] = useState(false);
  const [silenceThreshold, setSilenceThreshold] = useState(0.4);
  const [jumpcutStats, setJumpcutStats] = useState('0 pauses found');
  const [segmenterStatus, setSegmenterStatus] =
    useState<SegmenterStatus>('idle');

  const [loader, setLoader] = useState<LoaderState>({
    visible: false,
    text: 'Transcribing with Whisper AI...',
    progress: 0,
  });

  const [exportModal, setExportModal] = useState<ExportModalState>({
    open: false,
    progress: 0,
    statusDesc:
      'Rendering video frames and burning subtitles locally in your browser...',
    downloadUrl: null,
    downloadFilename: 'captioned-video.mp4',
    error: null,
  });

  const recalculateSilences = useCallback(() => {
    const detector = silenceRef.current;
    if (!detector.isEnabled) {
      setJumpcutStats('Off • Dead air preserved');
      return;
    }

    const dur = videoRef.current?.duration || 10;
    const result = detector.detectFromWords(engineRef.current.rawWords, dur);
    if (result.count === 0) {
      setJumpcutStats('0 long pauses found');
    } else {
      setJumpcutStats(
        `Cut ${result.count} pauses • Saved ${result.timeSaved}s`
      );
    }
  }, []);

  const applyWords = useCallback(
    (words: RawWord[]) => {
      const nextSegments = engineRef.current.processWords(words);
      setSegments([...nextSegments]);
      setWordCount(engineRef.current.rawWords.length);
      recalculateSilences();
    },
    [recalculateSilences]
  );

  const loadSampleCaptions = useCallback(() => {
    setLoader((prev) => ({ ...prev, visible: false }));
    applyWords(DEMO_SAMPLE_WORDS);
  }, [applyWords]);

  const startRenderLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        // Smart Silence Remover: Jump-cut dead air pauses with seek debounce
        if (
          isPlayingRef.current &&
          !video.paused &&
          !video.seeking &&
          !isJumpingRef.current &&
          silenceRef.current.isEnabled
        ) {
          const jumpTarget = silenceRef.current.getJumpTarget(
            video.currentTime
          );
          if (jumpTarget !== null && jumpTarget > video.currentTime + 0.08) {
            isJumpingRef.current = true;
            video.currentTime = jumpTarget;
            window.setTimeout(() => {
              isJumpingRef.current = false;
            }, 90);
          }
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cutout = engineRef.current.styleConfig.behindPerson
            ? segmenterRef.current.getForegroundCutout(
                video,
                canvas.width,
                canvas.height
              )
            : null;
          engineRef.current.render(
            ctx,
            canvas.width,
            canvas.height,
            video.currentTime,
            video,
            cutout
          );
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, []);

  // Initialize Whisper Web Worker & cleanup on unmount
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../core/transcriber.worker.ts', import.meta.url),
        { type: 'module' }
      );
      worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        const data = e.data;
        if (data.type === 'STATUS') {
          setLoader((prev) => ({ ...prev, text: data.message }));
        } else if (data.type === 'PROGRESS') {
          setLoader((prev) => ({ ...prev, progress: data.percent }));
        } else if (data.type === 'TRANSCRIBE_SUCCESS') {
          setLoader((prev) => ({ ...prev, visible: false, progress: 100 }));
          applyWords(data.words);
        }
      };
      workerRef.current = worker;
    } catch (err) {
      console.warn('Worker initialization note:', err);
    }

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      workerRef.current?.terminate();
      segmenterRef.current.dispose();
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
    };
  }, [applyWords]);

  const runSpeechRecognition = useCallback(async () => {
    const file = currentFileRef.current;
    if (!file) {
      loadSampleCaptions();
      return;
    }

    setLoader({
      visible: true,
      text: 'Extracting 16kHz audio from video...',
      progress: 5,
    });

    try {
      const audioResult = await extract16kHzMonoAudio(file, (pct, msg) => {
        setLoader({ visible: true, text: msg, progress: pct });
      });

      setLoader((prev) => ({
        ...prev,
        text: 'Transcribing with Whisper AI...',
      }));

      if (workerRef.current) {
        // Zero-copy transfer of the Float32Array buffer to the Web Worker
        workerRef.current.postMessage(
          { type: 'TRANSCRIBE', audioData: audioResult.audioData },
          [audioResult.audioData.buffer]
        );
      } else {
        loadSampleCaptions();
      }
    } catch (err) {
      console.warn('Audio extraction notice, loading sample words:', err);
      loadSampleCaptions();
    }
  }, [loadSampleCaptions]);

  const loadVideoFile = useCallback(
    (file: File, options: { autoTranscribe?: boolean } = {}) => {
      const video = videoRef.current;
      if (!video) return;

      currentFileRef.current = file;
      skipAutoTranscribeRef.current = options.autoTranscribe === false;

      // Revoke previous object URL to avoid memory leaks
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      videoUrlRef.current = url;
      video.src = url;
      video.load();
    },
    []
  );

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    segmenterRef.current.invalidateCache();

    exporterRef.current = new VideoExporter(canvas, video, silenceRef.current);

    setDuration(video.duration || 0);
    setCurrentTime(0);
    setHasVideo(true);
    setIsPlaying(false);
    isPlayingRef.current = false;

    startRenderLoop();

    if (skipAutoTranscribeRef.current) {
      skipAutoTranscribeRef.current = false;
      loadSampleCaptions();
    } else {
      void runSpeechRecognition();
    }
  }, [loadSampleCaptions, runSpeechRecognition, startRenderLoop]);

  const handleLoadDemoVideo = useCallback(async () => {
    if (isGeneratingDemo) return;
    setIsGeneratingDemo(true);
    try {
      const demoFile = await generateSyntheticDemoVideo();
      loadVideoFile(demoFile, { autoTranscribe: false });
    } catch (err) {
      console.error('Demo generation failed:', err);
    } finally {
      setIsGeneratingDemo(false);
    }
  }, [isGeneratingDemo, loadVideoFile]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (video.paused || video.ended) {
      void video.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
    } else {
      video.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, [hasVideo]);

  const handleVideoEnded = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const cur = video.currentTime || 0;
    setCurrentTime(cur);

    // O(1) active segment & word tracking (only updates state when IDs actually change)
    const seg = engineRef.current.getActiveSegment(cur);
    const nextSegId = seg?.id ?? null;
    const nextWord = seg?.words.find((w) => cur >= w.start && cur <= w.end);
    const nextWordId = nextWord?.id ?? null;

    setActiveSegmentId((prev) => (prev === nextSegId ? prev : nextSegId));
    setActiveWordId((prev) => (prev === nextWordId ? prev : nextWordId));
  }, []);

  const seekToPercent = useCallback((percent: number) => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 1;
    video.currentTime = (percent / 100) * dur;
    setCurrentTime(video.currentTime);
  }, []);

  const seekToTime = useCallback((timeSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = timeSeconds;
    setCurrentTime(timeSeconds);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleLoop = useCallback(() => {
    const video = videoRef.current;
    setIsLooping((prev) => {
      const next = !prev;
      if (video) video.loop = next;
      return next;
    });
  }, []);

  // Style & Preset Mutations
  const applyPreset = useCallback((presetKey: PresetKey) => {
    const nextStyle = engineRef.current.setPreset(presetKey);
    setActivePreset(presetKey);
    setStyleConfig(nextStyle);
    setUseUppercase(nextStyle.textTransform === 'uppercase');

    // Lazily load MediaPipe person segmentation model only when Behind-Person preset is chosen
    if (nextStyle.behindPerson) {
      segmenterRef.current.invalidateCache();
      void segmenterRef.current.init((status) => {
        setSegmenterStatus(status);
      });
    }
  }, []);

  const updateStyleParam = useCallback(
    <K extends keyof SubtitleStyleConfig>(
      key: K,
      value: SubtitleStyleConfig[K]
    ) => {
      engineRef.current.setStyleParam(key, value);
      setStyleConfig((prev) => ({ ...prev, [key]: value }));

      // Eagerly fetch selected Google Font so Canvas 2D paints it immediately
      if (key === 'fontFamily' && typeof value === 'string' && document.fonts) {
        const weight = engineRef.current.styleConfig.fontWeight || '700';
        void document.fonts.load(`${weight} 48px "${value}"`);
        void document.fonts.load(`italic ${weight} 48px "${value}"`);
      }
    },
    []
  );

  const toggleUppercase = useCallback((checked: boolean) => {
    engineRef.current.useUppercase = checked;
    const transform = checked ? 'uppercase' : 'none';
    engineRef.current.setStyleParam('textTransform', transform);
    setUseUppercase(checked);
    setStyleConfig((prev) => ({ ...prev, textTransform: transform }));
  }, []);

  const toggleEmojis = useCallback(
    (checked: boolean) => {
      engineRef.current.useEmojis = checked;
      setUseEmojis(checked);
      applyWords(engineRef.current.rawWords);
    },
    [applyWords]
  );

  const updateWordText = useCallback((wordId: string, text: string) => {
    engineRef.current.updateWordText(wordId, text);
  }, []);

  const previewTransition = useCallback(
    (phase: TransitionPhase = 'in', scope: TransitionScope = 'all') => {
      const video = videoRef.current;
      if (!video || !hasVideo) return;

      if (engineRef.current.segments.length === 0) {
        loadSampleCaptions();
      }

      const engine = engineRef.current;
      const activeMeta = engine.getActiveSegmentWithMeta(video.currentTime);
      const seg = activeMeta?.segment ?? engine.segments[0];
      const effectiveEnd =
        activeMeta?.effectiveEnd ?? engine.getSegmentEffectiveEnd(0);

      if (seg) {
        let seekTarget = seg.start;
        if (scope === 'emphasized') {
          const activeWord =
            seg.words.find(
              (w) => video.currentTime >= w.start && video.currentTime <= w.end
            ) ?? seg.words[0];
          if (activeWord) {
            seekTarget =
              phase === 'out'
                ? Math.max(activeWord.start, activeWord.end - 0.28)
                : activeWord.start;
          }
        } else if (phase === 'out') {
          seekTarget = Math.max(seg.start, effectiveEnd - 0.52);
        } else if (phase === 'hold') {
          seekTarget = seg.start + 0.06;
        } else {
          seekTarget = Math.max(0, seg.start - 0.02);
        }

        video.currentTime = seekTarget;
        setCurrentTime(seekTarget);
      }

      void video.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
    },
    [hasVideo, loadSampleCaptions]
  );

  const updateTransition = useCallback(
    (
      scope: TransitionScope,
      phase: TransitionPhase,
      value: InOutTransitionId | HoldTransitionId
    ) => {
      const next = engineRef.current.setTransition(scope, phase, value);
      setTransitionConfig({ ...next });

      // Auto-preview immediately when user picks a visible transition so they see it live
      const isReset =
        value === 'none' || (phase === 'hold' && value === 'template');
      if (!isReset && hasVideo) {
        previewTransition(phase, scope);
      }
    },
    [hasVideo, previewTransition]
  );

  // Silence Remover (single source of truth for both Settings modal & Sidebar card)
  const handleToggleSilence = useCallback(
    (enabled: boolean) => {
      silenceRef.current.isEnabled = enabled;
      setSilenceEnabled(enabled);
      recalculateSilences();
    },
    [recalculateSilences]
  );

  const handleChangeSilenceThreshold = useCallback(
    (threshold: number) => {
      silenceRef.current.setThreshold(threshold);
      setSilenceThreshold(threshold);
      recalculateSilences();
    },
    [recalculateSilences]
  );

  // Client-Side Video Export
  const triggerExport = useCallback(async () => {
    const exporter = exporterRef.current;
    if (!exporter) return;

    setExportModal({
      open: true,
      progress: 0,
      statusDesc: 'Burning animated captions onto video frames locally...',
      downloadUrl: null,
      downloadFilename: 'captioned-video.mp4',
      error: null,
    });

    try {
      const result: ExportResult = await exporter.exportVideo((pct) => {
        setExportModal((prev) => ({ ...prev, progress: pct }));
      });

      if (exportUrlRef.current) {
        URL.revokeObjectURL(exportUrlRef.current);
      }
      exportUrlRef.current = result.url;

      setExportModal({
        open: true,
        progress: 100,
        statusDesc: 'Export complete! Your video is ready for download.',
        downloadUrl: result.url,
        downloadFilename: `captioned-video.${result.extension}`,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected export error';
      console.error('Export failed:', err);
      setExportModal((prev) => ({
        ...prev,
        statusDesc: `Export failed: ${message}. Try playing the video first.`,
        error: message,
      }));
    }
  }, []);

  const closeExportModal = useCallback(() => {
    setExportModal((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    // DOM Refs
    videoRef,
    canvasRef,
    // Video & Playback
    hasVideo,
    isGeneratingDemo,
    isPlaying,
    isMuted,
    isLooping,
    currentTime,
    duration,
    loader,
    loadVideoFile,
    handleLoadedMetadata,
    handleLoadDemoVideo,
    togglePlay,
    handleVideoEnded,
    handleTimeUpdate,
    seekToPercent,
    seekToTime,
    toggleMute,
    toggleLoop,
    // Style & Presets
    activePreset,
    styleConfig,
    useUppercase,
    useEmojis,
    transitionConfig,
    segmenterStatus,
    applyPreset,
    updateStyleParam,
    toggleUppercase,
    toggleEmojis,
    updateTransition,
    previewTransition,
    // Transcript
    segments,
    wordCount,
    activeSegmentId,
    activeWordId,
    runSpeechRecognition,
    loadSampleCaptions,
    updateWordText,
    // Silence Remover
    silenceEnabled,
    silenceThreshold,
    jumpcutStats,
    handleToggleSilence,
    handleChangeSilenceThreshold,
    // Export
    exportModal,
    triggerExport,
    closeExportModal,
  };
}
