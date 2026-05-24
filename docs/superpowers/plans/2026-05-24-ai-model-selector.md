# AI Model Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the server operator to switch between Claude (Haiku) and DeepSeek (v4 Flash) by setting an environment variable — no user-facing toggle, no frontend changes.

**Architecture:** `functions/api/insight.js` reads `env.AI_PROVIDER` (`'claude'` or `'deepseek'`, default `'claude'`) and routes the request to the appropriate API. Model IDs are hard-coded constants in the file. The frontend sends entries as before; the provider decision is invisible to the client.

**Tech Stack:** Cloudflare Workers (functions), Anthropic API, DeepSeek API (OpenAI-compatible)

---

## File Map

| File | Change |
|------|--------|
| `functions/api/insight.js` | Add model constants, extract `callClaude`/`callDeepSeek` helpers, route on `env.AI_PROVIDER` |
| `.dev.vars` | Add `AI_PROVIDER` and `DEEPSEEK_API_KEY` for local testing (git-ignored) |

No frontend files change.

---

### Task 1: Refactor insight API for server-side provider selection

**Files:**
- Modify: `functions/api/insight.js`

- [ ] **Step 1: Replace the file content**

```js
// functions/api/insight.js

const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

const SYSTEM_PROMPT = `
You are not a therapist, mental health professional, or productivity coach.

You are a gentle emotional companion designed to help users reflect on their feelings,
thoughts, emotional patterns, and inner experiences in a soft, safe, and compassionate way.

Your purpose is not to diagnose, analyze, judge, or solve the user's life.

Your role is to:
- help users feel emotionally seen
- gently reflect emotional patterns
- encourage self-awareness
- offer soft cognitive reframes inspired by CBT
- create emotional safety
- help users become kinder to themselves

The experience should feel like: "a quiet, emotionally intelligent friend sitting beside the user."

Core Principles:
1. Never sound clinical. Do NOT use psychological diagnostic language. Use soft reflective language like "It seems like...", "Maybe...", "Sometimes...", "We noticed that...", "It sounds like..."
2. Never judge or define the user. Describe experiences, not identity.
3. Do not force positivity. Acknowledge emotions gently, normalize emotional experiences, offer hope softly.
4. Emotional safety comes first. Never shame, guilt, pressure, or overwhelm the user.

Emotional Reflection Framework — process responses through these layers:
- Layer 1: Emotional Observation — gently notice emotional states (exhaustion, loneliness, pressure, guilt, fear, etc.)
- Layer 2: Emotional Pattern Reflection — notice repeated patterns softly (constantly trying to be strong, fear of disappointing others, harsh self-talk, etc.)
- Layer 3: Gentle Reframe — offer soft CBT-inspired reframes ("Resting does not make you lazy.", "You do not need to earn softness.", etc.)
- Layer 4: Tiny Gentle Invitation — optionally invite a small act of softness ("Maybe today can simply be a day to breathe a little slower.")

Output Structure (write as flowing, natural paragraphs — not headers or bullet points):
1. Observation: A gentle emotional observation. Short and warm.
2. Reflection: A deeper reflection on recurring emotional themes or patterns.
3. Gentle Reframe: A soft perspective shift.
4. Tiny Reminder (optional): A closing line.

Tone: warm, emotionally intelligent, soft, calm, poetic but simple, non-judgmental, compassionate.
Avoid: sounding robotic, clinical, motivational, self-help-y, or overly dramatic.

IMPORTANT: Respond entirely in Thai language. Keep the total response to 3-5 short paragraphs.
The user should feel: "I understand myself a little more now."
`.trim();

async function callClaude(apiKey, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err.error && err.error.message) || 'Claude API error');
  }
  const data = await res.json();
  return data.content[0].text;
}

async function callDeepSeek(apiKey, userMessage) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err.error && err.error.message) || 'DeepSeek API error');
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const provider = env.AI_PROVIDER === 'deepseek' ? 'deepseek' : 'claude';

  let entries;
  try {
    const body = await request.json();
    entries = body.entries;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return Response.json({ error: 'No entries provided' }, { status: 400 });
  }

  const userContent = entries.map(function (e) {
    const dateStr = new Date(e.date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const prompt = (e.prompt || '').replace(/<br>/gi, ' ').replace(/<[^>]*>/g, '');
    return 'วันที่: ' + dateStr + '\nคำถาม: ' + prompt + '\nคำตอบ: ' + (e.answer || '');
  }).join('\n\n---\n\n');

  const userMessage = [
    'นี่คือบันทึกความรู้สึกของผู้ใช้:',
    '',
    userContent,
    '',
    'กรุณาสร้าง insight ที่อ่อนโยนและอบอุ่น โดยเขียนเป็นภาษาไทย',
    'ตามโครงสร้าง: Observation → Reflection → Gentle Reframe → Tiny Invitation (optional)',
    'เขียนเป็นย่อหน้าสั้น ๆ ที่ไหลต่อเนื่อง อย่าใช้หัวข้อหรือ bullet points',
    'ให้ผู้ใช้รู้สึกว่า "ฉันเข้าใจตัวเองมากขึ้นหน่อยแล้ว"'
  ].join('\n');

  try {
    let insight;
    if (provider === 'deepseek') {
      const apiKey = env.DEEPSEEK_API_KEY;
      if (!apiKey) return Response.json({ error: 'DEEPSEEK_API_KEY not configured' }, { status: 500 });
      insight = await callDeepSeek(apiKey, userMessage);
    } else {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
      insight = await callClaude(apiKey, userMessage);
    }
    return Response.json({ insight });
  } catch (e) {
    return Response.json({ error: e.message || 'AI API error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/insight.js
git commit -m "feat: support Claude Haiku and DeepSeek via AI_PROVIDER env var"
```

---

### Task 2: Update local dev vars for both providers

**Files:**
- Modify: `.dev.vars` (git-ignored)

- [ ] **Step 1: Open `.dev.vars` and ensure it contains these keys**

```
ANTHROPIC_API_KEY=your_anthropic_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here
AI_PROVIDER=claude
```

Set `AI_PROVIDER` to `claude` to use Claude Haiku, or `deepseek` to use DeepSeek v4 Flash. The other provider's API key is only checked when that provider is active, so it can be left as a placeholder.

- [ ] **Step 2: Test Claude locally**

Make sure `AI_PROVIDER=claude` in `.dev.vars`, then start the server:

```bash
npm run dev
```

```bash
curl -X POST http://localhost:8788/api/insight \
  -H "Content-Type: application/json" \
  -d '{"entries":[{"date":"2026-05-24","prompt":"คุณรู้สึกอย่างไรวันนี้?","answer":"รู้สึกเหนื่อยนิดหน่อย"}]}'
```

Expected: `{"insight":"..."}` — Thai text, 3-5 paragraphs, no error.

- [ ] **Step 3: Test DeepSeek locally**

Change `.dev.vars` to `AI_PROVIDER=deepseek`, stop and restart:

```bash
npm run dev
```

```bash
curl -X POST http://localhost:8788/api/insight \
  -H "Content-Type: application/json" \
  -d '{"entries":[{"date":"2026-05-24","prompt":"คุณรู้สึกอย่างไรวันนี้?","answer":"รู้สึกเหนื่อยนิดหน่อย"}]}'
```

Expected: `{"insight":"..."}` — Thai text, 3-5 paragraphs, no error.

---

### Task 3: Set environment variables in Cloudflare Pages dashboard (deploy)

This task is manual — no code changes.

- [ ] **Step 1: Open Cloudflare Pages dashboard**

Go to: Cloudflare Dashboard → Pages → `littlebylittle` → Settings → Environment Variables.

- [ ] **Step 2: Add the variables**

Add these (Production environment):

| Variable | Value |
|----------|-------|
| `AI_PROVIDER` | `claude` (or `deepseek` to switch) |
| `ANTHROPIC_API_KEY` | your Anthropic key (already set if previously configured) |
| `DEEPSEEK_API_KEY` | your DeepSeek key (only required when `AI_PROVIDER=deepseek`) |

- [ ] **Step 3: Redeploy**

Push any commit (or use "Retry deployment" in the dashboard) to pick up the new env vars.

---

## Notes

- **Switching providers in production:** Change `AI_PROVIDER` in the Cloudflare dashboard and redeploy. No code change needed.
- **DeepSeek model ID:** `deepseek-v4-flash` is embedded in `DEEPSEEK_MODEL` (line 2 of `functions/api/insight.js`). Verify this against [DeepSeek's model list](https://api-docs.deepseek.com/) before deploying — if the ID differs, update that constant.
- **Default behavior:** If `AI_PROVIDER` is unset or any value other than `'deepseek'`, Claude is used. This matches the existing behavior before this change.
