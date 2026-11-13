// Netlify Function (v2) that serves POST /api/contact.
// It reuses the dependency-free handler in api/contact.js (also used by server.mjs locally),
// adapting the Web Request/Response API to the (req, res) shape that handler expects.
//
// Environment variables (Netlify > Site configuration > Environment variables; never commit them):
//   RESEND_API_KEY, CONTACT_FROM   required (without them the endpoint answers 503)
//   CONTACT_TO, ALLOWED_ORIGIN     optional
import handler from '../../api/contact.js';

const MAX_BODY = 12 * 1024;

export default async (request, context) => {
  const headers = {};
  request.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  if (context && context.ip && !headers['x-forwarded-for']) headers['x-forwarded-for'] = context.ip;

  let body = '';
  if (request.method === 'POST') {
    const declared = Number(headers['content-length'] || 0);
    if (declared > MAX_BODY) {
      return new Response(JSON.stringify({ ok: false, code: 'too_large' }), {
        status: 413, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    body = await request.text();
  }

  const req = { method: request.method, headers, body, socket: {} };
  const out = { statusCode: 200, headers: new Headers() };
  const done = new Promise((resolve) => {
    const res = {
      get statusCode() { return out.statusCode; },
      set statusCode(v) { out.statusCode = v; },
      setHeader(k, v) { out.headers.set(k, String(v)); },
      end(payload) { resolve(new Response(payload == null ? null : payload, { status: out.statusCode, headers: out.headers })); },
    };
    Promise.resolve(handler(req, res)).catch(() => {
      out.headers.set('Content-Type', 'application/json; charset=utf-8');
      resolve(new Response(JSON.stringify({ ok: false, code: 'server' }), { status: 500, headers: out.headers }));
    });
  });
  return done;
};

export const config = { path: '/api/contact' };
