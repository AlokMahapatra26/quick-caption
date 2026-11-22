import {
  formatAudioSeconds,
  GROQ_LIMITS,
  useGroqUsage,
} from '../core/groqUsage';
import type { MultilingualModelSize } from '../types/caption';
import { SettingsIcon } from './Icons';

interface SettingsModalProps {
  open: boolean;
  silenceEnabled: boolean;
  silenceThreshold: number;
  groqApiKey: string;
  multilingualModelSize?: MultilingualModelSize;
  onClose: () => void;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
  onUpdateGroqApiKey: (key: string) => void;
  onChangeMultilingualModelSize?: (size: MultilingualModelSize) => void;
}

export function SettingsModal({
  open,
  silenceEnabled,
  silenceThreshold,
  groqApiKey,
  onClose,
  onToggleSilence,
  onChangeSilenceThreshold,
  onUpdateGroqApiKey,
}: SettingsModalProps) {
  const groqUsage = useGroqUsage();

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
            <div className="mono-eyebrow mb-2">CLOUD SPEECH (HINGLISH)</div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Groq API Key (Whisper Large v3)</strong>
                <p className="settings-row-desc">
                  Enables 95%+ accurate Hinglish code-switching in ~0.5s
                </p>
              </div>
              <span
                className="badge-pill"
                style={{
                  color: groqApiKey
                    ? 'var(--accent-green, #10b981)'
                    : 'var(--text-muted, #71717a)',
                }}
              >
                {groqApiKey ? 'Configured' : 'Optional'}
              </span>
            </div>
            <div
              className="settings-sub-row"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '8px',
              }}
            >
              <input
                type="password"
                className="control-input"
                placeholder="Paste Groq key (gsk_...)"
                value={groqApiKey}
                onChange={(e) => onUpdateGroqApiKey(e.target.value)}
              />
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-muted, #71717a)',
                }}
              >
                Free key from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-blue, #0070f3)',
                    textDecoration: 'underline',
                  }}
                >
                  console.groq.com/keys
                </a>
                . Saved securely in your local browser storage.
              </span>
            </div>

            {/* Live Daily Quota & Usage Meter */}
            <div className="groq-usage-card">
              <div className="groq-usage-header">
                <span className="groq-usage-title">Daily Free Quota</span>
                <span className="groq-usage-pct">
                  {Math.max(
                    0,
                    100 -
                      Math.round(
                        (groqUsage.audioSecondsUsedToday /
                          GROQ_LIMITS.DAILY_AUDIO_SECONDS) *
                          1000
                      ) /
                        10
                  )}% available
                </span>
              </div>
              <div className="groq-progress-track">
                <div
                  className="groq-progress-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        2,
                        (groqUsage.audioSecondsUsedToday /
                          GROQ_LIMITS.DAILY_AUDIO_SECONDS) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="groq-usage-stats-grid">
                <div className="groq-stat-item">
                  <span className="groq-stat-val">
                    {formatAudioSeconds(groqUsage.audioSecondsUsedToday)} / 8h
                  </span>
                  <span className="groq-stat-lbl">Audio Used Today</span>
                </div>
                <div className="groq-stat-item">
                  <span className="groq-stat-val">
                    {groqUsage.remainingDailyRequests} / 2,000
                  </span>
                  <span className="groq-stat-lbl">Requests Left</span>
                </div>
              </div>
              <div className="groq-usage-footer">
                <span>Resets daily at 00:00 UTC</span>
                {groqUsage.resetTime && (
                  <span>Reset in: {groqUsage.resetTime}</span>
                )}
              </div>
            </div>
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
                  ? 'WebGPU Active'
                  : 'CPU Mode'}
              </span>
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Whisper Speech Model</strong>
                <p className="settings-row-desc">
                  Ultra-fast in-browser English model (Whisper-Tiny)
                </p>
              </div>
              <span
                className="badge-pill"
                style={{ color: 'var(--accent-blue, #0070f3)' }}
              >
                Whisper Tiny.en
              </span>
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
