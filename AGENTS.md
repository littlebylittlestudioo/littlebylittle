# AGENTS.md — Liftapp Agent Guidelines

## Project Overview

Liftapp is a Thai emotional wellness app. It's a multi-page HTML/JS app with a serverless API on Cloudflare Pages.

- **Tech Stack:** Vanilla HTML/JS, Cloudflare Pages, Claude API
- **Code Structure:** Static files in `public/`, functions in `functions/api/`, utilities in `src/`
- **Development:** `npm run dev` → `wrangler pages dev .`

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
- **Never modify:** `server.js` (legacy local-only), `.dev.vars` (secrets)

### Testing & Verification
- Always test locally with `npm run dev` before committing
- Use curl to verify API endpoints work: `curl -X POST http://localhost:8788/api/insight ...`
- Check browser at `http://localhost:8788` to verify UI works
- No automated tests required — manual verification is sufficient for this project

### Cloudflare Pages API (Functions)
- Use `export async function onRequestPost(context)` for POST endpoints
- Access secrets via `context.env.VARIABLE_NAME`
- Return `Response.json({ ... })` for JSON responses
- All functions at `functions/api/` route to `/api/`

### Git Workflow
- Create commits frequently (after each logical step)
- Never force push or rewrite history
- Keep commits small and focused
- Use present tense: "add", "fix", "refactor" (not "added", "fixed")

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

### When to Ask for Help
- Unclear requirements or ambiguous instructions
- Blocked by missing dependencies or broken tests
- Unsure about Cloudflare Pages API behavior
- Need clarification on tone/style for Thai content

## Related Files
- `CLAUDE.md` — Claude Code IDE instructions
- `docs/ARCHITECTURE.md` — Detailed code structure documentation
