import { localDateKey } from './briefing';

export { localDateKey } from './briefing';

export type JournalDay = {
  date: string;
  trendIds: string[];
  tags: string[];
  note: string;
  cover?: string;
};

export type JournalState = {
  days: Record<string, JournalDay>;
  saved: string[];
};

export const blankJournal: JournalState = { days: {}, saved: [] };
export const journalLimits = { tags: 8, tagLength: 24, noteLength: 500, coverMB: 10 } as const;

const storageKey = 'teez.journal.v1';
const coverLimit = 280_000;
const maxTrendIdLength = 96;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDayKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function strings(value: unknown, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(
    (item): item is string => typeof item === 'string' && item.length > 0 && item.length <= maxLength,
  ))];
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags = new Map<string, string>();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const tag = item.trim().slice(0, journalLimits.tagLength);
    if (tag && !tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
    if (tags.size === journalLimits.tags) break;
  }
  return [...tags.values()];
}

function safeCover(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > coverLimit) return undefined;
  return /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : undefined;
}

export function readJournal(): JournalState {
  const fresh: JournalState = { days: {}, saved: [] };
  if (typeof window === 'undefined') return fresh;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return fresh;
    const parsed: unknown = JSON.parse(stored);
    if (!object(parsed)) return fresh;
    const days = fresh.days;
    if (object(parsed.days)) {
      for (const [date, raw] of Object.entries(parsed.days)) {
        if (!isDayKey(date) || !object(raw)) continue;
        const cover = safeCover(raw.cover);
        days[date] = {
          date,
          trendIds: strings(raw.trendIds, maxTrendIdLength),
          tags: cleanTags(raw.tags),
          note: typeof raw.note === 'string' ? raw.note.slice(0, journalLimits.noteLength) : '',
          ...(cover ? { cover } : {}),
        };
      }
    }
    return { days, saved: strings(parsed.saved, maxTrendIdLength) };
  } catch {
    return fresh;
  }
}

export function writeJournal(state: JournalState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function recordLearned(state: JournalState, id: string, date = localDateKey()): JournalState {
  if (!isDayKey(date) || !id || id.length > maxTrendIdLength) return state;
  const day = state.days[date] ?? { date, trendIds: [], tags: [], note: '' };
  if (day.trendIds.includes(id)) return state;
  return { ...state, days: { ...state.days, [date]: { ...day, trendIds: [...day.trendIds, id] } } };
}

export function setDay(
  state: JournalState,
  date: string,
  patch: Partial<Pick<JournalDay, 'tags' | 'note' | 'cover'>>,
): JournalState {
  if (!isDayKey(date)) return state;
  const day = state.days[date] ?? { date, trendIds: [], tags: [], note: '' };
  const updated: JournalDay = { ...day };
  if ('tags' in patch) updated.tags = cleanTags(patch.tags);
  if (typeof patch.note === 'string') updated.note = patch.note.slice(0, journalLimits.noteLength);
  if ('cover' in patch) {
    const cover = safeCover(patch.cover);
    if (cover) updated.cover = cover;
    else if (patch.cover === undefined) delete updated.cover;
  }
  return { ...state, days: { ...state.days, [date]: updated } };
}

export function toggleSaved(state: JournalState, id: string): JournalState {
  if (!id || id.length > maxTrendIdLength) return state;
  return {
    ...state,
    saved: state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id],
  };
}

export function formatDateKey(date: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }): string {
  if (!isDayKey(date)) return date;
  return new Intl.DateTimeFormat('en', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export async function prepareCover(file: File): Promise<string> {
  if (!/^image\/(?:jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (!file.size || file.size > journalLimits.coverMB * 1024 * 1024) {
    throw new Error(`Choose an image smaller than ${journalLimits.coverMB} MB.`);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('This image could not be opened. Try another file.'));
      image.src = url;
    });
    const { naturalWidth: width, naturalHeight: height } = image;
    if (!width || !height || width * height > 60_000_000) {
      throw new Error('This image is too large. Resize it and try again.');
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not process the cover image.');

    for (const maxEdge of [700, 540, 420]) {
      const scale = Math.min(1, maxEdge / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.fillStyle = '#f8f6ee';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const cover = safeCover(canvas.toDataURL('image/jpeg', 0.78));
      if (cover) return cover;
    }
    throw new Error('This image could not be made small enough to save.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
