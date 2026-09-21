import {
  cleanValue,
  getConfig,
  jsonResponse,
  notionRequest,
} from '../_lib/booking.js';

const MAX_TEXT_LENGTH = 1800;
const VALID_EVENTS = new Set([
  'page_view',
  'cta_click',
  'apply_now_click',
  'scroll_half_page',
  'whatsapp_click',
  'contact_click',
  'how_to_apply_click',
  'contact_us_click',
  'location_click',
  'faq_click',
  'loan_click',
  'about_us_click',
  'google_maps_click',
  'waze_click',
  'form_start',
  'form_submit',
  'booking_created',
  'appointment_cancel',
  'lead_form_start',
  'lead_form_submit',
  'lead_form_error',
  'loan_type_select',
]);

function trimText(value, maxLength = MAX_TEXT_LENGTH) {
  return cleanValue(value).slice(0, maxLength);
}

function richText(value) {
  const content = trimText(value);
  return { rich_text: content ? [{ text: { content } }] : [] };
}

function selectValue(value) {
  const name = trimText(value, 100);
  return name ? { select: { name } } : { select: null };
}

function urlValue(value) {
  const url = trimText(value, 2000);
  return { url: /^https?:\/\//i.test(url) ? url : null };
}

export function normalizeEventName(eventName) {
  return VALID_EVENTS.has(eventName) ? eventName : 'cta_click';
}

export function buildEventPayloadJson(payload) {
  const allowed = {
    booking_id: trimText(payload.booking_id || payload.lead_id, 160),
    booking_status: trimText(payload.booking_status, 100),
    preferred_slot: trimText(payload.preferred_slot, 120),
    form_id: trimText(payload.form_id, 120),
    form_name: trimText(payload.form_name, 160),
    link_text: trimText(payload.link_text, 200),
    link_url: trimText(payload.link_url, 500),
    click_target_id: trimText(payload.click_target_id, 160),
    scroll_percent: Number.isFinite(Number(payload.scroll_percent))
      ? Math.max(0, Math.min(100, Number(payload.scroll_percent)))
      : '',
    cta_text: trimText(payload.cta_text, 200),
    cta_url: trimText(payload.cta_url, 500),
    cta_type: trimText(payload.cta_type, 80),
    page_title: trimText(payload.page_title, 200),
    loan_type: trimText(payload.loan_type, 100),
    error_type: trimText(payload.error_type, 100),
    error_message: trimText(payload.error_message, 300),
  };

  return JSON.stringify(Object.fromEntries(
    Object.entries(allowed).filter(([, value]) => value)
  ));
}

function eventId(payload) {
  if (payload.event_id) return trimText(payload.event_id, 160);
  return `${trimText(payload.event, 60) || 'event'}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

async function createVisitorEvent(config, payload) {
  const eventName = normalizeEventName(payload.event);
  const properties = {
    'Event ID': { title: [{ text: { content: eventId({ ...payload, event: eventName }) } }] },
    'Event Name': selectValue(eventName),
    'Event Time': { date: { start: payload.event_time || new Date().toISOString() } },
    'Page Path': richText(payload.page_path),
    'Full URL': urlValue(payload.page_location || payload.full_url),
    Referrer: urlValue(payload.referrer),
    'UTM Source': richText(payload.utm_source),
    'UTM Medium': richText(payload.utm_medium),
    'UTM Campaign': richText(payload.utm_campaign),
    'UTM Content': richText(payload.utm_content),
    'UTM Term': richText(payload.utm_term),
    Platform: selectValue(payload.platform),
    'Platform Click ID': richText(payload.platform_click_id),
    'Visitor ID': richText(payload.visitor_id),
    'Session ID': richText(payload.session_id),
    'Device Type': selectValue(payload.device_type),
    'Lead / Booking ID': richText(payload.booking_id || payload.lead_id),
    Country: richText(payload.country),
    Region: richText(payload.region),
    City: richText(payload.city),
    Timezone: richText(payload.timezone),
    'User Agent': richText(payload.user_agent),
    'Event Payload': richText(buildEventPayloadJson(payload)),
  };

  return notionRequest(config, '/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: config.visitorEventsDatabaseId },
      properties,
    }),
  });
}

export async function onRequestPost({ request, env }) {
  const config = getConfig(env);
  if (!config.notionToken || !config.visitorEventsDatabaseId) {
    return jsonResponse({ ok: false, message: 'Visitor event tracking is not configured.' }, 202);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: 'Invalid event payload.' }, 400);
  }

  try {
    await createVisitorEvent(config, payload || {});
    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    console.error('[events] Visitor event failed:', error);
    return jsonResponse({
      ok: false,
      message: error instanceof Error ? error.message : 'Visitor event failed.',
    }, 202);
  }
}
