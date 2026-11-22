import type { MultilingualModelSize } from '../types/caption';
import { SettingsIcon } from './Icons';

interface SettingsModalProps {
  open: boolean;
  silenceEnabled: boolean;
  silenceThreshold: number;
  multilingualModelSize: MultilingualModelSize;
  onClose: () => void;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
  onChangeMultilingualModelSize: (size: MultilingualModelSize) => void;
}

export function SettingsModal({
  open,
  silenceEnabled,
  silenceThreshold,
  multilingualModelSize,
  onClose,
  onToggleSilence,
  onChangeSilenceThreshold,
  onChangeMultilingualModelSize,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <SettingsIcon size={16} />
            <h3>Studio Settings</h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-group">
            <div className="mono-eyebrow mb-2">AUDIO &amp; EDITING</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">
                  <strong>Auto-Cut Silences</strong>
                  <span className="badge-beta">BETA</span>
                </div>
                <p className="settings-row-desc">
                  Automatically detect and jump-cut dead pauses in video
                </p>
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

            {silenceEnabled && (
              <div className="settings-sub-row">
                <span className="control-label">Silence threshold</span>
                <select
                  className="control-select"
                  value={String(silenceThreshold)}
                  onChange={(e) =>
                    onChangeSilenceThreshold(Number(e.target.value))
                  }
                >
                  <option value="0.3">0.3s (High Energy / Aggressive)</option>
                  <option value="0.4">0.4s (TikTok / Reels Optimal)</option>
                  <option value="0.6">0.6s (Gentle / Podcast)</option>
                </select>
              </div>
            )}
          </div>

          <div className="settings-group mt-3">
            <div className="mono-eyebrow mb-2">SPEECH &amp; PERFORMANCE</div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>AI Acceleration</strong>
                <p className="settings-row-desc">
                  {typeof navigator !== 'undefined' && 'gpu' in navigator
                    ? 'WebGPU hardware acceleration active (GPU-powered)'
                    : 'WebAssembly CPU mode active (Thread-capped)'}
                </p>
              </div>
              <span
                className="badge-pill"
                style={{
                  color:
                    typeof navigator !== 'undefined' && 'gpu' in navigator
                      ? 'var(--accent-blue, #0070f3)'
                      : 'var(--text-muted, #71717a)',
                }}
              >
                {typeof navigator !== 'undefined' && 'gpu' in navigator
                  ? '⚡ WebGPU Active'
                  : 'WASM CPU'}
              </span>
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Non-English Model Size</strong>
                <p className="settings-row-desc">
                  Used when Non-English is selected (English always uses 39MB tiny.en)
                </p>
              </div>
              <select
                className="control-select"
                value={multilingualModelSize}
                onChange={(e) =>
                  onChangeMultilingualModelSize(
                    e.target.value as MultilingualModelSize
                  )
                }
              >
                <option value="base">Whisper Base (~75MB • Fast)</option>
                <option value="small">Whisper Small (~190MB • 8GB+ RAM)</option>
              </select>
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Privacy Guarantee</strong>
                <p className="settings-row-desc">
                  Video and audio stay strictly in your local browser
                </p>
              </div>
              <span
                className="badge-pill"
                style={{ color: 'var(--accent-green)' }}
              >
                Zero Cloud
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
