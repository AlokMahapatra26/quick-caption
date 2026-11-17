import { EMOJI_MAP, PRESETS } from './presets';
import type {
  PresetKey,
  RawWord,
  SubtitleSegment,
  SubtitleStyleConfig,
  WordTimestamp,
} from '../types/caption';

interface WordLayout {
  wordObj: WordTimestamp;
  displayText: string;
  width: number;
  startX: number;
}

/**
 * AutoCaption Studio • Subtitle & Typography Canvas Engine
 * Pure TypeScript 60fps Canvas 2D compositor (zero React coupling).
 */
export class SubtitleEngine {
  currentPreset: PresetKey = 'hormozi';
  styleConfig: SubtitleStyleConfig = { ...PRESETS.hormozi };
  rawWords: RawWord[] = [];
  segments: SubtitleSegment[] = [];
  useEmojis = true;
  useUppercase = true;

  setPreset(presetKey: PresetKey): SubtitleStyleConfig {
    this.currentPreset = presetKey;
    this.styleConfig = { ...PRESETS[presetKey] };
    this.useUppercase = this.styleConfig.textTransform === 'uppercase';
    return { ...this.styleConfig };
  }

  setStyleParam<K extends keyof SubtitleStyleConfig>(
    key: K,
    value: SubtitleStyleConfig[K]
  ): void {
    this.styleConfig[key] = value;
  }

  /**
   * Chunks individual words into punchy short phrases (2-4 words per card).
   */
  processWords(words: RawWord[]): SubtitleSegment[] {
    this.rawWords = words;
    this.segments = [];
    if (!words || words.length === 0) return [];

    const CHUNK_SIZE = 3;
    let currentChunk: WordTimestamp[] = [];

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const cleanWord = w.word.toLowerCase().replace(/[^a-z]/g, '');
      const emoji = this.useEmojis ? (EMOJI_MAP[cleanWord] ?? null) : null;

      currentChunk.push({
        id: w.id ?? `word-${i}`,
        word: w.word.trim(),
        start: w.start,
        end: w.end,
        emoji,
      });

      const nextWord = words[i + 1];
      const hasPause = Boolean(nextWord && nextWord.start - w.end > 0.6);

      if (currentChunk.length >= CHUNK_SIZE || hasPause || i === words.length - 1) {
        this.segments.push({
          id: `seg-${this.segments.length}`,
          start: currentChunk[0].start,
          end: currentChunk[currentChunk.length - 1].end,
          words: [...currentChunk],
        });
        currentChunk = [];
      }
    }

    return this.segments;
  }

  updateWordText(wordId: string, text: string): void {
    const trimmed = text.trim();
    for (const seg of this.segments) {
      const target = seg.words.find((w) => w.id === wordId);
      if (target) {
        target.word = trimmed;
        break;
      }
    }
    const rawIdx = Number(wordId.replace('word-', ''));
    if (!Number.isNaN(rawIdx) && this.rawWords[rawIdx]) {
      this.rawWords[rawIdx] = { ...this.rawWords[rawIdx], word: trimmed };
    }
  }

  getActiveSegment(currentTime: number): SubtitleSegment | undefined {
    return this.segments.find(
      (s) => currentTime >= s.start && currentTime <= s.end + 0.15
    );
  }

  /**
   * Main Frame Render: Composites video frame + animated captions onto canvas.
   * When `styleConfig.behindPerson` is enabled, renders a 4-layer sandwich:
   * 1. Background video -> 2. Giant behind-head hero word -> 3. Person cutout -> 4. Crisp foreground line.
   */
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    videoElement: HTMLVideoElement | null,
    foregroundCutout: HTMLCanvasElement | null = null
  ): void {
    if (videoElement && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);
    }

    const segment = this.getActiveSegment(currentTime);
    if (!segment) return;

    if (this.styleConfig.behindPerson) {
      this.renderBehindPerson(
        ctx,
        width,
        height,
        currentTime,
        segment,
        foregroundCutout
      );
      return;
    }

    if (this.styleConfig.editorialStack) {
      this.renderEditorialStack(ctx, width, height, currentTime, segment);
      return;
    }

    if (this.styleConfig.swissGrid) {
      this.renderSwissGrid(ctx, width, height, currentTime, segment);
      return;
    }

    if (this.styleConfig.auraPoster) {
      this.renderAuraPoster(ctx, width, height, currentTime, segment);
      return;
    }

    if (this.styleConfig.bigRedPoster) {
      this.renderBigRed(ctx, width, height, currentTime, segment);
      return;
    }

    ctx.save();

    const scaleFactor = height / 1000;
    const fontSize = this.styleConfig.fontSize * scaleFactor;
    const strokeWidth = this.styleConfig.strokeWidth * scaleFactor;
    const posX = width / 2;
    const posY = height * (this.styleConfig.positionYPercent / 100);

    const fontPrefix = this.styleConfig.kineticBlur ? 'italic ' : '';
    ctx.font = `${fontPrefix}${this.styleConfig.fontWeight} ${fontSize}px "${this.styleConfig.fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.styleConfig.tiltAngle) {
      ctx.translate(posX, posY);
      ctx.rotate((this.styleConfig.tiltAngle * Math.PI) / 180);
      ctx.translate(-posX, -posY);
    }

    const spaceWidth = ctx.measureText(' ').width;
    const wordLayouts: WordLayout[] = [];
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
        startX: 0,
      });
      totalTextWidth += wordWidth;
    });

    totalTextWidth += (segment.words.length - 1) * spaceWidth;

    let cursorX = posX - totalTextWidth / 2;
    wordLayouts.forEach((layout) => {
      layout.startX = cursorX + layout.width / 2;
      cursorX += layout.width + spaceWidth;
    });

    // Background pill box (Minimal / Terminal)
    if (this.styleConfig.bgBox) {
      const paddingX = 18 * scaleFactor;
      const paddingY = 8 * scaleFactor;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(
        posX - totalTextWidth / 2 - paddingX,
        posY - fontSize / 2 - paddingY,
        totalTextWidth + paddingX * 2,
        fontSize + paddingY * 2,
        8 * scaleFactor
      );
      ctx.fill();
    }

    // Real frosted Liquid Glass pill (samples & blurs live video pixels behind the capsule)
    if (this.styleConfig.liquidGlass) {
      const paddingX = 22 * scaleFactor;
      const paddingY = 11 * scaleFactor;
      const pillX = posX - totalTextWidth / 2 - paddingX;
      const pillY = posY - fontSize / 2 - paddingY;
      const pillW = totalTextWidth + paddingX * 2;
      const pillH = fontSize + paddingY * 2;
      const pillR = pillH / 2;

      // Ambient shadow beneath the glass pill
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
      ctx.shadowBlur = 22 * scaleFactor;
      ctx.shadowOffsetY = 6 * scaleFactor;
      ctx.fillStyle = 'rgba(20, 20, 26, 0.18)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      ctx.fill();
      ctx.restore();

      // Frosted blurred video backdrop clipped cleanly inside the pill
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      ctx.clip();

      if (videoElement && videoElement.readyState >= 2) {
        ctx.filter = `blur(${Math.max(8, Math.round(14 * scaleFactor))}px) saturate(165%)`;
        ctx.drawImage(videoElement, 0, 0, width, height);
        ctx.filter = 'none';
      }

      // Subtle dark legibility veil + top-lit liquid glass sheen gradient
      ctx.fillStyle = 'rgba(12, 14, 20, 0.24)';
      ctx.fillRect(pillX, pillY, pillW, pillH);

      const glassGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.26)');
      glassGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.16)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.restore();

      // Crisp specular glass rim border
      ctx.save();
      const rimGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
      rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.16)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.34)');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = Math.max(1, 1.5 * scaleFactor);
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      ctx.stroke();
      ctx.restore();
    }

    // Solid Pure White Pill (Ali Abdaal viral productivity style)
    if (this.styleConfig.whitePill) {
      const paddingX = 20 * scaleFactor;
      const paddingY = 10 * scaleFactor;
      const pillX = posX - totalTextWidth / 2 - paddingX;
      const pillY = posY - fontSize / 2 - paddingY;
      const pillW = totalTextWidth + paddingX * 2;
      const pillH = fontSize + paddingY * 2;
      const pillR = 14 * scaleFactor;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.26)';
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.shadowOffsetY = 5 * scaleFactor;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      ctx.fill();
      ctx.restore();
    }

    // Vox / Editorial marker tape sweep
    if (this.styleConfig.markerTape) {
      const paddingX = 14 * scaleFactor;
      const paddingY = 8 * scaleFactor;
      const phraseLeft = posX - totalTextWidth / 2 - paddingX;
      let tapeRight = phraseLeft;

      for (let i = 0; i < wordLayouts.length; i++) {
        const layout = wordLayouts[i];
        const wStart = layout.wordObj.start;
        const wEnd = layout.wordObj.end;
        const wLeft = layout.startX - layout.width / 2;
        const wRight = layout.startX + layout.width / 2;

        if (currentTime >= wEnd) {
          tapeRight =
            wRight + (i === wordLayouts.length - 1 ? paddingX : spaceWidth / 2);
        } else if (currentTime >= wStart) {
          const duration = Math.max(0.01, wEnd - wStart);
          const wordProgress = (currentTime - wStart) / duration;
          tapeRight =
            wLeft +
            Math.max(0, Math.min(1, wordProgress)) *
              (layout.width + spaceWidth / 2);
          break;
        } else {
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
          posY - fontSize / 2 - paddingY + 2 * scaleFactor,
          tapeWidth,
          fontSize + paddingY * 2,
          4 * scaleFactor
        );
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw each word with karaoke highlight & motion
    wordLayouts.forEach((layout) => {
      const isCurrent =
        currentTime >= layout.wordObj.start && currentTime <= layout.wordObj.end;
      const isFuture = currentTime < layout.wordObj.start;
      ctx.save();

      let wordScale = 1.0;
      if (isCurrent && this.styleConfig.animationType === 'bounce') {
        const progress = Math.min(
          1,
          (currentTime - layout.wordObj.start) / 0.15
        );
        const popStrength =
          this.styleConfig.activeWordPill ||
          this.styleConfig.sharpBoxPill ||
          this.styleConfig.liquidGlass ||
          this.styleConfig.whitePill ||
          this.styleConfig.heavyShadow
            ? 0.06
            : 0.15;
        wordScale = 1.0 + popStrength * Math.sin(progress * Math.PI);
      }

      if (wordScale !== 1.0) {
        ctx.translate(layout.startX, posY);
        ctx.scale(wordScale, wordScale);
        ctx.translate(-layout.startX, -posY);
      }

      // Active-word sliding capsule pill (Ali Abdaal / CapCut viral style)
      if (this.styleConfig.activeWordPill && isCurrent) {
        const padX = 14 * scaleFactor;
        const padY = 8 * scaleFactor;
        const pillW = layout.width + padX * 2;
        const pillH = fontSize + padY * 2;
        ctx.save();
        ctx.fillStyle = this.styleConfig.activeWordColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 12 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
        ctx.beginPath();
        ctx.roundRect(
          layout.startX - pillW / 2,
          posY - pillH / 2,
          pillW,
          pillH,
          10 * scaleFactor
        );
        ctx.fill();
        ctx.restore();
      }

      // Sharp rectangular active-word highlight box (Captik Anchorage Popular/NEW style)
      if (this.styleConfig.sharpBoxPill && isCurrent) {
        const padX = 11 * scaleFactor;
        const padY = 6 * scaleFactor;
        const boxW = layout.width + padX * 2;
        const boxH = fontSize * 1.02 + padY * 2;
        ctx.save();
        ctx.fillStyle = this.styleConfig.activeWordColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
        ctx.shadowBlur = 12 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
        ctx.beginPath();
        ctx.roundRect(
          layout.startX - boxW / 2,
          posY - boxH / 2,
          boxW,
          boxH,
          4 * scaleFactor
        );
        ctx.fill();
        ctx.restore();
      }

      // Scribble style: alternates hand-drawn red oval loop (on >=6 char hero words) & yellow highlighter pill
      const cleanWordLen = layout.wordObj.word.replace(/[^a-zA-Z0-9]/g, '').length;
      const isScribbleOval = Boolean(
        this.styleConfig.scribbleStyle && isCurrent && cleanWordLen >= 6
      );
      const isScribblePill = Boolean(
        this.styleConfig.scribbleStyle && isCurrent && !isScribbleOval
      );

      if (isScribblePill) {
        const padX = 13 * scaleFactor;
        const padY = 5 * scaleFactor;
        const pillW = layout.width + padX * 2;
        const pillH = fontSize * 0.92 + padY * 2;
        ctx.save();
        ctx.translate(layout.startX, posY);
        ctx.rotate(-0.025);
        ctx.fillStyle = this.styleConfig.activeWordColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 9 * scaleFactor);
        ctx.fill();
        ctx.restore();
      }

      // Progressive dim-to-bright spotlight (Iman / Cinema, Liquid Glass, Clean Shadow, Pixel 8-bit)
      if (this.styleConfig.progressiveReveal || this.styleConfig.liquidGlass) {
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.42 : 0.85;
      } else if (this.styleConfig.heavyShadow) {
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.72 : 0.96;
      } else if (this.styleConfig.pixelStyle) {
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.28 : 0.95;
      } else if (this.styleConfig.deepNeon) {
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.45 : 0.78;
      } else if (this.styleConfig.hollowImpact) {
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.78 : 0.9;
      }

      // Deep Neon volumetric radial light spill radiating behind the active word
      if (this.styleConfig.deepNeon && isCurrent) {
        const glowRx = Math.max(layout.width * 0.85, fontSize * 1.4);
        const glowRy = fontSize * 1.15;
        ctx.save();
        ctx.translate(layout.startX, posY);
        ctx.scale(1, glowRy / glowRx);
        const radGrad = ctx.createRadialGradient(0, 0, glowRx * 0.08, 0, 0, glowRx);
        radGrad.addColorStop(0, this.styleConfig.activeWordColor);
        radGrad.addColorStop(0.5, `${this.styleConfig.activeWordColor}55`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glowRx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const shouldDrawStroke =
        strokeWidth > 0 &&
        !(this.styleConfig.activeWordPill && isCurrent) &&
        !(this.styleConfig.sharpBoxPill && isCurrent) &&
        !this.styleConfig.whitePill &&
        !this.styleConfig.liquidGlass &&
        !this.styleConfig.chromeGradient &&
        !this.styleConfig.scribbleStyle &&
        !this.styleConfig.kineticBlur &&
        !this.styleConfig.heavyShadow &&
        !this.styleConfig.pixelStyle &&
        !this.styleConfig.deepNeon &&
        !this.styleConfig.hollowImpact;
      if (shouldDrawStroke) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = this.styleConfig.strokeColor;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(layout.displayText, layout.startX, posY);
      }

      if (this.styleConfig.markerTape) {
        ctx.fillStyle = '#FFFFFF';
        if (isFuture) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 8 * scaleFactor;
        } else {
          ctx.shadowBlur = 0;
        }
      } else if (this.styleConfig.chromeGradient) {
        if (isCurrent) {
          // Multi-stop liquid metallic chrome reflection gradient
          const chromeGrad = ctx.createLinearGradient(
            layout.startX,
            posY - fontSize * 0.55,
            layout.startX,
            posY + fontSize * 0.55
          );
          chromeGrad.addColorStop(0.0, '#FFFFFF');
          chromeGrad.addColorStop(0.28, '#E2E8F0');
          chromeGrad.addColorStop(0.5, this.styleConfig.activeWordColor);
          chromeGrad.addColorStop(0.68, '#1E293B');
          chromeGrad.addColorStop(0.86, '#CBD5E1');
          chromeGrad.addColorStop(1.0, '#F8FAFC');

          ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
          ctx.shadowBlur = 16 * scaleFactor;
          ctx.shadowOffsetY = 4 * scaleFactor;
          ctx.fillStyle = chromeGrad;
        } else {
          ctx.fillStyle = isFuture ? 'rgba(226, 232, 240, 0.68)' : '#F1F5F9';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
          ctx.shadowBlur = 10 * scaleFactor;
          ctx.shadowOffsetY = 2 * scaleFactor;
        }
      } else if (this.styleConfig.scribbleStyle) {
        if (isScribblePill) {
          ctx.fillStyle = '#09090B';
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = this.styleConfig.textColor;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
          ctx.shadowBlur = 10 * scaleFactor;
          ctx.shadowOffsetY = 2 * scaleFactor;
        }
      } else if (this.styleConfig.kineticBlur) {
        if (isCurrent) {
          // Pass 1: Dreamy Gaussian-blurred echo drifting slightly upward + horizontal speed streak
          ctx.save();
          ctx.fillStyle = this.styleConfig.activeWordColor;
          ctx.globalAlpha = 0.52;
          ctx.filter = `blur(${Math.max(6, Math.round(11 * scaleFactor))}px)`;
          ctx.fillText(
            layout.displayText,
            layout.startX + 4 * scaleFactor,
            posY - 10 * scaleFactor
          );
          ctx.globalAlpha = 0.42;
          ctx.fillText(
            layout.displayText,
            layout.startX - 14 * scaleFactor,
            posY
          );
          ctx.filter = 'none';
          ctx.restore();

          // Pass 2: Tight luminous bloom behind razor-sharp foreground text
          ctx.save();
          ctx.fillStyle = this.styleConfig.activeWordColor;
          ctx.globalAlpha = 0.65;
          ctx.filter = `blur(${Math.max(3, Math.round(4.5 * scaleFactor))}px)`;
          ctx.fillText(layout.displayText, layout.startX, posY);
          ctx.filter = 'none';
          ctx.restore();

          // Pass 3: Razor-sharp active word
          ctx.fillStyle = this.styleConfig.activeWordColor;
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 10 * scaleFactor;
        } else {
          ctx.fillStyle = isFuture
            ? 'rgba(255, 255, 255, 0.58)'
            : this.styleConfig.textColor;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 8 * scaleFactor;
          ctx.shadowOffsetY = 2 * scaleFactor;
        }
      } else if (this.styleConfig.sharpBoxPill) {
        if (isCurrent) {
          ctx.fillStyle = '#09090B';
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = this.styleConfig.textColor;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
          ctx.shadowBlur = 10 * scaleFactor;
          ctx.shadowOffsetY = 3 * scaleFactor;
        }
      } else if (this.styleConfig.heavyShadow) {
        // Captik Shadow: crisp white lowercase + deep layered directional dark drop shadow
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.94)';
        ctx.shadowBlur = 14 * scaleFactor;
        ctx.shadowOffsetX = 3 * scaleFactor;
        ctx.shadowOffsetY = 5 * scaleFactor;
      } else if (this.styleConfig.pixelStyle) {
        // Retro 8-bit arcade pixel look with hard zero-blur stepped pixel shadow
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;
        ctx.shadowColor = '#09090B';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = Math.max(2, Math.round(4 * scaleFactor));
        ctx.shadowOffsetY = Math.max(2, Math.round(4 * scaleFactor));
      } else if (this.styleConfig.deepNeon) {
        if (isCurrent) {
          // Colored outer neon bloom tube pass
          ctx.save();
          ctx.fillStyle = this.styleConfig.activeWordColor;
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 26 * scaleFactor;
          ctx.fillText(layout.displayText, layout.startX, posY);
          ctx.restore();

          // Incandescent hot white core inside the neon aura
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 14 * scaleFactor;
        } else {
          ctx.fillStyle = this.styleConfig.textColor;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 8 * scaleFactor;
        }
      } else if (this.styleConfig.hollowImpact) {
        if (isCurrent) {
          ctx.fillStyle = this.styleConfig.activeWordColor;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
          ctx.shadowBlur = 14 * scaleFactor;
          ctx.shadowOffsetY = 3 * scaleFactor;
        } else {
          // Hollow architectural outline only (skip fillText below)
          ctx.save();
          ctx.lineWidth = Math.max(1.8, (strokeWidth || 2.5 * scaleFactor));
          ctx.strokeStyle = this.styleConfig.strokeColor || '#FFFFFF';
          ctx.lineJoin = 'round';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 8 * scaleFactor;
          ctx.strokeText(layout.displayText, layout.startX, posY);
          ctx.restore();
        }
      } else if (this.styleConfig.whitePill) {
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : isFuture
            ? this.styleConfig.textColor
            : '#27272A';
        ctx.shadowBlur = 0;
      } else if (this.styleConfig.liquidGlass) {
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;
        if (isCurrent) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
          ctx.shadowBlur = 10 * scaleFactor;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 4 * scaleFactor;
        }
      } else if (this.styleConfig.activeWordPill) {
        ctx.fillStyle = isCurrent ? '#FFFFFF' : this.styleConfig.textColor;
        if (!isCurrent) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 8 * scaleFactor;
        }
      } else if (this.styleConfig.progressiveReveal) {
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;
        if (isCurrent && this.styleConfig.animationType === 'glow') {
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 14 * scaleFactor;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 10 * scaleFactor;
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

      if (!(this.styleConfig.hollowImpact && !isCurrent)) {
        ctx.fillText(layout.displayText, layout.startX, posY);
      }

      // Subtle chrome specular bevel edge on active metallic word
      if (this.styleConfig.chromeGradient && isCurrent) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.lineWidth = Math.max(1, 1.4 * scaleFactor);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.52)';
        ctx.strokeText(layout.displayText, layout.startX, posY);
        ctx.restore();
      }

      // Hand-drawn double-loop sketchy oval ring around hero Scribble words
      if (isScribbleOval) {
        const rx = layout.width * 0.62 + 10 * scaleFactor;
        const ry = fontSize * 0.56 + 4 * scaleFactor;
        ctx.save();
        ctx.strokeStyle = this.styleConfig.strokeColor || '#FF3B5C';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 6 * scaleFactor;

        // First sketchy pass
        ctx.lineWidth = Math.max(2, 3.2 * scaleFactor);
        ctx.beginPath();
        ctx.ellipse(layout.startX, posY, rx, ry, -0.06, 0.15, Math.PI * 2.08);
        ctx.stroke();

        // Second slightly offset organic pen pass
        ctx.lineWidth = Math.max(1.5, 2.0 * scaleFactor);
        ctx.globalAlpha = 0.82;
        ctx.beginPath();
        ctx.ellipse(
          layout.startX + 1.5 * scaleFactor,
          posY - 1.2 * scaleFactor,
          rx * 1.03,
          ry * 0.96,
          0.03,
          -0.2,
          Math.PI * 1.92
        );
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * 4-Layer Behind-Person Renderer (Captik Garnet / Big Reveal style):
   * Draws a giant hero keyword behind the segmented speaker cutout, then a crisp phrase in front.
   */
  private renderBehindPerson(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    segment: SubtitleSegment,
    foregroundCutout: HTMLCanvasElement | null
  ): void {
    const scaleFactor = height / 1000;
    const posX = width / 2;

    // Pick currently spoken word as the giant behind-head hero (fallback to longest word in segment)
    const activeWord =
      segment.words.find(
        (w) => currentTime >= w.start && currentTime <= w.end
      ) ??
      segment.words.reduce(
        (best, w) => (w.word.length > best.word.length ? w : best),
        segment.words[0]
      );

    // === LAYER 2: Giant Hero Word BEHIND Person ===
    if (activeWord) {
      ctx.save();
      let heroText = activeWord.word.replace(/[.,!?;:]+$/, '') || activeWord.word;
      if (this.styleConfig.textTransform === 'uppercase') {
        heroText = heroText.toUpperCase();
      }

      const heroY = height * (this.styleConfig.positionYPercent / 100);
      let heroFontSize = this.styleConfig.fontSize * scaleFactor * 3.4;

      ctx.font = `${this.styleConfig.fontWeight} ${heroFontSize}px "${this.styleConfig.fontFamily}", sans-serif`;
      const measured = ctx.measureText(heroText).width;
      const maxWidth = width * 0.92;
      if (measured > maxWidth && measured > 0) {
        heroFontSize = heroFontSize * (maxWidth / measured);
        ctx.font = `${this.styleConfig.fontWeight} ${heroFontSize}px "${this.styleConfig.fontFamily}", sans-serif`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Snappy entrance scale pop on the hero word
      let heroScale = 1.0;
      if (this.styleConfig.animationType === 'bounce') {
        const progress = Math.min(
          1,
          Math.max(0, (currentTime - activeWord.start) / 0.16)
        );
        heroScale = 0.94 + 0.06 * Math.sin((progress * Math.PI) / 2);
      }

      if (heroScale !== 1.0) {
        ctx.translate(posX, heroY);
        ctx.scale(heroScale, heroScale);
        ctx.translate(-posX, -heroY);
      }

      ctx.fillStyle = this.styleConfig.activeWordColor;
      if (this.styleConfig.animationType === 'glow') {
        ctx.shadowColor = this.styleConfig.activeWordColor;
        ctx.shadowBlur = 24 * scaleFactor;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 18 * scaleFactor;
        ctx.shadowOffsetY = 6 * scaleFactor;
      }

      if (this.styleConfig.haloArc) {
        // Curved halo arc arching gracefully around the top of the speaker's head
        const arcFontSize = Math.min(heroFontSize, this.styleConfig.fontSize * scaleFactor * 2.35);
        ctx.font = `${this.styleConfig.fontWeight} ${arcFontSize}px "${this.styleConfig.fontFamily}", sans-serif`;
        const chars = [...heroText];
        const tracking = arcFontSize * 0.08;
        const charWidths = chars.map((ch) => ctx.measureText(ch).width);
        const totalArcLen =
          charWidths.reduce((a, b) => a + b, 0) +
          Math.max(0, chars.length - 1) * tracking;

        // Radius sized so the arc forms a dramatic halo without wrapping upside-down
        const minRadius = Math.max(width * 0.44, totalArcLen / 1.42);
        const radius = Math.min(width * 0.9, minRadius);
        const centerY = heroY + radius;
        const totalAngle = totalArcLen / radius;
        let currentAngle = -totalAngle / 2;

        chars.forEach((ch, idx) => {
          const w = charWidths[idx];
          const charAngle = currentAngle + w / 2 / radius;
          ctx.save();
          ctx.translate(posX, centerY);
          ctx.rotate(charAngle);
          if (this.styleConfig.strokeWidth > 0) {
            ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor;
            ctx.strokeStyle = this.styleConfig.strokeColor;
            ctx.strokeText(ch, 0, -radius);
          }
          ctx.fillText(ch, 0, -radius);
          ctx.restore();
          currentAngle += (w + tracking) / radius;
        });
      } else {
        if (this.styleConfig.strokeWidth > 0) {
          ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor * 1.4;
          ctx.strokeStyle = this.styleConfig.strokeColor;
          ctx.lineJoin = 'miter';
          ctx.miterLimit = 2;
          ctx.strokeText(heroText, posX, heroY);
        }
        ctx.fillText(heroText, posX, heroY);
      }
      ctx.restore();
    }

    // === LAYER 3: Segmented Person Foreground Cutout ON TOP of Giant Word ===
    if (foregroundCutout) {
      ctx.drawImage(foregroundCutout, 0, 0, width, height);
    }

    // === LAYER 4: Crisp Foreground Subtitle Phrase (Lower Third) ===
    ctx.save();
    const fgFontSize = this.styleConfig.fontSize * scaleFactor * 0.72;
    const fgY = height * 0.8;

    ctx.font = `700 ${fgFontSize}px "Inter", "${this.styleConfig.fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const spaceWidth = ctx.measureText(' ').width;
    const layouts: WordLayout[] = [];
    let totalWidth = 0;

    segment.words.forEach((w) => {
      let displayText = w.word;
      if (w.emoji && this.useEmojis) {
        displayText += ` ${w.emoji}`;
      }
      const wWidth = ctx.measureText(displayText).width;
      layouts.push({ wordObj: w, displayText, width: wWidth, startX: 0 });
      totalWidth += wWidth;
    });
    totalWidth += (segment.words.length - 1) * spaceWidth;

    let cursorX = posX - totalWidth / 2;
    layouts.forEach((l) => {
      l.startX = cursorX + l.width / 2;
      cursorX += l.width + spaceWidth;
    });

    layouts.forEach((layout) => {
      const isCurrent =
        currentTime >= layout.wordObj.start && currentTime <= layout.wordObj.end;
      ctx.save();
      ctx.fillStyle = isCurrent
        ? this.styleConfig.activeWordColor
        : this.styleConfig.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 10 * scaleFactor;
      ctx.shadowOffsetY = 2 * scaleFactor;
      ctx.fillText(layout.displayText, layout.startX, fgY);
      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Multi-Line Editorial Magazine Stack (Captik Interlock / Aura style):
   * Small tracked ALL CAPS sans above & below a giant italic serif hero word.
   */
  private renderEditorialStack(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    segment: SubtitleSegment
  ): void {
    const scaleFactor = height / 1000;
    const posX = width / 2;
    const centerY = height * (this.styleConfig.positionYPercent / 100);

    // Find active spoken word index (or longest word between gaps)
    let activeIdx = segment.words.findIndex(
      (w) => currentTime >= w.start && currentTime <= w.end
    );
    if (activeIdx === -1) {
      activeIdx = 0;
      for (let i = 1; i < segment.words.length; i++) {
        if (segment.words[i].word.length > segment.words[activeIdx].word.length) {
          activeIdx = i;
        }
      }
    }

    const activeWord = segment.words[activeIdx];
    const beforeWords = segment.words.slice(0, activeIdx);
    const afterWords = segment.words.slice(activeIdx + 1);

    // Compute giant italic serif hero metrics
    let heroText = activeWord.word;
    if (this.styleConfig.textTransform === 'uppercase') {
      heroText = heroText.toUpperCase();
    }
    if (activeWord.emoji && this.useEmojis) {
      heroText += ` ${activeWord.emoji}`;
    }

    let heroFontSize = this.styleConfig.fontSize * scaleFactor * 1.85;
    const heroFont = (sz: number) =>
      `italic ${this.styleConfig.fontWeight} ${sz}px "${this.styleConfig.fontFamily}", Georgia, serif`;

    ctx.save();
    ctx.font = heroFont(heroFontSize);
    const heroMeasured = ctx.measureText(heroText).width;
    const maxHeroW = width * 0.88;
    if (heroMeasured > maxHeroW && heroMeasured > 0) {
      heroFontSize = heroFontSize * (maxHeroW / heroMeasured);
    }

    const subFontSize = Math.max(14 * scaleFactor, this.styleConfig.fontSize * scaleFactor * 0.44);
    const tierGap = heroFontSize * 0.62;

    const drawTrackedCapsLine = (text: string, y: number, alpha: number) => {
      if (!text) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${subFontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.styleConfig.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10 * scaleFactor;
      ctx.shadowOffsetY = 2 * scaleFactor;

      // Wide editorial letter-spacing (works universally across all browsers)
      const chars = [...text.toUpperCase()];
      const tracking = subFontSize * 0.18;
      const charWidths = chars.map((ch) => ctx.measureText(ch).width);
      const totalW =
        charWidths.reduce((a, b) => a + b, 0) +
        Math.max(0, chars.length - 1) * tracking;
      let cx = posX - totalW / 2;
      chars.forEach((ch, idx) => {
        ctx.fillText(ch, cx + charWidths[idx] / 2, y);
        cx += charWidths[idx] + tracking;
      });
      ctx.restore();
    };

    // Top Tier (spoken words before active hero)
    if (beforeWords.length > 0) {
      const topLine = beforeWords.map((w) => w.word).join(' ');
      drawTrackedCapsLine(topLine, centerY - tierGap, 0.92);
    }

    // Center Tier (Giant Italic Serif Hero Word)
    ctx.save();
    ctx.font = heroFont(heroFontSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let heroScale = 1.0;
    if (this.styleConfig.animationType === 'bounce') {
      const progress = Math.min(
        1,
        Math.max(0, (currentTime - activeWord.start) / 0.16)
      );
      heroScale = 0.94 + 0.08 * Math.sin(progress * Math.PI);
    }

    if (heroScale !== 1.0) {
      ctx.translate(posX, centerY);
      ctx.scale(heroScale, heroScale);
      ctx.translate(-posX, -centerY);
    }

    if (this.styleConfig.strokeWidth > 0) {
      ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor;
      ctx.strokeStyle = this.styleConfig.strokeColor;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeText(heroText, posX, centerY);
    }

    ctx.fillStyle = this.styleConfig.activeWordColor;
    if (this.styleConfig.animationType === 'glow') {
      ctx.shadowColor = this.styleConfig.activeWordColor;
      ctx.shadowBlur = 18 * scaleFactor;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 16 * scaleFactor;
      ctx.shadowOffsetY = 4 * scaleFactor;
    }
    ctx.fillText(heroText, posX, centerY);
    ctx.restore();

    // Bottom Tier (upcoming words after active hero)
    if (afterWords.length > 0) {
      const bottomLine = afterWords.map((w) => w.word).join(' ');
      drawTrackedCapsLine(bottomLine, centerY + tierGap, 0.72);
    }

    ctx.restore();
  }

  /**
   * Justified Swiss Grid Block (Big + Small tightly locked to identical left/right edges):
   * Automatically pairs shorter hero words HUGE on their own row and longer/multi-word phrases SMALLER,
   * scaling every row mathematically to the exact same rectangular poster width.
   */
  private renderSwissGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    segment: SubtitleSegment
  ): void {
    const scaleFactor = height / 1000;
    const posX = width / 2;
    const centerY = height * (this.styleConfig.positionYPercent / 100);
    const words = segment.words;
    if (words.length === 0) return;

    // Group words into structured Big + Small rows
    let rows: WordTimestamp[][];
    if (words.length === 1) {
      rows = [[words[0]]];
    } else if (words.length === 2) {
      rows = [[words[0]], [words[1]]];
    } else if (words.length === 3) {
      // Put the punchier/shorter edge word solo (so it blows up HUGE) & pair the other two SMALL
      const firstLen = words[0].word.length;
      const lastLen = words[2].word.length;
      rows =
        firstLen <= lastLen
          ? [[words[0]], [words[1], words[2]]]
          : [[words[0], words[1]], [words[2]]];
    } else {
      rows = [
        [words[0], words[1]],
        [words[2]],
        words.slice(3),
      ];
    }

    const baseSize = this.styleConfig.fontSize * scaleFactor;
    const targetBlockWidth = width * 0.72;
    const minRowSize = baseSize * 0.62;
    const maxRowSize = baseSize * 2.15;

    const formatDisplay = (w: WordTimestamp) => {
      let t = w.word;
      if (this.styleConfig.textTransform === 'uppercase') t = t.toUpperCase();
      if (w.emoji && this.useEmojis) t += ` ${w.emoji}`;
      return t;
    };

    // Compute exact justified font size per row so left & right edges align cleanly
    const rowMetrics = rows.map((rowWords) => {
      const texts = rowWords.map(formatDisplay);
      const joined = texts.join(' ');
      const refSize = 100;
      ctx.font = `${this.styleConfig.fontWeight} ${refSize}px "${this.styleConfig.fontFamily}", sans-serif`;
      const refWidth = Math.max(1, ctx.measureText(joined).width);
      const idealSize = (targetBlockWidth / refWidth) * refSize;
      const rowFontSize = Math.max(minRowSize, Math.min(maxRowSize, idealSize));
      const rowHeight = rowFontSize * 0.94;
      return { rowWords, texts, rowFontSize, rowHeight };
    });

    const rowGap = baseSize * 0.14;
    const totalBlockHeight =
      rowMetrics.reduce((sum, r) => sum + r.rowHeight, 0) +
      Math.max(0, rowMetrics.length - 1) * rowGap;

    let cursorY = centerY - totalBlockHeight / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    rowMetrics.forEach((row) => {
      const rowCenterY = cursorY + row.rowHeight / 2;
      ctx.font = `${this.styleConfig.fontWeight} ${row.rowFontSize}px "${this.styleConfig.fontFamily}", sans-serif`;

      const spaceW = ctx.measureText(' ').width;
      const wordWidths = row.texts.map((t) => ctx.measureText(t).width);
      const totalRowW =
        wordWidths.reduce((a, b) => a + b, 0) +
        Math.max(0, row.texts.length - 1) * spaceW;

      let cursorX = posX - totalRowW / 2;

      row.rowWords.forEach((w, idx) => {
        const displayText = row.texts[idx];
        const wWidth = wordWidths[idx];
        const wordCenterX = cursorX + wWidth / 2;
        cursorX += wWidth + spaceW;

        const isCurrent = currentTime >= w.start && currentTime <= w.end;
        const isFuture = currentTime < w.start;

        ctx.save();
        if (isCurrent && this.styleConfig.animationType === 'bounce') {
          const progress = Math.min(1, Math.max(0, (currentTime - w.start) / 0.14));
          const pop = 1.0 + 0.05 * Math.sin(progress * Math.PI);
          ctx.translate(wordCenterX, rowCenterY);
          ctx.scale(pop, pop);
          ctx.translate(-wordCenterX, -rowCenterY);
        }

        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.62 : 0.95;

        if (this.styleConfig.strokeWidth > 0) {
          ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor;
          ctx.strokeStyle = this.styleConfig.strokeColor;
          ctx.lineJoin = 'miter';
          ctx.miterLimit = 2;
          ctx.strokeText(displayText, wordCenterX, rowCenterY);
        }

        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;

        if (isCurrent && this.styleConfig.animationType === 'glow') {
          ctx.shadowColor = this.styleConfig.activeWordColor;
          ctx.shadowBlur = 16 * scaleFactor;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
          ctx.shadowBlur = 14 * scaleFactor;
          ctx.shadowOffsetY = 3 * scaleFactor;
        }

        ctx.fillText(displayText, wordCenterX, rowCenterY);
        ctx.restore();
      });

      cursorY += row.rowHeight + rowGap;
    });

    ctx.restore();
  }

  /**
   * Aura Mixed Poster (Captik Aura / Manifesto style):
   * Tightly structured 2-row Big Sans + Small Mixed Italic Serif composition.
   */
  private renderAuraPoster(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    segment: SubtitleSegment
  ): void {
    const scaleFactor = height / 1000;
    const posX = width / 2;
    const centerY = height * (this.styleConfig.positionYPercent / 100);
    const words = segment.words;
    if (words.length === 0) return;

    const baseSize = this.styleConfig.fontSize * scaleFactor;

    // Pick the longest word in the phrase as the BIG anchor word on top (or bottom)
    let heroIdx = 0;
    for (let i = 1; i < words.length; i++) {
      if (words[i].word.length >= words[heroIdx].word.length) {
        heroIdx = i;
      }
    }

    const heroWord = words[heroIdx];
    const otherWords = words.filter((_, i) => i !== heroIdx);
    const heroOnTop = heroIdx === 0 || heroIdx < words.length - 1;

    // Hero sizing (BIG bold ALL CAPS sans, clamped to 86% canvas width)
    let heroText = heroWord.word;
    if (this.styleConfig.textTransform === 'uppercase') {
      heroText = heroText.toUpperCase();
    }
    if (heroWord.emoji && this.useEmojis) {
      heroText += ` ${heroWord.emoji}`;
    }

    let heroSize = baseSize * 1.65;
    ctx.save();
    ctx.font = `${this.styleConfig.fontWeight} ${heroSize}px "${this.styleConfig.fontFamily}", sans-serif`;
    const heroW = ctx.measureText(heroText).width;
    if (heroW > width * 0.86 && heroW > 0) {
      heroSize = heroSize * ((width * 0.86) / heroW);
    }

    // Companion row sizing (SMALL sleek mix of crisp sans + italic Playfair serif)
    const subSize = baseSize * 0.84;
    const rowGap = baseSize * 0.22;
    const totalH =
      otherWords.length > 0 ? heroSize * 0.92 + subSize * 0.95 + rowGap : heroSize;

    const topY = centerY - totalH / 2;
    const heroY = heroOnTop
      ? topY + (heroSize * 0.92) / 2
      : topY + subSize * 0.95 + rowGap + (heroSize * 0.92) / 2;
    const subY = heroOnTop
      ? topY + heroSize * 0.92 + rowGap + (subSize * 0.95) / 2
      : topY + (subSize * 0.95) / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw BIG Hero Row
    {
      const isCurrent =
        currentTime >= heroWord.start && currentTime <= heroWord.end;
      const isFuture = currentTime < heroWord.start;
      ctx.save();
      ctx.font = `${this.styleConfig.fontWeight} ${heroSize}px "${this.styleConfig.fontFamily}", sans-serif`;

      if (isCurrent && this.styleConfig.animationType === 'bounce') {
        const p = Math.min(1, Math.max(0, (currentTime - heroWord.start) / 0.15));
        const s = 1.0 + 0.07 * Math.sin(p * Math.PI);
        ctx.translate(posX, heroY);
        ctx.scale(s, s);
        ctx.translate(-posX, -heroY);
      }

      ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.68 : 0.96;
      if (this.styleConfig.strokeWidth > 0) {
        ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor;
        ctx.strokeStyle = this.styleConfig.strokeColor;
        ctx.strokeText(heroText, posX, heroY);
      }
      ctx.fillStyle = isCurrent
        ? this.styleConfig.activeWordColor
        : this.styleConfig.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 16 * scaleFactor;
      ctx.shadowOffsetY = 4 * scaleFactor;
      ctx.fillText(heroText, posX, heroY);
      ctx.restore();
    }

    // Draw SMALL Mixed Companion Row (alternates crisp Sans + Italic Playfair Serif!)
    if (otherWords.length > 0) {
      const subItems = otherWords.map((w, idx) => {
        const useSerif = idx % 2 === 1 || otherWords.length === 1;
        let display = useSerif ? w.word.toLowerCase() : w.word.toUpperCase();
        if (w.emoji && this.useEmojis) display += ` ${w.emoji}`;
        const font = useSerif
          ? `italic 700 ${subSize * 1.12}px "Playfair Display", Georgia, serif`
          : `700 ${subSize * 0.88}px "Inter", sans-serif`;
        ctx.font = font;
        const wWidth = ctx.measureText(display).width;
        return { wordObj: w, display, font, width: wWidth };
      });

      ctx.font = `700 ${subSize * 0.88}px "Inter", sans-serif`;
      const spaceW = ctx.measureText(' ').width * 1.3;
      const totalSubW =
        subItems.reduce((a, b) => a + b.width, 0) +
        Math.max(0, subItems.length - 1) * spaceW;

      let cx = posX - totalSubW / 2;
      subItems.forEach((item) => {
        const wx = cx + item.width / 2;
        cx += item.width + spaceW;
        const isCurrent =
          currentTime >= item.wordObj.start && currentTime <= item.wordObj.end;
        const isFuture = currentTime < item.wordObj.start;

        ctx.save();
        ctx.font = item.font;
        ctx.globalAlpha = isCurrent ? 1.0 : isFuture ? 0.65 : 0.94;
        ctx.fillStyle = isCurrent
          ? this.styleConfig.activeWordColor
          : this.styleConfig.textColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 10 * scaleFactor;
        ctx.shadowOffsetY = 2 * scaleFactor;
        ctx.fillText(item.display, wx, subY);
        ctx.restore();
      });
    }

    ctx.restore();
  }

  /**
   * The Big Red (Captik Popular #1 Crimson Editorial Poster):
   * Giant stacked crimson-red high-contrast serif ALL CAPS filling the frame,
   * with the currently spoken word overlaid tiny in razor-sharp white italic serif dead-center.
   */
  private renderBigRed(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    segment: SubtitleSegment
  ): void {
    const scaleFactor = height / 1000;
    const posX = width / 2;
    const centerY = height * (this.styleConfig.positionYPercent / 100);
    const words = segment.words;
    if (words.length === 0) return;

    const baseSize = this.styleConfig.fontSize * scaleFactor;
    const targetW = width * 0.88;

    // Each word becomes a dramatic stacked crimson serif line
    const stackLines = words.map((w) => {
      const text =
        this.styleConfig.textTransform === 'uppercase'
          ? w.word.toUpperCase()
          : w.word;
      let sz = baseSize * 2.15;
      ctx.font = `${this.styleConfig.fontWeight} ${sz}px "${this.styleConfig.fontFamily}", Georgia, serif`;
      const measured = ctx.measureText(text).width;
      if (measured > targetW && measured > 0) {
        sz = sz * (targetW / measured);
      }
      return { wordObj: w, text, fontSize: sz, lineHeight: sz * 0.86 };
    });

    const totalH = stackLines.reduce((sum, l) => sum + l.lineHeight, 0);
    let cursorY = centerY - totalH / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Layer 1: Giant Stacked Crimson Serif Block
    stackLines.forEach((line) => {
      const ly = cursorY + line.lineHeight / 2;
      const isCurrent =
        currentTime >= line.wordObj.start && currentTime <= line.wordObj.end;

      ctx.save();
      ctx.font = `${this.styleConfig.fontWeight} ${line.fontSize}px "${this.styleConfig.fontFamily}", Georgia, serif`;

      if (isCurrent && this.styleConfig.animationType === 'bounce') {
        const p = Math.min(
          1,
          Math.max(0, (currentTime - line.wordObj.start) / 0.16)
        );
        const s = 1.0 + 0.04 * Math.sin(p * Math.PI);
        ctx.translate(posX, ly);
        ctx.scale(s, s);
        ctx.translate(-posX, -ly);
      }

      ctx.fillStyle = this.styleConfig.activeWordColor;
      ctx.globalAlpha = isCurrent ? 1.0 : 0.88;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.shadowOffsetY = 4 * scaleFactor;

      if (this.styleConfig.strokeWidth > 0) {
        ctx.lineWidth = this.styleConfig.strokeWidth * scaleFactor;
        ctx.strokeStyle = this.styleConfig.strokeColor;
        ctx.strokeText(line.text, posX, ly);
      }
      ctx.fillText(line.text, posX, ly);
      ctx.restore();

      cursorY += line.lineHeight;
    });

    // Layer 2: Tiny Crisp White Italic Serif Active Word Overlaid Dead-Center
    const activeWord =
      words.find((w) => currentTime >= w.start && currentTime <= w.end) ??
      words[0];

    if (activeWord) {
      let miniText = activeWord.word.toLowerCase();
      if (activeWord.emoji && this.useEmojis) {
        miniText += ` ${activeWord.emoji}`;
      }
      const miniSize = Math.max(16 * scaleFactor, baseSize * 0.62);
      ctx.save();
      ctx.font = `italic 700 ${miniSize}px "${this.styleConfig.fontFamily}", Georgia, serif`;
      ctx.fillStyle = this.styleConfig.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
      ctx.shadowBlur = 12 * scaleFactor;
      ctx.shadowOffsetY = 2 * scaleFactor;
      ctx.fillText(miniText, posX, centerY);
      ctx.restore();
    }

    ctx.restore();
  }
}
