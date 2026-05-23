# CLAUDE.md — Liftapp Development Guide

## Quick Start

```bash
npm run dev                           # Start local dev at http://localhost:8788
npm start                             # Run legacy Node.js server (not used for CF Pages)
```

Update `.dev.vars` with your Anthropic API key before running `npm run dev`.

## Project Context

**Liftapp** is a gentle emotional wellness app for Thai users. It guides reflection through daily prompts and generates AI insights using Claude.

- **Users:** Thai-speaking individuals seeking emotional support through journaling
- **Tech:** Vanilla HTML/JS frontend, Claude API for insights, Cloudflare Pages for hosting
- **Tone:** Soft, compassionate, non-clinical — like "a quiet, emotionally intelligent friend"

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
├── AGENTS.md                 # Instructions for subagents
├── CLAUDE.md                 # This file
├── wrangler.toml             # CF Pages config
├── .dev.vars                 # Local secrets (git-ignored)
└── server.js                 # Legacy Node.js dev server
```

## Key Practices

### Don't Modify These
- `server.js` — legacy, documented as local-only
- `.dev.vars` — secrets, git-ignored for user reasons
- `.git/` and git history — never force push or rewrite

### Do Modify These (Within Reason)
- HTML files in `public/` — page structure, layout
- `sets.js` — content (prompts, reflections)
- `functions/api/insight.js` — Claude API logic
- `src/` utilities — helper functions

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

## Deployment

1. Push to GitHub (main branch)
2. Cloudflare Pages auto-deploys from `public/` directory
3. API secrets are set in CF Pages dashboard (Settings → Environment Variables)
4. No build step needed — all static files served as-is

## Testing

- **Manual browser test:** Open `http://localhost:8788`, click through screens
- **API test:** Use curl to POST to `/api/insight` with sample diary entries
- **Link test:** Verify all internal navigation links work (use browser DevTools)
- **Thai content:** If editing prompts/insights, verify Thai text displays correctly

## Git Commit Examples

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

## When Things Break

**Dev server won't start:** Kill any existing Node processes, clear `node_modules/.wrangler`, run `npm install` again

**API returns 500:** Check `.dev.vars` has your actual Anthropic API key (not placeholder)

**Navigation doesn't work:** Search for old filenames (`Desktop1.html`, etc.) and update to new names (`index.html`, etc.)

**Styles look broken:** Check that fonts load from `public/fonts/` and image URLs are correct (Figma API URLs should work)

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Anthropic API Docs](https://docs.anthropic.com/en/api/getting-started)
- `AGENTS.md` — Instructions for subagents
