import webpush from 'web-push';
import { readDatabase, updateDatabase } from './data-store.mjs';

const publicKey = String(process.env.VAPID_PUBLIC_KEY || '').trim();
const privateKey = String(process.env.VAPID_PRIVATE_KEY || '').trim();
const pushConfigured = Boolean(publicKey && privateKey);
if (pushConfigured) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', publicKey, privateKey);
}

export function getPushConfiguration() {
  return { enabled: pushConfigured, publicKey: pushConfigured ? publicKey : '' };
}

export async function sendTestPush(subscription, payload) {
  if (!pushConfigured) throw new Error('تنبيهات Push غير مهيأة على الخادم.');
  await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60, timeout: 15_000 });
}

// Acceptance by a push service is distinct from confirmation that a device displayed it.
export async function sendPushToUser(userId, payload) {
  const result = { subscriptions: 0, accepted: 0, rejected: 0, uncertain: 0 };
  if (!pushConfigured) return result;
  const db = await readDatabase();
  if (!db.panel_data[userId]?.active || !db.panel_data[userId]?.notifications_enabled) return result;
  const subscriptions = db.push_subscriptions[userId] || [];
  result.subscriptions = subscriptions.length;
  const expiredEndpoints = new Set();
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60, timeout: 15_000 });
      result.accepted += 1;
    } catch (error) {
      const status = Number(error.statusCode);
      if ([400, 401, 403, 404, 410, 413, 429].includes(status)) result.rejected += 1;
      else result.uncertain += 1;
      if ([404, 410].includes(status)) expiredEndpoints.add(subscription.endpoint);
    }
  }));
  if (expiredEndpoints.size) {
    // Cleanup must not turn an already accepted delivery into an apparent send failure.
    await updateDatabase((current) => {
      current.push_subscriptions[userId] = (current.push_subscriptions[userId] || [])
        .filter((item) => !expiredEndpoints.has(item.endpoint));
    }).catch(() => {});
  }
  return result;
}
