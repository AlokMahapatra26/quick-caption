import { SettingsIcon } from './Icons';

interface SettingsModalProps {
  open: boolean;
  silenceEnabled: boolean;
  silenceThreshold: number;
  onClose: () => void;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
}

export function SettingsModal({
  open,
  silenceEnabled,
  silenceThreshold,
  onClose,
  onToggleSilence,
  onChangeSilenceThreshold,
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
            <div className="mono-eyebrow mb-2">CLIENT-SIDE PERFORMANCE</div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Whisper AI Engine</strong>
                <p className="settings-row-desc">
                  Transformers.js (Quantized int8 • 39MB)
                </p>
              </div>
              <span className="badge-pill">WebGPU / WASM</span>
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
