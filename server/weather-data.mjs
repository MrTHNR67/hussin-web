const weatherRequestTimeoutMs = 15_000;
const snapshotCacheTtlMs = 10 * 60_000;
const snapshotCache = new Map();
const snapshotRequests = new Map();
const upstreamCooldowns = new Map();

class WeatherServiceError extends Error {
  constructor(message, upstreamStatus = null, retryAfterSeconds = null) {
    super(message);
    this.code = 'WEATHER_UPSTREAM_UNAVAILABLE';
    this.upstreamStatus = upstreamStatus;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function retryAfterSeconds(header) {
  if (!header) return 60;
  const seconds = /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(seconds) ? Math.max(60, Math.min(1800, seconds)) : 60;
}

async function fetchWeatherJson(url, failureMessage, { timeoutMs = weatherRequestTimeoutMs, attempts = 2 } = {}) {
  const host = url.hostname;
  const cooldown = upstreamCooldowns.get(host);
  if (cooldown?.until > Date.now()) throw new WeatherServiceError(failureMessage, cooldown.status, Math.ceil((cooldown.until - Date.now()) / 1000));
  if (cooldown) upstreamCooldowns.delete(host);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response;
    try { response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) }); }
    catch {
      if (attempt + 1 < attempts) continue;
      console.warn(`Weather upstream ${host}: network request failed.`);
      throw new WeatherServiceError(failureMessage);
    }
    if (!response.ok) {
      // Log only the provider host and status, never a URL containing a customer's coordinates.
      console.warn(`Weather upstream ${host}: HTTP ${response.status}.`);
      await response.body?.cancel().catch(() => {});
      if ([403, 429].includes(response.status)) {
        const seconds = retryAfterSeconds(response.headers.get('retry-after'));
        upstreamCooldowns.set(host, { until: Date.now() + seconds * 1000, status: response.status });
        throw new WeatherServiceError(failureMessage, response.status, seconds);
      }
      if (response.status >= 500 && attempt + 1 < attempts) continue;
      throw new WeatherServiceError(failureMessage, response.status);
    }
    try { return await response.json(); }
    catch { throw new WeatherServiceError(failureMessage, response.status); }
  }
}

const metNoUserAgent = 'SiyajSolarGuardian/1.0 (+https://github.com/MrTHNR67/hussin-web)';
const metNoTimezone = 'Asia/Muscat';
const metNoZoneOffset = '+04:00';

function metNoWeatherCode(symbol = '') {
  const value = String(symbol).toLowerCase();
  if (value.includes('thunder')) return value.includes('heavy') ? 99 : 95;
  if (value.includes('showers')) {
    if (value.includes('heavy')) return 82;
    if (value.includes('light')) return 80;
    return 81;
  }
  if (value.includes('drizzle')) return 51;
  if (value.includes('heavyrain')) return 65;
  if (value.includes('rain')) return value.includes('light') ? 61 : 63;
  if (value.includes('heavysleet')) return 75;
  if (value.includes('sleet')) return value.includes('light') ? 71 : 73;
  if (value.includes('heavysnow')) return 75;
  if (value.includes('snow')) return value.includes('light') ? 71 : 73;
  if (value.includes('fog')) return 45;
  if (value.includes('partlycloudy')) return 2;
  if (value.includes('cloudy')) return 3;
  if (value.includes('fair')) return 1;
  if (value.includes('clear')) return 0;
  return 3;
}

function metNoDayKey(unixSeconds) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: metNoTimezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(unixSeconds * 1000));
}

function metNoLocalHour(unixSeconds) {
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: metNoTimezone, hour: '2-digit', hour12: false,
  }).format(new Date(unixSeconds * 1000)));
}

// Fallback provider used when Open-Meteo blocks the shared egress IP (HTTP 429).
export async function requestMetNoSnapshot(latitude, longitude) {
  const url = new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');
  url.search = new URLSearchParams({ lat: Number(latitude).toFixed(4), lon: Number(longitude).toFixed(4) });
  const response = await fetch(url, {
    headers: { 'User-Agent': metNoUserAgent, Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new WeatherServiceError('تعذر جلب حالة الطقس.', response.status);
  }
  const payload = await response.json();
  const series = Array.isArray(payload?.properties?.timeseries) ? payload.properties.timeseries : [];
  const entries = series.map((item) => {
    const details = item?.data?.instant?.details || {};
    const next = item?.data?.next_1_hours || {};
    return {
      time: Math.floor(Date.parse(item?.time) / 1000),
      temperature: Number(details.air_temperature),
      humidity: Number(details.relative_humidity),
      wind: Number(details.wind_speed) * 3.6,
      rain: Number(next?.details?.precipitation_amount ?? 0),
      symbol: String(next?.summary?.symbol_code || ''),
    };
  }).filter((entry) => Number.isFinite(entry.time) && Number.isFinite(entry.temperature));
  if (entries.length < 6) throw new WeatherServiceError('تعذر جلب حالة الطقس.');

  const now = entries[0];
  const isDay = now.symbol.includes('_day') ? 1 : now.symbol.includes('_night') ? 0 : 1;
  const hourlyEntries = entries.slice(0, 48);
  const hourly = {
    time: hourlyEntries.map((entry) => entry.time),
    temperature_2m: hourlyEntries.map((entry) => entry.temperature),
    relative_humidity_2m: hourlyEntries.map((entry) => entry.humidity),
    wind_speed_10m: hourlyEntries.map((entry) => Number(entry.wind.toFixed(1))),
    precipitation: hourlyEntries.map((entry) => entry.rain),
  };

  const days = new Map();
  for (const entry of entries) {
    const key = metNoDayKey(entry.time);
    const day = days.get(key) || { key, temps: [], rain: 0, symbol: '', noonDistance: Infinity };
    day.temps.push(entry.temperature);
    day.rain += entry.rain;
    const distance = Math.abs(metNoLocalHour(entry.time) - 12);
    if (distance < day.noonDistance) { day.noonDistance = distance; day.symbol = entry.symbol; }
    days.set(key, day);
  }
  const orderedDays = [...days.values()].slice(0, 7);
  const daily = {
    time: orderedDays.map((day) => Math.floor(Date.parse(`${day.key}T00:00:00${metNoZoneOffset}`) / 1000)),
    temperature_2m_max: orderedDays.map((day) => Math.max(...day.temps)),
    temperature_2m_min: orderedDays.map((day) => Math.min(...day.temps)),
    precipitation_probability_max: orderedDays.map(() => 0),
    precipitation_sum: orderedDays.map((day) => Number(day.rain.toFixed(1))),
    sunshine_duration: orderedDays.map(() => 0),
    weather_code: orderedDays.map((day) => metNoWeatherCode(day.symbol)),
  };

  return {
    current: {
      time: now.time,
      interval: 3600,
      temperature_2m: Number(now.temperature.toFixed(1)),
      relative_humidity_2m: Number(now.humidity.toFixed(0)),
      apparent_temperature: Number(now.temperature.toFixed(1)),
      is_day: isDay,
      precipitation: now.rain,
      weather_code: metNoWeatherCode(now.symbol),
      wind_speed_10m: Number(now.wind.toFixed(1)),
      wind_gusts_10m: Number((now.wind * 1.4).toFixed(1)),
    },
    hourly,
    daily,
    air: null,
    airHourly: null,
    timezone: metNoTimezone,
    dustForecastFlag: null,
    provider: 'MET Norway',
    fetchedAt: new Date().toISOString(),
    cached: false,
    cacheAgeSeconds: 0,
  };
}

async function requestWeatherSnapshot(latitude, longitude) {
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunshine_duration,weather_code',
    forecast_days: '7',
  });
  const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airUrl.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime', current: 'pm10,dust', hourly: 'pm10,dust', forecast_days: '2' });
  // Air-quality outages must not discard usable wind, temperature, and humidity data.
  const airRequest = fetchWeatherJson(airUrl, 'تعذر جلب جودة الهواء.', { timeoutMs: 6_000, attempts: 1 }).catch(() => null);
  const primaryDisabled = String(process.env.SIYAJ_WEATHER_PRIMARY || '').toLowerCase() === 'metno';

  let forecast;
  try {
    if (primaryDisabled) throw new WeatherServiceError('Weather primary provider disabled by configuration.');
    forecast = await fetchWeatherJson(forecastUrl, 'تعذر جلب حالة الطقس.', { timeoutMs: 8_000 });
  } catch (primaryError) {
    const fallback = await requestMetNoSnapshot(latitude, longitude).catch(() => null);
    if (!fallback) throw primaryError;
    console.warn('Weather: Open-Meteo unavailable, served the MET Norway fallback.');
    const air = await airRequest;
    return { ...fallback, air: air?.current || null, airHourly: air?.hourly || null };
  }

  const air = await airRequest;
  const usable = (value, min, max) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== ''
    && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  if (!usable(forecast?.current?.temperature_2m, -90, 65) || !usable(forecast?.current?.relative_humidity_2m, 0, 100)
    || typeof forecast.timezone !== 'string' || !forecast.timezone.trim()) {
    throw new WeatherServiceError('تعذر جلب حالة الطقس.');
  }
  try { new Intl.DateTimeFormat('en', { timeZone: forecast.timezone }).format(0); }
  catch { throw new WeatherServiceError('تعذر جلب حالة الطقس.'); }
  const rawDustFlag = forecast.dust_forecast_flag ?? forecast.current?.dust_forecast_flag ?? air?.current?.dust_forecast_flag;
  return {
    current: forecast.current, hourly: forecast.hourly, daily: forecast.daily,
    air: air?.current || null, airHourly: air?.hourly || null, timezone: forecast.timezone,
    dustForecastFlag: typeof rawDustFlag === 'boolean' ? rawDustFlag : null,
    provider: 'Open-Meteo', fetchedAt: new Date().toISOString(), cached: false, cacheAgeSeconds: 0,
  };
}

export async function fetchWeatherSnapshot(latitude, longitude) {
  const lat = Number(latitude); const lon = Number(longitude);
  if (!['number', 'string'].includes(typeof latitude) || !String(latitude).trim() || !['number', 'string'].includes(typeof longitude) || !String(longitude).trim()
    || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error('إحداثيات الموقع غير صالحة.');
  }
  // ~100 m keys avoid duplicate calls for small GPS jitter within the forecast grid.
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = snapshotCache.get(key);
  if (cached && Date.now() - cached.savedAt < cached.ttlMs) {
    return { ...structuredClone(cached.snapshot), cached: true, cacheAgeSeconds: Math.floor((Date.now() - cached.savedAt) / 1000) };
  }
  if (snapshotRequests.has(key)) return structuredClone(await snapshotRequests.get(key));
  const request = requestWeatherSnapshot(lat, lon).then((snapshot) => {
    const savedAt = Date.now();
    for (const [cacheKey, entry] of snapshotCache) if (savedAt - entry.savedAt >= entry.ttlMs) snapshotCache.delete(cacheKey);
    if (snapshotCache.size >= 200) snapshotCache.delete(snapshotCache.keys().next().value);
    const hasAirReading = [snapshot.air?.dust, snapshot.air?.pm10].some((value) => (typeof value === 'number' || typeof value === 'string')
      && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0);
    snapshotCache.set(key, { snapshot, savedAt, ttlMs: hasAirReading ? snapshotCacheTtlMs : 60_000 });
    return snapshot;
  });
  snapshotRequests.set(key, request);
  try { return structuredClone(await request); }
  finally { snapshotRequests.delete(key); }
}

export async function fetchRainfallSince(latitude, longitude, startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) return { totalMm: 0, days: 0 };
  const archiveUrl = new URL('https://historical-forecast-api.open-meteo.com/v1/forecast');
  archiveUrl.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude), start_date: startDate, end_date: endDate,
    daily: 'precipitation_sum', timezone: 'auto',
  });
  const archive = await fetchWeatherJson(archiveUrl, 'تعذر جلب سجل الأمطار للفترة المطلوبة.');
  const values = archive.daily?.precipitation_sum || [];
  const dates = archive.daily?.time || [];
  const validDays = new Map();
  values.forEach((value, index) => {
    const date = dates[index];
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return;
    if (typeof date !== 'string' || date < startDate || date > endDate) return;
    validDays.set(date, Number(value));
  });
  return { totalMm: [...validDays.values()].reduce((total, value) => total + value, 0), days: validDays.size, dates: [...validDays.keys()] };
}

export function localDateInTimezone(date, timezone = 'UTC') {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function dayDifference(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const from = Date.parse(`${fromDate}T00:00:00Z`);
  const to = Date.parse(`${toDate}T00:00:00Z`);
  return Number.isFinite(from) && Number.isFinite(to) ? Math.floor((to - from) / 86_400_000) : null;
}
