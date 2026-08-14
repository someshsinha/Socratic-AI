# Socratic AI — System Architecture & Engineering Deep-Dive

This document provides a comprehensive technical overview of **Socratic AI**, covering system design, data flow pipelines, prompt engineering specifications, mathematical typography rendering, and security models.

---

## 1. High-Level Architecture

Socratic AI is structured as a decoupled full-stack application consisting of an **Editorial Single-Page Application (SPA)** on the frontend and an **Asynchronous RESTful Microservice** on the backend, integrated with external LLM engines, identity providers, and media APIs.

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (Browser)"]
        ReactApp["React 19 SPA (Vite)"]
        Router["React Router 7"]
        KaTeX["KaTeX / Remark Math Pipeline"]
        CodeHighlighter["Prism Syntax Highlighter"]
        AudioEngine["Web Audio / TTS Player"]
        Auth0SDK["@auth0/auth0-react SDK"]
    end

    subgraph APILayer ["API & Middleware Layer (Node.js / Express 5)"]
        ExpressApp["Express.js 5 Application"]
        AuthGuard["JWT Verification Middleware (RS256)"]
        Validator["express-validator Rules"]
        ErrorHandler["Centralized Error Middleware"]
    end

    subgraph ServiceLayer ["Business Logic & Services"]
        CourseService["Curriculum Synthesis Service"]
        LessonService["Lesson Generation Service"]
        TTSService["Edge TTS Audio Service"]
        YouTubeService["YouTube Data API Service"]
    end

    subgraph StorageLayer ["Persistence & Cloud"]
        MongoDB[(MongoDB Atlas)]
        Auth0Cloud["Auth0 Identity Provider"]
        GeminiAPI["Google Gemini 2.5 Flash"]
        YouTubeAPI["YouTube Data API v3"]
    end

    ReactApp --> Router
    Router --> Auth0SDK
    Auth0SDK <-->|OAuth 2.0 PKCE| Auth0Cloud
    ReactApp --> KaTeX & CodeHighlighter & AudioEngine

    ReactApp -->|HTTP REST + Bearer Token| ExpressApp
    ExpressApp --> AuthGuard --> Validator
    Validator --> CourseService & LessonService & TTSService & YouTubeService
    ErrorHandler -.->|Catches Exceptions| ExpressApp

    CourseService & LessonService -->|JSON Schema / Prompts| GeminiAPI
    YouTubeService -->|Search Queries| YouTubeAPI
    CourseService & LessonService <-->|Mongoose Models| MongoDB
```

---

## 2. Core Execution Pipelines

### 2.1. Curriculum Generation Pipeline
When a user submits a subject query (e.g. *"Distributed Systems"*):

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant API as Express API
    participant AI as Gemini 2.5 Flash
    participant DB as MongoDB

    User->>Client: Enters Topic ("Distributed Systems")
    Client->>API: POST /api/courses { topic: "Distributed Systems" }
    API->>AI: generateContent(CourseOutlinePrompt + JSON Schema)
    AI-->>API: Returns Structured Modules & Lessons (JSON)
    API->>DB: Atomically persist Course, Modules, and Empty Lesson stubs
    DB-->>API: Stored Course Document with populated _id
    API-->>Client: HTTP 201 { success: true, data: Course }
    Client->>User: Navigates to /course/:id with interactive outline
```

---

### 2.2. On-Demand Lesson Synthesis & Multimodal Rendering

Lessons are generated and cached on-demand with first-principles structure:

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant API as Express API
    participant AI as Gemini 2.5 Flash
    participant YouTube as YouTube API
    participant DB as MongoDB

    User->>Client: Clicks "Start Lesson"
    Client->>API: GET /api/lessons/:id
    alt Lesson Already Synthesized in DB
        API->>DB: Query Lesson by _id
        DB-->>API: Return Cached Lesson Content
    else Lesson Content Empty
        API->>AI: Synthesize Academic Lesson (LaTeX + Code + MCQs + Proofs)
        AI-->>API: Polymorphic Block Array JSON
        API->>YouTube: Query supplementary video lecture
        YouTube-->>API: Video ID & Metadata
        API->>DB: Save assembled blocks & reading time to Lesson
    end
    API-->>Client: Structured Content Blocks
    Client->>Client: Parse LaTeX via KaTeX, render Code & MCQs
    Client->>User: Renders full interactive textbook experience
```

---

## 3. Mathematical Typography Pipeline

Mathematical formulas in computer science and physics (quantum mechanics, algorithm complexity, linear algebra) require strict typography standards.

### The Problem
LLM outputs often alternate unpredictably between:
- Standard LaTeX blocks: `$$...$$`
- Inline markdown math: `$...$`
- Bare unescaped LaTeX symbols: `|\psi|^2`, `\frac{a}{b}`, `\hbar`, `\mathcal{O}(n \log n)`

### The Normalization Solution (`normalizeMath()`)
Socratic AI implements a multi-pass normalization pipeline prior to feeding content into `react-markdown`:

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart LR
    RawInput[Raw AI Output] --> RegexFilter[Math Normalization Filter]
    RegexFilter --> MathDelimiters[Inject $...$ / $$...$$ Delimiters]
    MathDelimiters --> RemarkMath[remark-math AST Parser]
    RemarkMath --> RehypeKatex[rehype-katex Math Renderer]
    RehypeKatex --> HTMLOutput[Pixel-Perfect Typography]
```

1. **Bare LaTeX Detection**: Detects common LaTeX operators (`\frac`, `\sqrt`, `\sum`, `\int`, Greek letters `\alpha-\omega`) lacking wrapping delimiters and wraps them in `$...$`.
2. **AST Parsing**: `remark-math` parses inline `$math$` and block `$$math$$` into mathematical nodes within the markdown abstract syntax tree.
3. **KaTeX Execution**: `rehype-katex` converts math AST nodes into high-performance KaTeX HTML/MathML rendering without layout shift.

---

## 4. Audio Narration & Voice Pedagogy

To accommodate auditory and multimodal learners, Socratic AI includes an AI-driven Text-to-Speech narration pipeline.

- **Content Summarization for Audio**: Raw markdown blocks (headers, code snippets, math formulas) are sanitized into clean, conversational prose suitable for speech synthesis.
- **Bilingual Capabilities**: Supports both clean standard English and localized Hinglish for conversational conceptual clarity.
- **Client-Side Media Controller**: A floating audio player (`NarrateButton.jsx`) provides full playback control (play, pause, scrub, speed modulation `0.75x - 2.0x`).

---

## 5. Security & Identity Architecture

Socratic AI enforces zero-trust stateless authorization using **Auth0** and standard OAuth 2.0 / OIDC specifications.

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart TD
    subgraph AuthFlow ["Authentication Flow"]
        UserLogin[User Clicks 'Start Learning' / 'Courses'] --> SaveDest[Save Destination to sessionStorage]
        SaveDest --> Auth0Redirect[Redirect to Auth0 Universal Login]
        Auth0Redirect --> Auth0Login[User Authenticates]
        Auth0Login --> Callback[Redirect to Origin /]
        Callback --> ResolveAuth[Auth0 Provider Resolves Session]
        ResolveAuth --> NavigateDest[App.jsx Reads sessionStorage & Navigates]
    end

    subgraph APISecurity ["API Security Architecture"]
        ClientRequest[Client Axios Request] --> BearerToken[Attach Bearer JWT via Token Provider]
        BearerToken --> ExpressServer[Express API Server]
        ExpressServer --> JWTMiddleware[express-oauth2-jwt-bearer]
        JWTMiddleware --> RS256Verify[Verify Signature against Auth0 JWKS]
        RS256Verify --> RouteHandler[Extract userSub & Execute Route]
    end
```

- **Algorithm**: RS256 Asymmetric Key Verification
- **JWKS Endpoint**: Automatically queries and caches public verification keys from Auth0 tenant
- **Audience Validation**: Enforces strict audience validation matching `http://localhost:3000` (or production API domain) to prevent token replay across different services.

---

## 6. Directory Structure & Module Organization

```text
Socratic-AI/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static assets (favicons, logos)
│   ├── src/
│   │   ├── assets/             # Branding imagery & logos
│   │   ├── components/         # Reusable UI & Layout Components
│   │   │   ├── blocks/         # Polymorphic Lesson Content Renderers
│   │   │   │   ├── CodeBlock.jsx      # Prism highlighter with wrap controls
│   │   │   │   ├── HeadingBlock.jsx   # Section headers with anchor targets
│   │   │   │   ├── MCQBlock.jsx       # Interactive KaTeX-enabled quizzes
│   │   │   │   ├── ParagraphBlock.jsx # Markdown & Math paragraph renderer
│   │   │   │   └── VideoBlock.jsx     # Responsive 16:9 YouTube embed frame
│   │   │   ├── LessonRenderer.jsx     # Master polymorphic block dispatcher
│   │   │   ├── Navbar.jsx             # Sticky responsive navigation bar
│   │   │   └── NarrateButton.jsx      # Voice narration audio player
│   │   ├── config/             # Global site & creator configuration
│   │   ├── pages/              # Route Pages (Home, About, MyCourses, CourseDetail, LessonViewer)
│   │   ├── utils/              # API clients, auth constants, and math normalizers
│   │   ├── App.jsx             # App layout & post-login redirect controller
│   │   ├── index.css           # Global typography, tokens, and print stylesheets
│   │   └── main.jsx            # Auth0 & Router initialization root
│   └── vite.config.js          # Vite toolchain configuration (strict port 5173)
│
├── server/                     # Backend RESTful API (Express 5 + Node.js)
│   ├── config/                 # Database & environment configurations
│   ├── controllers/            # Route controllers (course, lesson, health, youtube)
│   ├── middlewares/            # Auth0 JWT verification, validation & error handling
│   ├── models/                 # Mongoose database schemas (Course, Module, Lesson)
│   ├── routes/                 # Express router definitions
│   ├── services/               # Gemini AI synthesis, Edge TTS & YouTube services
│   └── server.js               # Express application entry point
│
├── docs/                       # Comprehensive Architecture & API Documentation
│   ├── ARCHITECTURE.md         # Detailed architectural and design documentation
│   └── API.md                  # Complete REST API reference specification
├── ERROR_LOG.md                # Production error & incident resolution log
├── LICENSE                     # MIT Open Source License
└── README.md                   # Primary portfolio overview & setup guide
```
