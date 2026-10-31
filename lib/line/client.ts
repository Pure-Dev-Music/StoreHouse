import crypto from 'crypto';

/**
 * Verify LINE webhook signature using HMAC-SHA256
 */
export function verifyLineSignature(body: string, signature: string | null, channelSecret?: string): boolean {
  const secret = channelSecret || process.env.LINE_CHANNEL_SECRET || '';
  if (!signature || !secret) {
    // In dev environment or if secret not set, log warning
    return false;
  }
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * Check if user is in Whitelist Admin list
 */
export function isLineAdmin(userId?: string): boolean {
  if (!userId) return false;
  const adminIdsStr = process.env.LINE_ADMIN_USER_IDS || '';
  const adminIds = adminIdsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // If no whitelist configured yet, allow for first-time developer testing
  if (adminIds.length === 0) {
    return true;
  }

  return adminIds.includes(userId);
}

/**
 * Send reply message via LINE Messaging API
 */
export async function replyLineMessage(replyToken: string, messages: any[]): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn('[LINE] LINE_CHANNEL_ACCESS_TOKEN is not configured.');
    return false;
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[LINE API Error] reply failed:', res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[LINE API Error]', err);
    return false;
  }
}
