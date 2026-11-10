import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from './data-store.mjs';
import { dayDifference, fetchRainfallSince, fetchWeatherSnapshot, localDateInTimezone } from './weather-data.mjs';
import { getPushConfiguration, sendPushToUser } from './push-delivery.mjs';
import { createHeatCleaningWarning, heatWarningNeedsWork, retryHeatCleaningWarning } from './heat-cleaning-warning.mjs';

export { getPushConfiguration, sendTestPush } from './push-delivery.mjs';

const dayMs = 86_400_000;
let runningCheck;
let schedulerStarted = false;

function usableNumber(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function validCoordinates(panel) {
  return usableNumber(panel.latitude) && usableNumber(panel.longitude)
    && Math.abs(Number(panel.latitude)) <= 90 && Math.abs(Number(panel.longitude)) <= 180;
}

function retryTime(settings, now = Date.now()) {
  const raw = Number(settings.alert_retry_minutes);
  return new Date(now + (Number.isFinite(raw) && raw > 0 ? raw : 30) * 60 * 1000).toISOString();
}

function cooldownReady(panel, settings, now = Date.now()) {
  if (!usableNumber(settings.dust_alert_cooldown_days) || Number(settings.dust_alert_cooldown_days) < 0) return false;
  const lastSent = Date.parse(panel.last_dust_alert_sent_at);
  const lastReservedUntil = Date.parse(panel.dust_alert_reservation?.until);
  return (!Number.isFinite(lastSent) || now - lastSent >= Number(settings.dust_alert_cooldown_days) * dayMs)
    && (!Number.isFinite(lastReservedUntil) || now >= lastReservedUntil);
}

function forecastCondition(snapshot, settings) {
  const now = Date.now();
  const horizon = now + dayMs;
  const hourly = snapshot.hourly || {};
  const wind = hourly.wind_speed_10m || [];
  const humidity = hourly.relative_humidity_2m || [];
  let windyAndDry = false;
  for (let index = 0; index < Math.min(wind.length, humidity.length); index += 1) {
    const rawTime = hourly.time?.[index];
    const hour = typeof rawTime === 'number' ? rawTime * 1000 : Date.parse(rawTime || '');
    if (!Number.isFinite(hour) || hour < now || hour > horizon) continue;
    if (!usableNumber(wind[index]) || !usableNumber(humidity[index])) continue;
    if (usableNumber(settings.wind_speed_kmh) && usableNumber(settings.low_humidity_percent)
      && Number(wind[index]) > Number(settings.wind_speed_kmh)
      && Number(humidity[index]) < Number(settings.low_humidity_percent)) {
      windyAndDry = true;
      break;
    }
  }
  const pm10 = snapshot.airHourly?.pm10 || [];
  const pm10ForecastHigh = pm10.some((value, index) => {
    const rawTime = snapshot.airHourly?.time?.[index];
    const hour = typeof rawTime === 'number' ? rawTime * 1000 : Date.parse(rawTime || '');
    return Number.isFinite(hour) && hour >= now && hour <= horizon && usableNumber(value)
      && usableNumber(settings.dust_forecast_pm10_ug) && Number(value) >= Number(settings.dust_forecast_pm10_ug);
  });
  return {
    windyAndDry, pm10ForecastHigh,
    dustForecastFlag: snapshot.dustForecastFlag === true,
    dustForecastFlagAvailable: typeof snapshot.dustForecastFlag === 'boolean',
  };
}

async function rainSuppressesCleaningAlert(panel, today, timezone, settings) {
  const lastActivity = panel.last_cleaned_at || panel.created_at;
  const timestamp = Date.parse(lastActivity);
  if (!Number.isFinite(timestamp) || !usableNumber(settings.cleaning_cycle_days)) {
    return { due: false, daysSince: null, totalRainMm: null, rainDataIncomplete: true };
  }
  const lastDate = localDateInTimezone(new Date(timestamp), timezone);
  const daysSince = dayDifference(lastDate, today);
  if (daysSince === null || daysSince < Number(settings.cleaning_cycle_days)) return { due: false, daysSince, totalRainMm: null };
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const endDate = yesterday.toISOString().slice(0, 10);
  try {
    const rain = await fetchRainfallSince(panel.latitude, panel.longitude, lastDate, endDate);
    const expectedDays = Math.max(0, dayDifference(lastDate, endDate) + 1);
    if (rain.days < expectedDays) return { due: false, daysSince, totalRainMm: rain.totalMm, rainDataIncomplete: true };
    return {
      due: usableNumber(settings.significant_rain_mm) && rain.totalMm < Number(settings.significant_rain_mm),
      daysSince, totalRainMm: rain.totalMm,
    };
  } catch {
    return { due: false, daysSince, totalRainMm: null, rainDataIncomplete: true };
  }
}

async function acquireCheckLease(userId) {
  return updateDatabase((db) => {
    const panel = db.panel_data[userId];
    const now = Date.now();
    if (!panel?.active || !panel.notifications_enabled || !validCoordinates(panel)
      || !(db.push_subscriptions[userId] || []).length) return null;
    if (Date.parse(panel.alert_check_lease?.expires_at) > now) return null;
    const today = localDateInTimezone(new Date(now), panel.timezone || 'UTC');
    const dailyDone = panel.last_daily_check_date === today;
    if (dailyDone && !heatWarningNeedsWork(panel)) return null;
    if (!heatWarningNeedsWork(panel) && Date.parse(panel.alert_check_retry_at) > now) return null;
    const rawLease = Number(db.app_settings.alert_check_lease_seconds);
    const leaseSeconds = Number.isFinite(rawLease) && rawLease > 0 ? rawLease : 300;
    const token = randomUUID();
    panel.alert_check_lease = { token, expires_at: new Date(now + leaseSeconds * 1000).toISOString() };
    return { panel: { ...panel }, settings: { ...db.app_settings }, token, dailyDone };
  });
}

async function markCheck(userId, token, { today, complete, conditions, retry = false }) {
  await updateDatabase((db) => {
    const panel = db.panel_data[userId];
    if (!panel || panel.alert_check_lease?.token !== token) return;
    if (conditions) panel.last_dust_alert_conditions = conditions;
    if (complete) {
      panel.last_daily_check_date = today;
      panel.alert_check_retry_at = null;
    } else if (retry) panel.alert_check_retry_at = retryTime(db.app_settings);
  });
}

async function reserveDustAlert(userId, token, evaluatedPanel) {
  return updateDatabase((db) => {
    const panel = db.panel_data[userId];
    const now = Date.now();
    if (!panel?.active || !panel.notifications_enabled || panel.alert_check_lease?.token !== token
      || Date.parse(panel.alert_check_lease.expires_at) <= now || !cooldownReady(panel, db.app_settings, now)) return null;
    // A location or cleaning change during weather lookup requires a fresh evaluation.
    if (panel.latitude !== evaluatedPanel.latitude || panel.longitude !== evaluatedPanel.longitude
      || panel.last_cleaned_at !== evaluatedPanel.last_cleaned_at) return null;
    const eventId = randomUUID();
    panel.dust_alert_reservation = {
      event_id: eventId, status: 'sending', reserved_at: new Date(now).toISOString(),
      until: new Date(now + Number(db.app_settings.dust_alert_cooldown_days) * dayMs).toISOString(),
    };
    return { eventId };
  });
}

async function finishDustDelivery(userId, eventId, delivery, snapshot) {
  return updateDatabase((db) => {
    const panel = db.panel_data[userId];
    if (!panel || panel.dust_alert_reservation?.event_id !== eventId) return false;
    const reservation = panel.dust_alert_reservation;
    const now = Date.now();
    reservation.delivery_counts = { accepted: delivery.accepted, rejected: delivery.rejected, uncertain: delivery.uncertain };
    if (delivery.accepted > 0) {
      reservation.status = 'accepted';
      panel.last_dust_alert_sent_at = new Date(now).toISOString();
      reservation.until = new Date(now + Number(db.app_settings.dust_alert_cooldown_days) * dayMs).toISOString();
      panel.heat_cleaning_warning = createHeatCleaningWarning(panel, snapshot, db.app_settings, eventId, now);
      return true;
    }
    if (delivery.uncertain > 0) {
      // Preserve the full cooldown reservation when a send might already have been accepted.
      reservation.status = 'uncertain';
      return false;
    }
    reservation.status = 'rejected';
    reservation.until = null;
    return false;
  });
}

async function checkPanel(userId) {
  const result = { checked: 0, skipped: 0, dustSent: 0, heatSent: 0, retryPending: 0, uncertain: 0, failed: 0 };
  const lease = await acquireCheckLease(userId);
  if (!lease) { result.skipped = 1; return result; }
  const { panel, settings, token } = lease;
  result.checked = 1;
  try {
    if (heatWarningNeedsWork(panel)) {
      const heat = await retryHeatCleaningWarning(userId, token);
      result.heatSent += Number(heat.accepted);
      result.retryPending += Number(heat.retryPending);
      result.uncertain += Number(heat.uncertain);
    }
    if (lease.dailyDone) return result;
    const savedToday = localDateInTimezone(new Date(), panel.timezone || 'UTC');
    if (!cooldownReady(panel, settings)) {
      await markCheck(userId, token, { today: savedToday, complete: true });
      return result;
    }
    let snapshot;
    try { snapshot = await fetchWeatherSnapshot(Number(panel.latitude), Number(panel.longitude)); }
    catch {
      await markCheck(userId, token, { today: savedToday, complete: false, retry: true });
      result.failed += 1; result.retryPending += 1;
      return result;
    }
    const timezone = snapshot.timezone || panel.timezone || 'UTC';
    const today = localDateInTimezone(new Date(), timezone);
    const forecast = forecastCondition(snapshot, settings);
    const forecastDue = forecast.windyAndDry || forecast.pm10ForecastHigh || forecast.dustForecastFlag;
    // A forecast trigger already satisfies condition A without an expensive rainfall request.
    const cleaningCycle = forecastDue
      ? { due: false, totalRainMm: null }
      : await rainSuppressesCleaningAlert(panel, today, timezone, settings);
    const conditions = { ...forecast, cleaningCycleDue: cleaningCycle.due, totalRainMm: cleaningCycle.totalRainMm, rainDataIncomplete: !!cleaningCycle.rainDataIncomplete };
    if (!forecastDue && !cleaningCycle.due) {
      const retry = !!cleaningCycle.rainDataIncomplete;
      await markCheck(userId, token, { today, complete: !retry, conditions, retry });
      result.retryPending += Number(retry);
      return result;
    }
    const reservation = await reserveDustAlert(userId, token, panel);
    if (!reservation) {
      await markCheck(userId, token, { today, complete: false, conditions, retry: true });
      result.retryPending += 1;
      return result;
    }
    let delivery;
    try {
      delivery = await sendPushToUser(userId, {
        kind: 'dust-wind', title: 'تنبيه غبار من سياج',
        body: 'الجو فيه غبار متوقع اليوم — نظّف لوحك واسترجع جزء من خسارتك الشهرية.',
        url: '/', tag: 'siyaj-dust-alert',
      });
    } catch {
      delivery = { accepted: 0, rejected: 0, uncertain: 1, subscriptions: 0 };
    }
    const accepted = await finishDustDelivery(userId, reservation.eventId, delivery, snapshot);
    result.dustSent += Number(accepted);
    result.uncertain += Number(delivery.uncertain > 0);
    const retry = !accepted && delivery.uncertain === 0 && delivery.subscriptions > 0;
    await markCheck(userId, token, { today, complete: !retry, conditions, retry });
    result.retryPending += Number(retry);
    if (accepted) {
      const heat = await retryHeatCleaningWarning(userId, token);
      result.heatSent += Number(heat.accepted);
      result.retryPending += Number(heat.retryPending);
      result.uncertain += Number(heat.uncertain);
    }
    return result;
  } finally {
    await updateDatabase((db) => {
      const savedPanel = db.panel_data[userId];
      if (savedPanel?.alert_check_lease?.token === token) delete savedPanel.alert_check_lease;
    });
  }
}

async function performDailyCheck() {
  const summary = { enabled: getPushConfiguration().enabled, checked: 0, skipped: 0, dustSent: 0, heatSent: 0, retryPending: 0, uncertain: 0, failed: 0 };
  if (!summary.enabled) return summary;
  const db = await readDatabase();
  for (const userId of Object.keys(db.panel_data)) {
    try {
      const result = await checkPanel(userId);
      for (const key of Object.keys(result)) summary[key] += result[key];
    } catch { summary.failed += 1; }
  }
  return summary;
}

export function runDailyDustWindCheck() {
  // Local timer, startup, and external jobs share one run in this process.
  runningCheck ||= performDailyCheck().finally(() => { runningCheck = null; });
  return runningCheck;
}

export function startDustWindScheduler() {
  if (schedulerStarted) return;
  if (!getPushConfiguration().enabled) {
    console.warn('Push alerts are disabled. Configure VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to enable them.');
    return;
  }
  schedulerStarted = true;
  runDailyDustWindCheck().catch(() => console.error('Daily Siyaj push check failed.'));
  // This timer is supplementary; an external scheduled job is required while Render Free sleeps.
  const timer = setInterval(() => runDailyDustWindCheck().catch(() => console.error('Daily Siyaj push check failed.')), 60 * 60 * 1000);
  timer.unref?.();
}
