/**
 * AutoCaption Studio • Subtitle & Typography Canvas Engine
 * Handles word chunking, frame-accurate time synchronization,
 * creator presets (Hormozi, MrBeast, Minimal, Terminal), and bounce animations.
 */

export const PRESETS = {
  hormozi: {
    presetName: 'hormozi',
    fontFamily: 'Montserrat',
    fontSize: 44,
    fontWeight: '900',
    textTransform: 'uppercase',
    textColor: '#FFFFFF',
    activeWordColor: '#00FF66', // Viral Lime
    strokeColor: '#000000',
    strokeWidth: 10,
    animationType: 'bounce',
    positionYPercent: 72,
    tiltAngle: 0,
    bgBox: false,
    markerTape: false
  },
  editorial: {
    presetName: 'editorial',
    fontFamily: 'Playfair Display',
    fontSize: 44,
    fontWeight: '800',
    textTransform: 'none', // Natural casing like in reference
    textColor: '#FFFFFF',
    activeWordColor: '#FFFFFF',
    highlightTapeColor: '#FF0066', // Vivid Hot Pink / Magenta tape
    strokeColor: 'rgba(0, 0, 0, 0.4)',
    strokeWidth: 2,
    animationType: 'none',
    positionYPercent: 70,
    tiltAngle: -1.2, // Subtle organic tape angle
    bgBox: false,
    markerTape: true
  },
  mrbeast: {
    presetName: 'mrbeast',
    fontFamily: 'Bangers',
    fontSize: 50,
    fontWeight: '900',
    textTransform: 'uppercase',
    textColor: '#FFFFFF',
    activeWordColor: '#FFE600', // Yellow punch
    strokeColor: '#000000',
    strokeWidth: 12,
    animationType: 'bounce',
    positionYPercent: 70,
    tiltAngle: -2.5, // Slight energetic comic tilt
    bgBox: false,
    markerTape: false
  },
  minimal: {
    presetName: 'minimal',
    fontFamily: 'Inter',
    fontSize: 34,
    fontWeight: '700',
    textTransform: 'none',
    textColor: '#FFFFFF',
    activeWordColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 4,
    animationType: 'none',
    positionYPercent: 78,
    tiltAngle: 0,
    bgBox: true, // Clean translucent dark pill box
    markerTape: false
  },
  terminal: {
    presetName: 'terminal',
    fontFamily: 'JetBrains Mono',
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'uppercase',
    textColor: '#88FFCC',
    activeWordColor: '#00FFAA',
    strokeColor: '#002211',
    strokeWidth: 6,
    animationType: 'glow',
    positionYPercent: 80,
    tiltAngle: 0,
    bgBox: true,
    markerTape: false
  }
};

// Auto-Emoji lookup dictionary
const EMOJI_MAP = {
  money: '💸', cash: '💵', dollar: '💰', rich: '🤑', profit: '📈',
  fire: '🔥', hot: '🔥', lit: '🔥',
  grow: '🚀', growth: '🚀', rocket: '🚀', scale: '🚀',
  stop: '🛑', danger: '⚠️', secret: '🤫',
  crazy: '🤯', mind: '🧠', brain: '🧠',
  video: '📹', camera: '🎥', viral: '⚡', speed: '⚡',
  love: '❤️', win: '🏆', winner: '🥇', star: '⭐',
  work: '💼', business: '👔', code: '💻', tech: '🤖'
};

export class SubtitleEngine {
  constructor() {
    this.currentPreset = 'hormozi';
    this.styleConfig = { ...PRESETS.hormozi };
    this.rawWords = [];
    this.segments = [];
    this.useEmojis = true;
    this.useUppercase = true;
  }

  setPreset(presetKey) {
    if (PRESETS[presetKey]) {
      this.currentPreset = presetKey;
      this.styleConfig = { ...PRESETS[presetKey] };
      if (!this.useUppercase) this.styleConfig.textTransform = 'none';
    }
  }

  setStyleParam(key, value) {
    this.styleConfig[key] = value;
  }

  /**
   * Chunks individual words into punchy short phrases (2-4 words per card)
   * tailored for short-form retention.
   */
  processWords(words) {
    this.rawWords = words;
    this.segments = [];
    if (!words || words.length === 0) return;

    const CHUNK_SIZE = 3; // 2 to 4 words per frame
    let currentChunk = [];

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      
      // Auto-assign emoji if matching keyword
      const cleanWord = w.word.toLowerCase().replace(/[^a-z]/g, '');
      const emoji = this.useEmojis ? EMOJI_MAP[cleanWord] : null;

      currentChunk.push({
        id: `word-${i}`,
        word: w.word.trim(),
        start: w.start,
        end: w.end,
        emoji: emoji || null
      });

      // Split every CHUNK_SIZE words or on long speech pause (> 0.6s)
      const nextWord = words[i + 1];
      const hasPause = nextWord && (nextWord.start - w.end > 0.6);

      if (currentChunk.length >= CHUNK_SIZE || hasPause || i === words.length - 1) {
        this.segments.push({
          id: `seg-${this.segments.length}`,
          start: currentChunk[0].start,
          end: currentChunk[currentChunk.length - 1].end,
          words: [...currentChunk]
        });
        currentChunk = [];
      }
    }
  }

  getActiveSegment(currentTime) {
    return this.segments.find(s => currentTime >= s.start && currentTime <= s.end + 0.15);
  }

  /**
   * Main Frame Render: Composites video frame + animated text onto canvas
   */
  render(ctx, width, height, currentTime, videoElement) {
    // 1. Draw source video frame
    if (videoElement && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Locate active subtitle segment
    const segment = this.getActiveSegment(currentTime);
    if (!segment) return;

    // 3. Setup typography
    ctx.save();
    
    // Scale responsive metrics based on canvas dimensions (standardized to 1080x1920)
    const scaleFactor = height / 1000;
    const fontSize = this.styleConfig.fontSize * scaleFactor;
    const strokeWidth = this.styleConfig.strokeWidth * scaleFactor;
    const posX = width / 2;
    const posY = height * (this.styleConfig.positionYPercent / 100);

    ctx.font = `${this.styleConfig.fontWeight} ${fontSize}px "${this.styleConfig.fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Optional comic tilt
    if (this.styleConfig.tiltAngle) {
      ctx.translate(posX, posY);
      ctx.rotate((this.styleConfig.tiltAngle * Math.PI) / 180);
      ctx.translate(-posX, -posY);
    }

    // Calculate word layout & bounding box
    const spaceWidth = ctx.measureText(' ').width;
    const wordLayouts = [];
    let totalTextWidth = 0;

    segment.words.forEach((w) => {
      let displayText = w.word;
      if (this.styleConfig.textTransform === 'uppercase') {
        displayText = displayText.toUpperCase();
      }
      if (w.emoji && this.useEmojis) {
        displayText += ` ${w.emoji}`;
      }

      const wordWidth = ctx.measureText(displayText).width;
      wordLayouts.push({
        wordObj: w,
        displayText,
        width: wordWidth,
        startX: 0 // Will compute below
      });
      totalTextWidth += wordWidth;
    });

    totalTextWidth += (segment.words.length - 1) * spaceWidth;

    // Position words centered horizontally
    let cursorX = posX - (totalTextWidth / 2);
    wordLayouts.forEach(layout => {
      layout.startX = cursorX + (layout.width / 2);
      cursorX += layout.width + spaceWidth;
    });

    // Draw background box if enabled (Minimalist style)
    if (this.styleConfig.bgBox) {
      const paddingX = 18 * scaleFactor;
      const paddingY = 8 * scaleFactor;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(
        posX - (totalTextWidth / 2) - paddingX,
        posY - (fontSize / 2) - paddingY,
        totalTextWidth + (paddingX * 2),
        fontSize + (paddingY * 2),
        8 * scaleFactor
      );
      ctx.fill();
    }

    // Draw Hot Pink Marker Tape if enabled (Vox / Editorial style)
    // Animates smoothly across words in real-time sync with speech audio
    if (this.styleConfig.markerTape) {
      const paddingX = 14 * scaleFactor;
      const paddingY = 8 * scaleFactor;
      const phraseLeft = posX - (totalTextWidth / 2) - paddingX;
      let tapeRight = phraseLeft;

      for (let i = 0; i < wordLayouts.length; i++) {
        const layout = wordLayouts[i];
        const wStart = layout.wordObj.start;
        const wEnd = layout.wordObj.end;
        const wLeft = layout.startX - (layout.width / 2);
        const wRight = layout.startX + (layout.width / 2);

        if (currentTime >= wEnd) {
          // Word already spoken: tape extends past this word
          tapeRight = wRight + (i === wordLayouts.length - 1 ? paddingX : spaceWidth / 2);
        } else if (currentTime >= wStart) {
          // Word currently being spoken: sweep smoothly from word left to right
          const wordProgress = (currentTime - wStart) / (wEnd - wStart);
          tapeRight = wLeft + (Math.max(0, Math.min(1, wordProgress)) * (layout.width + (spaceWidth / 2)));
          break;
        } else {
          // Future words not yet spoken
          break;
        }
      }

      const tapeWidth = Math.max(0, tapeRight - phraseLeft);
      if (tapeWidth > 4) {
        ctx.save();
        ctx.fillStyle = this.styleConfig.highlightTapeColor || '#FF0066';
        ctx.beginPath();
        ctx.roundRect(
          phraseLeft,
          posY - (fontSize / 2) - paddingY + (2 * scaleFactor),
          tapeWidth,
          fontSize + (paddingY * 2),
          4 * scaleFactor
        );
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Draw each word with active karaoke highlight & bounce
    wordLayouts.forEach(layout => {
      const isCurrent = currentTime >= layout.wordObj.start && currentTime <= layout.wordObj.end;
      ctx.save();

      // Bounce / pop animation for the active spoken word
      let wordScale = 1.0;
      if (isCurrent && this.styleConfig.animationType === 'bounce') {
        // Quick scale curve: pops to 1.15x and settles
        const progress = Math.min(1, (currentTime - layout.wordObj.start) / 0.15);
        wordScale = 1.0 + (0.15 * Math.sin(progress * Math.PI));
      }

      if (wordScale !== 1.0) {
        ctx.translate(layout.startX, posY);
        ctx.scale(wordScale, wordScale);
        ctx.translate(-layout.startX, -posY);
      }

      // Outer Stroke Outline (ensures readability on bright videos)
      if (strokeWidth > 0) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = this.styleConfig.strokeColor;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(layout.displayText, layout.startX, posY);
      }

      // Inner Fill Color
      if (this.styleConfig.markerTape) {
        ctx.fillStyle = '#FFFFFF';
        if (currentTime < layout.wordObj.start) {
          // Future word: soft drop shadow for readability
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 8 * scaleFactor;
        } else {
          // Active or highlighted word: crisp white on top of the pink tape
          ctx.shadowBlur = 0;
        }
      } else if (isCurrent) {
        ctx.fillStyle = this.styleConfig.activeWordColor;
        if (this.styleConfig.animationType === 'glow') {
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 12 * scaleFactor;
        }
      } else {
        ctx.fillStyle = this.styleConfig.textColor;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(layout.displayText, layout.startX, posY);
      ctx.restore();
    });

    ctx.restore();
  }
}

