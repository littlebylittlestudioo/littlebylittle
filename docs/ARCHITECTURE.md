# Liftapp Code Architecture

## Directory Structure

### `public/` — Static Files
All user-facing files. Served directly by Cloudflare Pages.

- **HTML pages** (lowercase, hyphens): `index.html`, `prompt.html`, `answer.html`, `insight.html`, `diary.html`, `login.html`, `profile.html`, `donate.html`
- **Scripts:** `sets.js` (content)
- **Styles:** Inline CSS in HTML files (no separate CSS for simplicity)
- **Fonts:** `fonts/PG PicassoV2.ttf` (custom typography)

### `functions/` — Serverless Functions
Cloudflare Pages Functions (Workers runtime). Routes to `/api/*`.

- `functions/api/insight.js` — Claude API integration
  - Endpoint: `POST /api/insight`
  - Body: `{ entries: [{ date, prompt, answer }] }`
  - Returns: `{ insight: "..." }` (Thai text, 3-5 paragraphs)

### `src/` — Shared Client Code
Reusable JavaScript modules (future expansion, currently minimal).

- `constants.js` — Routes, storage keys, colors, API endpoints
- `nav-utils.js` — Navigation helpers, login guards

### `docs/` — Documentation
- `ARCHITECTURE.md` (this file)
- `superpowers/plans/` — Implementation plans

## Design Decisions

### No Framework
**Why:** Simplicity, fast load, minimal dependencies
**Trade-off:** More DOM manipulation code, no built-in state management

### Inline CSS
**Why:** Small codebase, single file per page
**Trade-off:** Can't share styles easily, harder to refactor
**Future:** Move to `public/styles.css` if it grows

### localStorage for State
**Why:** Simple auth and session state without a backend
**Trade-off:** No persistence across devices, security depends on user's browser
**Keys:**
- `liftapp_logged_in` (boolean)
- `liftapp_user` (JSON: name, photo)
- `liftapp_set_index` (current prompt index)
- `liftapp_redirect` (post-login redirect)
- `liftapp_back` (close button back-link)

### Firebase Auth (Client-Side Only)
**Why:** No backend needed, easy OAuth (Google, Facebook, LINE)
**Trade-off:** API keys in client code (acceptable for auth keys)
**Security:** User passwords never stored locally

### Responsive Design (3 Breakpoints)
**Why:** Support mobile, tablet, desktop without framework
**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px – 1199px
- Desktop: ≥ 1200px

### Claude API for Insights
**Why:** Compassionate, personalized emotional reflection
**Model:** `claude-sonnet-4-6`, max 500 tokens
**Tone:** Soft, non-clinical, Thai language
**Security:** API key in CF Pages secrets (not in code)

## Routing

### Static Routes (CF Pages)
All HTML files in `public/` are served directly:
- `/` → `index.html` (via `_redirects`)
- `/prompt.html` → `public/prompt.html`
- `/diary.html` → `public/diary.html`
- etc.

### API Routes (CF Pages Functions)
- `POST /api/insight` → `functions/api/insight.js`

### Navigation (Client-Side)
All navigation is `window.location.href = 'page.html'` (no single-page app framework).

Login and sensitive pages use localStorage guards:
```javascript
if (!localStorage.getItem('liftapp_logged_in')) {
  window.location.href = 'login.html';
}
```

## Data Flow

### Daily Prompt Cycling
1. `sets.js` has 60+ prompt objects
2. `localStorage.liftapp_set_index` tracks current prompt
3. Each page reads the current set and displays it
4. "Change question" button increments the index

### Diary Entry + Insight
1. User fills form on `diary.html`
2. Form submission collects `{ date, prompt, answer }`
3. Sends `POST /api/insight` with entries array
4. `functions/api/insight.js` calls Claude API
5. Claude returns Thai insight (3-5 paragraphs)
6. Insight displayed on `insight.html`

### User Login
1. User clicks login button
2. Navigates to `login.html`
3. Firebase SDK handles OAuth
4. On success, stores `{ name, photo }` in `localStorage.liftapp_user`
5. Sets `localStorage.liftapp_logged_in = true`
6. Redirects to `localStorage.liftapp_redirect` (post-login page)

## Performance

- **No build step:** Plain HTML/JS, instant load
- **Minimal dependencies:** Only Firebase and LINE LIFF SDKs (loaded via CDN)
- **Assets:** Figma-exported images via Figma API (external, not bundled)
- **Bundle size:** Single HTML file per page (~10-20KB), `sets.js` (~20KB)

## Future Expansion

### If Code Gets Larger
1. Move CSS to `public/styles.css` (shared styles)
2. Create `src/components/` for reusable UI components
3. Create `src/pages/` for page-specific logic
4. Consider a light bundler (e.g., esbuild) if modules grow

### If Users Grow
1. Move data to a real database (Cloudflare D1, Supabase, etc.)
2. Move auth backend to `functions/auth/` for security
3. Add caching layer to API responses

### If Features Expand
1. Add `functions/api/diary` for persisting entries
2. Add `functions/api/insights-history` for past insights
3. Add `functions/api/profile` for user settings
