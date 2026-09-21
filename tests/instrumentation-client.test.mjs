import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('missing optional PostHog configuration does not stop the client from starting', () => {
  const env = { ...process.env, NODE_ENV: 'development' };
  delete env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  delete env.NEXT_PUBLIC_POSTHOG_HOST;

  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', "await import('./instrumentation-client.ts')"],
    {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      env,
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
