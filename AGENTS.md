# AGENTS.md — Liftapp Development Guide

> This is the single source of truth for all agents and Claude Code. See `CLAUDE.md` for a quick-start pointer.

## Quick Start

```bash
npm run dev                           # Start local dev at http://localhost:8788
npm start                             # Run legacy Node.js server (not used for CF Pages)
```

Update `.dev.vars` with your Anthropic API key before running `npm run dev`.

## Project Overview

**Liftapp** is a gentle emotional wellness app for Thai users. It guides reflection through daily prompts and generates AI insights using Claude.

- **Users:** Thai-speaking individuals seeking emotional support through journaling
- **Tech Stack:** Vanilla HTML/JS frontend, Claude API for insights, Cloudflare Pages for hosting
- **Tone:** Soft, compassionate, non-clinical — like "a quiet, emotionally intelligent friend"
- **Development:** `npm run dev` → `wrangler pages dev .`

## Code Structure

```
liftapp/
├── public/                   # Static files (HTML, CSS, JS, assets)
│   ├── index.html            # Home (entry point)
│   ├── prompt.html           # Daily question
│   ├── answer.html           # Answer form
│   ├── insight.html          # AI insights
│   ├── diary.html            # Journal entries
│   ├── login.html            # Firebase auth
│   ├── profile.html          # User profile
│   ├── donate.html           # Donation page
│   ├── sets.js               # Content (prompts, reflections)
│   └── fonts/                # Typography
├── functions/
│   └── api/
│       └── insight.js        # Claude API function
├── src/
│   ├── constants.js          # Shared constants & routes
│   └── nav-utils.js          # Navigation helpers
├── docs/
│   ├── ARCHITECTURE.md
│   └── superpowers/plans/    # Implementation plans
├── AGENTS.md                 # This file — instructions for all agents
├── CLAUDE.md                 # Quick-start pointer → AGENTS.md
├── wrangler.toml             # CF Pages config
├── .dev.vars                 # Local secrets (git-ignored)
└── server.js                 # Legacy Node.js dev server
```

## Guidelines for Agents

### Code Style
- **No framework:** Vanilla HTML/CSS/JS — keep it simple and readable
- **Naming:** Lowercase with hyphens for filenames (`diary.html`, not `Desktop_Diary.html`)
- **Comments:** Only document WHY, not WHAT. Code should be self-explanatory
- **Git commits:** Atomic, descriptive messages. Example: `feat: add diary entry validation`

### File Organization
- **Public assets:** `public/` — all HTML, CSS, JS accessible to users
- **`public/db.js`** — Firestore CRUD utility; loaded as a plain `<script>` tag; exposes `window.DB`
- **Server functions:** `functions/api/` — Cloudflare Pages Functions only
- **Shared utilities:** `src/` — client-side helper modules (ES module format, not currently loaded by HTML pages)
- **Never modify:** `server.js` (legacy local-only), `.dev.vars` (secrets), `.git/` and git history

### Before You Code
1. Read the relevant HTML file to understand context
2. Check `src/constants.js` and `src/nav-utils.js` for existing utilities
3. Test locally with `npm run dev` — don't assume it works
4. Use curl or browser DevTools to verify API calls

### When Editing HTML
- Update navigation links to use new lowercase filenames (`index.html`, `prompt.html`, etc.)
- Keep design consistent with existing color scheme (see `src/constants.js` for colors)
- Test on mobile (smallest viewport) — responsive design is important

### When Editing `functions/api/insight.js`
- Always preserve the SYSTEM_PROMPT structure (tone, Thai language, 3-5 paragraphs)
- Return errors as `Response.json({ error: "..." }, { status: 400 })`
- Use `context.env.ANTHROPIC_API_KEY` for the API key
- Test with curl: `curl -X POST http://localhost:8788/api/insight -H "Content-Type: application/json" -d '...'`

### Cloudflare Pages API (Functions)
- Use `export async function onRequestPost(context)` for POST endpoints
- Access secrets via `context.env.VARIABLE_NAME`
- Return `Response.json({ ... })` for JSON responses
- All functions at `functions/api/` route to `/api/`

### Auth (Firebase)
- Client-side only — no backend auth required
- Use `localStorage` to persist login state
- Correct storage keys: `littlebylittle_logged_in`, `littlebylittle_user`
- `littlebylittle_user` stores `{uid, name, email, photo, provider}` — `uid` is the Firebase UID (or LINE userId for LINE logins)
- Firebase SDK scripts are loaded inline in each HTML page — do not modify SDK URLs

### Data Persistence (Firestore)
- **`public/db.js`** is the shared Firestore utility module. It must be loaded after the three Firebase compat SDK scripts and before any page script that calls `DB.*` functions.
- **Required script order** for any page that uses Firestore:
  ```html
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="/db.js"></script>
  ```
- **`DB.init()`** fetches `/api/config`, initializes Firebase (guarded against double-init), creates the Firestore instance, and waits for Firebase Auth to restore the session. Always `await DB.init()` (or chain `.then()`) before any other `DB.*` call.
- **`DB.isLoggedIn()`** returns true when `littlebylittle_logged_in === '1'` AND `littlebylittle_user.uid` is set.
- **Write-through pattern:** all saves/deletes write to `localStorage` first (synchronously), then call the appropriate `DB.*` function in a `.then()` chain (best-effort, async). Firestore failures are caught and logged with `console.warn` — never block the user.
- **Firestore document IDs** for entries and diary are `YYYY-MM-DD` strings derived from the entry's `date` ISO string (one document per day).
- **Security rules** require `request.auth.uid == uid` — only Google and Facebook users satisfy this (they authenticate through Firebase). LINE users (LIFF) are not Firebase-authenticated and do NOT sync to Firestore.
- **localStorage data keys** (the ones that contain user journal data — clear on logout):
  - `littlebylittle_entries` — prompt answer array
  - `littlebylittle_diary` — diary entry array
  - `littlebylittle_has_entries` — flag string
  - `littlebylittle_insight_cache` — AI insight cache
- **localStorage session keys** (keep across logout — navigation/auth only):
  - `littlebylittle_logged_in`, `littlebylittle_user`, `littlebylittle_redirect`, `littlebylittle_back`, `littlebylittle_set_index`, `littlebylittle_bookmarks`
- **Migration on login:** `login.html` checks for local data before completing sign-in for Google/Facebook. If found, shows a modal offering to transfer (upload local → Firestore, then clear local) or cancel (Firebase sign-out, stay on login page).

## Git Workflow

- Create commits frequently (after each logical step)
- Never force push or rewrite history
- Keep commits small and focused
- Use present tense: "add", "fix", "refactor" (not "added", "fixed")

```bash
# Good commits:
git commit -m "feat: add profile settings screen"
git commit -m "fix: update navigation links to new lowercase filenames"
git commit -m "refactor: extract nav logic into src/nav-utils.js"
git commit -m "docs: add ARCHITECTURE.md"

# Avoid:
git commit -m "updated stuff"
git commit -m "fixes"
git commit -m "WIP"
```

## Testing & Verification

- Always test locally with `npm run dev` before committing
- **Manual browser test:** Open `http://localhost:8788`, click through screens
- **API test:** Use curl to POST to `/api/insight` with sample diary entries
- **Link test:** Verify all internal navigation links work (use browser DevTools)
- **Thai content:** If editing prompts/insights, verify Thai text displays correctly
- No automated tests required — manual verification is sufficient for this project

## Deployment

1. Push to GitHub (main branch)
2. Cloudflare Pages auto-deploys from `public/` directory
3. API secrets are set in CF Pages dashboard (Settings → Environment Variables)
4. No build step needed — all static files served as-is

## When Things Break

**Dev server won't start:** Kill any existing Node processes, clear `node_modules/.wrangler`, run `npm install` again

**API returns 500:** Check `.dev.vars` has your actual Anthropic API key (not placeholder)

**Navigation doesn't work:** Search for old filenames (`Desktop1.html`, etc.) and update to new names (`index.html`, etc.)

**Styles look broken:** Check that fonts load from `public/fonts/` and image URLs are correct (Figma API URLs should work)

## When to Ask for Help
- Unclear requirements or ambiguous instructions
- Blocked by missing dependencies or broken tests
- Unsure about Cloudflare Pages API behavior
- Need clarification on tone/style for Thai content

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Anthropic API Docs](https://docs.anthropic.com/en/api/getting-started)
- `docs/ARCHITECTURE.md` — Detailed code structure documentation
