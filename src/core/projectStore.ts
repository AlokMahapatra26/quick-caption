import type {
  CaptionLanguage,
  PresetKey,
  RawWord,
  SubtitleStyleConfig,
} from '../types/caption';

export interface ProjectRecord {
  id: string;
  name: string;
  fileSize: number;
  duration: number;
  createdAt: number;
  updatedAt: number;
  language: CaptionLanguage;
  preset: PresetKey;
  wordCount: number;
  thumbnailDataUrl?: string;
  rawWords?: RawWord[];
  styleConfig?: SubtitleStyleConfig;
}

const STORAGE_KEY = 'autocaption_projects_v1';
const DB_NAME = 'autocaption_media_db';
const STORE_NAME = 'videos';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProjectVideoBlob(
  projectId: string,
  blob: Blob
): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not cache video in IndexedDB:', err);
  }
}

export async function getProjectVideoBlob(
  projectId: string
): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(projectId);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteProjectVideoBlob(projectId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export function loadProjects(): ProjectRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProjectRecord[]) : [];
  } catch {
    return [];
  }
}

export function upsertProjectRecord(record: ProjectRecord): ProjectRecord[] {
  const list = loadProjects();
  const idx = list.findIndex((p) => p.id === record.id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  // Keep latest 30 projects in localStorage metadata
  const trimmed = list.slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // If localStorage quota is tight, strip rawWords from older items
    const compact = trimmed.map((item, i) =>
      i > 5 ? { ...item, rawWords: undefined, thumbnailDataUrl: undefined } : item
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // ignore
    }
  }
  return trimmed;
}

export function removeProjectRecord(projectId: string): ProjectRecord[] {
  const next = loadProjects().filter((p) => p.id !== projectId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  void deleteProjectVideoBlob(projectId);
  return next;
}

export function captureVideoThumbnail(
  video: HTMLVideoElement
): string | undefined {
  try {
    const w = video.videoWidth || 360;
    const h = video.videoHeight || 640;
    const targetW = 240;
    const targetH = Math.round((targetW * h) / w);
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, targetW, targetH);
    return canvas.toDataURL('image/jpeg', 0.72);
  } catch {
    return undefined;
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

