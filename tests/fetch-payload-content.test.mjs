import test from 'node:test';
import assert from 'node:assert/strict';

import { defaultPayloadContent } from '../src/payload/content.ts';
import {
  DEFAULT_PUBLISHED_CONTENT_URL,
  fetchPayloadContent,
  resolvePublishedContentUrl,
} from '../src/payload/fetchPayloadContent.ts';

const originalFetch = globalThis.fetch;
const originalContentUrl = process.env.PAYLOAD_PUBLIC_CONTENT_URL;
const originalConsoleInfo = console.info;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  console.info = originalConsoleInfo;
  if (originalContentUrl === undefined) delete process.env.PAYLOAD_PUBLIC_CONTENT_URL;
  else process.env.PAYLOAD_PUBLIC_CONTENT_URL = originalContentUrl;
});

test('fetchPayloadContent fetches published content and merges nullish values with defaults', async () => {
  process.env.PAYLOAD_PUBLIC_CONTENT_URL = 'https://cms.example.test/api/published-content';
  globalThis.fetch = async (url, options) => {
    assert.equal(url, process.env.PAYLOAD_PUBLIC_CONTENT_URL);
    assert.deepEqual(options.headers, { accept: 'application/json' });
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify({
      siteSettings: {
        header: {
          aboutUsMenuLabel: '',
          loanMenuLabel: 'Loans from Payload',
        },
      },
    }));
  };

  const content = await fetchPayloadContent();

  assert.equal(content.siteSettings.header.aboutUsMenuLabel, '');
  assert.equal(content.siteSettings.header.loanMenuLabel, 'Loans from Payload');
  assert.equal(content.siteSettings.header.contactUsMenuLabel, defaultPayloadContent.siteSettings.header.contactUsMenuLabel);
});

test('fetchPayloadContent uses the default published endpoint when no production env URL is configured', async () => {
  delete process.env.PAYLOAD_PUBLIC_CONTENT_URL;
  const logs = [];
  console.info = (...args) => logs.push(args.join(' '));
  globalThis.fetch = async (url) => {
    assert.equal(url, DEFAULT_PUBLISHED_CONTENT_URL);
    return new Response(JSON.stringify({
      homePage: {
        hero: {
          mainHeading: 'Pay Off Your Debts',
        },
      },
    }));
  };

  const content = await fetchPayloadContent();

  assert.equal(content.homePage.hero.mainHeading, 'Pay Off Your Debts');
  assert.match(logs.join('\n'), /Fetch succeeded/);
});

test('resolvePublishedContentUrl trims whitespace and rejects the wrong endpoint path', () => {
  assert.equal(
    resolvePublishedContentUrl(' https://metropinjamanberlesen-payload-cms.easondev.workers.dev/api/published-content '),
    DEFAULT_PUBLISHED_CONTENT_URL,
  );

  assert.equal(
    resolvePublishedContentUrl('https://metropinjamanberlesen-payload-cms.easondev.workers.dev/api/site-content'),
    DEFAULT_PUBLISHED_CONTENT_URL,
  );
});

test('fetchPayloadContent returns defaults when the published endpoint fails', async () => {
  const logs = [];
  console.info = (...args) => logs.push(args.join(' '));
  globalThis.fetch = async () => {
    throw new Error('offline');
  };

  const content = await fetchPayloadContent();

  assert.deepEqual(content, defaultPayloadContent);
  assert.match(logs.join('\n'), /Fallback used because Payload fetch failed or timed out/);
});

test('fetchPayloadContent aborts a pending request and returns defaults', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let requestSignal;
  globalThis.fetch = async (_url, options) => {
    requestSignal = options.signal;
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    });
  };

  const contentPromise = fetchPayloadContent();
  context.mock.timers.tick(10_000);
  const content = await contentPromise;

  assert.equal(requestSignal.aborted, true);
  assert.deepEqual(content, defaultPayloadContent);
});
