import type {
  HoldTransitionId,
  InOutTransitionId,
  PhaseTransitionSet,
  TransitionConfig,
} from '../types/caption';

export interface TransitionTransform {
  tx: number;
  ty: number;
  scaleX: number;
  scaleY: number;
  rotateRad: number;
  skewX: number;
  alpha: number;
  blur: number;
  /** 1 = full width visible, 0..1 = left-to-right clip reveal (Typewriter / Type On) */
  clipReveal: number;
}

export const IDENTITY_TRANSFORM: TransitionTransform = {
  tx: 0,
  ty: 0,
  scaleX: 1,
  scaleY: 1,
  rotateRad: 0,
  skewX: 0,
  alpha: 1,
  blur: 0,
  clipReveal: 1,
};

export function createDefaultTransitionConfig(): TransitionConfig {
  return {
    all: { in: 'none', hold: 'template', out: 'none' },
    emphasized: { in: 'none', hold: 'template', out: 'none' },
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeOutBack(t: number, overshoot = 1.70158): number {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const u = t - 1.5 / d1;
    return n1 * u * u + 0.75;
  } else if (t < 2.5 / d1) {
    const u = t - 2.25 / d1;
    return n1 * u * u + 0.9375;
  } else {
    const u = t - 2.625 / d1;
    return n1 * u * u + 0.984375;
  }
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function scaleUniform(out: TransitionTransform, factor: number): void {
  out.scaleX *= factor;
  out.scaleY *= factor;
}

/** Per-effect ideal animation duration so dramatic effects (Drop, Typewriter, Wobble, Glitch) read clearly */
function getIdealDuration(id: InOutTransitionId, baseWindow: number): number {
  switch (id) {
    case 'drop':
    case 'bounce':
    case 'wobble':
    case 'typewriter':
    case 'typeOn':
    case 'flicker':
    case 'glitch':
      return baseWindow * 1.65;
    case 'slam':
    case 'spinIn':
    case 'blurRise':
    case 'softFocus':
    case 'hookLeft':
    case 'hookRight':
    case 'expand':
      return baseWindow * 1.35;
    default:
      return baseWindow;
  }
}

function applyInEffect(
  id: InOutTransitionId,
  p: number,
  sf: number,
  out: TransitionTransform
): void {
  if (id === 'none' || p >= 1) return;

  const t = clamp01(p);
  const cubic = easeOutCubic(t);
  const quart = easeOutQuart(t);
  const back = easeOutBack(t, 2.05);
  const inv = 1 - cubic;
  const invQ = 1 - quart;

  switch (id) {
    // Basic
    case 'fade':
      out.alpha *= cubic;
      break;
    case 'pop':
      out.alpha *= Math.min(1, t * 2.5);
      scaleUniform(out, 0.38 + 0.62 * back);
      break;
    case 'zoom':
      out.alpha *= Math.min(1, t * 2.0);
      scaleUniform(out, 1.85 - 0.85 * quart);
      break;
    case 'scale':
      out.alpha *= cubic;
      scaleUniform(out, 0.68 + 0.32 * quart);
      break;

    // Slide
    case 'slideUp':
      out.alpha *= Math.min(1, t * 2.0);
      out.ty += 70 * sf * invQ;
      break;
    case 'slideDown':
      out.alpha *= Math.min(1, t * 2.0);
      out.ty -= 70 * sf * invQ;
      break;
    case 'slideLeft':
      out.alpha *= Math.min(1, t * 2.0);
      out.tx += 96 * sf * invQ;
      break;
    case 'slideRight':
      out.alpha *= Math.min(1, t * 2.0);
      out.tx -= 96 * sf * invQ;
      break;
    case 'riseUp':
      out.alpha *= cubic;
      out.ty += 34 * sf * inv;
      scaleUniform(out, 0.9 + 0.1 * cubic);
      break;
    case 'riseDown':
      out.alpha *= cubic;
      out.ty -= 34 * sf * inv;
      scaleUniform(out, 0.9 + 0.1 * cubic);
      break;
    case 'blurRise':
      out.alpha *= cubic;
      out.ty += 38 * sf * invQ;
      out.blur += 14 * sf * inv;
      break;

    // Bouncy
    case 'hookLeft':
      out.alpha *= Math.min(1, t * 2.2);
      out.tx += 76 * sf * (1 - back);
      out.rotateRad += ((12 * Math.PI) / 180) * (1 - back);
      break;
    case 'hookRight':
      out.alpha *= Math.min(1, t * 2.2);
      out.tx -= 76 * sf * (1 - back);
      out.rotateRad -= ((12 * Math.PI) / 180) * (1 - back);
      break;
    case 'punch': {
      out.alpha *= Math.min(1, t * 3.2);
      const punchBack = easeOutBack(t, 2.8);
      scaleUniform(out, 1.72 - 0.72 * punchBack);
      break;
    }
    case 'slam': {
      out.alpha *= Math.min(1, t * 3.5);
      const slamEase = easeOutQuart(t);
      out.ty -= 58 * sf * (1 - slamEase);
      const impactWave = Math.sin(t * Math.PI * 2.5) * Math.pow(1 - t, 1.5);
      out.scaleX *= 1.62 - 0.62 * slamEase + impactWave * 0.18;
      out.scaleY *= 1.62 - 0.62 * slamEase - impactWave * 0.16;
      break;
    }
    case 'wobble': {
      out.alpha *= Math.min(1, t * 3.0);
      const damp = Math.pow(1 - t, 1.45);
      const osc = Math.sin(t * Math.PI * 4);
      out.rotateRad += ((18 * Math.PI) / 180) * osc * damp;
      out.scaleX *= 1 + 0.18 * osc * damp;
      out.scaleY *= 1 - 0.14 * osc * damp;
      break;
    }
    case 'drop': {
      out.alpha *= Math.min(1, t * 3.0);
      const b = easeOutBounce(t);
      out.ty -= 86 * sf * (1 - b);
      break;
    }
    case 'bounce': {
      out.alpha *= Math.min(1, t * 3.0);
      const b = easeOutBounce(t);
      out.ty += 62 * sf * (1 - b);
      const squash = Math.sin(t * Math.PI * 3.5) * (1 - t) * 0.14;
      out.scaleX *= 1 + squash;
      out.scaleY *= 1 - squash;
      break;
    }
    case 'spinIn':
      out.alpha *= Math.min(1, t * 2.4);
      scaleUniform(out, 0.35 + 0.65 * back);
      out.rotateRad -= ((44 * Math.PI) / 180) * (1 - back);
      break;

    // Typing
    case 'typewriter': {
      const steps = 9;
      const stepped = Math.max(0.06, Math.ceil(t * steps) / steps);
      out.clipReveal *= stepped;
      break;
    }
    case 'typeOn':
      out.clipReveal *= Math.max(0.03, cubic);
      break;
    case 'expand':
      out.alpha *= Math.min(1, t * 2.2);
      out.scaleX *= 0.22 + 0.78 * quart;
      out.scaleY *= 0.9 + 0.1 * quart;
      break;

    // Effects
    case 'flicker': {
      const flash =
        t < 0.15
          ? 0.08
          : t < 0.28
            ? 0.95
            : t < 0.42
              ? 0.12
              : t < 0.58
                ? 1.0
                : t < 0.72
                  ? 0.3
                  : 1.0;
      out.alpha *= flash;
      break;
    }
    case 'glitch': {
      out.alpha *= Math.min(1, t * 3.2);
      const intensity = Math.pow(1 - t, 1.3);
      const step = Math.floor(t * 16);
      const dir = step % 2 === 0 ? 1 : -1;
      out.tx += dir * 24 * sf * intensity;
      out.ty += (step % 3 === 0 ? -6 : 5) * sf * intensity;
      out.skewX += dir * 0.32 * intensity;
      if (step === 2 || step === 6 || step === 9) out.alpha *= 0.45;
      break;
    }
    case 'softFocus':
      out.alpha *= cubic;
      scaleUniform(out, 1.12 - 0.12 * cubic);
      out.blur += 16 * sf * inv;
      break;
  }
}

function applyHoldEffect(
  id: HoldTransitionId,
  elapsed: number,
  sf: number,
  out: TransitionTransform
): void {
  if (id === 'template' || id === 'none' || elapsed < 0) return;

  switch (id) {
    case 'float':
      out.ty += Math.sin(elapsed * 5.6) * 8.5 * sf;
      break;
    case 'pulse':
      scaleUniform(out, 1 + 0.075 * Math.sin(elapsed * 8.5));
      break;
    case 'heartbeat': {
      const cycle = (elapsed * 1.95) % 1;
      const beat1 = Math.exp(-Math.pow((cycle - 0.14) / 0.06, 2));
      const beat2 = 0.65 * Math.exp(-Math.pow((cycle - 0.34) / 0.06, 2));
      scaleUniform(out, 1 + 0.13 * (beat1 + beat2));
      break;
    }
    case 'shake':
      out.tx += Math.sin(elapsed * 38) * 3.8 * sf;
      out.ty += Math.cos(elapsed * 31) * 3.0 * sf;
      out.rotateRad += Math.sin(elapsed * 26) * 0.022;
      break;
    case 'swing':
      out.rotateRad += Math.sin(elapsed * 5.2) * ((6.5 * Math.PI) / 180);
      break;
    case 'breathe':
      scaleUniform(out, 1 + 0.045 * Math.sin(elapsed * 4.2));
      out.alpha *= 0.88 + 0.12 * Math.sin(elapsed * 4.2);
      break;
    case 'jello': {
      const w = Math.sin(elapsed * 9.5);
      out.scaleX *= 1 + 0.065 * w;
      out.scaleY *= 1 - 0.055 * w;
      out.skewX += 0.04 * Math.cos(elapsed * 9.5);
      break;
    }
  }
}

function applyOutEffect(
  id: InOutTransitionId,
  p: number,
  sf: number,
  out: TransitionTransform
): void {
  if (id === 'none' || p <= 0) return;

  const t = clamp01(p);
  const eased = easeInCubic(t);

  switch (id) {
    case 'fade':
      out.alpha *= 1 - eased;
      break;
    case 'pop':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 - 0.52 * eased);
      break;
    case 'zoom':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 + 0.7 * eased);
      break;
    case 'scale':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 - 0.32 * eased);
      break;
    case 'slideUp':
      out.alpha *= 1 - eased;
      out.ty -= 64 * sf * eased;
      break;
    case 'slideDown':
      out.alpha *= 1 - eased;
      out.ty += 64 * sf * eased;
      break;
    case 'slideLeft':
      out.alpha *= 1 - eased;
      out.tx -= 90 * sf * eased;
      break;
    case 'slideRight':
      out.alpha *= 1 - eased;
      out.tx += 90 * sf * eased;
      break;
    case 'riseUp':
      out.alpha *= 1 - eased;
      out.ty -= 32 * sf * eased;
      scaleUniform(out, 1 - 0.09 * eased);
      break;
    case 'riseDown':
      out.alpha *= 1 - eased;
      out.ty += 32 * sf * eased;
      scaleUniform(out, 1 - 0.09 * eased);
      break;
    case 'blurRise':
      out.alpha *= 1 - eased;
      out.ty -= 34 * sf * eased;
      out.blur += 14 * sf * eased;
      break;
    case 'hookLeft':
      out.alpha *= 1 - eased;
      out.tx -= 72 * sf * eased;
      out.rotateRad -= ((11 * Math.PI) / 180) * eased;
      break;
    case 'hookRight':
      out.alpha *= 1 - eased;
      out.tx += 72 * sf * eased;
      out.rotateRad += ((11 * Math.PI) / 180) * eased;
      break;
    case 'punch':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 + 0.55 * eased);
      break;
    case 'slam':
      out.alpha *= 1 - eased;
      out.ty += 52 * sf * eased;
      scaleUniform(out, 1 + 0.36 * eased);
      break;
    case 'wobble':
      out.alpha *= 1 - eased;
      out.rotateRad += ((18 * Math.PI) / 180) * Math.sin(t * Math.PI * 2.5) * eased;
      break;
    case 'drop':
      out.alpha *= 1 - eased;
      out.ty += 80 * sf * eased;
      break;
    case 'bounce':
      out.alpha *= 1 - eased;
      out.ty -= 54 * sf * eased;
      scaleUniform(out, 1 - 0.24 * eased);
      break;
    case 'spinIn':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 - 0.55 * eased);
      out.rotateRad += ((42 * Math.PI) / 180) * eased;
      break;
    case 'typewriter': {
      const steps = 9;
      const remaining = Math.max(0, 1 - Math.ceil(t * steps) / steps);
      out.clipReveal *= remaining;
      break;
    }
    case 'typeOn':
      out.clipReveal *= Math.max(0, 1 - eased);
      break;
    case 'expand':
      out.alpha *= 1 - eased;
      out.scaleX *= 1 - 0.72 * eased;
      break;
    case 'flicker': {
      const flash =
        t < 0.22
          ? 0.9
          : t < 0.42
            ? 0.15
            : t < 0.62
              ? 0.85
              : t < 0.8
                ? 0.1
                : 0;
      out.alpha *= flash;
      break;
    }
    case 'glitch': {
      const step = Math.floor(t * 14);
      const dir = step % 2 === 0 ? 1 : -1;
      out.tx += dir * 24 * sf * t;
      out.skewX += dir * 0.3 * t;
      out.alpha *= 1 - eased;
      break;
    }
    case 'softFocus':
      out.alpha *= 1 - eased;
      scaleUniform(out, 1 + 0.12 * eased);
      out.blur += 16 * sf * eased;
      break;
  }
}

/**
 * Computes combined IN + HOLD + OUT transform for a caption segment or word.
 */
export function computeTransitionTransform(
  set: PhaseTransitionSet,
  currentTime: number,
  start: number,
  end: number,
  scaleFactor: number,
  baseWindowSecs = 0.28
): TransitionTransform {
  if (
    set.in === 'none' &&
    (set.hold === 'template' || set.hold === 'none') &&
    set.out === 'none'
  ) {
    return IDENTITY_TRANSFORM;
  }

  const totalDur = Math.max(0.1, end - start);
  const idealIn = getIdealDuration(set.in, baseWindowSecs);
  const idealOut = getIdealDuration(set.out, baseWindowSecs * 0.92);

  // Ensure IN and OUT never overlap awkwardly on short segments
  const maxShare = set.in !== 'none' && set.out !== 'none' ? 0.46 : 0.62;
  const inDur = Math.min(idealIn, totalDur * maxShare);
  const outDur = Math.min(idealOut, totalDur * maxShare);

  const elapsed = currentTime - start;
  const remaining = end - currentTime;

  const result: TransitionTransform = {
    tx: 0,
    ty: 0,
    scaleX: 1,
    scaleY: 1,
    rotateRad: 0,
    skewX: 0,
    alpha: 1,
    blur: 0,
    clipReveal: 1,
  };

  if (set.in !== 'none' && elapsed < inDur) {
    applyInEffect(set.in, elapsed / inDur, scaleFactor, result);
  }

  applyHoldEffect(set.hold, Math.max(0, elapsed), scaleFactor, result);

  if (set.out !== 'none' && remaining < outDur) {
    const outProgress = 1 - remaining / outDur;
    applyOutEffect(set.out, outProgress, scaleFactor, result);
  }

  result.alpha = clamp01(result.alpha);
  result.clipReveal = clamp01(result.clipReveal);
  return result;
}

export function isIdentityTransform(t: TransitionTransform): boolean {
  return (
    t.tx === 0 &&
    t.ty === 0 &&
    t.scaleX === 1 &&
    t.scaleY === 1 &&
    t.rotateRad === 0 &&
    t.skewX === 0 &&
    t.alpha === 1 &&
    t.blur === 0 &&
    t.clipReveal === 1
  );
}

/**
 * Applies a computed transition transform around (anchorX, anchorY) on the Canvas 2D context.
 * Caller must wrap with ctx.save() / ctx.restore().
 */
export function applyCanvasTransform(
  ctx: CanvasRenderingContext2D,
  t: TransitionTransform,
  anchorX: number,
  anchorY: number,
  clipWidth = 0,
  clipHeight = 0
): void {
  if (t.alpha < 1) {
    ctx.globalAlpha *= t.alpha;
  }
  if (t.blur > 0.25) {
    ctx.filter = `blur(${t.blur.toFixed(1)}px)`;
  }
  if (
    t.tx !== 0 ||
    t.ty !== 0 ||
    t.scaleX !== 1 ||
    t.scaleY !== 1 ||
    t.rotateRad !== 0 ||
    t.skewX !== 0
  ) {
    ctx.translate(anchorX + t.tx, anchorY + t.ty);
    if (t.rotateRad !== 0) ctx.rotate(t.rotateRad);
    if (t.skewX !== 0) ctx.transform(1, 0, t.skewX, 1, 0, 0);
    if (t.scaleX !== 1 || t.scaleY !== 1) ctx.scale(t.scaleX, t.scaleY);
    ctx.translate(-anchorX, -anchorY);
  }
  if (t.clipReveal < 0.999 && clipWidth > 0 && clipHeight > 0) {
    ctx.beginPath();
    ctx.rect(
      anchorX - clipWidth / 2,
      anchorY - clipHeight / 2,
      clipWidth * t.clipReveal,
      clipHeight
    );
    ctx.clip();
  }
}
