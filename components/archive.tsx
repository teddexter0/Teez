'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, ImagePlus, Pencil, Plus } from 'lucide-react';
import type { Trend } from '../lib/catalog';
import { formatDateKey, journalLimits, localDateKey, prepareCover, type JournalDay, type JournalState } from '../lib/journal';
import { CoverArt } from './art';

type DayPatch = Partial<Pick<JournalDay, 'tags' | 'note' | 'cover'>>;
type Edition = JournalDay & { sample?: boolean };
const sample: Edition[] = [
  { date: '2024-08-23', trendIds: ['brat-summer', 'girl-dinner', 'booktok'], tags: ['music', 'style', 'books'], note: 'The summer that made neon green a whole mood.', sample: true },
  { date: '2024-08-16', trendIds: ['canon-event', 'delulu', 'quiet-luxury'], tags: ['memes', 'slang', 'style'], note: 'Internet shorthand, movie lore, and the art of looking expensive.', sample: true },
];

function Cover({ day, catalog }: { day: Edition; catalog: readonly Trend[] }) {
  const palette = catalog.find((trend) => trend.id === day.trendIds[0])?.art ?? 'lime';
  return day.cover ? <img className="cover-uploaded" src={day.cover} alt="Journal cover" /> :
    <CoverArt palette={palette} label={formatDateKey(day.date, { month: 'short', day: 'numeric' })} />;
}

function DayEditor({ day, onSave, onCancel }: { day: JournalDay; onSave: (patch: DayPatch) => void; onCancel: () => void }) {
  const [tags, setTags] = useState(day.tags.join(', '));
  const [note, setNote] = useState(day.note);
  const [cover, setCover] = useState(day.cover);
  const [coverLabel, setCoverLabel] = useState(day.cover ? 'Cover attached' : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!busy) onSave({ tags: tags.split(','), note, cover });
  }
  return <form className="journal-form" onSubmit={submit}>
    <label><span className="mono">Tags · separated by commas</span><input value={tags} onChange={(event) => setTags(event.target.value)} maxLength={journalLimits.tags * (journalLimits.tagLength + 2)} placeholder="e.g. slang, music, style" /></label>
    <label><span className="mono">Note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={journalLimits.noteLength} placeholder="What stuck with you?" /></label>
    <label><span className="mono"><ImagePlus size={13} aria-hidden /> Cover photo · optional</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setBusy(true); setError('');
        try { setCover(await prepareCover(file)); setCoverLabel(file.name); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not use that image.'); }
        finally { setBusy(false); }
      }} />
    </label>
    {coverLabel ? <div className="journal-actions"><small className="muted">{coverLabel}</small><button type="button" className="text-btn" onClick={() => { setCover(undefined); setCoverLabel(''); }}>Remove cover</button></div> : null}
    {error ? <p role="alert" className="form-error">{error}</p> : null}
    <div className="journal-actions"><button className="primary" disabled={busy}>{busy ? 'Preparing cover…' : 'Save entry'}</button><button type="button" className="text-btn" onClick={onCancel}>Cancel</button></div>
  </form>;
}

export function Archive({ catalog, journal, onUpdate, onPreview }: {
  catalog: readonly Trend[]; journal: JournalState; onUpdate: (date: string, patch: DayPatch) => void; onPreview: (trend: Trend) => void;
}) {
  const days: Edition[] = [...Object.values(journal.days), ...sample.filter((entry) => !journal.days[entry.date])].sort((a, b) => b.date.localeCompare(a.date));
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const day = days.find((item) => item.date === selected) ?? days[0];
  const entries = day.trendIds.flatMap((id) => { const trend = catalog.find((item) => item.id === id); return trend ? [trend] : []; });

  function openToday() {
    const today = localDateKey();
    if (!journal.days[today]) onUpdate(today, {});
    setSelected(today);
    setEditing(true);
  }

  return <section className="subpage wrap" aria-label="Archive">
    <div className="subhead">
      <div><div className="kicker mono"><CalendarDays size={15} className="kicker-mark" aria-hidden /> The Teez journal</div><h1>Archive<span className="accent">.</span></h1><p>A datebook of what you caught, with room for your own notes and cover art.</p></div>
      <button className="secondary" onClick={openToday}><Plus size={17} aria-hidden /> Today’s entry</button>
    </div>
    <div className="archive-layout">
      <div className="day-list" aria-label="Journal dates">
        {days.map((entry) => <button key={entry.date} className="day-tile" aria-pressed={day.date === entry.date} onClick={() => { setSelected(entry.date); setEditing(false); }}>
          <span className="day-thumb"><Cover day={entry} catalog={catalog} /></span>
          <span className="day-text"><strong>{formatDateKey(entry.date, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><span className="mono">{entry.sample ? 'Sample edition' : `${entry.trendIds.length} learned`}</span></span>
          <ChevronRight size={17} aria-hidden />
        </button>)}
      </div>
      <article className="journal-panel">
        <div className="journal-cover"><Cover day={day} catalog={catalog} /></div>
        <div className="journal-body">
          <span className="mono muted">{day.sample ? 'Sample edition' : 'Personal edition · this browser'}</span>
          <h2>{formatDateKey(day.date)}</h2>
          {day.tags.length ? <div className="tags">{day.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div> : null}
          {day.note ? <p className="journal-note">{day.note}</p> : null}
          {day.sample ? null : editing ? <DayEditor key={day.date} day={day} onSave={(patch) => { onUpdate(day.date, patch); setEditing(false); }} onCancel={() => setEditing(false)} /> :
            <button className="secondary" onClick={() => setEditing(true)}><Pencil size={15} aria-hidden /> Edit entry</button>}
          <div className="learned">
            <h3 className="mono">{day.sample ? 'In this sample' : 'What you learned'}</h3>
            {entries.length ? <ul className="learned-list">{entries.map((trend) => <li key={trend.id}><button onClick={() => onPreview(trend)}>{trend.title}<ArrowRight size={16} aria-hidden /></button></li>)}</ul> : <p className="journal-note">Trends you finish today will appear here.</p>}
          </div>
        </div>
      </article>
    </div>
  </section>;
}
