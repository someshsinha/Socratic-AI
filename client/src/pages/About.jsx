import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../config/siteConfig';

/* ────────────────────────────────────────────────────────
   DESIGN TOKENS (Academic / Editorial Socratic AI System)
──────────────────────────────────────────────────────── */
const T = {
  ink:   '#111827',
  muted: '#5f6673',
  paper: '#fbfaf6',
  panel: '#ffffff',
  line:  '#d8d3c7',
  green: '#2f6f4f',
  purple: '#6b46c1',
  accent: '#315f88',
};

export default function About() {
  const { creator, links, app } = siteConfig;

  useEffect(() => {
    document.title = 'About • Socratic AI';
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between" style={{ background: 'transparent', color: T.ink }}>
      <div className="page-content">
        
        {/* ═════════════════════════════════════════════════════════════
            1. HERO SECTION: Built for curious minds. Powered by purpose.
        ═════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pb-16 sm:pb-20 border-b border-[#d8d3c7]">
          {/* Left Column: Heading, Relaxed Spacing & Mission */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Eyebrow */}
            <p
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: T.green,
                margin: '0 0 12px',
              }}
            >
              [ABOUT // SOCRATIC_AI]
            </p>

            {/* Main Headline with relaxed word spacing and elegant leading */}
            <h1
              style={{
                fontSize: 'clamp(1.85rem, 5.2vw, 3.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.015em',
                lineHeight: 1.14,
                color: T.ink,
                margin: '0 0 16px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              Built for curious minds.{' '}
              <span style={{ color: T.purple }}>Powered by purpose.</span>
            </h1>

            {/* Lead description with comfortable breathing room */}
            <p
              style={{
                fontSize: '1.06rem',
                color: '#4b5563',
                lineHeight: 1.75,
                wordSpacing: '0.02em',
                maxWidth: 600,
                margin: '0 0 28px',
              }}
            >
              Socratic AI is an AI-powered curriculum generator and learning platform that creates deeply structured, high-quality courses on any topic — with clarity, depth, and academic rigor.
            </p>

            {/* 3 Monospace Feature Badges with proper sizing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {[
                {
                  label: 'AI-Generated Curricula',
                  icon: (
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ),
                },
                {
                  label: 'Deep, Structured Learning',
                  icon: (
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ),
                },
                {
                  label: 'Export Notes & PDFs',
                  icon: (
                    <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    padding: '13px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  className="card-hover-lift"
                >
                  <div>{badge.icon}</div>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace',
                      fontSize: '0.74rem',
                      fontWeight: 750,
                      color: T.ink,
                      lineHeight: 1.35,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Framed Socrates Artwork Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative p-6 sm:p-7 w-full max-w-sm flex flex-col items-center justify-center card-hover-lift"
              style={{
                border: `1px solid ${T.ink}`,
                background: T.panel,
                boxShadow: '0 16px 40px rgba(17,24,39,0.06)',
              }}
            >
              {/* Technical Header Strip */}
              <div
                className="w-full pb-3 mb-4 flex items-center justify-between border-b border-[#d8d3c7]"
              >
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.70rem', fontWeight: 700, color: T.green }}>
                  [SOCRATES // PHILOSOPHY]
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 font-semibold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              {/* Socratic Artwork Container */}
              <div className="relative w-56 h-56 my-2 flex items-center justify-center">
                <img
                  src="/socrates-hero.png"
                  alt="Socrates Archival Vector Illustration"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>

              {/* Technical Specification Bar */}
              <div className="w-full pt-3 mt-2 border-t border-[#d8d3c7] flex items-center justify-between">
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.68rem',
                    color: T.muted,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Pedagogy // Socratic Inquiry
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.68rem',
                    color: T.purple,
                    fontWeight: 700,
                  }}
                >
                  470 — 399 BCE
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* ═════════════════════════════════════════════════════════════
            2. THE IDEA: Turning Curiosity into a Structured Path
        ═════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-b border-[#d8d3c7]">
          {/* Section Eyebrow */}
          <p
            style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: T.green,
              margin: '0 0 16px',
            }}
          >
            [THE_IDEA // SOCRATIC_AI]
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: The Core Idea (Styled like the template panels) */}
            <div
              className="lg:col-span-5 p-8 sm:p-9 flex flex-col justify-between card-hover-lift"
              style={{
                border: `1px solid ${T.ink}`,
                background: T.panel,
                boxShadow: '0 16px 40px rgba(17,24,39,0.05)',
              }}
            >
              <div>
                {/* Technical Header Strip */}
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#d8d3c7]">
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.70rem', fontWeight: 700, color: T.green }}>
                    [CORE_THESIS]
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                    Principles
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.45rem, 2.5vw, 1.85rem)',
                    fontWeight: 900,
                    lineHeight: 1.28,
                    color: T.ink,
                    letterSpacing: '-0.02em',
                    margin: '0 0 20px',
                  }}
                >
                  “Turn curiosity into a structured path to understanding.”
                </h2>
              </div>

              {/* Bottom Premise Block */}
              <div className="pt-6 border-t border-[#d8d3c7] mt-8">
                <span
                  style={{
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: T.green,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  THE PREMISE
                </span>
                <p
                  style={{
                    fontSize: '0.90rem',
                    color: '#4b5563',
                    lineHeight: 1.68,
                    margin: 0,
                  }}
                >
                  Socratic AI starts with a simple idea: knowing what you want to learn should be enough to begin a serious learning journey.
                </p>
              </div>
            </div>

            {/* Right Box: 3 Core Pillars matching Template Styling */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              {[
                {
                  code: '01',
                  tag: 'INQUIRY',
                  title: 'Curiosity First',
                  desc: 'Start with a question, not a predefined course. Socratic AI turns curiosity into a structured path for exploration.',
                },
                {
                  code: '02',
                  tag: 'RIGOR',
                  title: 'Depth Over Noise',
                  desc: 'Courses are structured around fundamentals, clear explanations, and progressive depth — not disconnected summaries or surface-level answers.',
                },
                {
                  code: '03',
                  tag: 'MASTERY',
                  title: 'Learning That Lasts',
                  desc: 'Learn through knowledge checks, Hinglish audio narration, and carefully structured study notes designed to make difficult ideas easier to revisit.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    padding: '20px 24px',
                  }}
                  className="card-hover-lift flex items-start gap-4"
                >
                  {/* Monospace Code Pill */}
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center font-mono text-xs font-bold"
                    style={{
                      border: `1px solid ${T.ink}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  >
                    {pillar.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>
                        {pillar.title}
                      </h3>
                      <span
                        style={{
                          fontFamily: 'ui-monospace,monospace',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: T.muted,
                          letterSpacing: '0.04em',
                        }}
                      >
                        [{pillar.tag}]
                      </span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ═════════════════════════════════════════════════════════════
            3. CREATOR STORY: Built by a Learner (Somesh Sinha)
        ═════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-b border-[#d8d3c7]">
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.green,
              margin: '0 0 16px',
            }}
          >
            [CREATOR // BUILT_BY_A_LEARNER]
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Card: Profile & Bio */}
            <div
              className="lg:col-span-7 p-8 sm:p-10 card-hover-lift flex flex-col justify-between"
              style={{
                border: `1px solid ${T.line}`,
                background: T.panel,
              }}
            >
              <div>
                {/* Header with Avatar & Details */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                  {/* Avatar with fallback */}
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-20 h-20 rounded-full border border-[#111827] object-cover shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=Somesh+Sinha&background=111827&color=fff';
                    }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: T.ink, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                      {creator.name}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: T.muted, margin: '0 0 6px', fontFamily: 'ui-monospace,monospace' }}>
                      {creator.tagline}
                    </p>
                    {/* Role Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {creator.roleBadges.map((badge, idx) => (
                        <span
                          key={badge}
                          style={{
                            fontFamily: 'ui-monospace,monospace',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: idx === 0 ? T.green : idx === 1 ? T.purple : T.accent,
                            background: 'rgba(17,24,39,0.03)',
                            border: `1px solid ${T.line}`,
                            padding: '2px 8px',
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personal Story & Purpose */}
                <div className="pt-2">
                  <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.75, margin: '0 0 16px' }}>
                    I built Socratic AI around a simple problem. Discovering something worth learning is easy, but figuring out how to learn it properly can be much harder. When you start exploring a complex or unfamiliar subject, it is often difficult to find something that gives you enough depth without immediately overwhelming you.
                  </p>
                  <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.75, margin: 0 }}>
                    Socratic AI is my attempt to make that process easier. It uses generative AI to turn a topic into a structured course with modules, lessons, study material, and assessments. The idea is to give curious learners a clear place to start and a sensible path to follow, while still giving them enough depth to really understand what they are learning.
                  </p>
                </div>
              </div>

              {/* Action Buttons: GitHub, LinkedIn, Email */}
              <div className="flex flex-wrap items-center gap-3 pt-8 mt-6 border-t border-[#d8d3c7]">
                <a
                  href={creator.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: `1px solid ${T.ink}`,
                    background: T.ink,
                    color: '#ffffff',
                    padding: '9px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    fontFamily: 'ui-monospace,monospace',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>View on GitHub</span>
                </a>

                <a
                  href={creator.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: `1px solid ${T.ink}`,
                    background: '#ffffff',
                    color: T.ink,
                    padding: '9px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    fontFamily: 'ui-monospace,monospace',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  className="hover:-translate-y-px active:translate-y-0 hover:bg-[#fbfaf6] transition-transform shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 text-[#0077b5] fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
                  </svg>
                  <span>Connect on LinkedIn</span>
                </a>

                <a
                  href={creator.mailtoUrl}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    color: T.muted,
                    padding: '9px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    fontFamily: 'ui-monospace,monospace',
                    textDecoration: 'none',
                  }}
                  className="hover:text-black hover:border-gray-900 transition-colors"
                >
                  ✉️ {creator.email}
                </a>
              </div>
            </div>

            {/* Right Side: 4 Project-Focused Architectural Focus Cards */}
            <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
              {[
                {
                  code: '01',
                  tag: 'PATHWAY',
                  title: 'Structured Modules',
                  desc: 'Turns broad or ambiguous topics into an ordered, step-by-step curriculum with clear conceptual milestones.',
                },
                {
                  code: '02',
                  tag: 'DEPTH',
                  title: 'Progressive Rigor',
                  desc: 'Bridges shallow introductions and overwhelming academic material by introducing foundational depth progressively.',
                },
                {
                  code: '03',
                  tag: 'MODES',
                  title: 'Multimodal Synthesis',
                  desc: 'Combines formatted LaTeX formulas, concise prose, code samples, and bilingual Hinglish audio narration.',
                },
                {
                  code: '04',
                  tag: 'MASTERY',
                  title: 'Self-Assessments',
                  desc: 'Reinforces learning at the end of each lesson through interactive knowledge checks and instant conceptual feedback.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    padding: '16px 20px',
                  }}
                  className="card-hover-lift flex items-start gap-3.5"
                >
                  {/* Monospace Code Index */}
                  <div
                    className="w-8 h-8 shrink-0 flex items-center justify-center font-mono text-xs font-bold"
                    style={{
                      border: `1px solid ${T.ink}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  >
                    {item.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: T.ink, margin: 0 }}>
                        {item.title}
                      </h3>
                      <span
                        style={{
                          fontFamily: 'ui-monospace,monospace',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          color: T.muted,
                          letterSpacing: '0.04em',
                        }}
                      >
                        [{item.tag}]
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.55, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ═════════════════════════════════════════════════════════════
            4. ARCHITECTURE & TECH STACK: Built with Open Tech
        ═════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-b border-[#d8d3c7]">
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.green,
              margin: '0 0 6px',
            }}
          >
            [TECH_STACK // UNDER_THE_HOOD]
          </p>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: T.ink,
              margin: '0 0 24px',
            }}
          >
            Built with modern, open technologies.
          </h2>

          {/* 6 Tech Badges Grid with Authentic Brand SVGs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
            {[
              {
                name: 'React 18 & Vite',
                category: 'Frontend Client',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 256 228" fill="none">
                    <path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Z" />
                    <circle cx="128" cy="113.67" r="23" fill="#00D8FF" />
                  </svg>
                ),
              },
              {
                name: 'Node.js & Express',
                category: 'Backend REST API',
                icon: (
                  <svg className="w-7 h-7 text-[#539e43]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l9 5.2v10.4L12 23l-9-5.2V7.2L12 2zm0 2.3L4.8 8.4v7.2L12 19.7l7.2-4.1V8.4L12 4.3zm-1.8 4.2h3.6c1.2 0 2.2 1 2.2 2.2v2.6c0 1.2-1 2.2-2.2 2.2h-3.6c-1.2 0-2.2-1-2.2-2.2v-2.6c0-1.2 1-2.2 2.2-2.2zm0 1.8v3.4h3.6v-3.4h-3.6z" />
                  </svg>
                ),
              },
              {
                name: 'MongoDB Atlas',
                category: 'Document Store',
                icon: (
                  <svg className="w-7 h-7 text-[#13aa52]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.002 0c-.267 0-.53.078-.756.23L4.254 5.093c-.482.324-.766.86-.766 1.437v10.94c0 .577.284 1.113.766 1.437l6.992 4.863c.226.152.489.23.756.23s.53-.078.756-.23l6.992-4.863c.482-.324.766-.86.766-1.437V6.53c0-.577-.284-1.113-.766-1.437L12.758.23c-.226-.152-.489-.23-.756-.23zm-.002 2.5l5.5 3.82v9.36l-5.5 3.82-5.5-3.82V6.32l5.5-3.82z" />
                    <path d="M12 5.5c-.8 2.2-2 4.5-2 7 0 1.8.8 3.5 2 4.5 1.2-1 2-2.7 2-4.5 0-2.5-1.2-4.8-2-7z" fill="#00ed64" />
                  </svg>
                ),
              },
              {
                name: 'Google Gemini',
                category: 'LLM Architect',
                icon: (
                  <svg className="w-7 h-7 text-[#7c3aed]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                ),
              },
              {
                name: 'Tailwind & KaTeX',
                category: 'CSS & Math Engine',
                icon: (
                  <svg className="w-7 h-7 text-[#06b6d4]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
                  </svg>
                ),
              },
              {
                name: 'Auth0 Security',
                category: 'JWT & OAuth2',
                icon: (
                  <svg className="w-7 h-7 text-[#eb5424]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                ),
              },
            ].map((tech) => (
              <div
                key={tech.name}
                style={{
                  border: `1px solid ${T.line}`,
                  background: T.panel,
                  padding: '20px 14px',
                  textAlign: 'center',
                }}
                className="card-hover-lift flex flex-col items-center justify-center"
              >
                <div className="mb-3 flex items-center justify-center w-10 h-10">
                  {tech.icon}
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: T.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  {tech.name}
                </span>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.68rem', color: T.muted }}>
                  {tech.category}
                </span>
              </div>
            ))}
          </div>

          {/* Open Source Banner */}
          <div
            style={{
              border: `1px solid ${T.line}`,
              background: 'rgba(251,250,246,0.85)',
              padding: '24px 28px',
            }}
            className="card-hover-lift flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{ border: `1px solid ${T.ink}`, background: T.panel }}
              >
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: T.ink, margin: '0 0 2px' }}>
                  Open source at heart. Built for learners. By a learner.
                </h3>
                <p style={{ fontSize: '0.84rem', color: T.muted, margin: 0 }}>
                  Socratic AI is free, open, and community-driven. Explore the source code, contribute, or fork.
                </p>
              </div>
            </div>

            <a
              href={links.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: `1px solid ${T.ink}`,
                background: T.ink,
                color: '#ffffff',
                padding: '10px 20px',
                fontSize: '0.82rem',
                fontWeight: 750,
                fontFamily: 'ui-monospace,monospace',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              className="hover:-translate-y-px active:translate-y-0 transition-transform shadow-sm"
            >
              Star on GitHub ↗
            </a>
          </div>
        </section>


        {/* ═════════════════════════════════════════════════════════════
            5. PLATFORM METRICS (4-Column Monospace Stats Strip)
        ═════════════════════════════════════════════════════════════ */}
        <div
          className="mt-16 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{
            border: `1px solid ${T.line}`,
            background: T.panel,
          }}
        >
          {/* Stat 1 */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b sm:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>AI-Gen</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Multi-Module Syllabi</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b lg:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>Poly-Blocks</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Video, MCQ & Code</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-[#d8d3c7]">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>Hinglish</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>Speech Audio Synthesis</p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ border: `1px solid ${T.line}`, background: T.paper }}>
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.45rem', fontWeight: 900, color: T.ink, lineHeight: 1, margin: 0 }}>100%</p>
              <p style={{ fontSize: '0.74rem', color: T.muted, margin: '4px 0 0' }}>LaTeX & Math Notes</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${T.line}`,
          color: T.muted,
          padding: '24px 0',
          background: 'rgba(251, 250, 246, 0.92)',
          backdropFilter: 'blur(8px)',
          width: '100%',
        }}
        className="mt-auto"
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.82rem', margin: 0, fontFamily: 'ui-monospace,monospace' }}>
            A project by{' '}
            <a href={creator.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.ink, fontWeight: 700, textDecoration: 'none' }} className="hover:underline">
              {creator.handle}
            </a>
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'GitHub', href: links.githubRepo, external: true },
              { label: 'About', href: '/about', external: false },
              { label: 'Courses', href: '/my-courses', external: false },
              { label: 'Contact', href: creator.mailtoUrl, external: true },
            ].map(item => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                  className="hover:text-[#111827] transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  style={{ fontSize: '0.80rem', color: T.muted, textDecoration: 'none', fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}
                  className="hover:text-[#111827] transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
