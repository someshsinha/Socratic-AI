import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import siteConfig from '../config/siteConfig';
import { getIndianVoice, splitSpeechChunks, configureUtterance } from '../utils/speechUtils';

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
   WORKSPACE PANEL (Hero right side) — Matching Actual Course Modules Page
──────────────────────────────────────────────────────── */
function WorkspacePanel() {
  // Modules 1 & 2 expanded, Module 3 collapsed by default
  const [expanded, setExpanded] = useState({ 0: true, 1: true, 2: false });

  const toggle = (i) => setExpanded((p) => ({ ...p, [i]: !p[i] }));
  const expandAll = () => setExpanded({ 0: true, 1: true, 2: true });
  const collapseAll = () => setExpanded({ 0: false, 1: false, 2: false });

  const modules = [
    {
      num: '01',
      title: 'Module 1: Foundations & System Models',
      count: 3,
      lessons: [
        { code: '01.01', title: 'What is a Distributed System?' },
        { code: '01.02', title: 'Processes, Networking & RPCs' },
        { code: '01.03', title: 'Logical Clocks & Lamport Timestamps' },
      ],
    },
    {
      num: '02',
      title: 'Module 2: Replication & Consistency Models',
      count: 3,
      lessons: [
        { code: '02.01', title: 'Primary-Backup Replication' },
        { code: '02.02', title: 'Quorums & The CAP Theorem' },
        { code: '02.03', title: 'Linearizability vs Eventual Consistency' },
      ],
    },
    {
      num: '03',
      title: 'Module 3: Distributed Consensus & Raft',
      count: 2,
      lessons: [
        { code: '03.01', title: 'Leader Election & Heartbeats' },
        { code: '03.02', title: 'Log Replication & Safety Invariants' },
      ],
    },
  ];

  return (
    <div
      className="w-full overflow-hidden card-hover-lift"
      style={{
        border: `1px solid ${T.ink}`,
        background: T.panel,
        boxShadow: '0 20px 48px rgba(17,24,39,0.07)',
      }}
    >
      {/* Top Terminal / Curriculum Header Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#d8d3c7]"
        style={{ background: T.paper }}
      >
        <div className="flex items-center gap-2">
          {/* macOS / Terminal colored dots */}
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.green,
              marginLeft: 8,
            }}
          >
            [CURRICULUM // MODULES]
          </span>
        </div>

        {/* Expand All / Collapse All Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: T.ink,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            className="hover:text-emerald-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Expand All
          </button>
          <span style={{ color: T.line }}>|</span>
          <button
            onClick={collapseAll}
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: T.muted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            className="hover:text-black transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 5M4 4v4m0-4h4m11 5l5-5m0 0l-5 5m5-5v4m0-4h-4M9 15l-5 5m0 0l5-5m-5 5v-4m0 4h4m11-5l5 5m0 0l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Collapse All
          </button>
        </div>
      </div>

      {/* Modules List matching Image 2 */}
      <div className="divide-y divide-[#d8d3c7]">
        {modules.map((mod, i) => (
          <div key={i} className="transition-colors">
            {/* Module Header Bar */}
            <div
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer hover:bg-black/[0.015] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Module Number Stamp */}
                <div
                  className="w-8 h-8 flex items-center justify-center font-mono text-xs font-black shrink-0"
                  style={{
                    background: i === 0 ? T.ink : T.paper,
                    color: i === 0 ? '#ffffff' : T.ink,
                    border: `1px solid ${T.ink}`,
                  }}
                >
                  {mod.num}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: T.ink,
                      margin: 0,
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {mod.title}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: T.muted, fontFamily: 'ui-monospace,monospace' }}>
                    {mod.count} Lessons
                  </span>
                </div>
              </div>

              {/* Chevron */}
              <div
                className="w-7 h-7 flex items-center justify-center shrink-0 ml-2"
                style={{ border: `1px solid ${T.line}`, background: T.paper }}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded[i] ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke={T.ink}
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sub-lessons list matching Image 2 */}
            {expanded[i] && (
              <div className="px-3.5 sm:px-4 pb-3.5 pt-0.5 space-y-2" style={{ background: 'rgba(251,250,246,0.6)' }}>
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.code}
                    className="flex items-center justify-between px-3.5 py-2.5 card-hover-lift"
                    style={{
                      border: `1px solid ${T.line}`,
                      background: '#ffffff',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-3">
                      <span
                        style={{
                          fontFamily: 'ui-monospace,monospace',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: T.muted,
                        }}
                        className="shrink-0"
                      >
                        {lesson.code}
                      </span>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: T.ink,
                          letterSpacing: '-0.01em',
                        }}
                        className="truncate"
                      >
                        {lesson.title}
                      </span>
                    </div>

                    <span
                      style={{
                        fontFamily: 'ui-monospace,monospace',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: T.ink,
                        letterSpacing: '0.04em',
                      }}
                      className="shrink-0 hover:underline cursor-pointer"
                    >
                      START →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Live Status Strip matching Image 2 */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-t border-[#d8d3c7]"
        style={{ background: T.paper }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: T.accent }} />
          <span
            style={{
              fontFamily: 'ui-monospace,monospace',
              fontSize: '0.72rem',
              color: T.muted,
              fontStyle: 'italic',
            }}
          >
            Structured academic curriculum
          </span>
        </div>
        <span
          style={{
            fontFamily: 'ui-monospace,monospace',
            fontSize: '0.70rem',
            fontWeight: 800,
            color: T.green,
            letterSpacing: '0.04em',
          }}
        >
          100% LATEX READY
        </span>
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
    <section className="w-full section-gap" style={{ background: 'transparent' }}>
      {/* Responsive container with generous padding */}
      <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: 5 cols */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-7 min-w-0">
            {/* Eyebrow */}
            <p style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: T.green, margin: '0 0 14px 0',
            }}>
              Socratic-AI v0.1 // Curriculum Engine
            </p>

            {/* H1 — Proportional, clean typography */}
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 2.9rem)',
              fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.16,
              color: T.ink, margin: '0 0 16px 0',
              wordBreak: 'break-word',
            }}>
              Question Everything.<br />
              <em style={{ fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink }}>Learn Deeply.</em>
            </h1>

            {/* Lede */}
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.65, margin: '0 0 8px 0', maxWidth: 420 }}>
              Generate rigorous, structured academic courses and interactive study notes.
              First-principles reasoning. Native LaTeX. Zero fluff.
            </p>

            {/* Input with animated placeholder - responsive stack on small mobile */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0 my-3 sm:my-4 w-full max-w-md">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={`Enter a topic, e.g. "${sampleTopics[placeholderIndex]}"`}
                disabled={loading}
                style={{
                  border: `1px solid ${T.ink}`,
                  background: T.panel,
                  color: T.ink,
                }}
                className="flex-1 min-w-0 sm:border-r-0 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                style={{
                  border: `1px solid ${T.ink}`,
                  background: loading || !topic.trim() ? T.line : T.ink,
                  color: loading || !topic.trim() ? T.muted : 'white',
                  cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'ui-monospace,monospace',
                  letterSpacing: '0.04em',
                }}
                className="px-4 py-2 sm:py-2.5 font-bold text-xs whitespace-nowrap cursor-pointer hover:bg-black transition-colors shrink-0 text-center"
              >
                {loading ? 'GEN…' : 'GENERATE →'}
              </button>
            </form>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {['AI-Powered', 'Structured Curriculum', 'Rich Lessons', 'PDF Export'].map(f => (
                <span
                  key={f}
                  className="transition-colors hover:border-[#111827]"
                  style={{
                    border: `1px solid ${T.line}`,
                    padding: '2.5px 7px',
                    fontSize: '0.66rem',
                    color: T.muted,
                    fontFamily: 'ui-monospace,monospace',
                    background: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: 7 cols — fully expanded */}
          <div className="hidden lg:block lg:col-span-7 min-w-0">
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
    {
      num: '01',
      stage: 'INPUT_INTENT',
      title: 'Ask Anything',
      desc: 'Enter any topic, question, or technology. Our AI reads your intent and begins structuring a first-principles learning pathway.',
      tag: 'Natural Language Prompt',
    },
    {
      num: '02',
      stage: 'CURRICULUM_SYNTHESIS',
      title: 'AI Builds Curriculum',
      desc: 'A complete multi-module syllabus is generated with progressive lessons, derivations, code implementations, and self-assessments.',
      tag: 'Hierarchical Structure',
    },
    {
      num: '03',
      stage: 'DEEP_MASTERY',
      title: 'Learn & Master',
      desc: 'Study rich markdown lessons, listen to native bilingual Hinglish narration, test your retention with quizzes, and export clean PDFs.',
      tag: 'Active Retention',
    },
  ];

  return (
    <section className="w-full section-gap border-t border-[#d8d3c7]" style={{ background: 'transparent' }}>
      <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="mb-8 sm:mb-10">
          <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.green, margin: '0 0 10px' }}>
            [HOW_IT_WORKS // WORKFLOW]
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', color: T.ink, margin: 0, wordBreak: 'break-word' }}>
            From any topic to mastery in 3 steps
          </h2>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step) => (
            <div
              key={step.num}
              className="card-hover-lift flex flex-col justify-between"
              style={{
                border: `1px solid ${T.ink}`,
                background: T.panel,
                padding: '20px 22px',
                boxShadow: '0 4px 16px rgba(17,24,39,0.03)',
              }}
            >
              <div>
                {/* Header Strip with Number and Stage */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#d8d3c7]">
                  <div
                    className="w-6 h-6 flex items-center justify-center font-mono text-[11px] font-black"
                    style={{
                      border: `1px solid ${T.ink}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  >
                    {step.num}
                  </div>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: '0.06em',
                    }}
                  >
                    [{step.stage}]
                  </span>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: T.ink, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#4b5563', lineHeight: 1.55, margin: 0 }}>
                  {step.desc}
                </p>
              </div>

              {/* Tag pill at bottom */}
              <div className="pt-3 mt-4 border-t border-[#d8d3c7]">
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: T.green,
                    background: 'rgba(47,111,79,0.06)',
                    border: `1px solid rgba(47,111,79,0.2)`,
                    padding: '2px 7px',
                  }}
                >
                  ✓ {step.tag}
                </span>
              </div>
            </div>
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
    {
      code: '01',
      tag: 'LESSONS',
      title: 'Structured Lessons',
      desc: 'Clear, comprehensive and well-organized content with objectives, core mathematical derivations, and key takeaways.',
    },
    {
      code: '02',
      tag: 'MEDIA',
      title: 'Rich Video & Resources',
      desc: 'Curated deep-dive videos, documentation, and external academic references matched to each lesson concept.',
    },
    {
      code: '03',
      tag: 'CODE',
      title: 'Code & Implementations',
      desc: 'Practical code blocks with syntax highlighting, architectural diagrams, and real-world system designs.',
    },
    {
      code: '04',
      tag: 'ASSESSMENT',
      title: 'Quizzes & MCQs',
      desc: 'Built-in interactive knowledge checks after each lesson to reinforce retention and test core conceptual mastery.',
    },
    {
      code: '05',
      tag: 'TRACKING',
      title: 'Progress Tracking',
      desc: 'A granular view of module milestones, lesson completion status, and personal learning roadmaps.',
    },
    {
      code: '06',
      tag: 'EXPORT',
      title: 'Print & PDF Export',
      desc: 'Clean textbook-grade LaTeX-formatted PDF export of any lesson or the entire course for distraction-free offline study.',
    },
  ];

  return (
    <section className="w-full section-gap border-t border-[#d8d3c7]" style={{ background: 'transparent' }}>
      <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.green, margin: '0 0 10px' }}>
              [CURRICULUM_COMPONENTS // SPECIFICATION]
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', color: T.ink, margin: 0, wordBreak: 'break-word' }}>
              Everything you need to learn better
            </h2>
          </div>
          <p style={{ color: T.muted, maxWidth: 380, fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
            Every generated course comes completely structured out of the box with polymorphic learning blocks.
          </p>
        </div>

        {/* 3x2 Component Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.code}
              className="card-hover-lift flex flex-col justify-between"
              style={{
                border: `1px solid ${T.line}`,
                background: T.panel,
                padding: '18px 20px',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: T.ink,
                      border: `1px solid ${T.line}`,
                      background: T.paper,
                      padding: '2px 6px',
                    }}
                  >
                    {f.code}
                  </span>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: '0.04em',
                    }}
                  >
                    [{f.tag}]
                  </span>
                </div>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: T.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   ANIMATED AUDIO PLAYER (Real Hinglish Narration via Web Speech)
──────────────────────────────────────────────────────── */
function AnimatedAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [availableVoices, setAvailableVoices] = useState([]);
  const utterancesRef = useRef([]);

  // High-quality Hinglish narrative describing Socratic AI
  const HINGLISH_SCRIPT =
    "Namaste! Socratic AI ek smart learning platform hai jo kisi bhi topic ko ek structured, step-by-step academic course mein badal deta hai. Chahe aap distributed systems padh rahe ho ya computer architecture, yahan aapko milte hain rigorous lessons, LaTeX formulas, code implementations, aur self-assessments. Seekhna shuru kijiye!";

  const bars = useRef(
    Array.from({ length: 48 }, (_, i) => Math.max(0.12, Math.min(0.95, 0.45 + Math.sin(i * 0.4) * 0.35 + Math.cos(i * 0.8) * 0.25)))
  ).current;

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setProgress(0);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare sentence chunks for smooth progressive playback
    const chunks = splitSpeechChunks(HINGLISH_SCRIPT);

    const currentVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const indianVoice = getIndianVoice(currentVoices);

    const playChunk = (index) => {
      if (index >= chunks.length) {
        setPlaying(false);
        setProgress(1);
        setTimeout(() => setProgress(0), 1000);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      configureUtterance(utterance, indianVoice, 0.96, 1.0);

      utterance.onstart = () => {
        setProgress((index / chunks.length));
      };

      utterance.onend = () => {
        setProgress(((index + 1) / chunks.length));
        playChunk(index + 1);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech error:', e);
        }
        setPlaying(false);
      };

      utterancesRef.current.push(utterance);
      window.speechSynthesis.speak(utterance);
    };

    setPlaying(true);
    playChunk(0);
  };

  const tabs = ['Overview', 'Transcript', 'Notes'];

  return (
    <div
      className="card-hover-lift w-full overflow-hidden"
      style={{
        border: `1px solid ${T.ink}`,
        background: T.panel,
        boxShadow: '0 20px 48px rgba(17,24,39,0.07)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#d8d3c7]" style={{ background: T.paper }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: 800, color: T.green, marginLeft: 6 }}>
            [AUDIO_SYNTHESIS // HINGLISH_PLAYER]
          </span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 font-semibold">
          <span className={`w-2 h-2 rounded-full ${playing ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {playing ? 'STREAMING AUDIO' : 'INTERACTIVE'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}`, background: 'rgba(251,250,246,0.6)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 6px', fontSize: '0.74rem', fontWeight: 700, fontFamily: 'ui-monospace,monospace',
              background: activeTab === tab ? T.panel : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              color: activeTab === tab ? T.ink : T.muted,
              borderBottom: activeTab === tab ? `2px solid ${T.ink}` : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div style={{ padding: '20px 22px' }}>
        {activeTab === 'Overview' && (
          <div className="mb-4">
            <p style={{ fontSize: '0.86rem', color: '#374151', lineHeight: 1.6, margin: '0 0 10px' }}>
              <strong>Socratic AI</strong> structures any subject into modular lessons, mathematical LaTeX notes, and interactive knowledge checks.
            </p>
            <p style={{ fontSize: '0.78rem', color: T.muted, fontFamily: 'ui-monospace,monospace', margin: 0 }}>
              Press play below to hear the bilingual voice walkthrough in natural Hinglish.
            </p>
          </div>
        )}

        {activeTab === 'Transcript' && (
          <div className="mb-4 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xs">
            <p style={{ fontSize: '0.82rem', color: '#1f2937', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
              "{HINGLISH_SCRIPT}"
            </p>
          </div>
        )}

        {activeTab === 'Notes' && (
          <div className="mb-4 space-y-1.5">
            <div className="text-[12px] text-gray-700 flex items-center gap-2">
              <span className="font-mono text-emerald-700 font-bold">01.</span> First-principles syllabi generation
            </div>
            <div className="text-[12px] text-gray-700 flex items-center gap-2">
              <span className="font-mono text-emerald-700 font-bold">02.</span> Synchronized bilingual speech narration
            </div>
            <div className="text-[12px] text-gray-700 flex items-center gap-2">
              <span className="font-mono text-emerald-700 font-bold">03.</span> Exportable LaTeX textbook notes
            </div>
          </div>
        )}

        {/* Audio Player Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }} className="flex-wrap sm:flex-nowrap">
          {/* Play button */}
          <button
            onClick={handleTogglePlay}
            style={{
              width: 44, height: 44, flexShrink: 0, border: `1px solid ${T.ink}`,
              background: playing ? '#991b1b' : T.ink, color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            className="hover:-translate-y-px active:translate-y-0 shadow-xs cursor-pointer"
            title={playing ? "Stop Narration" : "Listen in Hinglish"}
          >
            {playing ? (
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            ) : (
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Dynamic Waveform */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 34 }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: playing ? `${Math.max(15, (h * 100 * (0.6 + Math.sin(Date.now() / 200 + i) * 0.4)))}%` : `${h * 100}%`,
                    borderRadius: 1,
                    background: (i / bars.length) < progress ? '#6b46c1' : playing ? T.ink : '#d8d3c7',
                    transition: 'height 0.1s ease, background 0.1s ease',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', color: T.muted, fontWeight: 600 }}>
              <span>{playing ? 'PLAYING...' : '00:00'}</span>
              <span>HINGLISH VOICE</span>
            </div>
          </div>

          {/* Hinglish badge */}
          <button
            onClick={handleTogglePlay}
            style={{
              border: `1px solid ${playing ? '#6b46c1' : T.line}`,
              padding: '6px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: playing ? '#ffffff' : '#6b46c1',
              background: playing ? '#6b46c1' : T.paper,
              fontFamily: 'ui-monospace,monospace',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {playing ? '■ STOP AUDIO' : '▶ PLAY HINGLISH'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 4, background: '#e5e2d9', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#6b46c1', width: `${progress * 100}%`, transition: 'width 0.2s linear' }} />
        </div>

        {/* Bottom Spec Strip */}
        <div className="flex items-center justify-between pt-2 border-t border-[#d8d3c7]">
          <span style={{ fontSize: '0.72rem', fontFamily: 'ui-monospace,monospace', color: T.muted }}>
            Engine // Web Speech Synthesis
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'ui-monospace,monospace', color: T.green, fontWeight: 700 }}>
            0 SERVER LATENCY • CLIENT-SIDE
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   HINGLISH SECTION
──────────────────────────────────────────────────────── */
function HinglishSection() {
  return (
    <section className="section-gap border-t border-[#d8d3c7]" style={{ background: 'rgba(255,255,255,0.6)' }}>
      <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.green, margin: '0 0 12px' }}>
                [BILINGUAL_PEDAGOGY // NATIVE_VOICE]
              </p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: T.ink, margin: '0 0 16px' }}>
                In English.<br />In Hinglish.<br /><span style={{ color: '#6b46c1' }}>Your choice.</span>
              </h2>
              <p style={{ fontSize: '0.96rem', color: '#4b5563', lineHeight: 1.68, margin: 0 }}>
                Complex ideas click fastest when explained in natural conversational language. Socratic AI pairs textbook-level English mathematical prose with intuitive, bilingual Hinglish audio narration.
              </p>
            </div>

            {/* Feature Pills Matrix */}
            <div className="space-y-3 pt-2">
              {[
                { title: 'Global Academic Depth', desc: 'Precise English definitions, LaTeX equations, and structured theorems.' },
                { title: 'Conversational Hinglish Audio', desc: 'Bilingual audio breakdowns that explain tricky nuances naturally.' },
                { title: 'Synced Multimodal Learning', desc: 'Listen to spoken lessons while reading through interactive code and quizzes.' },
                { title: 'Distraction-Free PDF Export', desc: 'Download print-ready textbook notes anytime for offline study.' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    padding: '14px 18px',
                  }}
                  className="card-hover-lift flex items-start gap-3.5"
                >
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.78rem', fontWeight: 800, color: T.green, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <div>
                    <h4 style={{ fontSize: '0.90rem', fontWeight: 800, color: T.ink, margin: '0 0 2px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.80rem', color: T.muted, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Audio player */}
          <div className="lg:col-span-6 min-w-0">
            <AnimatedAudioPlayer />
          </div>
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
    <section className="w-full section-gap border-t border-[#d8d3c7]" style={{ background: 'transparent' }}>
      <div className="max-w-[680px] mx-auto px-5 sm:px-8 text-center">
        <p style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.4rem)', fontStyle: 'italic', fontFamily: 'Georgia,serif', color: T.ink, lineHeight: 1.5, margin: '0 0 10px' }}>
          "Education is the kindling of a flame, not the filling of a vessel."
        </p>
        <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.green }}>
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
    <footer
      style={{
        borderTop: `1px solid ${T.line}`,
        color: T.muted,
        padding: '20px 0',
        background: 'rgba(251, 250, 246, 0.92)',
        backdropFilter: 'blur(8px)',
        width: '100%',
      }}
      className="mt-auto"
    >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center text-center sm:text-left">
        <p style={{ fontSize: '0.80rem', margin: 0, fontFamily: 'ui-monospace,monospace' }}>
          A project by{' '}
          <a href={siteConfig.creator.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, fontWeight: 700, textDecoration: 'none' }} className="hover:underline">
            {siteConfig.creator.handle}
          </a>
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-5 items-center justify-center">
          {[
            { label: 'GitHub', href: siteConfig.links.githubRepo, external: true },
            { label: 'About', href: '/about', external: false },
            { label: 'Courses', href: '/my-courses', external: false },
            { label: 'Contact', href: siteConfig.creator.mailtoUrl, external: true },
          ].map(item => (
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                className="hover:text-[#111827] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                style={{ fontSize: '0.78rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                className="hover:text-[#111827] transition-colors"
              >
                {item.label}
              </Link>
            )
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

  useEffect(() => {
    document.title = 'Socratic AI';
  }, []);

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
    <div className="flex-1 flex flex-col justify-between">
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
