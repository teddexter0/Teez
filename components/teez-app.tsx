'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, Check, Play, Sparkles } from 'lucide-react';
import type { Trend } from '../lib/catalog';
import { contextSeconds, durations, planBriefing, type BriefingSlot, type Minutes } from '../lib/briefing';
import { blankJournal, readJournal, recordLearned, setDay, toggleSaved, writeJournal, type JournalState } from '../lib/journal';
import { Archive } from './archive';
import { HeroArt, TrendArt } from './art';
import { clock, Player } from './player';

type View = 'home' | 'archive' | 'saved' | 'player' | 'finish';

function TrendTile({ trend, open }: { trend: Trend; open: (trend: Trend) => void }) {
  return <article className="trend-card">
    <button onClick={() => open(trend)} aria-label={`Preview ${trend.title}`}>
      <div className="tile-picture"><TrendArt trend={trend} /><span className="clip-duration"><Play size={10} fill="currentColor" aria-hidden /> {trend.seconds}s</span></div>
      <div className="tile-text"><div><span className="mono">{trend.category} / {trend.platform}</span><h3>{trend.title}</h3></div><ArrowUpRight size={19} aria-hidden /></div>
    </button>
  </article>;
}

export function TeezApp({ catalog }: { catalog: readonly Trend[] }) {
  const [view, setView] = useState<View>('home');
  const [minutes, setMinutes] = useState<Minutes>(5);
  const [journal, setJournal] = useState(blankJournal);
  const [queue, setQueue] = useState<BriefingSlot[]>([]);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState('');
  const lastJournal = useRef(blankJournal);
  const backTo = useRef<View>('home');
  const page = useRef<HTMLElement>(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    function sync() {
      const state = readJournal();
      lastJournal.current = state;
      setJournal(state);
    }
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 5200);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (!hasNavigated.current) return;
    page.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  const navigate = useCallback((next: View) => { hasNavigated.current = true; setView(next); }, []);
  const changeJournal = useCallback((update: (state: JournalState) => JournalState) => {
    const next = update(lastJournal.current);
    if (next === lastJournal.current) return;
    lastJournal.current = next;
    setJournal(next);
    if (!writeJournal(next)) setNotice('Browser storage is full or unavailable. This change is only kept until you close or reload Teez.');
  }, []);
  const onLearn = useCallback((id: string) => changeJournal((state) => recordLearned(state, id)), [changeJournal]);

  const planned = view === 'home' ? planBriefing(catalog, minutes, Object.values(journal.days).flatMap((day) => day.trendIds)) : [];
  const total = planned.reduce((sum, slot) => sum + slot.seconds, 0);
  function start(slots: BriefingSlot[], isPreview = false) {
    if (!slots.length) return;
    backTo.current = view === 'finish' ? 'home' : view;
    setQueue(slots);
    setPreview(isPreview);
    navigate('player');
  }
  function open(trend: Trend) { start([{ trend, seconds: trend.seconds + contextSeconds }], true); }

  return <>
    <header className="site-header">
      <div className="topbar wrap">
        <button className="wordmark" aria-label="Teez home" onClick={() => navigate('home')}>teez<span>.</span></button>
        <nav className="top-nav" aria-label="Main navigation">
          <button className="nav-link" aria-current={view === 'home' || view === 'player' || view === 'finish' ? 'page' : undefined} onClick={() => navigate('home')}>Briefing</button>
          <button className="nav-link" aria-current={view === 'archive' ? 'page' : undefined} onClick={() => navigate('archive')}>Archive</button>
          <button className="nav-link" aria-current={view === 'saved' ? 'page' : undefined} onClick={() => navigate('saved')}><Bookmark size={16} aria-hidden /> Saved</button>
        </nav>
        <span className="edition mono"><i aria-hidden /> Demo edition / 001</span>
      </div>
    </header>
    <main className="page" ref={page} tabIndex={-1}>
      {view === 'home' ? <div className="home wrap">
        <section className="hero" aria-label="Build a briefing">
          <div className="hero-main">
            <p className="kicker mono"><Sparkles size={18} strokeWidth={2.5} className="kicker-mark" aria-hidden /> Your pop culture briefing</p>
            <h1>The internet,<em>on your time.</em></h1>
            <p className="hero-copy">Tiny clips, the lore behind them, and a real stopping point. Catch up on what people are talking about.</p>
            <div className="setup">
              <div className="setup-label mono"><strong id="duration-label">How much time have you got?</strong><span>Max runtime</span></div>
              <div className="durations" role="radiogroup" aria-labelledby="duration-label">
                {durations.map((duration) => <label className="duration" key={duration}>
                  <input className="sr-only" type="radio" name="duration" checked={minutes === duration} onChange={() => setMinutes(duration)} />
                  <strong>{duration}</strong><small>min</small>
                </label>)}
              </div>
              <div className="setup-actions">
                <button className="primary" disabled={!planned.length} onClick={() => start(planned)}><Play size={16} fill="currentColor" aria-hidden /> Start briefing <ArrowRight size={17} aria-hidden /></button>
                <span className="mono" aria-live="polite">{planned.length} stories · {clock(total)} max</span>
              </div>
            </div>
          </div>
          <figure className="hero-visual">
            <div className="hero-picture"><HeroArt /></div>
            <figcaption className="mono"><span>Fig. 01 / The culture desk</span><span>Six corners of the internet</span></figcaption>
          </figure>
        </section>
        <section className="radar" aria-labelledby="radar-heading">
          <div className="section-title"><div><div className="kicker mono">The radar / 01</div><h2 id="radar-heading">In this edition.</h2></div><span className="mono">Original motion cards / 2.5–10s</span></div>
          <div className="radar-grid">{catalog.slice(0, 3).map((trend) => <TrendTile key={trend.id} trend={trend} open={open} />)}</div>
        </section>
      </div> : null}
      {view === 'player' && queue.length ? <Player queue={queue} preview={preview} saved={journal.saved} onSave={(id) => changeJournal((state) => toggleSaved(state, id))} onLearn={onLearn} onFinish={() => navigate('finish')} onExit={() => navigate(backTo.current)} /> : null}
      {view === 'finish' ? <div className="wrap"><section className="finish">
        <p className="kicker mono"><Check size={17} aria-hidden /> {preview ? 'Preview complete' : 'Briefing complete'}</p>
        <h1>You’re caught up.</h1><p>{queue.length === 1 ? 'One story covered.' : `${queue.length} stories covered.`} You can revisit {queue.length === 1 ? 'it' : 'them'} in today’s archive.</p>
        <div className="journal-actions"><button className="primary" onClick={() => navigate('archive')}>Open archive <ArrowRight size={17} aria-hidden /></button><button className="secondary" onClick={() => navigate('home')}>Back to briefing</button></div>
      </section></div> : null}
      {view === 'archive' ? <Archive catalog={catalog} journal={journal} onPreview={open} onUpdate={(date, patch) => changeJournal((state) => setDay(state, date, patch))} /> : null}
      {view === 'saved' ? <section className="subpage wrap">
        <div className="subhead"><div><p className="kicker mono"><Bookmark size={15} className="kicker-mark" aria-hidden /> Your collection</p><h1>Saved<span className="accent">.</span></h1><p>Clips and context you want to come back to.</p></div></div>
        {catalog.some((trend) => journal.saved.includes(trend.id)) ? <div className="saved-grid">{catalog.filter((trend) => journal.saved.includes(trend.id)).map((trend) => <TrendTile key={trend.id} trend={trend} open={open} />)}</div> : <div className="empty"><h2>Nothing saved yet.</h2><p>Tap Save on any trend to keep it here.</p><button className="secondary" onClick={() => navigate('home')}>Explore the edition <ArrowRight size={16} aria-hidden /></button></div>}
      </section> : null}
    </main>
    <footer className="site-footer"><div className="footer-inner wrap mono"><span>Teez / The culture desk</span><span>Curated demo · Journal stays in this browser</span></div></footer>
    {notice ? <p className="notice" role="status">{notice}</p> : null}
  </>;
}
