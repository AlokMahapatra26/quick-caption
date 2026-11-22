import type { CaptionLanguage } from '../types/caption';
import { CheckIcon, GlobeIcon, LanguageIcon, ScriptIcon } from './Icons';

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
            <h3>Select Language &amp; Script</h3>
            <p className="modal-subtitle">
              Choose your audio language and caption writing script
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
              selectedLanguage === 'hinglish' ? ' active' : ''
            }`}
            onClick={() => onConfirm('hinglish')}
          >
            <div className="lang-option-icon-box">
              <GlobeIcon size={18} />
            </div>
            <div className="lang-option-text">
              <div className="lang-option-name">
                Latin Script (Hinglish)
                {selectedLanguage === 'hinglish' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Spoken Hindi written in English letters (e.g. namaste doston)
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`lang-prompt-option${
              selectedLanguage === 'hindi' ? ' active' : ''
            }`}
            onClick={() => onConfirm('hindi')}
          >
            <div className="lang-option-icon-box">
              <ScriptIcon size={18} />
            </div>
            <div className="lang-option-text">
              <div className="lang-option-name">
                Devanagari Script (Hindi)
                {selectedLanguage === 'hindi' && (
                  <span className="lang-active-check">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>
              <div className="lang-option-detail">
                Spoken Hindi written in native Devanagari script (e.g. नमस्ते दोस्तों)
              </div>
            </div>
          </button>

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
                Standard English dialogue and captions
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

