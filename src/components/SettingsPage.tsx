import { useState } from 'react';
import {
  formatAudioSeconds,
  GROQ_LIMITS,
  useGroqUsage,
} from '../core/groqUsage';
import {
  CheckIcon,
  KeyIcon,
} from './Icons';

interface SettingsPageProps {
  onBack?: () => void;
  silenceEnabled: boolean;
  silenceThreshold: number;
  groqApiKey: string;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
  onUpdateGroqApiKey: (key: string) => void;
}

export function SettingsPage({
  silenceEnabled,
  silenceThreshold,
  groqApiKey,
  onToggleSilence,
  onChangeSilenceThreshold,
  onUpdateGroqApiKey,
}: SettingsPageProps) {
  const groqUsage = useGroqUsage();
  const [apiKeyInput, setApiKeyInput] = useState(groqApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = () => {
    onUpdateGroqApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isDirty = apiKeyInput.trim() !== groqApiKey.trim();
  const requestsUsed = Math.max(
    0,
    GROQ_LIMITS.DAILY_REQUESTS - groqUsage.remainingDailyRequests
  );
  const requestPctUsed = Math.min(
    100,
    Math.max(2, (requestsUsed / GROQ_LIMITS.DAILY_REQUESTS) * 100)
  );

  const audioPctUsed = Math.min(
    100,
    Math.max(
      2,
      (groqUsage.audioSecondsUsedToday / GROQ_LIMITS.DAILY_AUDIO_SECONDS) * 100
    )
  );

  return (
    <div className="settings-page-wrapper">
      <div className="settings-page-container">
        {/* Clean Page Title Header */}
        <header className="settings-page-header">
          <div className="settings-title-group">
            <h2>Settings</h2>
            <p>Configure speech recognition engines and audio preferences</p>
          </div>
        </header>

        <div className="settings-sections-stack">
          {/* SECTION 1: CLOUD SPEECH (GROQ AI) */}
          <section className="settings-section">
            <div className="settings-section-head">
              <div>
                <h3>Cloud Speech (Groq AI)</h3>
                <p>
                  Whisper Large v3 on Groq LPUs for studio-grade Hinglish and 0.4s transcription.
                </p>
              </div>
              <div
                className={`settings-connection-status ${
                  groqApiKey ? 'is-connected' : 'is-disconnected'
                }`}
              >
                <span className="status-dot" />
                <span className="status-label">
                  {groqApiKey ? 'Connected' : 'Key required'}
                </span>
              </div>
            </div>

            {/* API Key Input */}
            <div className="settings-key-field">
              <label htmlFor="groq-key-input" className="settings-field-title">
                API Key
              </label>

              <div className="settings-input-group">
                <div className="input-with-icon">
                  <span className="input-lead-icon">
                    <KeyIcon size={14} />
                  </span>
                  <input
                    id="groq-key-input"
                    type={showKey ? 'text' : 'password'}
                    className="settings-input"
                    placeholder="gsk_..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-trailing-action"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button
                  type="button"
                  className={`btn-save-action ${
                    savedSuccess ? 'btn-saved' : ''
                  }`}
                  disabled={!isDirty}
                  onClick={handleSaveKey}
                >
                  {savedSuccess ? (
                    <>
                      <CheckIcon size={13} />
                      <span>Saved</span>
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>

              <span className="settings-help-text">
                Free tier includes 2,000 requests/day &amp; 8 hours audio daily.{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get a free key &rarr;
                </a>
              </span>
            </div>

            {/* Clean, Refined Multi-Limit Quota Dashboard */}
            <div className="settings-quota-section">
              <div className="quota-section-head">
                <span className="quota-section-title">Live Quota &amp; Rate Limits</span>
                <span className="quota-reset-pill">
                  {groqUsage.resetTime
                    ? `Reset: ${groqUsage.resetTime}`
                    : 'Resets daily at 00:00 UTC'}
                </span>
              </div>

              {/* 1. Daily Requests Meter */}
              <div className="quota-meter-block">
                <div className="quota-meter-labels">
                  <span className="meter-name">Daily Requests</span>
                  <span className="meter-val">
                    <strong>{groqUsage.remainingDailyRequests.toLocaleString()}</strong>
                    <span className="meter-total"> / 2,000 left today</span>
                  </span>
                </div>
                <div className="quota-bar-track">
                  <div
                    className="quota-bar-fill"
                    style={{ width: `${requestPctUsed}%` }}
                  />
                </div>
              </div>

              {/* 2. Daily Audio Duration Meter */}
              <div className="quota-meter-block">
                <div className="quota-meter-labels">
                  <span className="meter-name">Daily Audio Processed</span>
                  <span className="meter-val">
                    <strong>{formatAudioSeconds(groqUsage.audioSecondsUsedToday)}</strong>
                    <span className="meter-total"> / 8h (28,800s) ceiling</span>
                  </span>
                </div>
                <div className="quota-bar-track">
                  <div
                    className="quota-bar-fill fill-cyan"
                    style={{ width: `${audioPctUsed}%` }}
                  />
                </div>
              </div>

              {/* 3. Official 4-Limit Spec Grid */}
              <div className="quota-limits-pills">
                <div className="limit-pill-item">
                  <span className="pill-item-lbl">Requests / Min</span>
                  <span className="pill-item-val">20 / min</span>
                </div>
                <div className="limit-pill-item">
                  <span className="pill-item-lbl">Requests / Day</span>
                  <span className="pill-item-val">2,000 / day</span>
                </div>
                <div className="limit-pill-item">
                  <span className="pill-item-lbl">Audio / Hour</span>
                  <span className="pill-item-val">7,200s (2 hrs)</span>
                </div>
                <div className="limit-pill-item">
                  <span className="pill-item-lbl">Audio / Day</span>
                  <span className="pill-item-val">28,800s (8 hrs)</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: AUDIO & PACING */}
          <section className="settings-section">
            <div className="settings-section-head">
              <div>
                <h3>Audio &amp; Pacing</h3>
                <p>
                  Pacing and smart jump-cuts for short-form Reels and Shorts.
                </p>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="toggle-row-text">
                <div className="toggle-row-title">
                  <strong>Smart Silence Removal</strong>
                  <span className="pill-beta">Beta</span>
                </div>
                <p>
                  Automatically jump-cuts dead air pauses without re-encoding audio.
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
              <div className="settings-threshold-row">
                <span className="threshold-label">Pause threshold</span>
                <select
                  className="settings-select"
                  value={String(silenceThreshold)}
                  onChange={(e) =>
                    onChangeSilenceThreshold(Number(e.target.value))
                  }
                >
                  <option value="0.3">0.3s &mdash; Fast paced / High energy</option>
                  <option value="0.4">0.4s &mdash; Reels &amp; TikTok standard</option>
                  <option value="0.6">0.6s &mdash; Relaxed / Story &amp; Podcast</option>
                </select>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;
