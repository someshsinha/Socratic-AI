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
