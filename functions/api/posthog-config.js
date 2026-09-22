const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

function cleanValue(value) {
  return String(value || '').trim();
}

export async function onRequestGet({ env }) {
  const projectToken = cleanValue(env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
  const headers = { 'cache-control': 'no-store' };

  if (!projectToken) {
    return new Response(null, { status: 204, headers });
  }

  return new Response(JSON.stringify({
    projectToken,
    host: cleanValue(env.NEXT_PUBLIC_POSTHOG_HOST) || DEFAULT_POSTHOG_HOST,
  }), {
    status: 200,
    headers: {
      ...headers,
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
