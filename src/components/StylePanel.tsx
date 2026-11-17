import type {
  AnimationType,
  PresetKey,
  SubtitleStyleConfig,
} from '../types/caption';
import { getTemplateLabel } from './TemplatesPanel';

interface StylePanelProps {
  activePreset: PresetKey;
  styleConfig: SubtitleStyleConfig;
  useUppercase: boolean;
  useEmojis: boolean;
  silenceEnabled: boolean;
  silenceThreshold: number;
  jumpcutStats: string;
  onChangeTemplateClick: () => void;
  onUpdateStyle: <K extends keyof SubtitleStyleConfig>(
    key: K,
    value: SubtitleStyleConfig[K]
  ) => void;
  onToggleUppercase: (checked: boolean) => void;
  onToggleEmojis: (checked: boolean) => void;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
}

/** Normalize non-hex stroke colors (e.g. rgba) so `<input type="color">` always receives valid #rrggbb */
function toColorInputValue(color: string | undefined, fallback: string): string {
  if (color && /^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return fallback;
}

export function StylePanel({
  activePreset,
  styleConfig,
  useUppercase,
  useEmojis,
  silenceEnabled,
  silenceThreshold,
  jumpcutStats,
  onChangeTemplateClick,
  onUpdateStyle,
  onToggleUppercase,
  onToggleEmojis,
  onToggleSilence,
  onChangeSilenceThreshold,
}: StylePanelProps) {
  return (
    <div className="tab-pane active">
      {/* Compact Active Template Summary Strip */}
      <div className="active-template-bar">
        <div className="active-template-info">
          <span className="active-template-label">TEMPLATE</span>
          <span className="active-template-name">
            {getTemplateLabel(activePreset)}
          </span>
        </div>
        <button
          type="button"
          className="btn-mini-change"
          onClick={onChangeTemplateClick}
        >
          Change
        </button>
      </div>

      {/* Smart Silence Remover Card (Hidden when disabled in Settings) */}
      {silenceEnabled && (
        <div className="smart-jumpcut-card">
          <div className="jumpcut-header">
            <div className="jumpcut-info">
              <span className="badge-tag">AUTO-CUT</span>
              <span className="jumpcut-stats">{jumpcutStats}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={silenceEnabled}
                onChange={(e) => onToggleSilence(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="jumpcut-sub">
            <span>Threshold</span>
            <select
              className="control-select-sm"
              value={String(silenceThreshold)}
              onChange={(e) => onChangeSilenceThreshold(Number(e.target.value))}
            >
              <option value="0.3">0.3s (High Energy)</option>
              <option value="0.4">0.4s (TikTok Pacing)</option>
              <option value="0.6">0.6s (Podcast Pacing)</option>
            </select>
          </div>
        </div>
      )}

      {/* Typography & Formatting — Immediately Visible With Zero Scrolling */}
      <div className="panel-section">
        <span className="mono-eyebrow">TYPOGRAPHY</span>

        <div className="control-row">
          <span className="control-label">Typeface</span>
          <select
            className="control-select"
            value={styleConfig.fontFamily}
            onChange={(e) => onUpdateStyle('fontFamily', e.target.value)}
          >
            <option value="Playfair Display">Playfair Display (Serif)</option>
            <option value="Montserrat">Montserrat Black</option>
            <option value="Poppins">Poppins Bold</option>
            <option value="Caveat">Caveat (Handwritten)</option>
            <option value="Silkscreen">Silkscreen (8-Bit Pixel)</option>
            <option value="Bangers">Bangers (Comic)</option>
            <option value="Inter">Inter Bold</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </div>

        <div className="dual-slider-row">
          <div className="compact-slider-item">
            <div className="slider-header">
              <span>Size</span>
              <span className="slider-val">{styleConfig.fontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={72}
              value={styleConfig.fontSize}
              onChange={(e) => onUpdateStyle('fontSize', Number(e.target.value))}
            />
          </div>
          <div className="compact-slider-item">
            <div className="slider-header">
              <span>Outline</span>
              <span className="slider-val">{styleConfig.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={18}
              value={styleConfig.strokeWidth}
              onChange={(e) =>
                onUpdateStyle('strokeWidth', Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="single-slider-row">
          <div className="slider-header">
            <span>Vertical Position</span>
            <span className="slider-val">{styleConfig.positionYPercent}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={90}
            value={styleConfig.positionYPercent}
            onChange={(e) =>
              onUpdateStyle('positionYPercent', Number(e.target.value))
            }
          />
        </div>
      </div>

      {/* Color Swatches & Motion */}
      <div className="panel-section">
        <span className="mono-eyebrow">COLORS &amp; MOTION</span>

        <div className="color-chips-grid">
          <label className="color-chip" title="Active Spoken Word">
            <input
              type="color"
              value={toColorInputValue(styleConfig.activeWordColor, '#00FF66')}
              onChange={(e) => onUpdateStyle('activeWordColor', e.target.value)}
            />
            <span className="color-chip-label">Active Word</span>
          </label>
          <label className="color-chip" title="Default Text">
            <input
              type="color"
              value={toColorInputValue(styleConfig.textColor, '#FFFFFF')}
              onChange={(e) => onUpdateStyle('textColor', e.target.value)}
            />
            <span className="color-chip-label">Text Color</span>
          </label>
          <label className="color-chip" title="Outline Border">
            <input
              type="color"
              value={toColorInputValue(styleConfig.strokeColor, '#000000')}
              onChange={(e) => onUpdateStyle('strokeColor', e.target.value)}
            />
            <span className="color-chip-label">Outline</span>
          </label>
          <label className="color-chip" title="Marker Tape">
            <input
              type="color"
              value={toColorInputValue(styleConfig.highlightTapeColor, '#FF0066')}
              onChange={(e) =>
                onUpdateStyle('highlightTapeColor', e.target.value)
              }
            />
            <span className="color-chip-label">Marker Tape</span>
          </label>
        </div>

        <div className="control-row mt-3">
          <span className="control-label">Word Motion</span>
          <select
            className="control-select"
            value={styleConfig.animationType}
            onChange={(e) =>
              onUpdateStyle('animationType', e.target.value as AnimationType)
            }
          >
            <option value="bounce">Bouncy Pop (Scale 1.15x)</option>
            <option value="glow">Neon Glow</option>
            <option value="none">Flat (Color Change Only)</option>
          </select>
        </div>

        <div className="toggles-grid mt-2">
          <label className="toggle-card">
            <span className="toggle-text">All-Caps</span>
            <input
              type="checkbox"
              checked={useUppercase}
              onChange={(e) => onToggleUppercase(e.target.checked)}
            />
            <span className="toggle-slider-sm" />
          </label>
          <label className="toggle-card">
            <span className="toggle-text">Auto Emojis</span>
            <input
              type="checkbox"
              checked={useEmojis}
              onChange={(e) => onToggleEmojis(e.target.checked)}
            />
            <span className="toggle-slider-sm" />
          </label>
        </div>
      </div>
    </div>
  );
}
