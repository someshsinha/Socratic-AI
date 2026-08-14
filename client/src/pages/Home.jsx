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
  accent: '#315f88',
  green: '#2f6f4f',
};

/* ────────────────────────────────────────────────────────
   WORKSPACE PANEL (Hero right side) — Fully Visible & Expanded
──────────────────────────────────────────────────────── */
function WorkspacePanel() {
  const [expanded, setExpanded] = useState({ 0: true, 1: false, 2: false });
  const [activeTab, setActiveTab] = useState('Overview');
  const toggle = i => setExpanded(p => ({ ...p, [i]: !p[i] }));

  const modules = [
    {
      num: '01',
      title: 'Foundations & System Models',
      count: 3,
      duration: '45m',
      lessons: [
        { code: '1.1', title: 'What is a Distributed System?', tag: 'Theory', time: '12m' },
        { code: '1.2', title: 'Processes, Networking & RPCs', tag: 'Architecture', time: '18m' },
        { code: '1.3', title: 'Logical Clocks & Lamport Timestamps', tag: 'Math & Logic', time: '15m' },
      ],
    },
    {
      num: '02',
      title: 'Replication & Consistency Models',
      count: 3,
      duration: '1h 10m',
      lessons: [
        { code: '2.1', title: 'Primary-Backup Replication', tag: 'State Machine', time: '20m' },
        { code: '2.2', title: 'Quorums & The CAP Theorem', tag: 'Proofs', time: '25m' },
        { code: '2.3', title: 'Linearizability vs Eventual Consistency', tag: 'Analysis', time: '25m' },
      ],
    },
    {
      num: '03',
      title: 'Distributed Consensus & Raft',
      count: 2,
      duration: '55m',
      lessons: [
        { code: '3.1', title: 'Leader Election & Heartbeats', tag: 'Protocol', time: '25m' },
        { code: '3.2', title: 'Log Replication & Safety Invariants', tag: 'Implementation', time: '30m' },
      ],
    },
  ];

  const sideLinks = [
    { label: 'Overview',  d: 'M4 6h16M4 12h16M4 18h16' },
    { label: 'Modules',   d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Lessons',   d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Resources', d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { label: 'Export',    d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  ];

  return (
    <div
      className="w-full overflow-hidden card-hover-lift"
      style={{ border: `1px solid ${T.ink}`, background: T.panel, boxShadow: '0 16px 48px rgba(17,24,39,0.07)' }}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${T.line}`, background: T.paper }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#d8d3c7' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#d8d3c7' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#d8d3c7' }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted, marginLeft: 6 }}>
            Curriculum Engine // Workspace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-soft-pulse" style={{ background: T.green }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: T.green }}>Ready</span>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 380 }}>
        {/* Left sidebar - clean and proportional */}
        <div className="w-38 shrink-0 flex flex-col" style={{ borderRight: `1px solid ${T.line}`, background: 'rgba(251,250,246,0.5)' }}>
          <div className="px-3.5 py-3" style={{ borderBottom: `1px solid ${T.line}` }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, fontWeight: 700, margin: '0 0 3px' }}>Course</p>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>Distributed Systems</span>
          </div>

          <nav className="flex-1 py-1.5">
            {sideLinks.map(({ label, d }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left transition-all"
                style={{
                  fontSize: '0.74rem',
                  fontWeight: activeTab === label ? 700 : 500,
                  color: activeTab === label ? T.ink : T.muted,
                  background: activeTab === label ? T.panel : 'transparent',
                  borderRight: activeTab === label ? `2px solid ${T.ink}` : 'none',
                }}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                </svg>
                {label}
              </button>
            ))}
          </nav>

          <div className="px-3.5 py-3" style={{ borderTop: `1px solid ${T.line}` }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted, fontWeight: 700, margin: '0 0 5px' }}>Scope</p>
            <div className="space-y-1">
              <p style={{ fontSize: '0.72rem', color: T.muted, margin: 0 }}>— 3 Core Modules</p>
              <p style={{ fontSize: '0.72rem', color: T.muted, margin: 0 }}>— 8 Deep Lessons</p>
              <p style={{ fontSize: '0.72rem', color: T.muted, margin: 0 }}>— ~2.5h Learning</p>
            </div>
          </div>
        </div>

        {/* Main Content Area - Full outline visibility */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: T.panel }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.line}` }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink }}>Generated Curriculum Outline</span>
            <button
              onClick={() => setExpanded(p => ({ 0: !p[0], 1: !p[1], 2: !p[2] }))}
              style={{ fontSize: '0.72rem', color: T.accent, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              Expand / Collapse
            </button>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-auto divide-y divide-[#d8d3c7]">
            {modules.map((mod, i) => (
              <div key={i} className="transition-colors">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-black/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      style={{
                        width: 22, height: 22, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 800, fontFamily: 'ui-monospace,monospace', flexShrink: 0,
                        background: i === 0 ? T.ink : T.paper, color: i === 0 ? 'white' : T.muted,
                        border: `1px solid ${i === 0 ? T.ink : T.line}`,
                      }}
                    >
                      {mod.num}
                    </span>
                    <div className="min-w-0">
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: T.ink, margin: 0, lineHeight: 1.25 }} className="truncate">
                        {mod.title}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: T.muted }}>
                        {mod.count} structured lessons
                      </span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ml-2 ${expanded[i] ? 'rotate-180' : ''}`} fill="none" stroke={T.muted} strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sub-lessons list with full badge visibility */}
                {expanded[i] && (
                  <div className="px-4 pb-3 pt-1 space-y-1.5" style={{ background: 'rgba(251,250,246,0.7)' }}>
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.code}
                        className="flex items-center justify-between px-3 py-2 rounded-sm transition-all hover:bg-white"
                        style={{ border: `1px solid ${T.line}`, background: 'rgba(255,255,255,0.92)' }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-2">
                          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', fontWeight: 700, color: T.muted }} className="shrink-0">
                            {lesson.code}
                          </span>
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: T.ink }} className="truncate">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            style={{
                              fontFamily: 'ui-monospace,monospace', fontSize: '0.62rem', fontWeight: 700,
                              padding: '1px 6px', border: `1px solid ${T.line}`, color: T.muted, background: T.paper,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {lesson.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom live status */}
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${T.line}`, background: T.paper }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full animate-soft-pulse shrink-0" style={{ background: T.accent }} />
              <span style={{ fontSize: '0.7rem', color: T.muted, fontStyle: 'italic', fontFamily: 'ui-monospace,monospace' }} className="truncate">
                AI ready to enrich full course notes
              </span>
            </div>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', color: T.green, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }} className="shrink-0">
              100% LATEX & MCQ
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
  
  // Subtle animated placeholder cycling
  const sampleTopics = [
    'Distributed Systems',
    'Quantum Algorithms',
    'Operating System Kernels',
    'Compiler Design',
    'Neural Networks from Scratch'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % sampleTopics.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) onGenerate(topic.trim());
  };

  return (
    <section style={{ background: 'transparent', paddingTop: 56, paddingBottom: 64 }}>
      {/* Expanded container for comfortable right-side width */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Eyebrow */}
            <p style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: T.green, margin: 0,
            }}>
              Socratic-AI v0.1 // Curriculum Engine
            </p>

            {/* H1 — Balanced, compact, breathing */}
            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.9rem)',
              fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05,
              color: T.ink, margin: 0,
            }}>
              Question<br />Everything.<br />
              <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink }}>Learn Deeply.</em>
            </h1>

            {/* Lede */}
            <p style={{ fontSize: '0.96rem', color: '#4b5563', lineHeight: 1.65, margin: 0, maxWidth: 420 }}>
              Generate rigorous, structured academic courses and interactive study notes.
              First-principles reasoning. Native LaTeX. Zero fluff.
            </p>

            {/* Input with animated placeholder */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: 14 }}>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={`Enter a topic, e.g. "${sampleTopics[placeholderIndex]}"`}
                disabled={loading}
                style={{
                  flex: 1, border: `1px solid ${T.ink}`, borderRight: 'none',
                  padding: '11px 16px', fontSize: '0.9rem', color: T.ink,
                  background: T.panel, fontFamily: 'inherit', outline: 'none',
                  minHeight: 44, transition: 'border-color 0.2s',
                }}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                style={{
                  border: `1px solid ${T.ink}`,
                  background: loading || !topic.trim() ? T.line : T.ink,
                  color: loading || !topic.trim() ? T.muted : 'white',
                  padding: '11px 18px', fontWeight: 750, fontSize: '0.82rem',
                  cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
                className="hover:-translate-y-px active:translate-y-0"
              >
                {loading ? 'Generating…' : 'GENERATE →'}
              </button>
            </form>

            {/* Feature tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
              {['AI-Powered', 'Structured Curriculum', 'Rich Lessons', 'PDF Export'].map(f => (
                <span
                  key={f}
                  className="transition-colors hover:border-[#111827]"
                  style={{
                    border: `1px solid ${T.line}`, padding: '3px 9px',
                    fontSize: '0.72rem', color: T.muted,
                    fontFamily: 'ui-monospace,monospace',
                    background: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: 7 cols — fully expanded so all badges & titles are 100% visible */}
          <div className="hidden lg:block lg:col-span-7">
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
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '72px 0', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.green, margin: '0 0 12px' }}>
              How It Works
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.01em', color: T.ink, margin: 0 }}>
              From any topic to mastery in 3 steps
            </h2>
          </div>
        </div>

        {/* Steps with subtle hover lift */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }} className="flex-col sm:flex-row">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div
                className="card-hover-lift"
                style={{ flex: 1, border: `1px solid ${T.line}`, background: T.panel, padding: 24 }}
              >
                <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', fontWeight: 800, color: T.muted, marginBottom: 12 }}>
                  {step.num}
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: T.ink, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: T.muted, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
              {i < 2 && (
                <div style={{
                  width: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`,
                  background: T.paper, color: T.muted, fontSize: '0.95rem',
                }} className="hidden sm:flex">
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
    { num: '01', title: 'Structured Lessons', desc: 'Clear, concise and well-organized content with objectives, core derivations, and key takeaways.' },
    { num: '02', title: 'Rich Resources', desc: 'Curated videos, docs, and external references matched to each lesson topic.' },
    { num: '03', title: 'Code & Examples', desc: 'Practical code snippets and real-world implementations for every concept.' },
    { num: '04', title: 'Quizzes & MCQs', desc: 'Built-in knowledge checks after each lesson to reinforce comprehension.' },
    { num: '05', title: 'Progress Tracking', desc: 'A transparent view of module completion and learning milestones.' },
    { num: '06', title: 'PDF Export', desc: 'Print-ready textbook-formatted export of any lesson or entire course.' },
  ];

  return (
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '72px 0', background: 'transparent' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.green, margin: '0 0 12px' }}>
              What You Get
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.01em', color: T.ink, margin: 0 }}>
              Everything you need to learn better
            </h2>
          </div>
          <p style={{ color: T.muted, maxWidth: 360, fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Every generated course comes completely structured out of the box.
          </p>
        </div>

        {/* 3-column grid with bordered cards + lift */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((f) => (
            <div
              key={f.num}
              className="card-hover-lift"
              style={{ border: `1px solid ${T.line}`, background: T.panel, padding: 20 }}
            >
              <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.7rem', fontWeight: 800, color: T.muted, marginBottom: 8 }}>
                {f.num}
              </p>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: T.ink, margin: '0 0 6px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.84rem', color: T.muted, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
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
    <div
      className="card-hover-lift"
      style={{ border: `1px solid ${T.ink}`, background: T.panel, boxShadow: '0 16px 48px rgba(17,24,39,0.06)' }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}` }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 6px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
              background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              color: activeTab === tab ? T.ink : T.muted,
              borderBottom: activeTab === tab ? `2px solid ${T.ink}` : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          {/* Play button */}
          <button
            onClick={() => setPlaying(p => !p)}
            style={{
              width: 40, height: 40, flexShrink: 0, border: `1px solid ${T.ink}`,
              background: playing ? T.ink : T.panel, color: playing ? T.panel : T.ink,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            className="hover:-translate-y-px active:translate-y-0"
          >
            {playing ? (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            ) : (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Waveform */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36 }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: `${h * 100}%`, borderRadius: 1,
                    background: i < activeBars ? T.ink : T.line,
                    transition: 'background 0.05s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', color: T.muted }}>
              <span>{fmt(elapsed)}</span><span>{fmt(DURATION)}</span>
            </div>
          </div>

          {/* Hinglish badge */}
          <button style={{
            border: `1px solid ${T.line}`, padding: '5px 8px', fontSize: '0.7rem', fontWeight: 700,
            color: T.muted, background: T.paper, cursor: 'pointer', fontFamily: 'ui-monospace,monospace',
            whiteSpace: 'nowrap',
          }}>
            ◉ Hinglish Audio
          </button>
        </div>

        {/* Progress bar */}
        <div
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
          style={{ height: 4, background: T.line, cursor: 'pointer', marginBottom: 12 }}
        >
          <div style={{ height: '100%', background: T.ink, width: `${progress * 100}%`, transition: 'width 0.1s' }} />
        </div>

        {/* Download */}
        <button style={{ fontSize: '0.76rem', fontWeight: 600, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '72px 0', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', gap: 48, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.green, margin: '0 0 16px' }}>
              Learn In Your Language
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.01em', color: T.ink, margin: '0 0 20px' }}>
              In English.<br />In Hinglish.<br />Your choice.
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {['English explanations for global learners', 'Hinglish audio narration for better retention', 'Download notes and PDFs anytime', 'Works on desktop, tablet, and mobile'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', fontWeight: 800, color: T.green, flexShrink: 0, paddingTop: 2 }}>✓</span>
                  <span style={{ fontSize: '0.88rem', color: T.muted, lineHeight: 1.55 }}>{item}</span>
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
    <section style={{ borderTop: `1px solid ${T.line}`, padding: '72px 0', background: 'transparent' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.6rem)', fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink, lineHeight: 1.55, margin: '0 0 18px' }}>
          "Education is the kindling of a flame, not the filling of a vessel."
        </p>
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.green }}>
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
    <footer style={{ borderTop: `1px solid ${T.line}`, color: T.muted, padding: '28px 0 40px', background: T.paper }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          A portfolio project by{' '}
          <a href="https://github.com/someshsinha" style={{ color: T.ink, fontWeight: 700 }}>@someshsinha</a>
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['GitHub', 'About', 'Contact'].map(l => (
            <a
              key={l}
              href="#"
              style={{ fontSize: '0.85rem', color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
              className="hover:text-[#111827]"
            >
              {l}
            </a>
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
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ border: `1px solid #9f3f34`, background: '#fff5f5', padding: '12px 16px', fontSize: '0.88rem', color: '#9f3f34' }}>
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
