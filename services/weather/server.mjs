// Siyaj Weather Service — an independently deployable microservice.
// Owns all outbound calls to Open-Meteo (forecast, air quality, geocoding).
// The main application calls it over HTTP when WEATHER_SERVICE_URL is set.

import express from 'express';
import { fetchWeatherSnapshot } from '../../server/weather-data.mjs';

const app = express();
const port = Number(process.env.WEATHER_PORT || process.env.PORT || 4001);
const upstreamTimeoutMs = Number(process.env.WEATHER_TIMEOUT_MS || 12_000) || 12_000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.get('/healthz', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', service: 'weather', instance: port, uptimeSeconds: Math.round(process.uptime()) });
});

app.get('/readyz', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ready', service: 'weather', instance: port });
});

app.get('/weather', async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  if (typeof req.query.latitude !== 'string' || !req.query.latitude.trim()
    || typeof req.query.longitude !== 'string' || !req.query.longitude.trim()
    || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return res.status(400).json({ error: 'إحداثيات الموقع غير صالحة.', code: 'INVALID_COORDINATES' });
  }
  try {
    const snapshot = await fetchWeatherSnapshot(latitude, longitude);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.json(snapshot);
  } catch (error) {
    if (Number.isFinite(error.retryAfterSeconds)) res.set('Retry-After', String(error.retryAfterSeconds));
    res.status(502).json({
      error: 'تعذر جلب بيانات الطقس الآن.',
      code: 'WEATHER_UPSTREAM_UNAVAILABLE',
      upstreamStatus: Number.isInteger(error.upstreamStatus) ? error.upstreamStatus : null,
    });
  }
});

app.get('/geocode', async (req, res) => {
  const name = String(req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'أدخل اسم مدينة للبحث.' });
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name, count: '6', language: 'ar', format: 'json' });
    const response = await fetch(url, { signal: AbortSignal.timeout(upstreamTimeoutMs) });
    if (!response.ok) throw new Error('تعذر الوصول إلى خدمة البحث عن المدن.');
    const data = await response.json();
    res.setHeader('Cache-Control', 'private, max-age=600');
    res.json({
      results: (data.results || []).map((place) => ({
        name: place.name, country: place.country, admin1: place.admin1,
        latitude: place.latitude, longitude: place.longitude, timezone: place.timezone,
      })),
    });
  } catch (error) {
    res.status(502).json({ error: error.message || 'تعذر البحث عن المدينة.', code: 'GEOCODE_UNAVAILABLE' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

const server = app.listen(port, () => console.log(`Siyaj weather service listening on ${port}`));

let closing = false;
function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`Weather service: received ${signal}, shutting down...`);
  const force = setTimeout(() => process.exit(1), 10_000);
  force.unref();
  server.close(() => process.exit(0));
}
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => shutdown(signal));
