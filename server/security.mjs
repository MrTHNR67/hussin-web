// Security headers + Content-Security-Policy for Siyaj.
// Equivalent to the helmet defaults already used by the hosted deployment,
// implemented locally so the project has no extra dependency.

const BASE_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://accounts.google.com https://plausible.io",
  "script-src-attr 'none'",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "media-src 'self' blob: data:",
  "connect-src 'self' https://accounts.google.com https://api.open-meteo.com https://archive-api.open-meteo.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://plausible.io",
  "frame-src 'self' https://accounts.google.com",
  "worker-src 'self'",
  "manifest-src 'self'",
];

function contentSecurityPolicy() {
  const directives = [...BASE_DIRECTIVES];
  // Only force HTTPS upgrades when actually served over HTTPS.
  if (process.env.NODE_ENV === 'production') directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function securityHeaders(_req, res, next) {
  res.setHeader('Content-Security-Policy', contentSecurityPolicy());
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Origin-Agent-Cluster', '?1');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-XSS-Protection', '0');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}
