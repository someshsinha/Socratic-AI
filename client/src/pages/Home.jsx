import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (matching codingagents.fyi palette)
──────────────────────────────────────────────────────── */
const T = {
  ink:   '#111827',
  muted: '#5f6673',
  paper: '#fbfaf6',
  panel: '#ffffff',
  line:  '#d8d3c7',
  accent: '#315f88',   // blue-ish accent like their --blue
};

/* ────────────────────────────────────────────────────────
   WORKSPACE PANEL (hero right side)
──────────────────────────────────────────────────────── */
function WorkspacePanel() {
  const [expanded, setExpanded] = useState({ 0: true, 1: false, 2: false });
  const toggle = i => setExpanded(p => ({ ...p, [i]: !p[i] }));

  const modules = [
    { num: '01', title: 'Foundations', count: 4, lessons: ['What is a Distributed System?', 'Processes & Communication', 'Clocks & Ordering', 'Failure Models'] },
    { num: '02', title: 'Replication & Consistency', count: 4, lessons: ['Replication', 'Consistency Models', 'Quorum Systems', 'CAP Theorem'] },
    { num: '03', title: 'Consensus', count: 4, lessons: ['Leader Election', 'Raft', 'Log Replication', 'Failure Recovery'] },
  ];

  const sideLinks = [
    { label: 'Overview',  d: 'M4 6h16M4 12h16M4 18h16' },
    { label: 'Modules',   d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Lessons',   d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Resources', d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { label: 'Progress',  d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10' },
    { label: 'Export',    d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  ];

  return (
    <div
      className="w-full overflow-hidden text-xs"
      style={{ border: `1px solid ${T.ink}`, background: T.panel, boxShadow: '0 16px 48px rgba(17,24,39,0.08)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${T.line}`, background: T.paper }}
      >
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>
          Curriculum Engine // Workspace
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2f6f4f' }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#2f6f4f' }}>Ready</span>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 360 }}>
        {/* Left sidebar */}
        <div className="w-36 shrink-0 flex flex-col" style={{ borderRight: `1px solid ${T.line}` }}>
          <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.line}` }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.muted, fontWeight: 700, marginBottom: 6 }}>Topic</p>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>Distributed Systems</span>
          </div>
          <nav className="flex-1 py-1">
            {sideLinks.map(({ label, d }) => (
              <button key={label} className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                style={{
                  fontSize: '0.7rem', fontWeight: label === 'Overview' ? 700 : 500,
                  color: label === 'Overview' ? T.ink : T.muted,
                  background: label === 'Overview' ? 'rgba(255,255,255,0.7)' : 'transparent',
                  borderRight: label === 'Overview' ? `2px solid ${T.ink}` : 'none',
                }}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                </svg>
                {label}
              </button>
            ))}
          </nav>
          <div className="px-3 py-3" style={{ borderTop: `1px solid ${T.line}` }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.muted, fontWeight: 700, marginBottom: 8 }}>Stats</p>
            {[{ label: '3 Modules' }, { label: '12 Lessons' }, { label: '~4h Total' }].map(s => (
              <p key={s.label} style={{ fontSize: '0.68rem', color: T.muted, marginBottom: 4 }}>— {s.label}</p>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.line}` }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>Curriculum Overview</span>
            <button style={{ fontSize: '0.65rem', color: T.accent, fontWeight: 700 }}>Expand all</button>
          </div>
          <div className="flex-1 overflow-auto" style={{ borderBottom: `1px solid ${T.line}` }}>
            {modules.map((mod, i) => (
              <div key={i} style={{ borderBottom: i < 2 ? `1px solid ${T.line}` : 'none' }}>
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/50">
                  <div className="flex items-center gap-2.5">
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, fontFamily: 'ui-monospace,monospace', flexShrink: 0,
                      background: i === 0 ? T.ink : T.line, color: i === 0 ? 'white' : T.muted
                    }}>{mod.num}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: T.ink }}>{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.65rem', color: T.muted }}>{mod.count} Lessons</span>
                    <svg className={`w-3 h-3 transition-transform duration-200 ${expanded[i] ? 'rotate-180' : ''}`} fill="none" stroke={T.muted} strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expanded[i] && (
                  <div className="px-4 pb-3" style={{ background: 'rgba(251,250,246,0.6)' }}>
                    {mod.lessons.map((lesson, j) => (
                      <p key={j} style={{ fontSize: '0.68rem', color: T.muted, padding: '3px 0', paddingLeft: 12, borderLeft: `2px solid ${T.line}`, marginBottom: 3 }}>
                        {lesson}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.accent }} />
            <span style={{ fontSize: '0.65rem', color: T.muted, fontStyle: 'italic', fontFamily: 'ui-monospace,monospace' }}>
              AI is structuring your learning path...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   HERO
──────────────────────────────────────────────────────── */
function HeroSection({ onGenerate, loading }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) onGenerate(topic.trim());
  };

  return (
    <section style={{ background: T.paper, paddingTop: 72, paddingBottom: 48 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 items-center">
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <p style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#2f6f4f', marginBottom: 18,
            }}>
              Socratic-AI v0.1 // Curriculum Engine
            </p>

            {/* H1 */}
            <h1 style={{
              fontSize: 'clamp(2.7rem, 7vw, 5.6rem)',
              fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.03,
              color: T.ink, margin: '0 0 24px',
            }}>
              Question<br />Everything.<br />
              <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink }}>Learn Deeply.</em>
            </h1>

            {/* Lede */}
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#343b48', lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
              Generate rigorous, structured academic courses and interactive study notes.
              First-principles reasoning. Native LaTeX. Zero fluff.
            </p>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: 20 }}>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={`Enter a topic, e.g. "Distributed Systems"`}
                disabled={loading}
                style={{
                  flex: 1, border: `1px solid ${T.ink}`, borderRight: 'none',
                  padding: '12px 16px', fontSize: '0.95rem', color: T.ink,
                  background: T.panel, fontFamily: 'inherit', outline: 'none',
                  minHeight: 46,
                }}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                style={{
                  border: `1px solid ${T.ink}`, background: loading || !topic.trim() ? T.line : T.ink,
                  color: loading || !topic.trim() ? T.muted : 'white',
                  padding: '12px 20px', fontWeight: 750, fontSize: '0.88rem',
                  cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}
              >
                {loading ? 'Generating…' : 'GENERATE →'}
              </button>
            </form>

            {/* Feature tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['AI-Powered', 'Structured Curriculum', 'Rich Lessons', 'PDF Export'].map(f => (
                <span key={f} style={{
                  border: `1px solid ${T.line}`, padding: '4px 10px',
                  fontSize: '0.75rem', color: T.muted,
                  fontFamily: 'ui-monospace,monospace',
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Workspace panel */}
          <div className="hidden lg:block">
            <WorkspacePanel />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   HOW IT WORKS
──────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Ask Anything', desc: 'Enter any topic. Our AI reads your intent and begins structuring a complete learning path around it.' },
    { num: '02', title: 'AI Builds Curriculum', desc: 'A rigorous course is generated: modules, lessons, code examples, MCQs, and external resources.' },
    { num: '03', title: 'Learn & Master', desc: 'Study with rich lessons, Hinglish audio, quizzes, and progress tracking. Export to PDF anytime.' },
  ];

  return (
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '56px 0', background: T.panel }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2f6f4f', margin: '0 0 14px' }}>
              How It Works
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.01em', color: T.ink, margin: 0 }}>
              From any topic to mastery in 3 steps
            </h2>
          </div>
        </div>

        {/* Steps — simple flex row, arrows as siblings */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              {/* Step */}
              <div style={{ flex: 1, border: `1px solid ${T.line}`, background: T.panel, padding: 24 }}>
                <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 800, color: T.muted, marginBottom: 14 }}>
                  {step.num}
                </p>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: T.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: T.muted, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
              {/* Arrow between steps */}
              {i < 2 && (
                <div style={{
                  width: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  alignSelf: 'stretch', borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`,
                  background: T.paper, color: T.muted, fontSize: '1rem',
                }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   WHAT YOU GET
──────────────────────────────────────────────────────── */
function WhatYouGet() {
  const features = [
    { num: '01', title: 'Structured Lessons', desc: 'Clear, concise and well-organized content. Every lesson has objectives, explanations, and takeaways.' },
    { num: '02', title: 'Rich Resources', desc: 'Curated videos, docs, articles, and external links hand-picked per lesson.' },
    { num: '03', title: 'Code & Examples', desc: 'Practical code snippets and real-world examples for every technical concept.' },
    { num: '04', title: 'Quizzes & MCQs', desc: 'Knowledge checks after each lesson so you can test comprehension as you go.' },
    { num: '05', title: 'Progress Tracking', desc: 'A clear view of where you are in the course and what comes next.' },
    { num: '06', title: 'PDF Export', desc: 'Export the full course, a single lesson, or your notes as a formatted PDF.' },
  ];

  return (
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '56px 0', background: T.paper }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2f6f4f', margin: '0 0 14px' }}>
              What You Get
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.01em', color: T.ink, margin: 0 }}>
              Everything you need to learn better
            </h2>
          </div>
          <p style={{ color: T.muted, maxWidth: 380, fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Every course comes fully loaded — no extra setup, no add-ons required.
          </p>
        </div>

        {/* 3-column grid with bordered cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {features.map((f) => (
            <div key={f.num} style={{ border: `1px solid ${T.line}`, background: T.panel, padding: 20 }}>
              <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: 800, color: T.muted, marginBottom: 10 }}>
                {f.num}
              </p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: T.ink, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: T.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   ANIMATED AUDIO PLAYER
──────────────────────────────────────────────────────── */
function AnimatedAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('Lesson');
  const intervalRef = useRef(null);
  const DURATION = 324;

  const bars = useRef(
    Array.from({ length: 48 }, (_, i) => Math.max(0.08, Math.min(0.95, 0.5 + Math.sin(i * 0.4) * 0.4 + Math.sin(i * 0.9) * 0.3)))
  ).current;

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => { if (p >= 1) { setPlaying(false); return 0; } return p + 1 / DURATION / 10; });
      }, 100);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const elapsed = Math.floor(progress * DURATION);
  const activeBars = Math.floor(progress * bars.length);
  const tabs = ['Lesson', 'Notes', 'Transcript', 'Resources'];

  return (
    <div style={{ border: `1px solid ${T.ink}`, background: T.panel, boxShadow: '0 16px 48px rgba(17,24,39,0.08)' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}` }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 8px', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
            background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
            color: activeTab === tab ? T.ink : T.muted,
            borderBottom: activeTab === tab ? `2px solid ${T.ink}` : '2px solid transparent',
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Play button */}
          <button onClick={() => setPlaying(p => !p)} style={{
            width: 44, height: 44, flexShrink: 0, border: `1px solid ${T.ink}`,
            background: playing ? T.ink : T.panel, color: playing ? T.panel : T.ink,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {playing ? (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            ) : (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Waveform */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
              {bars.map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h * 100}%`, borderRadius: 1,
                  background: i < activeBars ? T.ink : T.line,
                  transition: 'background 0.05s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', color: T.muted }}>
              <span>{fmt(elapsed)}</span><span>{fmt(DURATION)}</span>
            </div>
          </div>

          {/* Hinglish badge */}
          <button style={{
            border: `1px solid ${T.line}`, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700,
            color: T.muted, background: T.paper, cursor: 'pointer', fontFamily: 'ui-monospace,monospace',
            whiteSpace: 'nowrap',
          }}>
            ◉ Hinglish Audio
          </button>
        </div>

        {/* Progress bar */}
        <div
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
          style={{ height: 4, background: T.line, cursor: 'pointer', marginBottom: 14 }}
        >
          <div style={{ height: '100%', background: T.ink, width: `${progress * 100}%`, transition: 'width 0.1s' }} />
        </div>

        {/* Download */}
        <button style={{ fontSize: '0.8rem', fontWeight: 600, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   HINGLISH SECTION
──────────────────────────────────────────────────────── */
function HinglishSection() {
  return (
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '56px 0', background: T.panel }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', gap: 48, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2f6f4f', margin: '0 0 18px' }}>
              Learn In Your Language
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.01em', color: T.ink, margin: '0 0 24px' }}>
              In English.<br />In Hinglish.<br />Your choice.
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {['English explanations for global learners', 'Hinglish audio narration for better retention', 'Download notes and PDFs anytime', 'Works on desktop, tablet, and mobile'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.7rem', fontWeight: 800, color: '#2f6f4f', flexShrink: 0, paddingTop: 2 }}>✓</span>
                  <span style={{ fontSize: '0.92rem', color: T.muted, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Audio player */}
          <AnimatedAudioPlayer />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   QUOTE SECTION
──────────────────────────────────────────────────────── */
function QuoteSection() {
  return (
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '56px 0', background: T.paper }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink, lineHeight: 1.5, margin: '0 0 20px' }}>
          "Education is the kindling of a flame, not the filling of a vessel."
        </p>
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2f6f4f' }}>
          — Socrates
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FOOTER
──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, color: T.muted, padding: '28px 0 44px', background: T.paper }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.88rem', margin: 0 }}>
          A portfolio project by{' '}
          <a href="https://github.com/someshsinha" style={{ color: T.ink, fontWeight: 700 }}>@someshsinha</a>
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['GitHub', 'About', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: '0.88rem', color: T.muted, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = T.ink}
              onMouseLeave={e => e.target.style.color = T.muted}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN HOME
──────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  const handleGenerate = async (topic) => {
    setGenerating(true);
    setGenError(null);
    try {
      const response = await api.post('/courses', { topic });
      if (response.data?.success && response.data?.data?._id) {
        navigate(`/course/${response.data.data._id}`);
      }
    } catch (err) {
      console.error(err);
      setGenError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <HeroSection onGenerate={handleGenerate} loading={generating} />
      {genError && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ border: `1px solid #9f3f34`, background: '#fff5f5', padding: '12px 16px', fontSize: '0.9rem', color: '#9f3f34' }}>
            ⚠ {genError}
          </div>
        </div>
      )}
      <HowItWorks />
      <WhatYouGet />
      <HinglishSection />
      <QuoteSection />
      <Footer />
    </div>
  );
}
