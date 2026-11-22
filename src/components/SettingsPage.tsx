import { useState } from 'react';
import {
  formatAudioSeconds,
  GROQ_LIMITS,
  useGroqUsage,
} from '../core/groqUsage';
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  KeyIcon,
  SettingsIcon,
} from './Icons';

interface SettingsPageProps {
  onBack: () => void;
  silenceEnabled: boolean;
  silenceThreshold: number;
  groqApiKey: string;
  onToggleSilence: (enabled: boolean) => void;
  onChangeSilenceThreshold: (threshold: number) => void;
  onUpdateGroqApiKey: (key: string) => void;
}

export function SettingsPage({
  onBack,
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

  const pctAvailable = Math.max(
    0,
    100 -
      Math.round(
        (groqUsage.audioSecondsUsedToday / GROQ_LIMITS.DAILY_AUDIO_SECONDS) *
          1000
      ) /
        10
  );

  return (
    <div className="settings-page-wrapper">
      <div className="settings-page-container">
        {/* Top Navigation Bar */}
        <div className="settings-page-nav">
          <button
            type="button"
            className="btn btn-secondary btn-back-studio"
            onClick={onBack}
          >
            <ArrowLeftIcon size={15} />
            <span>Back to Studio</span>
          </button>

          <div className="settings-nav-title">
            <SettingsIcon size={16} />
            <h2>Studio Settings &amp; AI Quota</h2>
          </div>

          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-console-link"
          >
            <span>Groq Console</span>
            <ExternalLinkIcon size={13} />
          </a>
        </div>

        <div className="settings-page-content">
          {/* ============================================================
              CARD 1: GROQ CLOUD SPEECH (HINGLISH) & LIVE QUOTA
              ============================================================ */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="card-header-titles">
                <span className="mono-eyebrow">CLOUD SPEECH ENGINE</span>
                <h3>Groq AI (Hinglish &amp; Multilingual)</h3>
                <p className="card-header-desc">
                  Powered by OpenAI Whisper Large v3 on Groq LPUs. Delivers 95%+
                  accurate code-switching between Hindi and English in 0.4s.
                </p>
              </div>
              <span
                className={`badge-pill ${
                  groqApiKey ? 'badge-pill-success' : 'badge-pill-muted'
                }`}
              >
                {groqApiKey ? 'Connected & Active' : 'API Key Required'}
              </span>
            </div>

            {/* API Key Input Row */}
            <div className="settings-field-group">
              <label className="settings-field-label">
                <span className="flex items-center gap-1.5">
                  <KeyIcon size={14} />
                  <strong>Groq API Key</strong>
                </span>
                <span className="label-subtext">
                  Saved only in your browser&apos;s local storage (100% private)
                </span>
              </label>

              <div className="api-key-input-row">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="control-input key-input"
                  placeholder="Paste your key: gsk_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-toggle-vis"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-save-key"
                  disabled={apiKeyInput.trim() === groqApiKey}
                  onClick={handleSaveKey}
                >
                  {savedSuccess ? (
                    <>
                      <CheckIcon size={14} /> Saved
                    </>
                  ) : (
                    'Save Key'
                  )}
                </button>
              </div>

              <div className="field-hint">
                Don&apos;t have a key?{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a free Groq account (takes 30 seconds, no credit card
                  required) &rarr;
                </a>
              </div>
            </div>

            {/* LIVE DAILY QUOTA DASHBOARD */}
            <div className="settings-quota-dashboard">
              <div className="quota-dashboard-top">
                <div className="quota-title-row">
                  <h4>Daily Free Tier Usage</h4>
                  <span className="quota-pct-badge">
                    {pctAvailable}% Quota Available Today
                  </span>
                </div>
                <div className="groq-progress-track quota-large-track">
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
              </div>

              <div className="quota-stats-3col">
                <div className="quota-metric-box">
                  <span className="metric-box-val">
                    {formatAudioSeconds(groqUsage.audioSecondsUsedToday)}
                  </span>
                  <span className="metric-box-sub">
                    used of 8h (28,800s) ceiling
                  </span>
                  <span className="metric-box-title">Audio Consumed Today</span>
                </div>

                <div className="quota-metric-box">
                  <span className="metric-box-val">
                    {groqUsage.remainingDailyRequests.toLocaleString()}
                  </span>
                  <span className="metric-box-sub">
                    requests left of 2,000 / day
                  </span>
                  <span className="metric-box-title">Daily Requests Remaining</span>
                </div>

                <div className="quota-metric-box">
                  <span className="metric-box-val">Every 24h</span>
                  <span className="metric-box-sub">
                    {groqUsage.resetTime
                      ? `Reset in: ${groqUsage.resetTime}`
                      : 'Resets at 00:00 UTC daily'}
                  </span>
                  <span className="metric-box-title">Quota Reset Cycle</span>
                </div>
              </div>

              {/* Official Free Tier Quota Specs Table */}
              <div className="groq-limits-specs">
                <div className="limits-specs-title">
                  Groq Speech-to-Text Rate Limits (Official Free Tier)
                </div>
                <div className="limits-table-wrapper">
                  <table className="limits-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Requests / Min</th>
                        <th>Requests / Day</th>
                        <th>Audio / Hour</th>
                        <th>Audio / Day</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>whisper-large-v3-turbo</strong>
                        </td>
                        <td>20 / min</td>
                        <td>2,000 / day</td>
                        <td>7,200s (2 hrs)</td>
                        <td>28,800s (8 hrs)</td>
                        <td>
                          <span className="text-free-pill">100% Free</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              CARD 2: AUDIO & EDITING PREFERENCES
              ============================================================ */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="card-header-titles">
                <span className="mono-eyebrow">AUDIO &amp; PACING</span>
                <h3>Silence Removal &amp; Auto-Cut</h3>
                <p className="card-header-desc">
                  Automatically cuts awkward pauses and dead air in speech to
                  keep short-form Reels and Shorts fast-paced.
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">
                  <strong>Enable Smart Auto-Cut</strong>
                  <span className="badge-beta">BETA</span>
                </div>
                <p className="settings-row-desc">
                  Jump-cuts silence segments longer than your threshold without
                  re-encoding audio
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
              <div className="settings-sub-row mt-2">
                <span className="control-label">Silence Threshold</span>
                <select
                  className="control-select"
                  value={String(silenceThreshold)}
                  onChange={(e) =>
                    onChangeSilenceThreshold(Number(e.target.value))
                  }
                >
                  <option value="0.3">
                    0.3s (High Energy / Fast Jump-cuts)
                  </option>
                  <option value="0.4">
                    0.4s (TikTok &amp; Reels Standard - Recommended)
                  </option>
                  <option value="0.6">0.6s (Gentle / Podcast &amp; Story)</option>
                </select>
              </div>
            )}
          </section>

          {/* ============================================================
              CARD 3: HARDWARE ACCELERATION & IN-BROWSER AI
              ============================================================ */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="card-header-titles">
                <span className="mono-eyebrow">IN-BROWSER ENGINE</span>
                <h3>Local Processing &amp; Privacy</h3>
                <p className="card-header-desc">
                  Speech recognition for standard English runs 100% on-device in
                  WebAssembly/WebGPU.
                </p>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Hardware Acceleration</strong>
                <p className="settings-row-desc">
                  {typeof navigator !== 'undefined' && 'gpu' in navigator
                    ? 'WebGPU active for neural network operations'
                    : 'WebAssembly CPU mode active (multi-thread capped)'}
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
                <strong>Local English Whisper Model</strong>
                <p className="settings-row-desc">
                  Whisper-Tiny (quantized) runs completely offline in your
                  browser memory
                </p>
              </div>
              <span
                className="badge-pill"
                style={{ color: 'var(--accent-blue, #0070f3)' }}
              >
                whisper-tiny.en
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <strong>Privacy &amp; Data Security</strong>
                <p className="settings-row-desc">
                  Video files never leave your computer or get uploaded to
                  untrusted servers
                </p>
              </div>
              <span
                className="badge-pill"
                style={{ color: 'var(--accent-green, #10b981)' }}
              >
                100% Client-Side
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;
