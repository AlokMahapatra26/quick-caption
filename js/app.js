/**
 * AutoCaption Studio • Main Application Controller
 * Coordinates Video Ingestion, Scrubber Playback, Whisper AI Transcription,
 * Subtitle Canvas Synchronization, Preset Controls, and MP4 Export.
 */

import { SubtitleEngine, PRESETS } from './subtitleEngine.js';
import { extract16kHzMonoAudio } from './audioExtractor.js';
import { VideoExporter } from './exporter.js';
import { DEMO_SAMPLE_WORDS } from './transcriber.worker.js';

class AutoCaptionApp {
  constructor() {
    this.video = document.getElementById('source-video');
    this.canvas = document.getElementById('preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.engine = new SubtitleEngine();
    this.exporter = new VideoExporter(this.canvas, this.video, this.engine);
    
    this.currentFile = null;
    this.isPlaying = false;
    this.rafId = null;
    this.worker = null;

    this.initElements();
    this.initEventListeners();
    this.initWorker();
  }

  initElements() {
    // Stage elements
    this.dropzone = document.getElementById('dropzone');
    this.playerContainer = document.getElementById('player-container');
    this.playbackBar = document.getElementById('playback-bar');
    this.fileInput = document.getElementById('file-input');
    this.statusPill = document.getElementById('status-pill');
    this.statusText = document.getElementById('status-text');

    // Controls
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.timeDisplay = document.getElementById('time-display');
    this.scrubber = document.getElementById('timeline-scrubber');
    this.btnMute = document.getElementById('btn-mute');
    this.iconVolOn = document.getElementById('icon-vol-on');
    this.iconVolOff = document.getElementById('icon-vol-off');

    // Sidebar & Tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');
    this.presetCards = document.querySelectorAll('.preset-card');
    this.transcriptList = document.getElementById('transcript-list');
    this.transcriptCount = document.getElementById('transcript-count');

    // Style Controls
    this.ctrlFontFamily = document.getElementById('ctrl-font-family');
    this.ctrlFontSize = document.getElementById('ctrl-font-size');
    this.valFontSize = document.getElementById('val-font-size');
    this.ctrlPosY = document.getElementById('ctrl-pos-y');
    this.valPosY = document.getElementById('val-pos-y');
    this.ctrlStrokeWidth = document.getElementById('ctrl-stroke-width');
    this.valStrokeWidth = document.getElementById('val-stroke-width');
    this.ctrlActiveColor = document.getElementById('ctrl-active-color');
    this.ctrlTextColor = document.getElementById('ctrl-text-color');
    this.ctrlStrokeColor = document.getElementById('ctrl-stroke-color');
    this.ctrlTapeColor = document.getElementById('ctrl-tape-color');
    this.ctrlAnimation = document.getElementById('ctrl-animation');
    this.ctrlUppercase = document.getElementById('ctrl-uppercase');
    this.ctrlEmojis = document.getElementById('ctrl-emojis');

    // AI & Actions
    this.btnRunWhisper = document.getElementById('btn-run-whisper');
    this.btnLoadSample = document.getElementById('btn-load-sample-transcript');
    this.btnExport = document.getElementById('btn-export');
    this.canvasLoader = document.getElementById('canvas-loader');
    this.canvasLoaderText = document.getElementById('canvas-loader-text');
    this.aiProgressBar = document.getElementById('ai-progress-bar');

    // Modal
    this.modal = document.getElementById('export-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.exportProgressFill = document.getElementById('export-progress-fill');
    this.exportPercent = document.getElementById('export-percent');
    this.exportDownloadArea = document.getElementById('export-download-area');
    this.btnDownloadVideo = document.getElementById('btn-download-video');
  }

  initWorker() {
    try {
      this.worker = new Worker(new URL('./transcriber.worker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => this.handleWorkerMessage(e.data);
    } catch (err) {
      console.warn('Worker initialization note:', err);
    }
  }

  initEventListeners() {
    // File Ingestion
    document.getElementById('btn-browse').addEventListener('click', () => this.fileInput.click());
    document.getElementById('btn-upload-trigger').addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files?.[0]) this.loadVideoFile(e.target.files[0]);
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropzone.classList.remove('dragover');
      });
    });
    this.dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('video/')) this.loadVideoFile(file);
    });

    // Demo Video Generator
    document.getElementById('btn-demo-video').addEventListener('click', () => this.generateDemoVideo());

    // Video Playback Controls
    this.btnPlayPause.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('ended', () => this.onEnded());
    this.scrubber.addEventListener('input', (e) => this.onSeek(e.target.value));
    this.btnMute.addEventListener('click', () => this.toggleMute());

    // Spacebar to toggle play/pause
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        this.togglePlay();
      }
    });

    // Sidebar Tab Switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Preset Selection
    this.presetCards.forEach(card => {
      card.addEventListener('click', () => {
        this.presetCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.applyPreset(card.dataset.preset);
      });
    });

    // Style Adjustments
    this.ctrlFontFamily.addEventListener('change', (e) => this.engine.setStyleParam('fontFamily', e.target.value));
    this.ctrlFontSize.addEventListener('input', (e) => {
      this.valFontSize.textContent = `${e.target.value}px`;
      this.engine.setStyleParam('fontSize', Number(e.target.value));
    });
    this.ctrlPosY.addEventListener('input', (e) => {
      this.valPosY.textContent = `${e.target.value}%`;
      this.engine.setStyleParam('positionYPercent', Number(e.target.value));
    });
    this.ctrlStrokeWidth.addEventListener('input', (e) => {
      this.valStrokeWidth.textContent = `${e.target.value}px`;
      this.engine.setStyleParam('strokeWidth', Number(e.target.value));
    });
    this.ctrlActiveColor.addEventListener('input', (e) => this.engine.setStyleParam('activeWordColor', e.target.value));
    this.ctrlTextColor.addEventListener('input', (e) => this.engine.setStyleParam('textColor', e.target.value));
    this.ctrlStrokeColor.addEventListener('input', (e) => this.engine.setStyleParam('strokeColor', e.target.value));
    this.ctrlTapeColor?.addEventListener('input', (e) => this.engine.setStyleParam('highlightTapeColor', e.target.value));
    this.ctrlAnimation.addEventListener('change', (e) => this.engine.setStyleParam('animationType', e.target.value));
    this.ctrlUppercase.addEventListener('change', (e) => {
      this.engine.useUppercase = e.target.checked;
      this.engine.setStyleParam('textTransform', e.target.checked ? 'uppercase' : 'none');
    });
    this.ctrlEmojis.addEventListener('change', (e) => {
      this.engine.useEmojis = e.target.checked;
      this.engine.processWords(this.engine.rawWords);
      this.renderTranscriptList();
    });

    // Actions
    this.btnRunWhisper.addEventListener('click', () => this.runSpeechRecognition());
    this.btnLoadSample.addEventListener('click', () => this.loadSampleCaptions());
    this.btnExport.addEventListener('click', () => this.triggerExport());
    this.btnCloseModal.addEventListener('click', () => this.modal.classList.add('hidden'));
  }

  // ==========================================
  // VIDEO LOADING & DEMO GENERATION
  // ==========================================
  async loadVideoFile(file) {
    this.currentFile = file;
    const url = URL.createObjectURL(file);
    this.video.src = url;
    this.setStatus('busy', 'Loading Video...');

    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth || 720;
      this.canvas.height = this.video.videoHeight || 1280;
      this.dropzone.classList.add('hidden');
      this.playerContainer.classList.remove('hidden');
      this.playbackBar.classList.remove('hidden');
      this.btnExport.removeAttribute('disabled');
      this.setStatus('ready', `Loaded: ${file.name}`);
      this.updateScrubberDuration();
      this.startRenderLoop();

      // Auto-transcribe or prompt
      this.runSpeechRecognition();
    };
  }

  generateDemoVideo() {
    // Generates an interactive synthetic vertical 9:16 demo video via Canvas & Web Audio
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 720;
    demoCanvas.height = 1280;
    const dctx = demoCanvas.getContext('2d');

    const stream = demoCanvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.loadVideoFile(new File([blob], 'viral-demo-clip.webm', { type: 'video/webm' }));
      this.loadSampleCaptions();
    };

    recorder.start();
    let frame = 0;
    const totalFrames = 30 * 10; // 10 seconds demo

    const animInterval = setInterval(() => {
      frame++;
      // Animated gradient background
      const grad = dctx.createLinearGradient(0, 0, 720, 1280);
      const shift = Math.sin(frame * 0.05);
      grad.addColorStop(0, shift > 0 ? '#111827' : '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#09090b');
      dctx.fillStyle = grad;
      dctx.fillRect(0, 0, 720, 1280);

      // Moving graphic circles
      dctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
      dctx.beginPath();
      dctx.arc(360 + Math.sin(frame * 0.04) * 120, 500 + Math.cos(frame * 0.03) * 150, 180, 0, Math.PI * 2);
      dctx.fill();

      dctx.fillStyle = 'rgba(255, 230, 0, 0.1)';
      dctx.beginPath();
      dctx.arc(360 - Math.sin(frame * 0.04) * 100, 700 - Math.cos(frame * 0.03) * 120, 220, 0, Math.PI * 2);
      dctx.fill();

      // Watermark indicator
      dctx.fillStyle = 'rgba(255,255,255,0.4)';
      dctx.font = '600 24px sans-serif';
      dctx.textAlign = 'center';
      dctx.fillText('⚡ DEMO VERTICAL VIDEO CLIP (9:16)', 360, 240);

      if (frame >= totalFrames) {
        clearInterval(animInterval);
        recorder.stop();
      }
    }, 1000 / 30);
  }

  // ==========================================
  // PLAYBACK & CANVAS LOOP
  // ==========================================
  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play();
      this.isPlaying = true;
      this.iconPlay.classList.add('hidden');
      this.iconPause.classList.remove('hidden');
    } else {
      this.video.pause();
      this.isPlaying = false;
      this.iconPlay.classList.remove('hidden');
      this.iconPause.classList.add('hidden');
    }
  }

  onEnded() {
    this.isPlaying = false;
    this.iconPlay.classList.remove('hidden');
    this.iconPause.classList.add('hidden');
  }

  onTimeUpdate() {
    const cur = this.video.currentTime || 0;
    const dur = this.video.duration || 1;
    this.scrubber.value = (cur / dur) * 100;
    this.timeDisplay.textContent = `${this.formatTime(cur)} / ${this.formatTime(dur)}`;
    this.highlightActiveTranscript(cur);
  }

  onSeek(percent) {
    const dur = this.video.duration || 1;
    this.video.currentTime = (percent / 100) * dur;
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.iconVolOn.classList.toggle('hidden', this.video.muted);
    this.iconVolOff.classList.toggle('hidden', !this.video.muted);
  }

  startRenderLoop() {
    const loop = () => {
      this.engine.render(
        this.ctx,
        this.canvas.width,
        this.canvas.height,
        this.video.currentTime,
        this.video
      );
      this.rafId = requestAnimationFrame(loop);
    };
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(loop);
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateScrubberDuration() {
    this.timeDisplay.textContent = `00:00 / ${this.formatTime(this.video.duration || 0)}`;
  }

  // ==========================================
  // STYLES & PRESETS
  // ==========================================
  applyPreset(presetKey) {
    this.engine.setPreset(presetKey);
    const p = PRESETS[presetKey];
    if (!p) return;

    this.ctrlFontFamily.value = p.fontFamily;
    this.ctrlFontSize.value = p.fontSize;
    this.valFontSize.textContent = `${p.fontSize}px`;
    this.ctrlPosY.value = p.positionYPercent;
    this.valPosY.textContent = `${p.positionYPercent}%`;
    this.ctrlStrokeWidth.value = p.strokeWidth;
    this.valStrokeWidth.textContent = `${p.strokeWidth}px`;
    this.ctrlActiveColor.value = p.activeWordColor;
    this.ctrlTextColor.value = p.textColor;
    this.ctrlStrokeColor.value = p.strokeColor;
    if (this.ctrlTapeColor && p.highlightTapeColor) {
      this.ctrlTapeColor.value = p.highlightTapeColor;
    }
    this.ctrlAnimation.value = p.animationType;
    this.ctrlUppercase.checked = p.textTransform === 'uppercase';
    this.engine.useUppercase = p.textTransform === 'uppercase';
  }

  // ==========================================
  // SPEECH-TO-TEXT & TRANSCRIPT
  // ==========================================
  async runSpeechRecognition() {
    if (!this.currentFile) {
      this.loadSampleCaptions();
      return;
    }

    this.canvasLoader.classList.remove('hidden');
    this.canvasLoaderText.textContent = 'Extracting 16kHz audio from video...';
    this.setStatus('busy', 'Extracting Audio...');

    try {
      const audioResult = await extract16kHzMonoAudio(this.currentFile, (pct, msg) => {
        this.aiProgressBar.style.width = `${pct}%`;
        this.canvasLoaderText.textContent = msg;
      });

      this.canvasLoaderText.textContent = 'Transcribing with Whisper AI...';
      this.setStatus('busy', 'Running Whisper AI...');

      if (this.worker) {
        this.worker.postMessage({
          type: 'TRANSCRIBE',
          audioData: audioResult.audioData
        });
      } else {
        this.loadSampleCaptions();
      }
    } catch (err) {
      console.warn('Audio extraction notice, loading sample words:', err);
      this.loadSampleCaptions();
    }
  }

  handleWorkerMessage(data) {
    if (data.type === 'STATUS') {
      this.canvasLoaderText.textContent = data.message;
    } else if (data.type === 'PROGRESS') {
      this.aiProgressBar.style.width = `${data.percent}%`;
    } else if (data.type === 'TRANSCRIBE_SUCCESS') {
      this.canvasLoader.classList.add('hidden');
      this.setStatus('ready', 'Transcription Complete');
      this.engine.processWords(data.words);
      this.renderTranscriptList();
    }
  }

  loadSampleCaptions() {
    this.canvasLoader.classList.add('hidden');
    this.setStatus('ready', 'Sample Captions Loaded');
    this.engine.processWords(DEMO_SAMPLE_WORDS);
    this.renderTranscriptList();
  }

  renderTranscriptList() {
    this.transcriptList.innerHTML = '';
    this.transcriptCount.textContent = this.engine.rawWords.length;

    this.engine.segments.forEach((seg, sIdx) => {
      const card = document.createElement('div');
      card.className = 'transcript-card';
      card.dataset.start = seg.start;
      card.dataset.end = seg.end;

      const meta = document.createElement('div');
      meta.className = 'transcript-meta';
      meta.textContent = `${this.formatTime(seg.start)} - ${this.formatTime(seg.end)}`;
      card.appendChild(meta);

      const wordsRow = document.createElement('div');
      wordsRow.className = 'transcript-words-row';

      seg.words.forEach((w) => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        chip.id = `chip-${w.id}`;
        chip.textContent = w.emoji ? `${w.word} ${w.emoji}` : w.word;
        chip.contentEditable = true;
        chip.title = `Click to seek (${w.start.toFixed(1)}s) • Double-click to edit`;

        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          this.video.currentTime = w.start;
        });

        chip.addEventListener('input', () => {
          w.word = chip.textContent.trim();
        });

        wordsRow.appendChild(chip);
      });

      card.appendChild(wordsRow);
      card.addEventListener('click', () => {
        this.video.currentTime = seg.start;
      });

      this.transcriptList.appendChild(card);
    });
  }

  highlightActiveTranscript(curTime) {
    const seg = this.engine.getActiveSegment(curTime);
    document.querySelectorAll('.transcript-card').forEach(c => {
      const s = Number(c.dataset.start);
      const e = Number(c.dataset.end);
      c.classList.toggle('active-segment', curTime >= s && curTime <= e);
    });

    document.querySelectorAll('.word-chip').forEach(chip => {
      chip.classList.remove('active-word');
    });

    if (seg) {
      const activeWord = seg.words.find(w => curTime >= w.start && curTime <= w.end);
      if (activeWord) {
        const chip = document.getElementById(`chip-${activeWord.id}`);
        if (chip) chip.classList.add('active-word');
      }
    }
  }

  // ==========================================
  // EXPORT PIPELINE
  // ==========================================
  async triggerExport() {
    this.modal.classList.remove('hidden');
    this.exportDownloadArea.classList.add('hidden');
    this.exportProgressFill.style.width = '0%';
    this.exportPercent.textContent = '0%';
    document.getElementById('export-status-desc').textContent =
      'Burning animated captions onto video frames locally...';

    try {
      const result = await this.exporter.exportVideo((pct) => {
        this.exportProgressFill.style.width = `${pct}%`;
        this.exportPercent.textContent = `${pct}%`;
      });

      this.exportDownloadArea.classList.remove('hidden');
      this.btnDownloadVideo.href = result.url;
      this.btnDownloadVideo.download = `captioned-video.${result.extension}`;
      document.getElementById('export-status-desc').textContent =
        'Export complete! Your video is ready for download.';
    } catch (err) {
      console.error('Export failed:', err);
      document.getElementById('export-status-desc').textContent =
        `Export failed: ${err.message}. Try playing the video first.`;
    }
  }

  setStatus(type, text) {
    this.statusPill.className = `status-pill status-${type}`;
    this.statusText.textContent = text;
  }
}

// Start application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new AutoCaptionApp();
});

