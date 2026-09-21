import {
  getConfig,
  jsonResponse,
} from '../../_lib/booking.js';

const NOTION_VERSION = '2022-06-28';

async function notionStatus(config, pathname, options = {}) {
  if (!config.notionToken) return { ok: false, status: 'missing_token' };

  try {
    const response = await fetch(`https://api.notion.com/v1${pathname}`, {
      ...options,
      headers: {
        authorization: `Bearer ${config.notionToken}`,
        'notion-version': NOTION_VERSION,
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
    });
    let code = '';
    if (!response.ok) {
      try {
        const body = await response.json();
        code = body.code || '';
      } catch {
        code = 'unreadable_error';
      }
    }
    return { ok: response.ok, status: response.status, code };
  } catch {
    return { ok: false, status: 'request_failed' };
  }
}

export async function onRequestGet({ request, env }) {
  const key = env.BOOKING_DIAGNOSTICS_KEY || '';
  if (!key || request.headers.get('x-booking-diagnostics-key') !== key) {
    return jsonResponse({ message: 'Not found.' }, 404);
  }

  const config = getConfig(env);
  const databaseId = config.notionDatabaseId || '';
  const database = await notionStatus(config, `/databases/${databaseId}`);
  const query = await notionStatus(config, `/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 1 }),
  });

  return jsonResponse({
    env: {
      APPOINTMENT_NOTION_DATABASE_ID: Boolean(env.APPOINTMENT_NOTION_DATABASE_ID),
      NOTION_DATABASE_ID: Boolean(env.NOTION_DATABASE_ID),
      NOTION_TOKEN: Boolean(env.NOTION_TOKEN),
      RESEND_API_KEY: Boolean(env.RESEND_API_KEY),
    },
    selectedDatabaseIdSuffix: databaseId.slice(-8),
    notion: { database, query },
  });
}
