import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEventPayloadJson,
  normalizeEventName,
} from '../functions/api/events.js';

test('normalizes Alfa booking funnel event names without falling back to cta_click', () => {
  assert.equal(normalizeEventName('form_start'), 'form_start');
  assert.equal(normalizeEventName('booking_created'), 'booking_created');
  assert.equal(normalizeEventName('appointment_cancel'), 'appointment_cancel');
});

test('normalizes the requested site-wide engagement events', () => {
  [
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
  ].forEach((eventName) => {
    assert.equal(normalizeEventName(eventName), eventName);
  });
});

test('includes booking context in visitor event payload JSON', () => {
  const payload = JSON.parse(buildEventPayloadJson({
    booking_id: '3974fcc4-f701-811e-a894-eb6085e289f6',
    booking_status: 'Pending Confirmation',
    preferred_slot: '2026-07-10|16:00',
    loan_type: 'Business Loan',
  }));

  assert.deepEqual(payload, {
    booking_id: '3974fcc4-f701-811e-a894-eb6085e289f6',
    booking_status: 'Pending Confirmation',
    preferred_slot: '2026-07-10|16:00',
    loan_type: 'Business Loan',
  });
});
