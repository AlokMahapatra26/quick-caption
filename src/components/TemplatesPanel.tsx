import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { SegmenterStatus } from '../core/personSegmenter';
import type { PresetKey } from '../types/caption';

export type TemplateCategory = 'all' | 'behind' | 'clean' | 'bold' | 'editorial';

export interface TemplateCatalogItem {
  key: PresetKey;
  label: string;
  category: Exclude<TemplateCategory, 'all'>;
  sample: string;
  fontClass: string;
  sampleStyle?: CSSProperties;
  variant?: 'behind' | 'editorialStack' | 'swissGrid' | 'auraPoster' | 'bigRed';
}

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  // Behind You (AI Cutout)
  {
    key: 'behind',
    label: 'GARNET',
    category: 'behind',
    sample: 'GARNET',
    fontClass: 'font-montserrat',
    sampleStyle: { color: '#00FF66', letterSpacing: '0.02em' },
    variant: 'behind',
  },
  {
    key: 'haloArc',
    label: 'HALO ARC',
    category: 'behind',
    sample: '⌒ HALO ARC',
    fontClass: 'font-montserrat',
    sampleStyle: { color: '#FACC15', letterSpacing: '0.04em' },
    variant: 'behind',
  },

  // Bold & Viral
  {
    key: 'hormozi',
    label: 'HORMOZI',
    category: 'bold',
    sample: 'VIRAL GROW',
    fontClass: 'font-montserrat',
    sampleStyle: { color: '#00FF66' },
  },
  {
    key: 'anchorage',
    label: 'ANCHORAGE',
    category: 'bold',
    sample: 'YELLOW BOX',
    fontClass: 'font-montserrat',
    sampleStyle: {
      background: '#FFE600',
      color: '#09090B',
      padding: '1px 6px',
      borderRadius: '3px',
      fontSize: '11.5px',
      display: 'inline-block',
      width: 'fit-content',
    },
  },
  {
    key: 'mrbeast',
    label: 'BEAST',
    category: 'bold',
    sample: '$1,000,000',
    fontClass: 'font-bangers',
    sampleStyle: { color: '#FFE600' },
  },
  {
    key: 'broadcast',
    label: 'BROADCAST',
    category: 'bold',
    sample: 'CYAN PUNCH',
    fontClass: 'font-montserrat',
    sampleStyle: { color: '#00D4FF' },
  },
  {
    key: 'chrome',
    label: 'CHROME',
    category: 'bold',
    sample: 'LIQUID METAL',
    fontClass: 'font-montserrat',
    sampleStyle: {
      background:
        'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 35%, #7DD3FC 55%, #475569 75%, #F8FAFC 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '0.02em',
    },
  },
  {
    key: 'kineticBlur',
    label: 'KINETIC BLUR',
    category: 'bold',
    sample: 'speed glow',
    fontClass: 'font-montserrat',
    sampleStyle: {
      color: '#FFB800',
      fontStyle: 'italic',
      textShadow:
        '-4px 0 8px rgba(255,184,0,0.7), 2px -3px 10px rgba(255,184,0,0.55)',
    },
  },
  {
    key: 'deepGlow',
    label: 'DEEP NEON',
    category: 'bold',
    sample: 'AURA BLOOM',
    fontClass: 'font-montserrat',
    sampleStyle: {
      color: '#FFFFFF',
      textShadow: '0 0 8px #EC4899, 0 0 18px #EC4899',
    },
  },
  {
    key: 'hollowImpact',
    label: 'HOLLOW IMPACT',
    category: 'bold',
    sample: 'OUTLINE POP',
    fontClass: 'font-montserrat',
    sampleStyle: {
      color: 'transparent',
      WebkitTextStroke: '1px #FFFFFF',
      letterSpacing: '0.03em',
    },
  },
  {
    key: 'pixel',
    label: 'PIXEL 8-BIT',
    category: 'bold',
    sample: 'LEVEL UP',
    fontClass: 'font-pixel',
    sampleStyle: {
      color: '#38BDF8',
      fontSize: '11.5px',
      textShadow: '2px 2px 0 #000000',
    },
  },

  // Clean & Aesthetic
  {
    key: 'liquidGlass',
    label: 'LIQUID GLASS',
    category: 'clean',
    sample: 'frosted glass',
    fontClass: 'font-inter',
    sampleStyle: {
      color: '#FFFFFF',
      background: 'rgba(255, 255, 255, 0.14)',
      border: '1px solid rgba(255, 255, 255, 0.32)',
      padding: '1px 8px',
      borderRadius: '999px',
      fontWeight: 600,
      fontSize: '11.5px',
      display: 'inline-block',
      width: 'fit-content',
    },
  },
  {
    key: 'aliPill',
    label: 'ALI WHITE PILL',
    category: 'clean',
    sample: 'clean focus',
    fontClass: 'font-poppins',
    sampleStyle: {
      background: '#FFFFFF',
      color: '#09090B',
      padding: '1px 8px',
      borderRadius: '6px',
      fontWeight: 700,
      fontSize: '11.5px',
      display: 'inline-block',
      width: 'fit-content',
    },
  },
  {
    key: 'capsule',
    label: 'CAPSULE PILL',
    category: 'clean',
    sample: 'active word',
    fontClass: 'font-poppins',
    sampleStyle: {
      background: '#7C3AED',
      color: '#FFFFFF',
      padding: '1px 7px',
      borderRadius: '6px',
      display: 'inline-block',
      width: 'fit-content',
    },
  },
  {
    key: 'cinema',
    label: 'CINEMA',
    category: 'clean',
    sample: 'Focus reveal',
    fontClass: 'font-inter',
    sampleStyle: {
      color: '#FFFFFF',
      textShadow: '0 0 10px rgba(255,255,255,0.65)',
      fontWeight: 600,
    },
  },
  {
    key: 'cleanShadow',
    label: 'CLEAN SHADOW',
    category: 'clean',
    sample: 'clean drop',
    fontClass: 'font-inter',
    sampleStyle: {
      color: '#FFFFFF',
      fontWeight: 700,
      textShadow: '2px 3px 6px rgba(0, 0, 0, 0.95)',
    },
  },
  {
    key: 'minimal',
    label: 'MINIMAL',
    category: 'clean',
    sample: 'Clean modern',
    fontClass: 'font-inter',
    sampleStyle: { color: '#FFFFFF' },
  },
  {
    key: 'terminal',
    label: 'TERMINAL',
    category: 'clean',
    sample: '> DEV_MODE',
    fontClass: 'font-mono',
    sampleStyle: { color: '#00FFAA' },
  },

  // Editorial & Poster
  {
    key: 'editorial',
    label: 'VOX HIGHLIGHT',
    category: 'editorial',
    sample: 'charge, which',
    fontClass: 'font-playfair',
    sampleStyle: {
      background: '#FF0066',
      color: '#FFF',
      padding: '0 4px',
      borderRadius: '2px',
      fontStyle: 'italic',
      display: 'inline-block',
      width: 'fit-content',
    },
  },
  {
    key: 'swissGrid',
    label: 'SWISS GRID',
    category: 'editorial',
    sample: 'STOP',
    fontClass: 'font-montserrat',
    variant: 'swissGrid',
  },
  {
    key: 'auraPoster',
    label: 'AURA MIX',
    category: 'editorial',
    sample: 'VIRAL',
    fontClass: 'font-montserrat',
    variant: 'auraPoster',
  },
  {
    key: 'editorialStack',
    label: 'EDITORIAL STACK',
    category: 'editorial',
    sample: 'editorial',
    fontClass: 'font-playfair',
    variant: 'editorialStack',
  },
  {
    key: 'bigRed',
    label: 'THE BIG RED',
    category: 'editorial',
    sample: 'READY',
    fontClass: 'font-playfair',
    variant: 'bigRed',
  },
  {
    key: 'scribble',
    label: 'SCRIBBLE',
    category: 'editorial',
    sample: 'handwritten',
    fontClass: 'font-caveat',
    sampleStyle: {
      background: '#FFE600',
      color: '#09090B',
      padding: '0 7px',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: 1.1,
      display: 'inline-block',
      width: 'fit-content',
      transform: 'rotate(-1.5deg)',
    },
  },
];

export function getTemplateLabel(key: PresetKey): string {
  return TEMPLATE_CATALOG.find((t) => t.key === key)?.label ?? key.toUpperCase();
}

const FILTER_PILLS: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'behind', label: 'Behind You' },
  { id: 'bold', label: 'Bold' },
  { id: 'clean', label: 'Clean' },
  { id: 'editorial', label: 'Editorial' },
];

interface TemplatesPanelProps {
  activePreset: PresetKey;
  segmenterStatus: SegmenterStatus;
  onSelectPreset: (preset: PresetKey) => void;
  onCustomizeClick: () => void;
}

export function TemplatesPanel({
  activePreset,
  segmenterStatus,
  onSelectPreset,
  onCustomizeClick,
}: TemplatesPanelProps) {
  const [category, setCategory] = useState<TemplateCategory>('all');

  const visibleTemplates =
    category === 'all'
      ? TEMPLATE_CATALOG
      : TEMPLATE_CATALOG.filter((t) => t.category === category);

  return (
    <div className="tab-pane active">
      {/* Category Filter Pills */}
      <div className="filter-pills-bar">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            className={`filter-pill${category === pill.id ? ' active' : ''}`}
            onClick={() => setCategory(pill.id)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Section Meta & Quick Customize Link */}
      <div className="section-header">
        <span className="mono-eyebrow">
          {(activePreset === 'behind' || activePreset === 'haloArc') &&
          segmenterStatus === 'loading'
            ? 'LOADING AI CUTOUT...'
            : `${visibleTemplates.length} TEMPLATES`}
        </span>
        <button
          type="button"
          className="link-btn-inline"
          onClick={onCustomizeClick}
        >
          Customize Style →
        </button>
      </div>

      {/* Symmetrical 2-Column Preset Grid */}
      <div className="presets-grid">
        {visibleTemplates.map((item) => {
          const isActive = activePreset === item.key;

          if (item.variant === 'behind') {
            return (
              <div
                key={item.key}
                className={`preset-card preset-card-behind${isActive ? ' active' : ''}`}
                onClick={() => onSelectPreset(item.key)}
              >
                <div className="preset-featured-badges">
                  <span className="badge-behind">BEHIND YOU</span>
                  {isActive && segmenterStatus !== 'idle' && (
                    <span
                      className={`segmenter-dot segmenter-dot-${segmenterStatus}`}
                      title={`AI Cutout: ${segmenterStatus}`}
                    />
                  )}
                </div>
                <div
                  className={`preset-sample ${item.fontClass}`}
                  style={item.sampleStyle}
                >
                  {item.sample}
                </div>
              </div>
            );
          }

          if (item.variant === 'editorialStack') {
            return (
              <div
                key={item.key}
                className={`preset-card${isActive ? ' active' : ''}`}
                onClick={() => onSelectPreset(item.key)}
              >
                <div className="preset-featured-badges">
                  <span className="badge-editorial">MAGAZINE</span>
                </div>
                <div className="preset-stack-preview">
                  <span className="preset-stack-hero font-playfair">
                    editorial
                  </span>
                </div>
              </div>
            );
          }

          if (item.variant === 'swissGrid') {
            return (
              <div
                key={item.key}
                className={`preset-card${isActive ? ' active' : ''}`}
                onClick={() => onSelectPreset(item.key)}
              >
                <div className="preset-badge">{item.label}</div>
                <div className="preset-swiss-preview">
                  <span className="swiss-big font-montserrat">STOP</span>
                  <span className="swiss-small font-montserrat">RIGHT NOW</span>
                </div>
              </div>
            );
          }

          if (item.variant === 'auraPoster') {
            return (
              <div
                key={item.key}
                className={`preset-card${isActive ? ' active' : ''}`}
                onClick={() => onSelectPreset(item.key)}
              >
                <div className="preset-badge">{item.label}</div>
                <div className="preset-aura-preview">
                  <span className="aura-big font-montserrat">VIRAL</span>
                  <span className="aura-serif font-playfair">story</span>
                </div>
              </div>
            );
          }

          if (item.variant === 'bigRed') {
            return (
              <div
                key={item.key}
                className={`preset-card${isActive ? ' active' : ''}`}
                onClick={() => onSelectPreset(item.key)}
              >
                <div className="preset-badge">{item.label}</div>
                <div className="preset-bigred-preview">
                  <span className="bigred-bg font-playfair">READY</span>
                  <span className="bigred-mini font-playfair">now</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.key}
              className={`preset-card${isActive ? ' active' : ''}`}
              onClick={() => onSelectPreset(item.key)}
            >
              <div className="preset-badge">{item.label}</div>
              <div
                className={`preset-sample ${item.fontClass}`}
                style={item.sampleStyle}
              >
                {item.sample}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
