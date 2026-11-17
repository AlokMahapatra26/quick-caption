import type { ExportModalState } from '../hooks/useStudioController';
import { DownloadIcon } from './Icons';

interface ExportModalProps {
  state: ExportModalState;
  onClose: () => void;
}

export function ExportModal({ state, onClose }: ExportModalProps) {
  if (!state.open) return null;

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Client-Side Video Export</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>{state.statusDesc}</p>
          <div className="export-progress-bar">
            <div
              className="export-progress-fill"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <span className="export-percent">{state.progress}%</span>

          {state.downloadUrl && (
            <div className="export-download-area">
              <a
                className="btn btn-primary btn-full"
                href={state.downloadUrl}
                download={state.downloadFilename}
              >
                <DownloadIcon />
                Download Captioned MP4
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
