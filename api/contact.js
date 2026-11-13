// Contact form handler (server side). Dependency-free Node function.
// Works as a Vercel/Netlify-style function (export default (req, res)) and is mounted by server.mjs locally.
//
// Required environment variables (set them in the host; NEVER in the browser or this repo):
//   RESEND_API_KEY   API key of the email provider (https://resend.com)
//   CONTACT_FROM     Verified sender, e.g. "Sarah Miller Website <support@your-domain.com>"
// Optional:
//   CONTACT_TO       Recipient (default below)
//   ALLOWED_ORIGIN   e.g. https://www.example.com (blocks cross-site posts); same-host posts are always allowed
//
// Without RESEND_API_KEY/CONTACT_FROM the endpoint answers 503 and the page shows the error message.
// It never reports success unless the provider accepted the message.

const TO_DEFAULT = 'millersarahj980@gmail.com';
const MAX_BODY = 12 * 1024;
const LIMITS = { name: 100, email: 254, subject: 150, order: 60, message: 3000 };
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map(); // in-memory (per instance). Use the host/provider rate limiting for stronger protection.

const json = (res, status, obj) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// single-line fields: drop control chars (blocks CR/LF header injection), collapse spaces
const line = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const multi = (v, max) => String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/g, '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]{2,}$/;

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return false;
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    if (raw.length > MAX_BODY) throw Object.assign(new Error('too_large'), { code: 413 });
    return JSON.parse(raw);
  }
  let size = 0; const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw Object.assign(new Error('too_large'), { code: 413 });
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { ok: false, code: 'method' }); }

  const ctype = String(req.headers['content-type'] || '');
  if (!ctype.toLowerCase().startsWith('application/json')) return json(res, 415, { ok: false, code: 'type' });

  // Same-origin check (Origin must match Host, or ALLOWED_ORIGIN)
  const origin = req.headers.origin;
  if (origin) {
    let okOrigin = false;
    try {
      const o = new URL(origin);
      okOrigin = o.host === req.headers.host || (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN.replace(/\/+$/, ''));
    } catch (e) { /* invalid origin */ }
    if (!okOrigin) return json(res, 403, { ok: false, code: 'origin' });
  }

  let body;
  try { body = await readBody(req); }
  catch (e) { return json(res, e && e.code === 413 ? 413 : 400, { ok: false, code: e && e.code === 413 ? 'too_large' : 'bad_json' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { ok: false, code: 'bad_json' });

  // Honeypot: pretend success to bots without sending anything
  if (body.website) return json(res, 200, { ok: true });

  const ip = String((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')).split(',')[0].trim();
  if (limited(ip)) { res.setHeader('Retry-After', '600'); return json(res, 429, { ok: false, code: 'rate_limited' }); }

  const data = {
    name: line(body.name, LIMITS.name),
    email: line(body.email, LIMITS.email),
    subject: line(body.subject, LIMITS.subject),
    order: line(body.order, LIMITS.order),
    message: multi(body.message, LIMITS.message),
  };
  const errors = {};
  if (!data.name) errors.name = 'Please enter your name.';
  if (!data.email) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (!data.subject) errors.subject = 'Please enter a subject.';
  if (!data.message) errors.message = 'Please enter a message.';
  if (Object.keys(errors).length) return json(res, 422, { ok: false, code: 'validation', errors });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || TO_DEFAULT;
  if (!key || !from) return json(res, 503, { ok: false, code: 'not_configured' });

  const text = `New message from the Sarah Miller website\n\nName: ${data.name}\nEmail: ${data.email}\nOrder number: ${data.order || '-'}\nSubject: ${data.subject}\n\n${data.message}\n`;
  const html = `<h2>New message from the Sarah Miller website</h2>` +
    `<p><strong>Name:</strong> ${esc(data.name)}<br><strong>Email:</strong> ${esc(data.email)}<br><strong>Order number:</strong> ${esc(data.order || '-')}<br><strong>Subject:</strong> ${esc(data.subject)}</p>` +
    `<p style="white-space:pre-wrap">${esc(data.message)}</p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: data.email, subject: `[Website] ${data.subject}`.slice(0, 200), text, html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return json(res, 502, { ok: false, code: 'provider' }); // provider body intentionally not logged/forwarded
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 502, { ok: false, code: 'provider' });
  }
}
