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
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Claude returned empty response');
  return text;
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
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned empty response');
  return text;
}

async function handleInsight(request, env) {
  const provider = env.AI_PROVIDER === 'deepseek' ? 'deepseek' : 'claude';

  let entries;
  try {
    const body = await request.json();
    entries = body.entries;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const diaryEntries = Array.isArray(body.diaryEntries) ? body.diaryEntries : [];

  if ((!Array.isArray(entries) || entries.length === 0) && diaryEntries.length === 0) {
    return Response.json({ error: 'No entries provided' }, { status: 400 });
  }

  const promptContent = (Array.isArray(entries) ? entries : []).map(function (e) {
    const d = new Date(e.date);
    const dateStr = isNaN(d.getTime())
      ? 'ไม่ระบุวันที่'
      : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = (e.prompt || '').replace(/<br>/gi, ' ').replace(/<[^>]*>/g, '');
    return 'วันที่: ' + dateStr + '\nคำถาม: ' + prompt + '\nคำตอบ: ' + (e.answer || '');
  }).join('\n\n---\n\n');

  const diaryContent = diaryEntries.map(function (e) {
    const d = new Date(e.date);
    const dateStr = isNaN(d.getTime())
      ? 'ไม่ระบุวันที่'
      : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const parts = [];
    if (e.story)     parts.push('เรื่องเล็ก ๆ ของวัน: ' + e.story);
    if (e.gratitude) parts.push('สิ่งที่ขอบคุณ: ' + e.gratitude);
    if (e.care)      parts.push('การดูแลตัวเอง: ' + e.care);
    return 'วันที่: ' + dateStr + '\n' + parts.join('\n');
  }).join('\n\n---\n\n');

  const sections = [];
  if (promptContent) sections.push('[ บันทึกคำถามประจำวัน ]\n' + promptContent);
  if (diaryContent)  sections.push('[ บันทึกประจำวัน ]\n' + diaryContent);
  const userContent = sections.join('\n\n═══\n\n');

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

function handleConfig(env) {
  const cfg = {
    firebase: {
      apiKey:            env.FIREBASE_API_KEY             || '',
      authDomain:        env.FIREBASE_AUTH_DOMAIN         || '',
      projectId:         env.FIREBASE_PROJECT_ID          || '',
      storageBucket:     env.FIREBASE_STORAGE_BUCKET      || '',
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId:             env.FIREBASE_APP_ID              || ''
    },
    liffId: env.LINE_LIFF_ID || ''
  };
  return Response.json(cfg, { headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/insight' && request.method === 'POST') {
      return handleInsight(request, env);
    }

    if (url.pathname === '/api/config' && request.method === 'GET') {
      return handleConfig(env);
    }

    return env.ASSETS.fetch(request);
  }
};
