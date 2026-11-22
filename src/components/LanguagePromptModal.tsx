import { useState } from 'react';
import { useGroqUsage } from '../core/groqUsage';
import type { CaptionLanguage } from '../types/caption';
import { CheckIcon, GlobeIcon, KeyIcon, LanguageIcon } from './Icons';

interface LanguagePromptModalProps {
  open: boolean;
  selectedLanguage: CaptionLanguage;
  groqApiKey: string;
  onUpdateGroqApiKey: (key: string) => void;
  onConfirm: (lang: CaptionLanguage) => void;
  onClose: () => void;
}

export function LanguagePromptModal({
  open,
  selectedLanguage,
  groqApiKey,
  onUpdateGroqApiKey,
  onConfirm,
  onClose,
}: LanguagePromptModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState(groqApiKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const groqUsage = useGroqUsage();

  if (!open) return null;

  const handleSelectHinglish = () => {
    if (!groqApiKey.trim()) {
      setShowKeyInput(true);
    } else {
      onConfirm('hinglish');
    }
  };

  const handleSaveKeyAndConfirm = () => {
    if (apiKeyInput.trim()) {
      onUpdateGroqApiKey(apiKeyInput.trim());
      onConfirm('hinglish');
    }
  };

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card lang-prompt-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>Spoken Language</h3>
            <p className="modal-subtitle">
              Select your audio language for hardware-accelerated captions
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

        <div className="lang-prompt-options">
          {/* Option 1: English (100% Local In-Browser) */}
          <button
            type="button"
            className={`lang-prompt-option${
              selectedLanguage === 'english' ? ' active' : ''
            }`}
            onClick={() => onConfirm('english')}
          >
            <div className="lang-option-icon-box">
              <LanguageIcon size={18} />
            </div>
            <div className="lang-option-text">
              <div className="lang-option-name">
                English (Local AI)
                {selectedLanguage === 'english' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Fast in-browser speech recognition • 100% private and offline
              </div>
            </div>
          </button>

          {/* Option 2: Hinglish (Groq Whisper Large v3) */}
          <button
            type="button"
            className={`lang-prompt-option${
              selectedLanguage === 'hinglish' ? ' active' : ''
            }`}
            onClick={handleSelectHinglish}
          >
            <div className="lang-option-icon-box">
              <GlobeIcon size={18} />
            </div>
            <div className="lang-option-text">
              <div className="lang-option-name">
                Hinglish (Groq AI)
                {selectedLanguage === 'hinglish' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Studio-grade code-mixed Hindi &amp; English in Roman alphabet
                {groqApiKey.trim() && (
                  <span> • {groqUsage.remainingDailyRequests} free left today</span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Inline Groq API Key Input if Hinglish is selected without a key */}
        {showKeyInput && !groqApiKey.trim() && (
          <div className="groq-key-prompt-box">
            <div className="groq-key-label">
              <span className="flex items-center gap-1">
                <KeyIcon size={13} />
                <strong>Free Groq API Key Required</strong>
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
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary btn-full mt-2"
              disabled={!apiKeyInput.trim()}
              onClick={handleSaveKeyAndConfirm}
            >
              Save Key &amp; Transcribe Hinglish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default LanguagePromptModal;
