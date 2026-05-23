/**
 * Liftapp — local dev server
 * Usage:  node server.js YOUR_ANTHROPIC_API_KEY
 *    or:  ANTHROPIC_API_KEY=sk-... node server.js
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT    = 3000;
const API_KEY = process.argv[2] || process.env.ANTHROPIC_API_KEY || '';

if (!API_KEY) {
  console.error('\n  ❌  API key missing.');
  console.error('     Run:  node server.js YOUR_ANTHROPIC_API_KEY\n');
  process.exit(1);
}

/* ══════════════════════════════════════════════════════
   AI SYSTEM PROMPT
   ══════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════
   STATIC FILE MIME TYPES
   ══════════════════════════════════════════════════════ */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ttf':  'font/truetype',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

/* ══════════════════════════════════════════════════════
   CALL CLAUDE
   ══════════════════════════════════════════════════════ */
function callClaude(entries, cb) {
  const userContent = entries.map(function (e) {
    var dateStr = new Date(e.date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    var prompt = (e.prompt || '').replace(/<br>/gi, ' ').replace(/<[^>]*>/g, '');
    return 'วันที่: ' + dateStr + '\nคำถาม: ' + prompt + '\nคำตอบ: ' + (e.answer || '');
  }).join('\n\n---\n\n');

  var message = [
    'นี่คือบันทึกความรู้สึกของผู้ใช้:',
    '',
    userContent,
    '',
    'กรุณาสร้าง insight ที่อ่อนโยนและอบอุ่น โดยเขียนเป็นภาษาไทย',
    'ตามโครงสร้าง: Observation → Reflection → Gentle Reframe → Tiny Invitation (optional)',
    'เขียนเป็นย่อหน้าสั้น ๆ ที่ไหลต่อเนื่อง อย่าใช้หัวข้อหรือ bullet points',
    'ให้ผู้ใช้รู้สึกว่า "ฉันเข้าใจตัวเองมากขึ้นหน่อยแล้ว"'
  ].join('\n');

  var body = JSON.stringify({
    model:      'claude-sonnet-4-6',
    max_tokens: 500,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: message }]
  });

  var options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers:  {
      'Content-Type':      'application/json',
      'x-api-key':         API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length':    Buffer.byteLength(body)
    }
  };

  var req = https.request(options, function (res) {
    var data = '';
    res.on('data', function (c) { data += c; });
    res.on('end', function () {
      try {
        var parsed = JSON.parse(data);
        if (parsed.error) return cb(new Error(parsed.error.message));
        cb(null, parsed.content[0].text);
      } catch (e) { cb(e); }
    });
  });
  req.on('error', cb);
  req.write(body);
  req.end();
}

/* ══════════════════════════════════════════════════════
   HTTP SERVER
   ══════════════════════════════════════════════════════ */
var server = http.createServer(function (req, res) {
  /* CORS — allow requests from any origin (local dev only) */
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  /* ── POST /api/insight ── */
  if (req.method === 'POST' && req.url === '/api/insight') {
    var raw = '';
    req.on('data', function (c) { raw += c; });
    req.on('end', function () {
      var entries;
      try { entries = JSON.parse(raw).entries; } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
      if (!entries || !entries.length) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'No entries provided' }));
      }
      callClaude(entries, function (err, insight) {
        if (err) {
          console.error('[Claude error]', err.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ insight: insight }));
      });
    });
    return;
  }

  /* ── Serve static files ── */
  var urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/Desktop1.html';
  var filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found: ' + urlPath);
    }
    var ext  = path.extname(filePath).toLowerCase();
    var mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log('\n  🌱  Liftapp is running!');
  console.log('      Open → http://localhost:' + PORT);
  console.log('      Stop → Ctrl + C\n');
});
