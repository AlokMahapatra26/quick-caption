import { useEffect, useRef, useState } from 'react';
import { useGroqUsage } from '../core/groqUsage';
import {
  getLanguageOption,
  MORE_LANGUAGES,
  PRIMARY_LANGUAGES,
} from '../core/languages';
import type {
  CaptionDensity,
  CaptionLanguage,
  CaptionTranscribeConfig,
} from '../types/caption';
import { formatTime } from '../utils/formatTime';
import { CheckIcon, KeyIcon, PlayIcon } from './Icons';

interface LanguagePromptModalProps {
  open: boolean;
  selectedLanguage: CaptionLanguage;
  selectedDensity: CaptionDensity;
  translateToEnglish: boolean;
  videoUrl: string | null;
  videoFilename: string;
  videoDuration: number;
  groqApiKey: string;
  onUpdateGroqApiKey: (key: string) => void;
  onConfirm: (config: CaptionTranscribeConfig) => void;
  onClose: () => void;
}

export function LanguagePromptModal({
  open,
  selectedLanguage,
  selectedDensity,
  translateToEnglish: initialTranslate,
  videoUrl,
  videoFilename,
  videoDuration,
  groqApiKey,
  onUpdateGroqApiKey,
  onConfirm,
  onClose,
}: LanguagePromptModalProps) {
  const [lang, setLang] = useState<CaptionLanguage>(selectedLanguage);
  const [density, setDensity] = useState<CaptionDensity>(selectedDensity);
  const [translateToEnglish, setTranslateToEnglish] =
    useState<boolean>(initialTranslate);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(groqApiKey);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const groqUsage = useGroqUsage();

  // Sync modal draft state whenever opened
  useEffect(() => {
    if (open) {
      setLang(selectedLanguage);
      setDensity(selectedDensity);
      setTranslateToEnglish(initialTranslate);
      setApiKeyInput(groqApiKey);
      setMoreOpen(false);
      setLangQuery('');
      setIsPreviewPlaying(false);
    } else if (previewVideoRef.current) {
      previewVideoRef.current.pause();
      setIsPreviewPlaying(false);
    }
  }, [open, selectedLanguage, selectedDensity, initialTranslate, groqApiKey]);

  // Close "More languages" popover on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  if (!open) return null;

  const isMoreLanguageSelected = MORE_LANGUAGES.some((l) => l.id === lang);
  const activeLangMeta = getLanguageOption(lang);
  const previewSample = translateToEnglish
    ? 'How are you doing?'
    : activeLangMeta.samplePreview;

  const requiresGroq = lang !== 'english' || translateToEnglish;
  const hasSavedKey = Boolean(groqApiKey.trim());
  const needsGroqKey = requiresGroq && !hasSavedKey;

  const filteredMoreLanguages = MORE_LANGUAGES.filter((item) =>
    item.label.toLowerCase().includes(langQuery.trim().toLowerCase())
  );

  const togglePreviewPlay = () => {
    const vid = previewVideoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      void vid.play();
      setIsPreviewPlaying(true);
    } else {
      vid.pause();
      setIsPreviewPlaying(false);
    }
  };

  const handleGenerate = () => {
    if (needsGroqKey) {
      const trimmed = apiKeyInput.trim();
      if (!trimmed) return;
      onUpdateGroqApiKey(trimmed);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
    onConfirm({
      language: lang,
      density,
      translateToEnglish,
    });
  };

  const canSubmit = !needsGroqKey || Boolean(apiKeyInput.trim());

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card cap-setup-modal">
        {/* Header */}
        <div className="cap-setup-header">
          <div>
            <h3>Caption your video</h3>
            <p className="modal-subtitle">
              Three quick choices, then we start transcribing.
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Two-column Body */}
        <div className="cap-setup-body">
          {/* Left Column: Video Preview */}
          <div className="cap-setup-preview-col">
            <div
              className="cap-preview-player"
              onClick={togglePreviewPlay}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePreviewPlay();
                }
              }}
              aria-label={isPreviewPlaying ? 'Pause video preview' : 'Play video preview'}
            >
              {videoUrl ? (
                <video
                  ref={previewVideoRef}
                  src={videoUrl}
                  playsInline
                  preload="metadata"
                  onEnded={() => setIsPreviewPlaying(false)}
                />
              ) : (
                <div className="cap-preview-empty">No video</div>
              )}

              {!isPreviewPlaying && (
                <div className="cap-preview-play-overlay">
                  <span className="cap-preview-play-circle">
                    <PlayIcon size={18} />
                  </span>
                </div>
              )}

              <span className="cap-preview-duration">
                {formatTime(videoDuration)}
              </span>
            </div>

            <div className="cap-preview-meta">
              <div className="cap-preview-filename" title={videoFilename}>
                {videoFilename || 'video.mp4'}
              </div>
              <div className="cap-preview-hint">
                {isPreviewPlaying
                  ? 'Tap the video to pause'
                  : 'Tap the video to play it'}
              </div>
            </div>
          </div>

          {/* Right Column: 3 Steps */}
          <div className="cap-setup-steps-col">
            {/* Step 1: Spoken Language */}
            <div className="cap-step-block">
              <div className="cap-step-heading">
                <span className="cap-step-num">1</span>
                <span>What language is spoken?</span>
                {requiresGroq && hasSavedKey && (
                  <span className="cap-quota-hint">
                    • {groqUsage.remainingDailyRequests} free left today
                  </span>
                )}
              </div>

              <div className="cap-lang-pills">
                {PRIMARY_LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`cap-lang-pill${lang === item.id ? ' active' : ''}`}
                    onClick={() => {
                      setLang(item.id);
                      setMoreOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="cap-more-lang-wrap" ref={moreMenuRef}>
                  <button
                    type="button"
                    className={`cap-lang-pill cap-more-pill${
                      isMoreLanguageSelected || moreOpen ? ' active' : ''
                    }`}
                    onClick={() => setMoreOpen((prev) => !prev)}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span>
                      {isMoreLanguageSelected
                        ? activeLangMeta.label
                        : 'More languages'}
                    </span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {moreOpen && (
                    <div className="cap-more-dropdown">
                      <input
                        type="text"
                        className="cap-more-search"
                        placeholder="Search language..."
                        value={langQuery}
                        onChange={(e) => setLangQuery(e.target.value)}
                        autoFocus
                      />
                      <div className="cap-more-list">
                        {filteredMoreLanguages.length > 0 ? (
                          filteredMoreLanguages.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className={`cap-more-item${
                                lang === item.id ? ' active' : ''
                              }`}
                              onClick={() => {
                                setLang(item.id);
                                setMoreOpen(false);
                                setLangQuery('');
                              }}
                            >
                              <span>{item.label}</span>
                              {lang === item.id && <CheckIcon size={12} />}
                            </button>
                          ))
                        ) : (
                          <div className="cap-more-empty">No match found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="cap-sample-preview-bar">
                <span>Captions will look like</span>{' '}
                <strong>{previewSample}</strong>
              </div>
            </div>

            {/* Step 2: Which captions? */}
            <div className="cap-step-block">
              <div className="cap-step-heading">
                <span className="cap-step-num">2</span>
                <span>Which captions?</span>
              </div>

              <div className="cap-density-grid">
                <button
                  type="button"
                  className={`cap-choice-card${
                    density === 'full' ? ' active' : ''
                  }`}
                  onClick={() => setDensity('full')}
                >
                  <span className="cap-radio-dot" aria-hidden="true">
                    {density === 'full' && <span className="cap-radio-inner" />}
                  </span>
                  <div className="cap-choice-text">
                    <div className="cap-choice-title">Full captions</div>
                    <div className="cap-choice-desc">
                      Every word, timed to the voice
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`cap-choice-card${
                    density === 'important' ? ' active' : ''
                  }`}
                  onClick={() => setDensity('important')}
                >
                  <span className="cap-radio-dot" aria-hidden="true">
                    {density === 'important' && (
                      <span className="cap-radio-inner" />
                    )}
                  </span>
                  <div className="cap-choice-text">
                    <div className="cap-choice-title">Important only</div>
                    <div className="cap-choice-desc">
                      Key moments, one caption per idea
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Anything else? */}
            <div className="cap-step-block">
              <div className="cap-step-heading">
                <span className="cap-step-num">3</span>
                <span>Anything else?</span>
              </div>

              <button
                type="button"
                className={`cap-choice-card cap-check-card${
                  translateToEnglish ? ' active' : ''
                }`}
                onClick={() => setTranslateToEnglish((prev) => !prev)}
              >
                <span className="cap-checkbox-box" aria-hidden="true">
                  {translateToEnglish && <CheckIcon size={11} />}
                </span>
                <div className="cap-choice-text">
                  <div className="cap-choice-title">Translate to English</div>
                  <div className="cap-choice-desc">
                    Any spoken language, captions in English
                  </div>
                </div>
              </button>
            </div>

            {/* Inline Groq API Key Input when Cloud Whisper is needed */}
            {needsGroqKey && (
              <div className="groq-key-prompt-box">
                <div className="groq-key-label">
                  <span className="flex items-center gap-1">
                    <KeyIcon size={13} />
                    <strong>
                      Free Groq API Key Required for {activeLangMeta.label}
                      {translateToEnglish ? ' Translation' : ''}
                    </strong>
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Free Key &rarr;
                  </a>
                </div>
                <input
                  type="password"
                  className="control-input"
                  placeholder="Paste Groq API key (gsk_...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="cap-setup-footer">
          <button
            type="button"
            className="btn btn-secondary cap-footer-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary cap-footer-btn cap-generate-btn"
            disabled={!canSubmit}
            onClick={handleGenerate}
          >
            <span>Generate captions</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default LanguagePromptModal;
