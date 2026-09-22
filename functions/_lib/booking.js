const NOTION_VERSION = '2022-06-28';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const WHATSAPP_GRAPH_HOST = 'https://graph.facebook.com';
const GOOGLE_OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_API_HOST = 'https://sheets.googleapis.com/v4/spreadsheets';
const DEFAULT_DATABASE_ID = 'fa9a71965f8d40ff92276ba56aa2d69f';
const DEFAULT_VISITOR_EVENTS_DATABASE_ID = '3984fcc4f70180ec8e27f466ebc06223';
const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;
const BOOKING_EMAILS_TEMPORARILY_DISABLED = false;

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export function cleanValue(value) {
  return String(value || '').trim();
}

export function googleSheetsDateTimeSerial(value) {
  const timestamp = Date.parse(cleanValue(value));
  if (!Number.isFinite(timestamp)) return '';
  const malaysiaOffsetMilliseconds = 8 * 60 * 60 * 1000;
  return (timestamp + malaysiaOffsetMilliseconds) / 86400000 + 25569;
}

export function normalizeNotionDatabaseId(value, fallback = '') {
  const raw = cleanValue(value);
  if (!raw) return fallback;

  const uuid = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuid) return uuid[0].replace(/-/g, '');

  const compactId = raw.match(/[0-9a-f]{32}/i);
  if (compactId) return compactId[0];

  return raw;
}

export function escapeHtml(value) {
  return cleanValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue(email));
}

export function slotKey(date, time) {
  return `${date}|${time}`;
}

export function slotStart(date, time) {
  return new Date(`${date}T${time}:00+08:00`);
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function notionDateTime(date, time) {
  const { date: parsedDate, time: parsedTime } = addMinutesToWallClock(date, time, 0);
  return `${parsedDate}T${parsedTime}:00`;
}

export function notionEndDateTime(date, time) {
  const end = addMinutesToWallClock(date, time, DEFAULT_APPOINTMENT_DURATION_MINUTES);
  return `${end.date}T${end.time}:00`;
}

export function addMinutesToWallClock(date, time, minutesToAdd) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleanValue(date));
  const timeMatch = /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i.exec(cleanValue(time));

  if (!dateMatch || !timeMatch) {
    throw new Error('Invalid appointment date or time.');
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) throw new Error('Invalid appointment time.');

  const wallClock = new Date(Date.UTC(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    hours,
    minutes + minutesToAdd,
    0,
  ));
  const pad = (value) => String(value).padStart(2, '0');

  return {
    date: `${wallClock.getUTCFullYear()}-${pad(wallClock.getUTCMonth() + 1)}-${pad(wallClock.getUTCDate())}`,
    time: `${pad(wallClock.getUTCHours())}:${pad(wallClock.getUTCMinutes())}`,
  };
}

export function getConfig(env) {
  return {
    notionToken: env.NOTION_TOKEN || '',
    notionDatabaseId: normalizeNotionDatabaseId(
      env.APPOINTMENT_NOTION_DATABASE_ID
        || env.CONTACT_NOTION_DATABASE_ID
        || env.NOTION_DATABASE_ID,
      DEFAULT_DATABASE_ID,
    ),
    contactNotionDatabaseId: normalizeNotionDatabaseId(env.CONTACT_NOTION_DATABASE_ID),
    contactGoogleSpreadsheetId: cleanValue(env.CONTACT_GOOGLE_SPREADSHEET_ID),
    contactGoogleSheetName: cleanValue(env.CONTACT_GOOGLE_SHEET_NAME) || 'Contact Form',
    googleOAuthClientId: cleanValue(env.GOOGLE_OAUTH_CLIENT_ID),
    googleOAuthClientSecret: cleanValue(env.GOOGLE_OAUTH_CLIENT_SECRET),
    googleOAuthRefreshToken: cleanValue(
      env.GOOGLE_WORKSPACE_OAUTH_REFRESH_TOKEN || env.GOOGLE_OAUTH_REFRESH_TOKEN,
    ),
    visitorEventsDatabaseId: normalizeNotionDatabaseId(env.VISITOR_EVENTS_NOTION_DATABASE_ID, DEFAULT_VISITOR_EVENTS_DATABASE_ID),
    emailNotificationsEnabled:
      !BOOKING_EMAILS_TEMPORARILY_DISABLED
      && cleanValue(env.BOOKING_EMAILS_ENABLED).toLowerCase() !== 'false',
    resendApiKey: env.RESEND_API_KEY || '',
    resendFromEmail: env.RESEND_FROM_EMAIL_DEV || env.RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL_PROD || 'Metro Pinjaman Berlesen <no-reply@locus-t.com.my>',
    resendAdminEmails: env.RESEND_CONFIRMATION_TO_EMAIL_DEV || env.RESEND_TO_EMAIL_DEV || env.RESEND_TO_EMAILS || env.RESEND_TO_EMAIL || env.RESEND_TO_EMAIL_PROD || '',
    resendAdminCcEmails: env.RESEND_CC_EMAIL_DEV || env.RESEND_CC_EMAIL || env.RESEND_CC_EMAIL_PROD || '',
    bookingBaseUrl: env.BOOKING_BASE_URL || 'https://alfapinjaman.pages.dev',
    whatsappAccessToken: env.WHATSAPP_ACCESS_TOKEN || '',
    whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappApiVersion: env.WHATSAPP_API_VERSION || 'v23.0',
    whatsappTestRecipient: env.WHATSAPP_TEST_RECIPIENT || '',
  };
}

export function validateBooking(payload) {
  if (!cleanValue(payload.name)) return 'Please enter your full name.';
  if (!isValidEmail(payload.email)) return 'Please enter a valid email address.';
  if (!normalizeMalaysiaPhone(payload.phone)) return 'Please enter a valid Malaysian contact number.';
  if (!cleanValue(payload.loanType)) return 'Please select a loan type.';
  if (!payload.date || !payload.time) return 'Please select your preferred date and time.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) return 'Please select a valid date.';
  if (!/^\d{2}:\d{2}$/.test(payload.time)) return 'Please select a valid time.';
  return '';
}

export function normalizeMalaysiaPhone(value) {
  const trimmed = cleanValue(value);
  if (!trimmed) return '';
  if (trimmed.startsWith('+') && !trimmed.startsWith('+60')) return '';

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('60')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return /^1\d{8,9}$/.test(digits) ? `+60${digits}` : '';
}

export async function notionRequest(config, pathname, options = {}) {
  if (!config.notionToken) throw new Error('NOTION_TOKEN is not configured.');

  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...options,
    headers: {
      authorization: `Bearer ${config.notionToken}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Notion API error ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }

  return response.json();
}

export async function findActiveBookingBySlot(config, key) {
  const [date, time] = key.split('|');
  const result = await notionRequest(config, `/databases/${config.notionDatabaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        and: [
          preferredSlotDayFilter(date),
          { property: 'Preferred Time', rich_text: { equals: time } },
        ],
      },
      page_size: 1,
    }),
  });

  return result.results?.[0] || null;
}

export async function findActiveBookingsForDate(config, date) {
  const result = await notionRequest(config, `/databases/${config.notionDatabaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        and: [preferredSlotDayFilter(date)],
      },
      page_size: 100,
    }),
  });

  return result.results || [];
}

export function bookedTimesFromPages(date, pages) {
  return [...new Set(pages
    .map(slotKeyFromPage)
    .filter((key) => key.startsWith(`${date}|`))
    .map((key) => key.split('|')[1]))].sort();
}

function slotKeyFromPage(page) {
  const properties = page.properties || {};
  const storedKey = properties['Slot Key']?.rich_text
    ?.map((part) => part.plain_text)
    .join('');
  if (storedKey) return storedKey;

  const date = properties['Preferred Date']?.date?.start?.slice(0, 10) || '';
  const time = properties['Preferred Time']?.rich_text
    ?.map((part) => part.plain_text)
    .join('') || '';
  return date && time ? `${date}|${time}` : '';
}

function preferredSlotDayFilter(date) {
  return {
    property: 'Preferred Date',
    date: { equals: date },
  };
}

export function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function formatAppointmentDate(booking) {
  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(slotStart(booking.date, booking.time));
}

export function pageToBooking(page) {
  const props = page.properties || {};
  const key = slotKeyFromPage(page);
  const [date, time] = key.split('|');

  return {
    id: page.id,
    notionPageId: page.id,
    notionUrl: page.url,
    name: props['Full Name']?.title?.map((part) => part.plain_text).join('') || '',
    email: props.Email?.email || '',
    phone: props['Contact Number']?.phone_number || '',
    loanType: props['Loan Type']?.select?.name || '',
    message: props['Message / Enquiry']?.rich_text?.map((part) => part.plain_text).join('') || '',
    status: 'Confirmed - Booked',
    slotKey: key,
    date,
    time,
    cancelToken: props['Cancel Token']?.rich_text?.map((part) => part.plain_text).join('') || '',
    cancelUrl: props['Cancel URL']?.url || '',
    confirmUrl: '',
  };
}

export async function createBookingPage(config, payload) {
  const token = randomToken();
  const properties = {
    'Full Name': { title: [{ text: { content: cleanValue(payload.name) } }] },
    'Preferred Date': { date: { start: payload.date } },
    'Preferred Time': { rich_text: [{ text: { content: payload.time } }] },
    'Contact Number': { phone_number: cleanValue(payload.phone) },
    Email: { email: cleanValue(payload.email) },
    'Loan Type': { select: { name: cleanValue(payload.loanType) } },
    Location: {
      rich_text: cleanValue(payload.location)
        ? [{ text: { content: cleanValue(payload.location) } }]
        : [],
    },
    'Message / Enquiry': { rich_text: [{ text: { content: cleanValue(payload.message) } }] },
  };
  if (payload.submissionTimestamp) {
    properties.submission_timestamp = {
      date: { start: payload.submissionTimestamp },
    };
  }

  const page = await notionRequest(config, '/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: config.notionDatabaseId },
      properties,
    }),
  });

  const realCancelUrl = `${config.bookingBaseUrl}/api/bookings/cancel?id=${page.id}&token=${token}`;
  const confirmUrl = `${config.bookingBaseUrl}/api/bookings/confirm?id=${page.id}&token=${token}`;
  return { ...pageToBooking(page), id: page.id, cancelToken: token, cancelUrl: realCancelUrl, confirmUrl, date: payload.date, time: payload.time };
}

export async function createContactSubmissionPage(config, payload) {
  if (!config.contactNotionDatabaseId) {
    return { ok: true, skipped: true };
  }

  try {
    const page = await notionRequest(config, '/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: config.contactNotionDatabaseId },
        properties: {
          'Full Name': {
            title: [{ text: { content: cleanValue(payload.name) } }],
          },
          Email: { email: cleanValue(payload.email) },
          'Contact Number': { phone_number: cleanValue(payload.phone) },
          'Loan Type': { select: { name: cleanValue(payload.loanType) } },
          Location: {
            rich_text: cleanValue(payload.location)
              ? [{ text: { content: cleanValue(payload.location) } }]
              : [],
          },
          'Preferred Date': { date: { start: payload.date } },
          'Preferred Time': {
            rich_text: [{ text: { content: payload.time } }],
          },
          'Message / Enquiry': {
            rich_text: cleanValue(payload.message)
              ? [{ text: { content: cleanValue(payload.message) } }]
              : [],
          },
          submission_timestamp: {
            date: { start: payload.submissionTimestamp },
          },
        },
      }),
    });

    return { ok: true, skipped: false, id: page.id, url: page.url };
  } catch (error) {
    return { ok: false, skipped: false, error: error.message };
  }
}

async function getGoogleWorkspaceAccessToken(config) {
  if (
    !config.googleOAuthClientId
    || !config.googleOAuthClientSecret
    || !config.googleOAuthRefreshToken
  ) {
    throw new Error('Google Workspace OAuth credentials are not configured.');
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.googleOAuthClientId,
      client_secret: config.googleOAuthClientSecret,
      refresh_token: config.googleOAuthRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(`Google OAuth error ${response.status}: ${cleanValue(data.error) || 'token unavailable'}`);
  }

  return data.access_token;
}

export async function appendContactSubmissionToGoogleSheet(config, payload) {
  if (!config.contactGoogleSpreadsheetId) {
    return { ok: true, skipped: true };
  }

  try {
    const accessToken = await getGoogleWorkspaceAccessToken(config);
    const escapedSheetName = config.contactGoogleSheetName.replace(/'/g, "''");
    const lookupRange = `'${escapedSheetName}'!A2:A`;
    const lookupEndpoint =
      `${GOOGLE_SHEETS_API_HOST}/${encodeURIComponent(config.contactGoogleSpreadsheetId)}`
      + `/values/${encodeURIComponent(lookupRange)}?majorDimension=ROWS`;
    const lookupResponse = await fetch(lookupEndpoint, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const lookupData = await lookupResponse.json().catch(() => ({}));
    if (!lookupResponse.ok) {
      throw new Error(
        `Google Sheets API error ${lookupResponse.status}: `
        + `${cleanValue(lookupData.error?.message) || 'row lookup failed'}`,
      );
    }

    const rows = Array.isArray(lookupData.values) ? lookupData.values : [];
    const firstEmptyOffset = rows.findIndex((row) => !cleanValue(row?.[0]));
    const targetRow = firstEmptyOffset >= 0 ? firstEmptyOffset + 2 : rows.length + 2;
    const range = `'${escapedSheetName}'!A${targetRow}:I${targetRow}`;
    const endpoint =
      `${GOOGLE_SHEETS_API_HOST}/${encodeURIComponent(config.contactGoogleSpreadsheetId)}`
      + `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [[
          cleanValue(payload.name),
          cleanValue(payload.email),
          cleanValue(payload.phone) ? `'${cleanValue(payload.phone)}` : '',
          cleanValue(payload.loanType),
          cleanValue(payload.location),
          payload.date,
          payload.time,
          cleanValue(payload.message),
          googleSheetsDateTimeSerial(payload.submissionTimestamp),
        ]],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Google Sheets API error ${response.status}: ${cleanValue(data.error?.message) || 'append failed'}`);
    }

    return {
      ok: true,
      skipped: false,
      updatedRange: data.updatedRange || data.updates?.updatedRange || '',
    };
  } catch (error) {
    return { ok: false, skipped: false, error: error.message };
  }
}

export async function cancelBookingPage(config, pageId, token) {
  const page = await notionRequest(config, `/pages/${pageId}`);
  const booking = pageToBooking(page);

  if (!booking.cancelToken || booking.cancelToken !== token) return null;
  const wasConfirmed = booking.status === 'Confirmed - Booked';

  await notionRequest(config, `/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: 'Cancelled' } },
        'Cancelled At': { date: { start: new Date().toISOString() } },
      },
    }),
  });

  return { ...booking, id: pageId, status: 'Cancelled', wasConfirmed };
}

export async function confirmBookingPage(config, pageId, token) {
  const page = await notionRequest(config, `/pages/${pageId}`);
  const booking = pageToBooking(page);

  if (!booking.cancelToken || booking.cancelToken !== token) return null;
  if (booking.status === 'Cancelled') return null;

  await notionRequest(config, `/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: 'Confirmed - Booked' } },
      },
    }),
  });

  const cancelUrl = booking.cancelUrl || `${config.bookingBaseUrl}/api/bookings/cancel?id=${pageId}&token=${token}`;
  const confirmUrl = `${config.bookingBaseUrl}/api/bookings/confirm?id=${pageId}&token=${token}`;
  return { ...booking, id: pageId, status: 'Confirmed - Booked', cancelUrl, confirmUrl };
}

function formatIcsDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function buildCalendarInvite(booking, { method = 'REQUEST', status = 'CONFIRMED', sequence = 1 } = {}) {
  const escapeIcs = (value) => String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
  const start = slotStart(booking.date, booking.time);
  const end = addMinutes(start, 30);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Metro Pinjaman Berlesen//Appointment//EN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${booking.id}@metropinjamanberlesan.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `STATUS:${status}`,
    `SEQUENCE:${sequence}`,
    `SUMMARY:${escapeIcs(`Loan Appointment - ${booking.loanType}`)}`,
    `DESCRIPTION:${escapeIcs(`Metro Pinjaman Berlesen appointment. Cancel: ${booking.cancelUrl}`)}`,
    `LOCATION:${OFFICE_ADDRESS}`,
    `ORGANIZER;CN=Metro Pinjaman Berlesen:mailto:${OFFICE_EMAIL}`,
    `ATTENDEE;CN=${escapeIcs(booking.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${booking.email}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildCalendarCancel(booking) {
  return buildCalendarInvite(booking, { method: 'CANCEL', status: 'CANCELLED', sequence: 2 });
}

function base64Content(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

const OFFICE_ADDRESS = 'Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Federal Territory of Kuala Lumpur';
const OFFICE_PHONE = '+60 10-215 0037';
const OFFICE_EMAIL = 'metropinjamanberlesan@gmail.com';
const WHATSAPP_MESSAGE = 'Hi Metro Pinjaman Berlesen, I would like to enquire about a loan appointment.';
const WHATSAPP_URL = `https://wa.me/60102150037?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Jalan+Metro+1,+Metro+Prima,+52100+Kuala+Lumpur,+Wilayah+Persekutuan+Kuala+Lumpur/data=!4m2!3m1!1s0x31cc46401fe7d16b:0xcbf18c7859da390b';

function bookingReference(booking) {
  return booking.id || booking.slotKey || `${booking.date}-${booking.time}`;
}

function buttonHtml(href, label, variant = 'primary') {
  if (!href) return '';
  const style = variant === 'primary'
    ? 'background:#020617;color:#ffffff;border:1px solid #020617;'
    : 'background:#ffffff;color:#0f766e;border:1px solid #0f766e;';
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 10px 0;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;padding:12px 16px;${style}">${escapeHtml(label)}</a>`;
}

function emailShell({ title, preheader, reference, body }) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || title);
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#f6f8f5;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe7df;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:26px 30px;border-bottom:1px solid #e5ebe5;background:#ffffff;">
                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f766e;">Metro Pinjaman Berlesen</div>
                <div style="font-size:24px;line-height:1.25;font-weight:800;color:#0f172a;margin-top:8px;">${safeTitle}</div>
                <div style="font-size:13px;color:#64748b;margin-top:8px;">Ref: ${escapeHtml(reference || '-')}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:20px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:13px;line-height:1.7;color:#475569;">
                <strong style="color:#0f172a;">Metro Pinjaman Berlesen</strong><br>
                ${escapeHtml(OFFICE_ADDRESS)}<br>
                ${escapeHtml(OFFICE_PHONE)} | ${escapeHtml(OFFICE_EMAIL)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function rowsHtml(rows) {
  return rows.map(([label, value]) => `<tr><th align="left" style="width:38%;padding:12px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;color:#0f172a;">${escapeHtml(label)}</th><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:1.5;color:#334155;">${escapeHtml(value || '-')}</td></tr>`).join('');
}

function bookingRows(booking, { includeInternal = false, includeSlot = true } = {}) {
  const rows = [
    ['Customer Name', booking.name],
    ['Email', booking.email],
    ['Contact Number', booking.phone],
    ['Loan Type', booking.loanType],
    ['Message / Enquiry', booking.message || '-'],
    ['Status', booking.status || 'Pending Confirmation'],
  ];
  if (includeSlot) {
    rows.splice(4, 0, ['Preferred Slot', formatAppointmentDate(booking)]);
  }
  if (includeInternal) {
    rows.push(['Slot Key', booking.slotKey || '-']);
    rows.push(['Source', booking.source || 'Website']);
  }
  return rows;
}

export async function sendResendEmail(config, { to, cc, replyTo, subject, text, html, attachments }) {
  if (!config.emailNotificationsEnabled) {
    return { ok: true, skipped: true };
  }

  const recipients = Array.isArray(to) ? to : cleanValue(to).split(',').map((email) => email.trim()).filter(Boolean);
  if (!config.resendApiKey || !recipients.length) return { ok: false, error: 'Missing Resend configuration.' };

  const payload = {
    from: config.resendFromEmail,
    to: recipients,
    subject,
    text,
    html,
  };
  const ccRecipients = Array.isArray(cc) ? cc : cleanValue(cc).split(',').map((email) => email.trim()).filter(Boolean);
  if (ccRecipients.length) payload.cc = ccRecipients;
  if (replyTo) payload.reply_to = replyTo;
  if (attachments?.length) payload.attachments = attachments;

  let response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.resendApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: 'Resend request failed.' };
  }

  if (!response.ok) return { ok: false, error: `Resend returned ${response.status}: ${(await response.text()).slice(0, 500)}` };
  return { ok: true };
}

export async function sendBookingEmails(config, booking) {
  const reference = bookingReference(booking);
  const preferredSlot = formatAppointmentDate(booking);
  const adminText = [
    'New Metro Pinjaman Berlesen appointment request',
    '',
    `Reference: ${reference}`,
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Contact Number: ${booking.phone}`,
    `Loan Type: ${booking.loanType}`,
    `Preferred Slot: ${preferredSlot}`,
    `Message / Enquiry: ${booking.message || '-'}`,
    `Status: ${booking.status || 'Pending Confirmation'}`,
    `Notion: ${booking.notionUrl || '-'}`,
  ].join('\n');
  const clientText = [
    `Hi ${booking.name},`,
    '',
    'Thank you. We have received your appointment request.',
    `Loan Type: ${booking.loanType}`,
    '',
    'Your appointment request has been received. Our team will contact you if any follow-up is needed.',
    `WhatsApp: ${WHATSAPP_URL}`,
    '',
    'Metro Pinjaman Berlesen',
  ].join('\n');
  const adminHtml = emailShell({
    title: 'New appointment booking',
    preheader: `${booking.name} requested ${preferredSlot}.`,
    reference,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">A new appointment request was submitted from the website. Reply directly to the customer from this email if needed.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking, { includeInternal: true }))}</table>
      <div style="margin-top:22px;">
        ${buttonHtml(booking.notionUrl, 'Open in Notion')}
        ${buttonHtml(`mailto:${booking.email}`, 'Reply to Client', 'secondary')}
      </div>`,
  });
  const clientHtml = emailShell({
    title: 'Appointment request received',
    preheader: 'We have received your Metro Pinjaman Berlesen appointment request.',
    reference,
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;font-weight:700;">Hi ${escapeHtml(booking.name)},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">Thank you. We have received your appointment request. Our team will contact you if any follow-up is needed.</p>
      <div style="display:inline-block;margin:0 0 18px;padding:7px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700;">Request Received</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking, { includeSlot: false }))}</table>
      <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#334155;">If you need to change your request, please contact us on WhatsApp.</p>
      <div style="margin-top:22px;">
        ${buttonHtml(WHATSAPP_URL, 'WhatsApp Us', 'secondary')}
      </div>`,
  });
  const [admin, client] = await Promise.all([
    sendResendEmail(config, {
      to: config.resendAdminEmails,
      cc: config.resendAdminCcEmails,
      replyTo: booking.email,
      subject: `New appointment: ${booking.name} - ${booking.date} ${booking.time}`,
      text: adminText,
      html: adminHtml,
    }),
    sendResendEmail(config, {
      to: booking.email,
      subject: 'Your Metro Pinjaman Berlesen appointment request was received',
      text: clientText,
      html: clientHtml,
    }),
  ]);

  return { admin, client };
}

function normalizeWhatsAppRecipient(value) {
  const digits = cleanValue(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('60')) return digits;
  if (digits.startsWith('0')) return `6${digits}`;
  return digits;
}

export async function sendWhatsAppText(config, { to, body }) {
  const recipient = normalizeWhatsAppRecipient(config.whatsappTestRecipient || to);
  if (!config.whatsappAccessToken || !config.whatsappPhoneNumberId || !recipient) {
    return { ok: false, error: 'Missing WhatsApp configuration or recipient.' };
  }

  let response;
  try {
    response = await fetch(`${WHATSAPP_GRAPH_HOST}/${config.whatsappApiVersion}/${config.whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.whatsappAccessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: true,
          body,
        },
      }),
    });
  } catch {
    return { ok: false, error: 'WhatsApp request failed.' };
  }

  if (!response.ok) {
    return { ok: false, error: `WhatsApp returned ${response.status}: ${(await response.text()).slice(0, 500)}` };
  }

  return { ok: true };
}

export async function sendBookingWhatsApp(config, booking) {
  const body = [
    `Hi ${booking.name}, thank you for your Metro Pinjaman Berlesen appointment request.`,
    '',
    `Preferred slot: ${formatAppointmentDate(booking)}`,
    `Loan type: ${booking.loanType}`,
    '',
    'You will also receive this by email. Please confirm or cancel from either email or WhatsApp; you only need to do it once.',
    `Confirm: ${booking.confirmUrl}`,
    `Cancel: ${booking.cancelUrl}`,
  ].join('\n');

  return sendWhatsAppText(config, { to: booking.phone, body });
}

export async function sendConfirmedEmails(config, booking) {
  const preferredSlot = formatAppointmentDate(booking);
  const reference = bookingReference(booking);
  const calendarInvite = buildCalendarInvite(booking);
  const text = [
    `Hi ${booking.name},`,
    '',
    'Your appointment is confirmed.',
    `Preferred Slot: ${preferredSlot}`,
    `Loan Type: ${booking.loanType}`,
    `Cancel appointment: ${booking.cancelUrl}`,
    '',
    'A calendar file is attached.',
    'Metro Pinjaman Berlesen',
  ].join('\n');
  const html = emailShell({
    title: 'Appointment confirmed',
    preheader: `Your appointment for ${preferredSlot} is confirmed.`,
    reference,
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;font-weight:700;">Hi ${escapeHtml(booking.name)},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">Your appointment is confirmed. We attached a calendar file so you can add it to your calendar.</p>
      <div style="display:inline-block;margin:0 0 18px;padding:7px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700;">Confirmed - Booked</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking))}</table>
      <div style="margin-top:22px;">
        ${buttonHtml(booking.cancelUrl, 'Cancel Appointment')}
        ${buttonHtml(WHATSAPP_URL, 'WhatsApp Us', 'secondary')}
        ${buttonHtml(GOOGLE_MAPS_URL, 'View Location', 'secondary')}
      </div>`,
  });

  const [client, admin] = await Promise.all([
    sendResendEmail(config, {
      to: booking.email,
      subject: 'Your Metro Pinjaman Berlesen appointment is confirmed',
      text,
      html,
      attachments: [{ filename: 'metro-pinjaman-berlesen-appointment.ics', content: base64Content(calendarInvite) }],
    }),
    sendResendEmail(config, {
      to: config.resendAdminEmails,
      cc: config.resendAdminCcEmails,
      replyTo: booking.email,
      subject: `Appointment confirmed: ${booking.name} - ${booking.date} ${booking.time}`,
      text,
      html,
    }),
  ]);

  return { client, admin };
}

export async function sendCancelledEmails(config, booking) {
  const preferredSlot = formatAppointmentDate(booking);
  const reference = bookingReference(booking);
  const calendarCancel = buildCalendarCancel(booking);
  const text = [
    `Hi ${booking.name},`,
    '',
    'Your appointment has been cancelled.',
    `Previous Slot: ${preferredSlot}`,
    `Loan Type: ${booking.loanType}`,
    '',
    'A calendar cancellation file is attached so supported calendar apps can remove the event.',
    'Metro Pinjaman Berlesen',
  ].join('\n');
  const html = emailShell({
    title: 'Appointment cancelled',
    preheader: `Your appointment for ${preferredSlot} has been cancelled.`,
    reference,
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;font-weight:700;">Hi ${escapeHtml(booking.name)},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">Your appointment has been cancelled. We attached a calendar cancellation file so supported calendar apps can remove the event.</p>
      <div style="display:inline-block;margin:0 0 18px;padding:7px 10px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:12px;font-weight:700;">Cancelled</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking))}</table>
      <div style="margin-top:22px;">
        ${buttonHtml(`${config.bookingBaseUrl}/contact.html`, 'Book Another Appointment')}
        ${buttonHtml(WHATSAPP_URL, 'WhatsApp Us', 'secondary')}
      </div>`,
  });

  const [client, admin] = await Promise.all([
    sendResendEmail(config, {
      to: booking.email,
      subject: 'Your Metro Pinjaman Berlesen appointment was cancelled',
      text,
      html,
      attachments: [{ filename: 'metro-pinjaman-berlesen-appointment-cancelled.ics', content: base64Content(calendarCancel) }],
    }),
    sendResendEmail(config, {
      to: config.resendAdminEmails,
      cc: config.resendAdminCcEmails,
      replyTo: booking.email,
      subject: `Appointment cancelled: ${booking.name} - ${booking.date} ${booking.time}`,
      text,
      html,
    }),
  ]);

  return { client, admin };
}

export async function sendConfirmedWhatsApp(config, booking) {
  const body = [
    `Hi ${booking.name}, your Metro Pinjaman Berlesen appointment is confirmed.`,
    '',
    `Preferred slot: ${formatAppointmentDate(booking)}`,
    `Loan type: ${booking.loanType}`,
    '',
    `Cancel if needed: ${booking.cancelUrl}`,
  ].join('\n');

  return sendWhatsAppText(config, { to: booking.phone, body });
}
