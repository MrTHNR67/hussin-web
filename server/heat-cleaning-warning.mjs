import { updateDatabase } from './data-store.mjs';
import { sendPushToUser } from './push-delivery.mjs';
import { localDateInTimezone } from './weather-data.mjs';

const dayMs = 86_400_000;

function usableNumber(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function noRecentCleaning(panel, settings, now) {
  if (!usableNumber(settings.heat_no_clean_days) || Number(settings.heat_no_clean_days) < 0) return false;
  if (!panel.last_cleaned_at) return true;
  const cleanedAt = Date.parse(panel.last_cleaned_at);
  return Number.isFinite(cleanedAt) && now - cleanedAt >= Number(settings.heat_no_clean_days) * dayMs;
}

// Module 2 receives a successful Module 1 event; it has no independent daily job.
export function createHeatCleaningWarning(panel, snapshot, settings, dustEventId, now = Date.now()) {
  const timezone = snapshot.timezone || panel.timezone || 'UTC';
  const today = localDateInTimezone(new Date(now), timezone);
  const todayIndex = (snapshot.daily?.time || []).findIndex((value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value === today;
    const timestamp = typeof value === 'number' ? value * 1000 : Date.parse(value || '');
    return Number.isFinite(timestamp) && localDateInTimezone(new Date(timestamp), timezone) === today;
  });
  if (todayIndex < 0) return null;
  const rawTemperature = snapshot.daily?.temperature_2m_max?.[todayIndex];
  if (!usableNumber(rawTemperature) || !usableNumber(settings.heat_warning_temp_c)) return null;
  if (Number(rawTemperature) <= Number(settings.heat_warning_temp_c) || !noRecentCleaning(panel, settings, now)) return null;
  const retryHours = usableNumber(settings.heat_warning_retry_hours) && Number(settings.heat_warning_retry_hours) > 0
    ? Number(settings.heat_warning_retry_hours) : 24;
  return {
    event_id: dustEventId, status: 'pending', created_at: new Date(now).toISOString(),
    expires_at: new Date(now + retryHours * 60 * 60 * 1000).toISOString(),
    local_date: today, timezone,
    retry_at: null, attempts: 0,
  };
}

export function heatWarningNeedsWork(panel) {
  return ['pending', 'sending'].includes(panel.heat_cleaning_warning?.status);
}

export async function retryHeatCleaningWarning(userId, leaseToken) {
  const claim = await updateDatabase((db) => {
    const panel = db.panel_data[userId];
    const warning = panel?.heat_cleaning_warning;
    const now = Date.now();
    if (!panel || panel.alert_check_lease?.token !== leaseToken
      || Date.parse(panel.alert_check_lease.expires_at) <= now || !warning) return { action: 'skip' };
    if (!panel.active || !panel.notifications_enabled) {
      warning.status = 'cancelled';
      return { action: 'skip' };
    }
    if (Date.parse(warning.expires_at) <= now || warning.local_date !== localDateInTimezone(new Date(now), warning.timezone)) {
      warning.status = 'expired';
      return { action: 'skip' };
    }
    if (!noRecentCleaning(panel, db.app_settings, now) || Date.parse(panel.last_cleaned_at) > Date.parse(warning.created_at)) {
      warning.status = 'cancelled';
      return { action: 'skip' };
    }
    // An abandoned send may already have reached a device. Do not duplicate it after restart.
    if (warning.status === 'sending') {
      warning.status = 'uncertain';
      return { action: 'uncertain' };
    }
    if (warning.status !== 'pending') return { action: 'skip' };
    if (Date.parse(warning.retry_at) > now) return { action: 'wait' };
    warning.status = 'sending';
    warning.last_attempt_at = new Date(now).toISOString();
    warning.attempts = Number(warning.attempts || 0) + 1;
    return { action: 'send', eventId: warning.event_id };
  });
  if (claim.action !== 'send') return { accepted: false, retryPending: claim.action === 'wait', uncertain: claim.action === 'uncertain' };

  let delivery;
  try {
    delivery = await sendPushToUser(userId, {
      kind: 'heat-cleaning', title: 'تنبيه توقيت التنظيف من سياج',
      body: 'الجو حار اليوم — لا تنظف لوحك وقت الظهيرة، فيه خطر صدمة حرارية. أفضل وقت: بعد المغرب أو الصباح الباكر.',
      url: '/', tag: 'siyaj-heat-cleaning',
    });
  } catch {
    delivery = { accepted: 0, rejected: 0, uncertain: 1, subscriptions: 0 };
  }
  return updateDatabase((db) => {
    const panel = db.panel_data[userId];
    const warning = panel?.heat_cleaning_warning;
    if (!warning || warning.event_id !== claim.eventId || warning.status !== 'sending') {
      return { accepted: delivery.accepted > 0, retryPending: false, uncertain: delivery.uncertain > 0 };
    }
    warning.last_delivery_counts = { accepted: delivery.accepted, rejected: delivery.rejected, uncertain: delivery.uncertain };
    if (delivery.accepted > 0) {
      warning.status = 'sent';
      warning.sent_at = new Date().toISOString();
    } else if (delivery.uncertain > 0) {
      warning.status = 'uncertain';
    } else if (!delivery.subscriptions || !panel.active || !panel.notifications_enabled) {
      warning.status = 'cancelled';
    } else {
      const configuredMinutes = Number(db.app_settings.alert_retry_minutes);
      const minutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0 ? configuredMinutes : 30;
      warning.status = 'pending';
      warning.retry_at = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    }
    return { accepted: delivery.accepted > 0, retryPending: warning.status === 'pending', uncertain: delivery.uncertain > 0 };
  });
}
