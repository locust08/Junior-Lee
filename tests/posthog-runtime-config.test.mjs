import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

let onRequestGet;
try {
  ({ onRequestGet } = await import('../functions/api/posthog-config.js'));
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

test('PostHog config endpoint returns the browser-safe runtime configuration', async () => {
  assert.equal(typeof onRequestGet, 'function', 'the PostHog config endpoint must exist');

  const response = await onRequestGet({
    env: {
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: '  phc_runtime_test  ',
      NEXT_PUBLIC_POSTHOG_HOST: '  https://us.i.posthog.com  ',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), {
    projectToken: 'phc_runtime_test',
    host: 'https://us.i.posthog.com',
  });
});

test('PostHog config endpoint stays unavailable without a project token', async () => {
  assert.equal(typeof onRequestGet, 'function', 'the PostHog config endpoint must exist');

  const response = await onRequestGet({ env: {} });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('app initializes PostHog from Worker runtime configuration when build variables are absent', async () => {
  const appUrl = new URL('../src/pages/_app.tsx', import.meta.url);
  const appPath = appUrl.pathname.replace(/^\/(.:\/)/, '$1');
  const source = fs.readFileSync(appUrl, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: appPath,
  }).outputText;

  const effects = [];
  const fetchCalls = [];
  const initCalls = [];
  const browserWindow = {};
  const posthog = {
    __loaded: false,
    init(...args) {
      initCalls.push(args);
      this.__loaded = true;
    },
  };
  const realRequire = createRequire(appUrl);
  const require = (specifier) => {
    if (specifier === 'react') return { useEffect: (effect) => effects.push(effect) };
    if (specifier === 'posthog-js') return { __esModule: true, default: posthog };
    if (specifier === '@/config/site') return { siteConfig: { name: 'Metro Pinjaman Berlesen' } };
    if (specifier === '@/src/components/lead/WhatsAppLeadFormLoader') {
      return { __esModule: true, default: () => null };
    }
    if (specifier.endsWith('.css')) return {};
    return realRequire(specifier);
  };
  const module = { exports: {} };
  const env = { ...process.env };
  delete env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  delete env.NEXT_PUBLIC_POSTHOG_HOST;

  vm.runInNewContext(compiled, {
    console,
    exports: module.exports,
    fetch: async (input) => {
      fetchCalls.push(String(input));
      return {
        ok: true,
        json: async () => ({
          projectToken: 'phc_runtime_test',
          host: 'https://us.i.posthog.com',
        }),
      };
    },
    module,
    process: { env },
    require,
    window: browserWindow,
  }, { filename: appPath });

  const App = module.exports.default;
  App({ Component: () => null, pageProps: {} });
  assert.equal(effects.length, 1);
  effects[0]();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(fetchCalls, ['/api/posthog-config']);
  assert.equal(initCalls.length, 1);
  assert.equal(initCalls[0][0], 'phc_runtime_test');
  assert.equal(initCalls[0][1].api_host, 'https://us.i.posthog.com');
  assert.equal(browserWindow.posthog, posthog);
});
