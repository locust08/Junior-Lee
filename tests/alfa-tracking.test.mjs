import test from 'node:test';
import assert from 'node:assert/strict';

import fs from 'node:fs';
import vm from 'node:vm';

function createElement({
  tagName = 'FORM',
  attrs = {},
  textContent = '',
  matches = () => false,
  querySelector = () => null,
  closest = () => null,
} = {}) {
  return {
    tagName,
    attributes: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    textContent,
    getAttribute(name) {
      return attrs[name] || '';
    },
    matches,
    querySelector,
    closest,
  };
}

function loadAnalytics() {
  const listeners = {};
  const beacons = [];
  const consoleEvents = [];
  const document = {
    title: 'Metro',
    referrer: '',
    readyState: 'complete',
    head: { appendChild() {} },
    documentElement: { clientWidth: 1440, clientHeight: 1000, scrollHeight: 2000, scrollTop: 0 },
    body: { scrollHeight: 2000 },
    querySelector() {
      return null;
    },
    createElement(tagName) {
      return createElement({ tagName: tagName.toUpperCase() });
    },
    addEventListener(type, handler) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
  };
  const context = {
    Blob,
    Date,
    Intl,
    Math,
    URLSearchParams,
    URL,
    WeakMap,
    window: {
      location: {
        pathname: '/contact.html',
        href: 'https://metropinjamanberlesen.pages.dev/contact.html',
        search: '',
      },
      innerWidth: 1440,
      innerHeight: 1000,
      scrollY: 0,
      localStorage: new Map(),
      sessionStorage: new Map(),
      crypto: { randomUUID: () => '11111111-1111-4111-8111-111111111111' },
      dataLayer: [],
      console: {
        info(prefix, eventName, payload) {
          consoleEvents.push({ prefix, eventName, payload });
        },
      },
      addEventListener(type, handler) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type, handler) {
        listeners[type] = (listeners[type] || []).filter((candidate) => candidate !== handler);
      },
    },
    document,
    navigator: {
      userAgent: 'Node Test',
      sendBeacon(url, blob) {
        beacons.push({ url, blob });
        return true;
      },
    },
  };
  context.window.window = context.window;
  context.window.document = document;
  context.window.navigator = context.navigator;
  context.window.localStorage.getItem = context.window.localStorage.get.bind(context.window.localStorage);
  context.window.localStorage.setItem = context.window.localStorage.set.bind(context.window.localStorage);
  context.window.sessionStorage.getItem = context.window.sessionStorage.get.bind(context.window.sessionStorage);
  context.window.sessionStorage.setItem = context.window.sessionStorage.set.bind(context.window.sessionStorage);

  vm.createContext(context);
  vm.runInContext(fs.readFileSync('public/js/alfa-tracking.js', 'utf8'), context);

  return { context, listeners, beacons, consoleEvents };
}

async function readBeaconPayload(beacon) {
  return JSON.parse(await beacon.blob.text());
}

test('successful booking can be tracked with booking id context', async () => {
  const { context, beacons } = loadAnalytics();

  context.window.alfaTrack('booking_created', {
    booking_id: '3974fcc4-f701-811e-a894-eb6085e289f6',
    booking_status: 'Pending Confirmation',
    preferred_slot: '2026-07-10|16:00',
    loan_type: 'Business Loan',
  });

  const payload = await readBeaconPayload(beacons.at(-1));
  assert.equal(payload.event, 'booking_created');
  assert.equal(payload.booking_id, '3974fcc4-f701-811e-a894-eb6085e289f6');
  assert.equal(payload.booking_status, 'Pending Confirmation');
  assert.equal(payload.preferred_slot, '2026-07-10|16:00');
  assert.equal(payload.loan_type, 'Business Loan');
});

test('booking form focus sends form_start instead of legacy lead_form_start', async () => {
  const { listeners, beacons } = loadAnalytics();
  const form = createElement({
    matches: (selector) => selector === 'form',
    querySelector(selector) {
      return selector === "input[type='date'], select" ? createElement() : null;
    },
  });
  const input = createElement({ closest: () => form });

  listeners.focusin[0]({ target: input });

  const payload = await readBeaconPayload(beacons.at(-1));
  assert.equal(payload.event, 'form_start');
  assert.equal(payload.form_id, 'contact_booking');
});

test('successful lead form submission sends the Google Ads conversion once', () => {
  const { context } = loadAnalytics();
  const gtagCalls = [];
  context.window.gtag = (...args) => gtagCalls.push(args);

  context.window.alfaTrack('lead_form_submit', {
    booking_id: '3974fcc4-f701-811e-a894-eb6085e289f6',
    loan_type: 'Business Loan',
  });

  assert.deepEqual(Array.from(gtagCalls[0].slice(0, 2)), ['event', 'conversion']);
  assert.equal(gtagCalls[0][2].send_to, 'AW-10860340363/2HJKCNGu3N8cEIvJzroo');
  assert.equal(gtagCalls[0][2].value, 1);
  assert.equal(gtagCalls[0][2].currency, 'MYR');
  assert.equal(gtagCalls[0][2].transaction_id, '3974fcc4-f701-811e-a894-eb6085e289f6');
});

test('WhatsApp link click sends the secondary Google Ads contact conversion', () => {
  const { context, listeners } = loadAnalytics();
  const gtagCalls = [];
  context.window.gtag = (...args) => gtagCalls.push(args);
  const anchor = createElement({
    tagName: 'A',
    attrs: { href: 'https://wa.me/60175392449' },
    textContent: 'Chat on WhatsApp',
    matches: (selector) => selector === 'a[href]',
  });
  anchor.closest = () => anchor;

  listeners.click[0]({ target: anchor });

  assert.deepEqual(Array.from(gtagCalls[0].slice(0, 2)), ['event', 'conversion']);
  assert.equal(gtagCalls[0][2].send_to, 'AW-10860340363/DZ1cCM7ez-QcEIvJzroo');
  assert.equal(gtagCalls[0][2].value, 1);
  assert.equal(gtagCalls[0][2].currency, 'MYR');
});

test('directions link click sends the secondary Google Ads directions conversion', () => {
  const { context, listeners } = loadAnalytics();
  const gtagCalls = [];
  context.window.gtag = (...args) => gtagCalls.push(args);
  const anchor = createElement({
    tagName: 'A',
    attrs: { href: 'https://www.google.com/maps/dir/?api=1&destination=Kuala+Lumpur' },
    textContent: 'Get directions',
    matches: (selector) => selector === 'a[href]',
  });
  anchor.closest = () => anchor;

  listeners.click[0]({ target: anchor });

  assert.deepEqual(Array.from(gtagCalls[0].slice(0, 2)), ['event', 'conversion']);
  assert.equal(gtagCalls[0][2].send_to, 'AW-10860340363/pmXkCNC-xOQcEIvJzroo');
  assert.equal(gtagCalls[0][2].value, 1);
  assert.equal(gtagCalls[0][2].currency, 'MYR');
});

test('delegated navigation click emits contact_us_click and prints it to the console', async () => {
  const { listeners, beacons, consoleEvents } = loadAnalytics();
  const anchor = createElement({
    tagName: 'A',
    attrs: {
      href: '/en/contact',
      id: 'site-header-nav-contact-us',
    },
    textContent: 'Contact Us',
    matches: (selector) => selector === 'a[href]',
    querySelector: () => null,
  });
  anchor.id = 'site-header-nav-contact-us';
  anchor.closest = () => anchor;

  listeners.click[0]({ target: anchor });

  const payload = await readBeaconPayload(beacons.at(-1));
  assert.equal(payload.event, 'contact_us_click');
  assert.equal(payload.click_target_id, 'site-header-nav-contact-us');
  assert.equal(consoleEvents.at(-1).prefix, '[Junior Lee tracking]');
  assert.equal(consoleEvents.at(-1).eventName, 'contact_us_click');
});

test('scrolling halfway down a page emits scroll_half_page once and logs it', async () => {
  const { context, listeners, beacons, consoleEvents } = loadAnalytics();
  context.window.scrollY = 500;

  listeners.scroll[0]();
  const firstPayload = await readBeaconPayload(beacons.at(-1));
  assert.equal(firstPayload.event, 'scroll_half_page');
  assert.equal(firstPayload.scroll_percent, 50);
  assert.equal(consoleEvents.at(-1).eventName, 'scroll_half_page');
  assert.equal(listeners.scroll.length, 0);
});
