import { useState } from 'react';
import type {
  AnimationType,
  PresetKey,
  SubtitleStyleConfig,
} from '../types/caption';
import {
  MoveVerticalIcon,
  PaletteIcon,
  SlidersIcon,
  StyleIcon,
  TuneOptionsIcon,
} from './Icons';
import { getTemplateLabel } from './TemplatesPanel';

type MobileStyleSubTab = 'font' | 'size' | 'position' | 'colors' | 'options';

const FONT_CATALOG: { value: string; label: string }[] = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Syne', label: 'Syne' },
  { value: 'Unbounded', label: 'Unbounded' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Plus Jakarta Sans', label: 'Jakarta' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Space Grotesk', label: 'Space' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'Instrument Serif', label: 'Instrument' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Permanent Marker', label: 'Marker' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Bangers', label: 'Bangers' },
  { value: 'Silkscreen', label: '8-Bit' },
  { value: 'JetBrains Mono', label: 'Mono' },
];

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
  const [mobileSubTab, setMobileSubTab] = useState<MobileStyleSubTab>('font');

  return (
    <div className="tab-pane active style-tab-pane">
      {/* ============================================================
          DESKTOP LAYOUT (> 860px) — 100% unchanged full vertical panel
          ============================================================ */}
      <div className="desktop-style-layout">
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
                onChange={(e) =>
                  onChangeSilenceThreshold(Number(e.target.value))
                }
              >
                <option value="0.3">0.3s (High Energy)</option>
                <option value="0.4">0.4s (TikTok Pacing)</option>
                <option value="0.6">0.6s (Podcast Pacing)</option>
              </select>
            </div>
          </div>
        )}

        {/* Typography & Formatting */}
        <div className="panel-section">
          <span className="mono-eyebrow">TYPOGRAPHY</span>

          <div className="control-row">
            <span className="control-label">Typeface</span>
            <select
              className="control-select"
              value={styleConfig.fontFamily}
              onChange={(e) => onUpdateStyle('fontFamily', e.target.value)}
            >
              <optgroup label="Bold &amp; Impact">
                <option value="Montserrat">Montserrat Black</option>
                <option value="Anton">Anton (Condensed Impact)</option>
                <option value="Bebas Neue">Bebas Neue (Tall Cinema)</option>
                <option value="Oswald">Oswald (Editorial Bold)</option>
                <option value="Syne">Syne (Wide Agency)</option>
                <option value="Unbounded">Unbounded (Futuristic)</option>
              </optgroup>
              <optgroup label="Clean Modern">
                <option value="Inter">Inter Bold</option>
                <option value="Poppins">Poppins Bold</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="DM Sans">DM Sans (Minimal)</option>
                <option value="Space Grotesk">Space Grotesk (Tech)</option>
              </optgroup>
              <optgroup label="Editorial Serif">
                <option value="Playfair Display">
                  Playfair Display (Serif)
                </option>
                <option value="Instrument Serif">
                  Instrument Serif (Tall)
                </option>
                <option value="Cinzel">Cinzel (Luxury Cinema)</option>
              </optgroup>
              <optgroup label="Handwritten &amp; Script">
                <option value="Caveat">Caveat (Handwritten)</option>
                <option value="Permanent Marker">Permanent Marker</option>
                <option value="Pacifico">Pacifico (Brush Script)</option>
              </optgroup>
              <optgroup label="Display &amp; Mono">
                <option value="Bangers">Bangers (Comic)</option>
                <option value="Silkscreen">Silkscreen (8-Bit Pixel)</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </optgroup>
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
                onChange={(e) =>
                  onUpdateStyle('fontSize', Number(e.target.value))
                }
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
              <span className="slider-val">
                {styleConfig.positionYPercent}%
              </span>
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
                value={toColorInputValue(
                  styleConfig.activeWordColor,
                  '#00FF66'
                )}
                onChange={(e) =>
                  onUpdateStyle('activeWordColor', e.target.value)
                }
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
                value={toColorInputValue(
                  styleConfig.highlightTapeColor,
                  '#FF0066'
                )}
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

      {/* ============================================================
          MOBILE VIDEO EDITOR TRAY (<= 860px ONLY)
          Horizontal sub-tool strip + focused live control right under preview
          ============================================================ */}
      <div className="mobile-style-tray">
        {/* Horizontal Icon Sub-Tool Bar */}
        <div className="mobile-subtool-bar">
          <button
            type="button"
            className={`mobile-subtool-btn${mobileSubTab === 'font' ? ' active' : ''}`}
            onClick={() => setMobileSubTab('font')}
          >
            <StyleIcon size={14} />
            <span>Font</span>
          </button>
          <button
            type="button"
            className={`mobile-subtool-btn${mobileSubTab === 'size' ? ' active' : ''}`}
            onClick={() => setMobileSubTab('size')}
          >
            <SlidersIcon size={14} />
            <span>Size</span>
          </button>
          <button
            type="button"
            className={`mobile-subtool-btn${mobileSubTab === 'position' ? ' active' : ''}`}
            onClick={() => setMobileSubTab('position')}
          >
            <MoveVerticalIcon size={14} />
            <span>Position</span>
          </button>
          <button
            type="button"
            className={`mobile-subtool-btn${mobileSubTab === 'colors' ? ' active' : ''}`}
            onClick={() => setMobileSubTab('colors')}
          >
            <PaletteIcon size={14} />
            <span>Colors</span>
          </button>
          <button
            type="button"
            className={`mobile-subtool-btn${mobileSubTab === 'options' ? ' active' : ''}`}
            onClick={() => setMobileSubTab('options')}
          >
            <TuneOptionsIcon size={14} />
            <span>Options</span>
          </button>
        </div>

        {/* Focused Horizontal Control Area */}
        <div className="mobile-subtool-content">
          {mobileSubTab === 'font' && (
            <div className="mobile-h-scroll">
              {FONT_CATALOG.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`mobile-font-chip${styleConfig.fontFamily === f.value ? ' active' : ''}`}
                  style={{ fontFamily: `"${f.value}", sans-serif` }}
                  onClick={(e) => {
                    onUpdateStyle('fontFamily', f.value);
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      inline: 'center',
                      block: 'nearest',
                    });
                  }}
                >
                  <span className="mobile-font-aa">Aa</span>
                  <span className="mobile-font-name">{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {mobileSubTab === 'size' && (
            <div className="dual-slider-row mobile-compact-sliders">
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
                  onChange={(e) =>
                    onUpdateStyle('fontSize', Number(e.target.value))
                  }
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
          )}

          {mobileSubTab === 'position' && (
            <div className="single-slider-row mobile-compact-sliders">
              <div className="slider-header">
                <span>Vertical Position</span>
                <span className="slider-val">
                  {styleConfig.positionYPercent}%
                </span>
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
          )}

          {mobileSubTab === 'colors' && (
            <div className="mobile-h-scroll">
              <label className="color-chip mobile-color-pill">
                <input
                  type="color"
                  value={toColorInputValue(
                    styleConfig.activeWordColor,
                    '#00FF66'
                  )}
                  onChange={(e) =>
                    onUpdateStyle('activeWordColor', e.target.value)
                  }
                />
                <span className="color-chip-label">Active</span>
              </label>
              <label className="color-chip mobile-color-pill">
                <input
                  type="color"
                  value={toColorInputValue(styleConfig.textColor, '#FFFFFF')}
                  onChange={(e) => onUpdateStyle('textColor', e.target.value)}
                />
                <span className="color-chip-label">Text</span>
              </label>
              <label className="color-chip mobile-color-pill">
                <input
                  type="color"
                  value={toColorInputValue(styleConfig.strokeColor, '#000000')}
                  onChange={(e) => onUpdateStyle('strokeColor', e.target.value)}
                />
                <span className="color-chip-label">Outline</span>
              </label>
              <label className="color-chip mobile-color-pill">
                <input
                  type="color"
                  value={toColorInputValue(
                    styleConfig.highlightTapeColor,
                    '#FF0066'
                  )}
                  onChange={(e) =>
                    onUpdateStyle('highlightTapeColor', e.target.value)
                  }
                />
                <span className="color-chip-label">Tape</span>
              </label>
            </div>
          )}

          {mobileSubTab === 'options' && (
            <div className="mobile-h-scroll">
              {(['bounce', 'glow', 'none'] as AnimationType[]).map((anim) => (
                <button
                  key={anim}
                  type="button"
                  className={`filter-pill${styleConfig.animationType === anim ? ' active' : ''}`}
                  onClick={() => onUpdateStyle('animationType', anim)}
                >
                  {anim === 'bounce'
                    ? 'Pop'
                    : anim === 'glow'
                      ? 'Glow'
                      : 'Flat'}
                </button>
              ))}
              <label className="toggle-card mobile-toggle-pill">
                <span className="toggle-text">CAPS</span>
                <input
                  type="checkbox"
                  checked={useUppercase}
                  onChange={(e) => onToggleUppercase(e.target.checked)}
                />
                <span className="toggle-slider-sm" />
              </label>
              <label className="toggle-card mobile-toggle-pill">
                <span className="toggle-text">Emojis</span>
                <input
                  type="checkbox"
                  checked={useEmojis}
                  onChange={(e) => onToggleEmojis(e.target.checked)}
                />
                <span className="toggle-slider-sm" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
