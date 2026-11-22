import type { CaptionLanguage } from '../types/caption';
import { CheckIcon, GlobeIcon, LanguageIcon } from './Icons';

interface LanguagePromptModalProps {
  open: boolean;
  selectedLanguage: CaptionLanguage;
  onConfirm: (lang: CaptionLanguage) => void;
  onClose: () => void;
}

export function LanguagePromptModal({
  open,
  selectedLanguage,
  onConfirm,
  onClose,
}: LanguagePromptModalProps) {
  if (!open) return null;

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
            <h3>Select Audio Language</h3>
            <p className="modal-subtitle">
              Choose the primary language spoken in your video
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
                English
                {selectedLanguage === 'english' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Standard English dialogue
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`lang-prompt-option${
              selectedLanguage !== 'english' ? ' active' : ''
            }`}
            onClick={() => onConfirm('hinglish')}
          >
            <div className="lang-option-icon-box">
              <GlobeIcon size={18} />
            </div>
            <div className="lang-option-text">
              <div className="lang-option-name">
                Non-English
                {selectedLanguage !== 'english' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Hinglish, Hindi, and 90+ global languages
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

