'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import type { BriefingSlot } from '../lib/briefing';
import { TrendArt } from './art';

export function clock(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function Player({ queue, preview, saved, onSave, onLearn, onFinish, onExit }: {
  queue: BriefingSlot[]; preview: boolean; saved: readonly string[];
  onSave: (id: string) => void; onLearn: (id: string) => void;
  onFinish: () => void; onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [replay, setReplay] = useState({ key: 0, start: 0 });
  const completed = useRef(-1);
  const slot = queue[index];
  const { trend, seconds } = slot;
  const clipActive = elapsed - replay.start < trend.seconds * 1000;
  const remaining = queue.slice(index).reduce((sum, item) => sum + item.seconds, 0) - elapsed / 1000;

  useEffect(() => {
    const pauseOnHide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pauseOnHide);
    return () => document.removeEventListener('visibilitychange', pauseOnHide);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (!document.hidden) setElapsed((time) => Math.min(seconds * 1000, time + delta));
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, index, seconds]);

  const advance = useCallback(() => {
    if (completed.current >= index) return;
    completed.current = index;
    onLearn(trend.id);
    if (index === queue.length - 1) {
      onFinish();
      return;
    }
    setIndex(index + 1);
    setElapsed(0);
    setReplay({ key: 0, start: 0 });
    window.scrollTo(0, 0);
  }, [index, onFinish, onLearn, queue.length, trend.id]);

  const atEnd = elapsed >= seconds * 1000;
  // A single guarded advance handles both auto-play and a manual click at the boundary.
  useEffect(() => { if (atEnd) advance(); }, [atEnd, advance]);

  return (
    <section className="player wrap" aria-label={preview ? 'Trend preview' : 'Briefing player'}>
      <div className="player-top">
        <button className="text-btn" onClick={onExit}><ArrowLeft size={17} aria-hidden /> Exit {preview ? 'preview' : 'briefing'}</button>
        <span className="mono muted">{preview ? 'Preview' : `Card ${String(index + 1).padStart(2, '0')} / ${String(queue.length).padStart(2, '0')}`} · {clock(remaining)} left</span>
      </div>
      <div className="progress-segments" aria-hidden>
        {queue.map((item, position) => <span key={item.trend.id}><i style={{ width: `${position < index ? 100 : position === index ? (elapsed / (seconds * 1000)) * 100 : 0}%` }} /></span>)}
      </div>
      <div className="player-grid">
        <div>
          <div className="clip-frame">
            <TrendArt key={trend.id} trend={trend} variant="player" playing={playing && clipActive} replayKey={replay.key} />
          </div>
          <div className="clip-ticker mono"><span>Teez original · {trend.seconds}s</span><span>{!playing ? 'Paused' : clipActive ? 'Playing clip' : 'Reading time'}</span></div>
          <div className="clip-controls">
            <button className="secondary" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}{playing ? 'Pause' : 'Resume'}</button>
            <button className="secondary" disabled={clipActive || seconds * 1000 - elapsed < trend.seconds * 1000} onClick={() => { setReplay({ key: replay.key + 1, start: elapsed }); setPlaying(true); }}><RotateCcw size={15} aria-hidden /> Replay clip</button>
            <button className="secondary bookmark" aria-pressed={saved.includes(trend.id)} aria-label={`Save ${trend.title}`} onClick={() => onSave(trend.id)}><Bookmark size={16} aria-hidden /> {saved.includes(trend.id) ? 'Saved' : 'Save'}</button>
          </div>
        </div>
        <div className="brief-text" key={trend.id}>
          <p className="kicker mono"><Sparkles size={15} className="kicker-mark" aria-hidden /> {trend.category} / {trend.platform} culture</p>
          <h1>{trend.title}</h1>
          <p className="meaning">{trend.meaning}</p>
          <dl>
            <div><dt className="mono">The lore</dt><dd>{trend.lore}</dd></div>
            <div><dt className="mono">How it spread</dt><dd>{trend.resurfaced}</dd></div>
            <div><dt className="mono">How to use it</dt><dd>{trend.usage}<span className="quote">“{trend.example}”</span></dd></div>
          </dl>
          <div className="tags" aria-label="Related terms">{trend.related.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          {trend.evidence.length > 0 ? (
            <details onToggle={(event) => { if (event.currentTarget.open) setPlaying(false); }}>
              <summary>Further reading</summary>
              <ul>{trend.evidence.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul>
            </details>
          ) : null}
        </div>
      </div>
      <div className="player-bottom">
        <span className="mono muted">{playing ? 'Auto advance on' : 'Take your time'}</span>
        <button className="primary" onClick={advance}>{index === queue.length - 1 ? 'Finish' : 'Got it, next'} <ArrowRight size={17} aria-hidden /></button>
      </div>
      <p className="sr-only" aria-live="polite">Card {index + 1} of {queue.length}: {trend.title}</p>
    </section>
  );
}
