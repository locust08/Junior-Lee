const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DATABASE_ID =
  process.env.APPOINTMENT_NOTION_DATABASE_ID
  || process.env.CONTACT_NOTION_DATABASE_ID
  || process.env.NOTION_DATABASE_ID
  || 'fa9a71965f8d40ff92276ba56aa2d69f';
const NOTION_VERSION = '2022-06-28';
const GOOGLE_OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_API_HOST = 'https://sheets.googleapis.com/v4/spreadsheets';
const CONTACT_GOOGLE_SPREADSHEET_ID = process.env.CONTACT_GOOGLE_SPREADSHEET_ID || '';
const CONTACT_GOOGLE_SHEET_NAME = process.env.CONTACT_GOOGLE_SHEET_NAME || 'Contact Form';
const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const GOOGLE_OAUTH_REFRESH_TOKEN =
  process.env.GOOGLE_WORKSPACE_OAUTH_REFRESH_TOKEN
  || process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  || '';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const WHATSAPP_GRAPH_HOST = 'https://graph.facebook.com';
const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const BOOKING_EMAILS_ENABLED = true;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL_DEV || process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL_PROD || 'Metro Pinjaman Berlesen <no-reply@locus-t.com.my>';
const RESEND_ADMIN_EMAILS = process.env.RESEND_CONFIRMATION_TO_EMAIL_DEV || process.env.RESEND_TO_EMAIL_DEV || process.env.RESEND_TO_EMAILS || process.env.RESEND_TO_EMAIL || process.env.RESEND_TO_EMAIL_PROD || '';
const RESEND_ADMIN_CC_EMAILS = process.env.RESEND_CC_EMAIL_DEV || process.env.RESEND_CC_EMAIL || process.env.RESEND_CC_EMAIL_PROD || '';
const BOOKING_BASE_URL = process.env.BOOKING_BASE_URL || `http://localhost:${PORT}`;
const OFFICE_ADDRESS = 'Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Federal Territory of Kuala Lumpur';
const OFFICE_PHONE = '+60 10-215 0037';
const OFFICE_EMAIL = 'metropinjamanberlesan@gmail.com';
const WHATSAPP_MESSAGE = 'Hi Metro Pinjaman Berlesen, I would like to enquire about a loan appointment.';
const WHATSAPP_URL = `https://wa.me/60102150037?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';
const WHATSAPP_TEST_RECIPIENT = process.env.WHATSAPP_TEST_RECIPIENT || '';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Jalan+Metro+1,+Metro+Prima,+52100+Kuala+Lumpur,+Wilayah+Persekutuan+Kuala+Lumpur/data=!4m2!3m1!1s0x31cc46401fe7d16b:0xcbf18c7859da390b';

const activeStatuses = new Set(['Pending Confirmation', 'Confirmed - Booked']);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, '[]\n');
}

function readBookings() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
}

function writeBookings(bookings) {
  ensureDataFile();
  fs.writeFileSync(BOOKINGS_FILE, `${JSON.stringify(bookings, null, 2)}\n`);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function slotKey(date, time) {
  return `${date}|${time}`;
}

function notionSlotKey(page) {
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

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function cleanValue(value) {
  return String(value || '').trim();
}

function googleSheetsDateTimeSerial(value) {
  const timestamp = Date.parse(cleanValue(value));
  if (!Number.isFinite(timestamp)) return '';
  const malaysiaOffsetMilliseconds = 8 * 60 * 60 * 1000;
  return (timestamp + malaysiaOffsetMilliseconds) / 86400000 + 25569;
}

async function getGoogleWorkspaceAccessToken() {
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new Error('Google Workspace OAuth credentials are not configured.');
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(
      `Google OAuth error ${response.status}: ${cleanValue(data.error) || 'token unavailable'}`,
    );
  }

  return data.access_token;
}

async function appendContactSubmissionToGoogleSheet(payload) {
  if (!CONTACT_GOOGLE_SPREADSHEET_ID) {
    return { ok: true, skipped: true };
  }

  try {
    const accessToken = await getGoogleWorkspaceAccessToken();
    const escapedSheetName = CONTACT_GOOGLE_SHEET_NAME.replace(/'/g, "''");
    const lookupRange = `'${escapedSheetName}'!A2:A`;
    const lookupEndpoint =
      `${GOOGLE_SHEETS_API_HOST}/${encodeURIComponent(CONTACT_GOOGLE_SPREADSHEET_ID)}`
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
      `${GOOGLE_SHEETS_API_HOST}/${encodeURIComponent(CONTACT_GOOGLE_SPREADSHEET_ID)}`
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
          googleSheetsDateTimeSerial(payload.submissionTimestamp || payload.submittedAt),
        ]],
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        `Google Sheets API error ${response.status}: `
        + `${cleanValue(data.error?.message) || 'append failed'}`,
      );
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

function escapeHtml(value) {
  return cleanValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue(email));
}

function parseRecipientEmails(value) {
  return cleanValue(value)
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

function slotStart(date, time) {
  return new Date(`${date}T${time}:00+08:00`);
}

function notionDateTime(date, time) {
  const parsed = addMinutesToWallClock(date, time, 0);
  return `${parsed.date}T${parsed.time}:00`;
}

function notionEndDateTime(date, time) {
  const end = addMinutesToWallClock(date, time, DEFAULT_APPOINTMENT_DURATION_MINUTES);
  return `${end.date}T${end.time}:00`;
}

function addMinutesToWallClock(date, time, minutesToAdd) {
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

function validateBooking(payload) {
  if (!payload.name || !String(payload.name).trim()) return 'Please enter your full name.';
  if (!payload.email || !isValidEmail(payload.email)) return 'Please enter a valid email address.';
  if (!normalizeMalaysiaPhone(payload.phone)) return 'Please enter a valid Malaysian contact number.';
  if (!payload.loanType) return 'Please select a loan type.';
  if (!payload.date || !payload.time) return 'Please select your preferred date and time.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) return 'Please select a valid date.';
  if (!/^\d{2}:\d{2}$/.test(payload.time)) return 'Please select a valid time.';
  return '';
}

function normalizeMalaysiaPhone(value) {
  const trimmed = cleanValue(value);
  if (!trimmed) return '';
  if (trimmed.startsWith('+') && !trimmed.startsWith('+60')) return '';

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('60')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return /^1\d{8,9}$/.test(digits) ? `+60${digits}` : '';
}

function formatAppointmentDate(booking) {
  const start = slotStart(booking.date, booking.time);
  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(start);
}

function formatIcsDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function buildCalendarInvite(booking, { method = 'REQUEST', status = 'CONFIRMED', sequence = 1 } = {}) {
  const start = slotStart(booking.date, booking.time);
  const end = addMinutes(start, 30);
  const escapeIcs = (value) => String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');

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
    `DESCRIPTION:${escapeIcs(`Metro Pinjaman Berlesen appointment. Contact: ${OFFICE_PHONE}. Cancel: ${booking.cancelUrl || ''}`)}`,
    `LOCATION:${escapeIcs(OFFICE_ADDRESS)}`,
    `ORGANIZER;CN=Metro Pinjaman Berlesen:mailto:${OFFICE_EMAIL}`,
    `ATTENDEE;CN=${escapeIcs(booking.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${booking.email}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function buildCalendarCancel(booking) {
  return buildCalendarInvite(booking, { method: 'CANCEL', status: 'CANCELLED', sequence: 2 });
}

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

function buildEmailShell({ title, preheader, reference, body }) {
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
  return rows.map(([label, value]) => `
    <tr>
      <th align="left" style="width:38%;padding:12px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;color:#0f172a;">${escapeHtml(label)}</th>
      <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:1.5;color:#334155;">${escapeHtml(value || '-')}</td>
    </tr>`).join('');
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

function buildAdminEmail(booking) {
  const reference = bookingReference(booking);
  const preferredSlot = formatAppointmentDate(booking);
  const text = [
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

  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">A new appointment request was submitted from the website. Reply directly to the customer from this email if needed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking, { includeInternal: true }))}</table>
    <div style="margin-top:22px;">
      ${buttonHtml(booking.notionUrl, 'Open in Notion')}
      ${buttonHtml(`mailto:${booking.email}`, 'Reply to Client', 'secondary')}
    </div>`;

  return {
    subject: `New appointment: ${booking.name} - ${booking.date} ${booking.time}`,
    text,
    html: buildEmailShell({
      title: 'New appointment booking',
      preheader: `${booking.name} requested ${preferredSlot}.`,
      reference,
      body,
    }),
  };
}

function buildClientEmail(booking) {
  const reference = bookingReference(booking);
  const text = [
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

  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#0f172a;font-weight:700;">Hi ${escapeHtml(booking.name)},</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">Thank you. We have received your appointment request. Our team will contact you if any follow-up is needed.</p>
    <div style="display:inline-block;margin:0 0 18px;padding:7px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700;">Request Received</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking, { includeSlot: false }))}</table>
    <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#334155;">If you need to change your request, please contact us on WhatsApp.</p>
    <div style="margin-top:22px;">
      ${buttonHtml(WHATSAPP_URL, 'WhatsApp Us', 'secondary')}
    </div>`;

  return {
    subject: 'Your Metro Pinjaman Berlesen appointment request was received',
    text,
    html: buildEmailShell({
      title: 'Appointment request received',
      preheader: 'We have received your Metro Pinjaman Berlesen appointment request.',
      reference,
      body,
    }),
  };
}

async function sendResendEmail({ to, cc, replyTo, subject, text, html, attachments }) {
  if (!BOOKING_EMAILS_ENABLED) {
    return { ok: true, skipped: true };
  }

  const recipients = Array.isArray(to) ? to : parseRecipientEmails(to);
  if (!RESEND_API_KEY || !recipients.length) {
    return { ok: false, error: 'Missing RESEND_API_KEY or recipient email.' };
  }

  const payload = {
    from: RESEND_FROM_EMAIL,
    to: recipients,
    subject,
    text,
    html,
  };

  const ccRecipients = Array.isArray(cc) ? cc : parseRecipientEmails(cc);
  if (ccRecipients.length) payload.cc = ccRecipients;

  if (replyTo) payload.reply_to = replyTo;
  if (attachments && attachments.length) payload.attachments = attachments;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Resend returned ${response.status}: ${body.slice(0, 500)}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || 'Resend request failed.' };
  }
}

async function sendBookingEmails(booking) {
  const adminEmail = buildAdminEmail(booking);
  const clientEmail = buildClientEmail(booking);

  const [adminResult, clientResult] = await Promise.all([
    sendResendEmail({
      to: RESEND_ADMIN_EMAILS,
      cc: RESEND_ADMIN_CC_EMAILS,
      replyTo: booking.email,
      ...adminEmail,
    }),
    sendResendEmail({
      to: booking.email,
      ...clientEmail,
    }),
  ]);

  if (!adminResult.ok) console.error('[booking] Admin email failed:', adminResult.error);
  if (!clientResult.ok) console.error('[booking] Client email failed:', clientResult.error);

  return { admin: adminResult, client: clientResult };
}

function normalizeWhatsAppRecipient(value) {
  const digits = cleanValue(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('60')) return digits;
  if (digits.startsWith('0')) return `6${digits}`;
  return digits;
}

async function sendWhatsAppText({ to, body }) {
  const recipient = normalizeWhatsAppRecipient(WHATSAPP_TEST_RECIPIENT || to);
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !recipient) {
    return { ok: false, error: 'Missing WhatsApp configuration or recipient.' };
  }

  try {
    const response = await fetch(`${WHATSAPP_GRAPH_HOST}/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
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

    if (!response.ok) {
      const responseBody = await response.text();
      return { ok: false, error: `WhatsApp returned ${response.status}: ${responseBody.slice(0, 500)}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || 'WhatsApp request failed.' };
  }
}

async function sendBookingWhatsApp(booking) {
  return sendWhatsAppText({
    to: booking.phone,
    body: [
      `Hi ${booking.name}, thank you for your Metro Pinjaman Berlesen appointment request.`,
      '',
      `Preferred slot: ${formatAppointmentDate(booking)}`,
      `Loan type: ${booking.loanType}`,
      '',
      'You will also receive this by email. Please confirm or cancel from either email or WhatsApp; you only need to do it once.',
      `Confirm: ${booking.confirmUrl}`,
      `Cancel: ${booking.cancelUrl}`,
    ].join('\n'),
  });
}

async function sendConfirmedEmails(booking) {
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
  const html = buildEmailShell({
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
    sendResendEmail({
      to: booking.email,
      subject: 'Your Metro Pinjaman Berlesen appointment is confirmed',
      text,
      html,
      attachments: [{ filename: 'metro-pinjaman-berlesen-appointment.ics', content: Buffer.from(calendarInvite).toString('base64') }],
    }),
    sendResendEmail({
      to: RESEND_ADMIN_EMAILS,
      cc: RESEND_ADMIN_CC_EMAILS,
      replyTo: booking.email,
      subject: `Appointment confirmed: ${booking.name} - ${booking.date} ${booking.time}`,
      text,
      html,
    }),
  ]);

  if (!client.ok) console.error('[booking] Confirmed client email failed:', client.error);
  if (!admin.ok) console.error('[booking] Confirmed admin email failed:', admin.error);

  return { client, admin };
}

async function sendCancelledEmails(booking) {
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
  const html = buildEmailShell({
    title: 'Appointment cancelled',
    preheader: `Your appointment for ${preferredSlot} has been cancelled.`,
    reference,
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;font-weight:700;">Hi ${escapeHtml(booking.name)},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">Your appointment has been cancelled. We attached a calendar cancellation file so supported calendar apps can remove the event.</p>
      <div style="display:inline-block;margin:0 0 18px;padding:7px 10px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:12px;font-weight:700;">Cancelled</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rowsHtml(bookingRows(booking))}</table>
      <div style="margin-top:22px;">
        ${buttonHtml(`${BOOKING_BASE_URL}/contact.html`, 'Book Another Appointment')}
        ${buttonHtml(WHATSAPP_URL, 'WhatsApp Us', 'secondary')}
      </div>`,
  });

  const [client, admin] = await Promise.all([
    sendResendEmail({
      to: booking.email,
      subject: 'Your Metro Pinjaman Berlesen appointment was cancelled',
      text,
      html,
      attachments: [{ filename: 'metro-pinjaman-berlesen-appointment-cancelled.ics', content: Buffer.from(calendarCancel).toString('base64') }],
    }),
    sendResendEmail({
      to: RESEND_ADMIN_EMAILS,
      cc: RESEND_ADMIN_CC_EMAILS,
      replyTo: booking.email,
      subject: `Appointment cancelled: ${booking.name} - ${booking.date} ${booking.time}`,
      text,
      html,
    }),
  ]);

  if (!client.ok) console.error('[booking] Cancelled client email failed:', client.error);
  if (!admin.ok) console.error('[booking] Cancelled admin email failed:', admin.error);

  return { client, admin };
}

async function sendConfirmedWhatsApp(booking) {
  return sendWhatsAppText({
    to: booking.phone,
    body: [
      `Hi ${booking.name}, your Metro Pinjaman Berlesen appointment is confirmed.`,
      '',
      `Preferred slot: ${formatAppointmentDate(booking)}`,
      `Loan type: ${booking.loanType}`,
      '',
      `Cancel if needed: ${booking.cancelUrl}`,
    ].join('\n'),
  });
}

async function notionRequest(pathname, options = {}) {
  if (!NOTION_TOKEN) return null;

  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function findActiveNotionBooking(key) {
  if (!NOTION_TOKEN) return null;
  const [date, time] = key.split('|');

  const result = await notionRequest(`/databases/${NOTION_DATABASE_ID}/query`, {
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

async function findActiveNotionBookingsForDate(date) {
  if (!NOTION_TOKEN) return [];

  const result = await notionRequest(`/databases/${NOTION_DATABASE_ID}/query`, {
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

async function updateNotionBookingStatus(pageId, status) {
  if (!NOTION_TOKEN || !pageId) return null;

  return notionRequest(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  });
}

async function createNotionBooking(payload, key) {
  if (!NOTION_TOKEN) return null;

  return notionRequest('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Full Name': { title: [{ text: { content: payload.name || '' } }] },
        'Preferred Date': { date: { start: payload.date } },
        'Preferred Time': { rich_text: [{ text: { content: payload.time } }] },
        'Contact Number': payload.phone ? { phone_number: payload.phone } : { phone_number: null },
        Email: payload.email ? { email: payload.email } : { email: null },
        'Loan Type': { select: { name: payload.loanType } },
        Location: {
          rich_text: cleanValue(payload.location)
            ? [{ text: { content: cleanValue(payload.location) } }]
            : [],
        },
        'Message / Enquiry': { rich_text: [{ text: { content: payload.message || '' } }] },
        submission_timestamp: { date: { start: payload.submissionTimestamp || payload.submittedAt } },
      },
    }),
  });
}

async function handleBookedSlots(req, res, url) {
  const date = url.searchParams.get('date');
  if (!date) return sendJson(res, 400, { message: 'Date is required.' });

  const localBookedTimes = readBookings()
    .filter((booking) => {
      if (booking.date !== date || !activeStatuses.has(booking.status)) return false;
      return !NOTION_TOKEN || !booking.notionSynced;
    })
    .map((booking) => booking.time);

  const notionBookings = await findActiveNotionBookingsForDate(date);
  const notionBookedTimes = notionBookings
    .map(notionSlotKey)
    .filter((key) => key.startsWith(`${date}|`))
    .map((key) => key.split('|')[1]);

  sendJson(res, 200, { bookedTimes: [...new Set([...localBookedTimes, ...notionBookedTimes])].sort() });
}

async function handleCreateBooking(req, res) {
  const payload = await readJsonBody(req);
  const validationError = validateBooking(payload);
  if (validationError) return sendJson(res, 400, { message: validationError });

  const key = slotKey(payload.date, payload.time);
  const bookings = readBookings();
  const duplicate = bookings.find((booking) => {
    if (booking.slotKey !== key || !activeStatuses.has(booking.status)) return false;
    return !NOTION_TOKEN || !booking.notionSynced;
  });
  if (duplicate) {
    return sendJson(res, 409, { message: 'This time slot has already been booked. Please choose another time.' });
  }

  const notionDuplicate = await findActiveNotionBooking(key);
  if (notionDuplicate) {
    return sendJson(res, 409, { message: 'This time slot has already been booked. Please choose another time.' });
  }

  const booking = {
    id: `local-${Date.now()}`,
    slotKey: key,
    cancelToken: crypto.randomBytes(24).toString('hex'),
    status: 'Pending Confirmation',
    source: 'Website',
    submittedAt: new Date().toISOString(),
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    phone: normalizeMalaysiaPhone(payload.phone),
    loanType: payload.loanType,
    location: String(payload.location || '').trim(),
    date: payload.date,
    time: payload.time,
    message: String(payload.message || '').trim(),
    notionSynced: false,
  };
  booking.submissionTimestamp = booking.submittedAt;
  booking.cancelUrl = `${BOOKING_BASE_URL}/api/bookings/cancel?id=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(booking.cancelToken)}`;
  booking.confirmUrl = `${BOOKING_BASE_URL}/api/bookings/confirm?id=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(booking.cancelToken)}`;

  const notionPage = await createNotionBooking(booking, key);
  if (notionPage) {
    booking.notionSynced = true;
    booking.notionPageId = notionPage.id;
    booking.notionUrl = notionPage.url;
    booking.cancelUrl = `${BOOKING_BASE_URL}/api/bookings/cancel?id=${encodeURIComponent(notionPage.id)}&token=${encodeURIComponent(booking.cancelToken)}`;
    booking.confirmUrl = `${BOOKING_BASE_URL}/api/bookings/confirm?id=${encodeURIComponent(notionPage.id)}&token=${encodeURIComponent(booking.cancelToken)}`;
  }

  bookings.push(booking);
  writeBookings(bookings);

  const googleSheetResult = await appendContactSubmissionToGoogleSheet(booking);
  if (!googleSheetResult.ok) {
    console.error('[booking] Contact Google Sheet storage failed:', googleSheetResult.error);
  } else if (!googleSheetResult.skipped) {
    console.log('[booking] Contact Google Sheet row appended:', googleSheetResult.updatedRange);
  }

  const emailResults = await sendBookingEmails(booking);
  booking.emailSent = Boolean(emailResults.admin.ok && emailResults.client.ok);
  const whatsappResult = await sendBookingWhatsApp(booking);
  if (!whatsappResult.ok) console.error('[booking] WhatsApp message failed:', whatsappResult.error);
  booking.whatsappSent = Boolean(whatsappResult.ok);
  writeBookings(bookings);

  const warnings = [];
  if (!emailResults.admin.ok) {
    warnings.push('Your booking was saved, but the company email notification could not be sent.');
  }
  if (!emailResults.client.ok) {
    warnings.push('Your booking was saved, but your confirmation email could not be sent.');
  }
  if (!googleSheetResult.ok) {
    warnings.push(
      'Your booking was saved, but the contact details could not be copied to the contact Google Sheet.',
    );
  }

  sendJson(res, 201, { message: 'Booking submitted.', booking, warnings });
}

async function handleCancelBooking(res, url) {
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');
  const bookings = readBookings();
  const booking = bookings.find((item) => (item.id === id || item.notionPageId === id) && item.cancelToken === token);

  if (!booking) {
    return sendHtml(res, 404, '<h1>Booking not found</h1><p>This cancellation link is invalid or expired.</p>');
  }

  const wasConfirmed = booking.status === 'Confirmed - Booked';
  booking.status = 'Cancelled';
  booking.cancelledAt = new Date().toISOString();

  if (booking.notionPageId) {
    await updateNotionBookingStatus(booking.notionPageId, 'Cancelled').catch(() => null);
  }

  writeBookings(bookings);

  if (wasConfirmed) {
    await sendCancelledEmails(booking);
  }

  sendHtml(res, 200, `<!doctype html>
<html>
  <head>
    <title>Appointment Cancelled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <main style="max-width:640px;margin:64px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
      <h1 style="margin:0 0 12px;font-size:28px;">Appointment Cancelled</h1>
      <p style="font-size:16px;line-height:1.6;">Your appointment for ${escapeHtml(formatAppointmentDate(booking))} has been cancelled. This time slot is now available again.</p>
      <p><a href="/contact.html" style="color:#0f766e;font-weight:700;">Book another appointment</a></p>
    </main>
  </body>
</html>`);
}

async function handleConfirmBooking(res, url) {
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');
  const bookings = readBookings();
  const booking = bookings.find((item) => (item.id === id || item.notionPageId === id) && item.cancelToken === token);

  if (!booking || booking.status === 'Cancelled') {
    return sendHtml(res, 404, '<h1>Booking not found</h1><p>This confirmation link is invalid or expired.</p>');
  }

  booking.status = 'Confirmed - Booked';
  booking.confirmedAt = new Date().toISOString();
  writeBookings(bookings);

  if (booking.notionPageId || (NOTION_TOKEN && !String(booking.id).startsWith('local-'))) {
    await updateNotionBookingStatus(booking.notionPageId || id, 'Confirmed - Booked').catch(() => null);
  }

  await sendConfirmedEmails(booking);
  const whatsappResult = await sendConfirmedWhatsApp(booking);
  if (!whatsappResult.ok) console.error('[booking] Confirmed WhatsApp failed:', whatsappResult.error);

  return sendHtml(res, 200, `<!doctype html>
<html>
  <head>
    <title>Appointment Confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <main style="max-width:640px;margin:64px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
      <h1 style="margin:0 0 12px;font-size:28px;">Appointment Confirmed</h1>
      <p style="font-size:16px;line-height:1.6;">Your appointment for ${escapeHtml(formatAppointmentDate(booking))} is confirmed. A calendar invite has been sent to your email.</p>
      <p><a href="/contact.html" style="color:#0f766e;font-weight:700;">Back to contact page</a></p>
    </main>
  </body>
</html>`);
}

async function handleResetBookings(res) {
  const bookings = readBookings();
  const notionPageIds = bookings
    .filter((booking) => booking.notionPageId)
    .map((booking) => booking.notionPageId);

  await Promise.all(notionPageIds.map((pageId) => (
    updateNotionBookingStatus(pageId, 'Cancelled').catch(() => null)
  )));
  writeBookings([]);
  sendJson(res, 200, { message: 'Test bookings reset.' });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/bookings/booked-slots') {
      await handleBookedSlots(req, res, url);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/bookings/cancel') {
      await handleCancelBooking(res, url);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/bookings/confirm') {
      await handleConfirmBooking(res, url);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/bookings') {
      await handleCreateBooking(req, res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/test/reset-bookings') {
      await handleResetBookings(res);
      return;
    }

    serveStatic(req, res, url);
  } catch (error) {
    console.error('[booking] Request failed:', error);
    sendJson(res, 500, {
      message: 'Sorry, we could not submit your appointment right now. Please try again or contact us on WhatsApp.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`Booking test server running at http://localhost:${PORT}`);
  if (!NOTION_TOKEN) {
    console.log('NOTION_TOKEN is not set. Bookings will be blocked locally for testing only.');
  }
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY is not set. Booking emails will not be sent.');
  }
});
