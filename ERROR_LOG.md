# Socratic-AI — Error Resolution & Incident Log

This document records all errors, exceptions, and anomalies encountered during development, along with their root causes, system impact, and exact resolutions.

---

## Incident #001: 401 UnauthorizedError on `/api/courses/user-courses`

### Metadata
- **Date**: August 14, 2026
- **Component**: Backend (`server/middlewares/auth.middleware.js`, `server/middlewares/error.middleware.js`) & Frontend (`client/src/pages/MyCourses.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms & Stack Trace
```text
UnauthorizedError: Unauthorized
    at getToken (/home/coderpanda/Socratic-AI/server/node_modules/express-oauth2-jwt-bearer/dist/index.js:888:19)
    at Object.verify (/home/coderpanda/Socratic-AI/server/node_modules/express-oauth2-jwt-bearer/dist/index.js:902:35)
    at /home/coderpanda/Socratic-AI/server/node_modules/express-oauth2-jwt-bearer/dist/index.js:1154:39
    at Layer.handleRequest (/home/coderpanda/Socratic-AI/server/node_modules/router/lib/layer.js:152:17)
    at next (/home/coderpanda/Socratic-AI/server/node_modules/router/lib/route.js:157:13)
    at Route.dispatch (/home/coderpanda/Socratic-AI/server/node_modules/router/lib/route.js:117:3)
    at handle (/home/coderpanda/Socratic-AI/server/node_modules/router/index.js:435:11)
{
  status: 401,
  statusCode: 401,
  headers: {
    'WWW-Authenticate': 'Bearer realm="api", DPoP algs="RS256 RS384 RS512 PS256 PS384 PS512 ES256 ES256K ES384 ES512 EdDSA"'
  }
}
```

### Root Cause
1. **Unauthenticated / Premature API Calls**: The `MyCourses.jsx` component mounted and immediately attempted to execute `api.get('/courses/user-courses')` before Auth0 finished resolving authentication state or when a guest visited the page without a Bearer token.
2. **Missing Explicit Audience Parameter**: When calling `getAccessTokenSilently()`, Auth0 requires an explicit audience parameter (`audience: import.meta.env.VITE_AUTH0_AUDIENCE`) to issue a valid JWT Bearer token configured for `http://localhost:3000`.
3. **Noisy Error Logging**: `server/middlewares/error.middleware.js` was dumping full stack traces to `console.error` for standard 401 unauthenticated requests.

### Resolution Steps
1. **Centralized Error Handler (`server/middlewares/error.middleware.js`)**:
   - Added explicit handling for `UnauthorizedError` (HTTP 401) to return structured JSON `{ success: false, error: 'Unauthorized', message: ... }` without polluting server logs with stack traces.
2. **Auth0 Token Resolution (`client/src/pages/MyCourses.jsx`)**:
   - Guarded API calls: network requests to `/api/courses/user-courses` only execute when `isAuthenticated === true` and `authLoading === false`.
   - Updated `getAccessTokenSilently` to pass `{ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE } }`.
3. **Authentication Gating & Routing (`Navbar.jsx` & `MyCourses.jsx`)**:
   - Unauthenticated visitors on `/my-courses` or clicking "Courses" / "Start Learning →" are directed to Auth0 login with `returnTo: '/my-courses'`.
   - Authenticated users transition directly to their personal library.
4. **Database Query Optimization (`server/controllers/course.controller.js`)**:
   - Sorted user courses by `createdAt: -1` and populated nested modules and lessons.

---

## Incident #002: PostCSS `@import` Order Warning / Build Failure

### Metadata
- **Date**: August 14, 2026
- **Component**: Client Stylesheet (`client/src/index.css`)
- **Status**: ✅ Resolved

### Error Symptoms
```text
[postcss] @import must precede all other statements (besides @charset or empty @layer)
```

### Root Cause
Google Fonts `@import url(...)` declarations were placed after Tailwind CSS `@tailwind` directives in `client/src/index.css`, violating CSS/PostCSS specification rules.

### Resolution Steps
1. Removed `@import` from `client/src/index.css`.
2. Re-verified Vite build with `npx vite build` (zero errors).

---

## Incident #003: Auth0 Callback URL Mismatch (Oops! Something went wrong)

### Metadata
- **Date**: August 14, 2026
- **Component**: Client Auth0 Configuration (`client/vite.config.js`, `client/src/main.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms & Screenshot Details
```text
Socratic-AI: Oops!, something went wrong
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```
Auth0 authorize URL contained: `redirect_uri=http%3A%2F%2Flocalhost%3A5174`.

### Root Cause
1. An orphaned background process was holding port `5173`. When `npm run dev` was launched in the terminal, Vite automatically fell back to port `5174` (`http://localhost:5174`).
2. Auth0 Dashboard strictly whitelists `http://localhost:5173` in its **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins**. When Auth0 received `redirect_uri=http://localhost:5174`, it rejected the authorization request with `Callback URL mismatch`.

### Resolution Steps
1. **Enforce Port 5173 (`client/vite.config.js`)**:
   - Added `server: { port: 5173, strictPort: true }` to guarantee Vite always runs on port 5173 and avoids silent port hopping.
2. **Freed Port 5173**:
   - Terminated the orphaned process holding port 5173.
3. **Re-verified Callback Handshake**:
   - Requests now originate from `http://localhost:5173`, perfectly matching Auth0 dashboard credentials.

---

## Incident #004: YouTube API Rate Limit & Broken Embed Iframe Handling

### Metadata
- **Date**: August 14, 2026
- **Component**: Supplemental Video Renderer (`client/src/components/blocks/VideoBlock.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms
When repeated development searches hit the YouTube Data API v3 quota (`quotaExceeded` / HTTP 403) or when video streams were blocked, the lesson renderer previously broke the page visual flow or displayed an empty grey rectangle.

### Root Cause
1. YouTube Data API v3 free tier enforces daily quota limits (10,000 units/day). Rapid test requests during curriculum generation exhaust the API quota.
2. If the backend returned an error or empty `videoId`, the component fell back to an unformatted error box that disrupted the reading layout and broke the standard 16:9 player proportions.

### Resolution Steps
1. **Preserved 16:9 Aspect Ratio Frame (`VideoBlock.jsx`)**:
   - Guaranteed the video container maintains its exact `aspect-video w-full` dimensions across all states (loading, ready, error, rate-limited) without shifting the surrounding textbook layout.
2. **Branded Academic Fallback Component**:
   - Replaced raw browser errors with a branded 16:9 container featuring:
     - Centered video/play badge.
     - "Video temporarily unavailable" status notice with recommended topic label.
     - Direct `[ WATCH ON YOUTUBE ↗ ]` action opening the topic query on YouTube.
3. **Zero Layout Shift**:
   - Preserved identical margin and padding hierarchy matching the surrounding editorial design.

---

## Incident #005: Raw Unrendered LaTeX Formulas in MCQ Knowledge Checks

### Metadata
- **Date**: August 14, 2026
- **Component**: Assessment Renderer (`client/src/components/blocks/MCQBlock.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms & Screenshot Details
In quantum mechanics and scientific lessons, question prompts such as:
> *"In quantum mechanics, what physical meaning is attributed to the square of the absolute value of the wave function, |\psi|^2?"*

were displayed with raw, unparsed LaTeX markup (`|\psi|^2?`) instead of formatted mathematical typography ($\lvert\psi\rvert^2$).

### Root Cause
1. **Direct String Interpolation**: `MCQBlock.jsx` rendered `{question}`, `{option}`, and `{explanation}` as plain unparsed strings instead of passing them through a KaTeX / Markdown pipeline.
2. **Bare LaTeX Delimiters**: AI-generated quiz questions frequently contain bare LaTeX macros (e.g. `|\psi|^2`, `\frac{a}{b}`, `\hbar`, `\alpha`) without outer markdown `$...$` delimiters, which prevented standard markdown parsers from treating them as inline math.

### Resolution Steps
1. **Integrated KaTeX Pipeline (`MCQBlock.jsx`)**:
   - Integrated `ReactMarkdown` with `remark-gfm`, `remark-math` (`{ singleDollar: true }`), and `rehype-katex`.
2. **LaTeX Math Normalization**:
   - Implemented `normalizeMath()` utility that automatically detects bare LaTeX expressions, operators, Greek letters, and exponents, wrapping them in `$...$` for KaTeX rendering.
3. **Full MCQ Coverage**:
   - Applied math rendering across all question prompts, interactive option choices, explanation feedback cards, and print/PDF views.

---

## Incident #006: Mobile Responsiveness — Cramped Layout & Insufficient Spacing

### Metadata
- **Date**: August 14, 2026
- **Component**: All pages (`Home.jsx`, `About.jsx`, `CourseDetail.jsx`, `MyCourses.jsx`, `LessonViewer.jsx`) & Global CSS (`index.css`)
- **Status**: ✅ Resolved

### Error Symptoms
On mobile viewports (≤640px), all pages exhibited severe visual crowding:
- Elements were jammed together with insufficient breathing room between sections.
- Page wrappers used only `px-4 py-5` (16px / 20px) padding — insufficient for comfortable reading on small screens.
- Font and component sizes did not scale down proportionally, causing overflow and visual asymmetry.
- Individual sections (Hero, HowItWorks, WhatYouGet, HinglishSection, QuoteSection) had no consistent vertical rhythm.

### Root Cause
1. **No Global Spacing Contract**: Each page and section hardcoded its own padding/margin inconsistently. There was no shared responsive spacing system.
2. **Flat Mobile Padding**: All page wrappers used `px-4 py-5 sm:px-6 sm:py-8 lg:px-8` — too tight for mobile.
3. **Inline `style` Padding on Sections**: Some sections (e.g. `HinglishSection`) used `style={{ padding: '80px 0' }}` which didn't adapt to mobile at all.

### Resolution Steps
1. **Global Spacing Utilities (`client/src/index.css`)**:
   - Added `.page-content` class: `36px 20px` padding on mobile → `48px 32px` on tablet → `56px 40px` on desktop.
   - Added `.section-gap` class: `48px` vertical padding on mobile → `64px` on tablet → `80px` on desktop.
2. **All Page Wrappers Updated**:
   - Replaced `flex-1 w-full max-w-[1240px] mx-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8 pb-16` with `.page-content` in `About.jsx`, `CourseDetail.jsx`, `MyCourses.jsx`, `LessonViewer.jsx`.
3. **Home Page Sections**:
   - All sections (`HeroSection`, `HowItWorks`, `WhatYouGet`, `HinglishSection`, `QuoteSection`) switched to `.section-gap` with `px-5 sm:px-8 lg:px-12` side padding.

---

## Incident #007: Sticky Navbar Broken by `overflow-x: hidden` on `html` Element

### Metadata
- **Date**: August 14, 2026
- **Component**: Global CSS (`client/src/index.css`), Navbar (`client/src/components/Navbar.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms
The navbar (`position: sticky; top: 0`) stopped sticking to the top of the viewport on scroll. Users could scroll past the navbar, causing it to disappear off-screen.

### Root Cause
`overflow-x: hidden` was applied to the `html` element in `index.css`. This is a known browser behaviour: when any `overflow` property (including `overflow-x`) is set on the `<html>` element, the browser designates `<html>` as the scroll container instead of the viewport. `position: sticky` computes its scroll boundary relative to its nearest scrolling ancestor — which became `<html>` rather than the viewport — silently breaking stickiness.

### Resolution Steps
1. **Removed `overflow-x: hidden` and `max-width: 100vw` from `html` element** in `index.css`.
   - `overflow-x: hidden` was retained only on `body`, which does not exhibit this sticky-breaking behaviour.
   - Added a comment explaining why `overflow` must never be set on `html`.
2. **Logo Size & Header Proportions Balanced (`Navbar.jsx`)**:
   - Adjusted logo sizing to `h-18 sm:h-22 md:h-26` with compact padding `py-0.5 sm:py-1` so the brand icon/logo is prominent, large, and crisp.

---

## Incident #008: Post-Login Redirect Returns to Home Instead of Intended Page

### Metadata
- **Date**: August 14, 2026
- **Component**: Auth0 Provider (`client/src/main.jsx`), App Shell (`client/src/App.jsx`), Navbar (`client/src/components/Navbar.jsx`), Auth Constants (`client/src/utils/authConstants.js`)
- **Status**: ✅ Resolved

### Error Symptoms
When an unauthenticated user clicked **"Courses"** or **"Start Learning →"**, they were redirected to Auth0 for login. After a successful login, Auth0 redirected them back to the app's root (`/`) instead of the originally intended `/my-courses` page.

### Root Cause
1. **Missing `onRedirectCallback`**: The `Auth0Provider` in `main.jsx` had no `onRedirectCallback` prop. Without it, Auth0 ignores the `appState` object (which contains `returnTo: '/my-courses'`) after login and simply lands on the `redirect_uri` root URL.
2. **Provider Hierarchy Constraint**: `onRedirectCallback` requires `useNavigate()` from React Router. However, `Auth0Provider` wrapped `BrowserRouter` in the original structure.
3. **Circular Import Trap**: Exporting constants from `App.jsx` to `Navbar.jsx` while `App.jsx` imported `Navbar.jsx` created a circular dependency where `REDIRECT_KEY` resolved as `undefined`, causing initialization failures.

### Resolution Steps
1. **Decoupled Auth Constants (`client/src/utils/authConstants.js`)**:
   - Created standalone `authConstants.js` exporting `REDIRECT_KEY = 'auth_redirect_to'` to eliminate circular dependencies.
2. **`sessionStorage`-based Redirect (`client/src/App.jsx`, `client/src/components/Navbar.jsx`)**:
   - In `Navbar.jsx`, before calling `loginWithRedirect()`, the intended destination (`/my-courses`) is saved: `sessionStorage.setItem(REDIRECT_KEY, '/my-courses')`.
   - In `App.jsx`, a `useEffect` watches `isAuthenticated` and `isLoading`. When authentication resolves, it checks `sessionStorage` for a stored destination, navigates there with `replace: true`, and clears the key.
3. **Maintained Safe Structure**: Kept `Auth0Provider` wrapping `BrowserRouter` in `main.jsx` for clean Auth0 URL parsing.

---

## Incident #009: Dark Gap Stripe Between Header and Mobile Navigation Drawer

### Metadata
- **Date**: August 15, 2026
- **Component**: Navbar (`client/src/components/Navbar.jsx`)
- **Status**: ✅ Resolved

### Error Symptoms
When opening the mobile drawer menu on small screens, a dark horizontal stripe appeared between the navbar bottom border and the dropdown drawer.

### Root Cause
1. **Backdrop Bleed Through**: The backdrop element used `top-[52px]` which did not align with the updated navbar height. When the navbar had semi-transparent background (`rgba(251,250,246,0.95)`), the dark backdrop overlay showed through the navbar and gap.

### Resolution Steps
1. **Solid Navbar Surface**: Set `background: '#fbfaf6'` on `<nav>` to eliminate transparency bleed.
2. **Seamless Full Backdrop**: Positioned backdrop at `fixed inset-0 bg-black/35 z-40` behind the `z-50` navbar and drawer, ensuring the drawer attaches flush below the navbar with zero visual artifacts.

---

## Incident #010: Code Block Mobile Responsiveness & Overflow Clipping

### Metadata
- **Date**: August 15, 2026
- **Component**: Code Renderer (`client/src/components/blocks/CodeBlock.jsx`), Styles (`client/src/index.css`)
- **Status**: ✅ Resolved

### Error Symptoms
On mobile screens, code blocks displayed clipped lines on long comments/statements, had inflexible font sizes, and lacked smooth touch scrolling.

### Root Cause
1. Fixed font sizing (`0.84rem`) and wide line-number gutters (`2.5em`) consumed disproportionate horizontal width on small screens.
2. Long code lines overflowed without line wrap options or custom touch-optimized scrollbars.

### Resolution Steps
1. **Responsive Typography**: Set font size to `clamp(0.70rem, 2.7vw, 0.82rem)` with compact `1.8em` line-number gutters on mobile.
2. **Interactive Wrap Toggle with Prism Overrides**: Added a `[ WRAP ]` / `✓ [ WRAPPED ]` switch with explicit `lineProps` (`whiteSpace: 'pre-wrap'`, `wordBreak: 'break-all'`) and `codeTagProps` style overrides to bypass Prism's default `whiteSpace: pre` restriction.
3. **Smooth Touch Scrolling**: Enabled `-webkit-overflow-scrolling: touch` and added dark custom scrollbar styles in `index.css`.
4. **Mobile Lesson Table of Contents (`LessonViewer.jsx`)**: Added a collapsible accordion `[ TOC // N SECTIONS ▾ ]` at the top of lessons on mobile viewports, enabling single-tap section jumping.



