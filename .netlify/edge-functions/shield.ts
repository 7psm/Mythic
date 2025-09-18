// Edge Function "shield" – Rate limit + WAF très simple + anti-hotlink
// Déployée côté CDN (edge) pour bloquer tôt le trafic abusif
// NOTE: Netlify doit être configuré avec [edge_functions] dans netlify.toml

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
  const ua = request.headers.get('user-agent') || 'unknown';
  const key = `${ip}:${ua}:${url.pathname}`;

  // Mémoire locale par instance (edge runtime) – pour un vrai RL, utiliser DKV/Redis
  // Ici on fait un simple token bucket sur 60 secondes
  const BUCKET = context.vars?.bucket || (context.vars = { bucket: new Map() }).bucket;
  const now = Date.now();
  const windowMs = 60_000; // 60s
  const limit = 60; // 60 req / 60s par IP/UA/path

  let record = BUCKET.get(key);
  if (!record || now - record.start >= windowMs) {
    record = { start: now, count: 0 };
    BUCKET.set(key, record);
  }
  record.count += 1;

  // Bloque si dépassement
  if (record.count > limit) {
    return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } });
  }

  // WAF ultra simple: refuser méthodes inattendues
  const method = request.method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Anti-hotlink basique pour images (référer strict)
  if (url.pathname.startsWith('/public/') && /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname)) {
    const referer = request.headers.get('referer') || '';
    const allowed = referer === '' || referer.includes(url.origin);
    if (!allowed) {
      return new Response('Hotlink Forbidden', { status: 403 });
    }
  }

  // Limitation de la longueur des querystrings (anti-abus)
  if (url.search.length > 2048) {
    return new Response('Query Too Large', { status: 414 });
  }

  return context.next();
};





