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
- **Server functions:** `functions/api/` — Cloudflare Pages Functions only
- **Shared utilities:** `src/` — client-side helper modules
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
- Keys: `liftapp_logged_in`, `liftapp_user`
- Firebase SDK is loaded in HTML — never modify auth keys or endpoints

### When to Ask for Help
- Unclear requirements or ambiguous instructions
- Blocked by missing dependencies or broken tests
- Unsure about Cloudflare Pages API behavior
- Need clarification on tone/style for Thai content

## Related Files
- `CLAUDE.md` — Claude Code IDE instructions
- `docs/ARCHITECTURE.md` — Detailed code structure documentation
