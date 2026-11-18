import { useState } from 'react';
import type {
  HoldTransitionId,
  InOutTransitionId,
  TransitionConfig,
  TransitionPhase,
  TransitionScope,
} from '../types/caption';
import { PlayIcon } from './Icons';

type TransitionGroup = 'Basic' | 'Slide' | 'Bouncy' | 'Typing' | 'Effects';

interface InOutOption {
  id: InOutTransitionId;
  label: string;
  outLabel?: string;
  group: TransitionGroup;
  previewClass: string;
}

interface HoldOption {
  id: HoldTransitionId;
  label: string;
  previewClass: string;
}

const IN_OUT_OPTIONS: InOutOption[] = [
  // Basic
  { id: 'none', label: 'None', group: 'Basic', previewClass: 'aa-none' },
  { id: 'fade', label: 'Fade', group: 'Basic', previewClass: 'aa-fade' },
  { id: 'pop', label: 'Pop', group: 'Basic', previewClass: 'aa-pop' },
  { id: 'zoom', label: 'Zoom', group: 'Basic', previewClass: 'aa-zoom' },
  { id: 'scale', label: 'Scale', group: 'Basic', previewClass: 'aa-scale' },

  // Slide
  { id: 'slideUp', label: 'Slide Up', group: 'Slide', previewClass: 'aa-slide-up' },
  { id: 'slideDown', label: 'Slide Down', group: 'Slide', previewClass: 'aa-slide-down' },
  { id: 'slideLeft', label: 'Slide Left', group: 'Slide', previewClass: 'aa-slide-left' },
  { id: 'slideRight', label: 'Slide Right', group: 'Slide', previewClass: 'aa-slide-right' },
  { id: 'riseUp', label: 'Rise Up', group: 'Slide', previewClass: 'aa-rise-up' },
  { id: 'riseDown', label: 'Rise Down', group: 'Slide', previewClass: 'aa-rise-down' },
  { id: 'blurRise', label: 'Blur Rise', group: 'Slide', previewClass: 'aa-blur-rise' },

  // Bouncy
  { id: 'hookLeft', label: 'Hook Left', group: 'Bouncy', previewClass: 'aa-hook-left' },
  { id: 'hookRight', label: 'Hook Right', group: 'Bouncy', previewClass: 'aa-hook-right' },
  { id: 'punch', label: 'Punch', group: 'Bouncy', previewClass: 'aa-punch' },
  { id: 'slam', label: 'Slam', group: 'Bouncy', previewClass: 'aa-slam' },
  { id: 'wobble', label: 'Wobble', group: 'Bouncy', previewClass: 'aa-wobble' },
  { id: 'drop', label: 'Drop', group: 'Bouncy', previewClass: 'aa-drop' },
  { id: 'bounce', label: 'Bounce', group: 'Bouncy', previewClass: 'aa-bounce' },
  { id: 'spinIn', label: 'Spin In', outLabel: 'Spin Out', group: 'Bouncy', previewClass: 'aa-spin-in' },

  // Typing
  { id: 'typewriter', label: 'Typewriter', group: 'Typing', previewClass: 'aa-typewriter' },
  { id: 'typeOn', label: 'Type On', group: 'Typing', previewClass: 'aa-type-on' },
  { id: 'expand', label: 'Expand', group: 'Typing', previewClass: 'aa-expand' },

  // Effects
  { id: 'flicker', label: 'Flicker', group: 'Effects', previewClass: 'aa-flicker' },
  { id: 'glitch', label: 'Glitch', group: 'Effects', previewClass: 'aa-glitch' },
  { id: 'softFocus', label: 'Soft Focus', group: 'Effects', previewClass: 'aa-soft-focus' },
];

const HOLD_OPTIONS: HoldOption[] = [
  { id: 'template', label: 'Template', previewClass: 'aa-template' },
  { id: 'none', label: 'None', previewClass: 'aa-none' },
  { id: 'pulse', label: 'Pulse', previewClass: 'aa-pulse' },
  { id: 'float', label: 'Float', previewClass: 'aa-float' },
  { id: 'heartbeat', label: 'Heartbeat', previewClass: 'aa-heartbeat' },
  { id: 'shake', label: 'Shake', previewClass: 'aa-shake' },
  { id: 'swing', label: 'Swing', previewClass: 'aa-swing' },
  { id: 'breathe', label: 'Breathe', previewClass: 'aa-breathe' },
  { id: 'jello', label: 'Jello', previewClass: 'aa-jello' },
];

const IN_OUT_GROUPS: TransitionGroup[] = [
  'Basic',
  'Slide',
  'Bouncy',
  'Typing',
  'Effects',
];

function getLabelForInOut(
  id: InOutTransitionId,
  phase: 'in' | 'out' = 'in'
): string {
  const opt = IN_OUT_OPTIONS.find((o) => o.id === id);
  if (!opt) return 'None';
  return phase === 'out' && opt.outLabel ? opt.outLabel : opt.label;
}

function getLabelForHold(id: HoldTransitionId): string {
  return HOLD_OPTIONS.find((o) => o.id === id)?.label ?? 'Template';
}

function InCurveIcon() {
  return (
    <svg width="11" height="9" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1.5 8.5C2.5 3.5 5 2 10.5 2" />
    </svg>
  );
}

function HoldLineIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1.5 5H10.5" />
    </svg>
  );
}

function OutCurveIcon() {
  return (
    <svg width="11" height="9" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1.5 2C7 2 9.5 3.5 10.5 8.5" />
    </svg>
  );
}

function AaPreviewGlyph({ previewClass }: { previewClass: string }) {
  const hasGhost =
    previewClass !== 'aa-none' &&
    previewClass !== 'aa-scale' &&
    previewClass !== 'aa-template' &&
    previewClass !== 'aa-wobble' &&
    previewClass !== 'aa-typewriter' &&
    previewClass !== 'aa-type-on' &&
    previewClass !== 'aa-flicker' &&
    previewClass !== 'aa-glitch' &&
    previewClass !== 'aa-soft-focus';

  return (
    <div className={`aa-stage ${previewClass}`}>
      {hasGhost && (
        <span className="aa-ghost" aria-hidden="true">
          Aa
        </span>
      )}
      <span className="aa-main">Aa</span>
    </div>
  );
}

interface TransitionsPanelProps {
  hasVideo: boolean;
  config: TransitionConfig;
  onUpdateTransition: (
    scope: TransitionScope,
    phase: TransitionPhase,
    value: InOutTransitionId | HoldTransitionId
  ) => void;
  onPreview: (phase: TransitionPhase, scope: TransitionScope) => void;
}

export function TransitionsPanel({
  hasVideo,
  config,
  onUpdateTransition,
  onPreview,
}: TransitionsPanelProps) {
  const [scope, setScope] = useState<TransitionScope>('all');
  const [phase, setPhase] = useState<TransitionPhase>('in');

  const currentSet = config[scope];

  const hasActiveIn = currentSet.in !== 'none';
  const hasActiveHold =
    currentSet.hold !== 'template' && currentSet.hold !== 'none';
  const hasActiveOut = currentSet.out !== 'none';

  const handleSelectInOut = (id: InOutTransitionId, el?: HTMLButtonElement) => {
    onUpdateTransition(scope, phase, id);
    if (el && window.matchMedia('(max-width: 860px)').matches) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  const handleSelectHold = (id: HoldTransitionId, el?: HTMLButtonElement) => {
    onUpdateTransition(scope, 'hold', id);
    if (el && window.matchMedia('(max-width: 860px)').matches) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  const phaseTitle = phase === 'in' ? 'In' : phase === 'hold' ? 'Hold' : 'Out';

  return (
    <div className="tab-pane active">
      {/* Scope Segmented Switch: All captions vs Emphasized words */}
      <div className="scope-segmented">
        <button
          type="button"
          className={`scope-seg-btn${scope === 'all' ? ' active' : ''}`}
          onClick={() => setScope('all')}
        >
          All captions
        </button>
        <button
          type="button"
          className={`scope-seg-btn${scope === 'emphasized' ? ' active' : ''}`}
          onClick={() => setScope('emphasized')}
        >
          Emphasized words
        </button>
      </div>

      {/* Interlocking Chevron 3-Stage Stepper: IN > HOLD > OUT */}
      <div className="chevron-stepper">
        {/* IN Stage */}
        <div
          role="button"
          tabIndex={0}
          className={`chevron-step chevron-step-first${phase === 'in' ? ' is-selected' : ''}${hasActiveIn ? ' has-effect' : ''}`}
          onClick={() => setPhase('in')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setPhase('in');
          }}
        >
          {hasActiveIn && (
            <button
              type="button"
              className="chevron-clear-btn"
              title="Clear IN transition"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTransition(scope, 'in', 'none');
              }}
            >
              &times;
            </button>
          )}
          <span className="chevron-eyebrow">
            <InCurveIcon />
            IN
          </span>
          <span className="chevron-val">{getLabelForInOut(currentSet.in)}</span>
          <span className="chevron-underline" />
        </div>

        {/* HOLD Stage */}
        <div
          role="button"
          tabIndex={0}
          className={`chevron-step chevron-step-mid${phase === 'hold' ? ' is-selected' : ''}${hasActiveHold ? ' has-effect' : ''}`}
          onClick={() => setPhase('hold')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setPhase('hold');
          }}
        >
          {hasActiveHold && (
            <button
              type="button"
              className="chevron-clear-btn"
              title="Reset HOLD to Template"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTransition(scope, 'hold', 'template');
              }}
            >
              &times;
            </button>
          )}
          <span className="chevron-eyebrow">
            <HoldLineIcon />
            HOLD
          </span>
          <span className="chevron-val">
            {getLabelForHold(currentSet.hold)}
          </span>
          <span className="chevron-underline" />
        </div>

        {/* OUT Stage */}
        <div
          role="button"
          tabIndex={0}
          className={`chevron-step chevron-step-last${phase === 'out' ? ' is-selected' : ''}${hasActiveOut ? ' has-effect' : ''}`}
          onClick={() => setPhase('out')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setPhase('out');
          }}
        >
          {hasActiveOut && (
            <button
              type="button"
              className="chevron-clear-btn"
              title="Clear OUT transition"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTransition(scope, 'out', 'none');
              }}
            >
              &times;
            </button>
          )}
          <span className="chevron-eyebrow">
            <OutCurveIcon />
            OUT
          </span>
          <span className="chevron-val">
            {getLabelForInOut(currentSet.out, 'out')}
          </span>
          <span className="chevron-underline" />
        </div>
      </div>

      {/* Active Phase Header + Live Preview Trigger */}
      <div className="transition-stage-header">
        <span className="transition-stage-title">{phaseTitle}</span>
        <button
          type="button"
          className="btn-preview-inline"
          disabled={!hasVideo}
          onClick={() => onPreview(phase, scope)}
          title={
            hasVideo
              ? `Preview ${phaseTitle} animation on canvas`
              : 'Load a video to preview'
          }
        >
          <PlayIcon size={11} filled={false} />
          Preview
        </button>
      </div>

      {/* Transition Tiles Grid (Desktop 3-col grouped | Mobile single-row horizontal carousel) */}
      <div className="transitions-scroll-track">
        {phase === 'hold' ? (
          <div className="transition-group">
            <span className="transition-group-label">Continuous Hold</span>
            <div className="transitions-grid">
              {HOLD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`transition-card${currentSet.hold === opt.id ? ' active' : ''}`}
                  onClick={(e) => handleSelectHold(opt.id, e.currentTarget)}
                >
                  <AaPreviewGlyph previewClass={opt.previewClass} />
                  <span className="transition-card-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          IN_OUT_GROUPS.map((group) => {
            const groupItems = IN_OUT_OPTIONS.filter((o) => o.group === group);
            const selectedId = phase === 'in' ? currentSet.in : currentSet.out;
            return (
              <div key={group} className="transition-group">
                <span className="transition-group-label">{group}</span>
                <div className="transitions-grid">
                  {groupItems.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`transition-card${selectedId === opt.id ? ' active' : ''}`}
                      onClick={(e) =>
                        handleSelectInOut(opt.id, e.currentTarget)
                      }
                    >
                      <AaPreviewGlyph previewClass={opt.previewClass} />
                      <span className="transition-card-label">
                        {phase === 'out' && opt.outLabel
                          ? opt.outLabel
                          : opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
