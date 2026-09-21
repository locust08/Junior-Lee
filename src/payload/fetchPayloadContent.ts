import { defaultPayloadContent, type PublicPayloadContent } from './content.ts';

const PAYLOAD_FETCH_TIMEOUT_MS = 10_000;
export const DEFAULT_PUBLISHED_CONTENT_URL =
  'https://metropinjamanberlesen-payload-cms.easondev.workers.dev/api/published-content';

function logPayloadFetch(message: string, data?: Record<string, unknown>): void {
  const details = data ? ` ${JSON.stringify(data)}` : '';
  console.info(`[metro-payload] ${message}${details}`);
}

export function resolvePublishedContentUrl(value = process.env.PAYLOAD_PUBLIC_CONTENT_URL): string {
  const configuredUrl = value?.trim() || DEFAULT_PUBLISHED_CONTENT_URL;

  try {
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.pathname !== '/api/published-content') {
      logPayloadFetch('Configured Payload endpoint path is invalid; using default endpoint.', {
        host: parsedUrl.host,
        path: parsedUrl.pathname,
      });
      return DEFAULT_PUBLISHED_CONTENT_URL;
    }

    return parsedUrl.toString();
  } catch {
    logPayloadFetch('Configured Payload endpoint URL is invalid; using default endpoint.');
    return DEFAULT_PUBLISHED_CONTENT_URL;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergePublishedContentWithFallback(fallback: unknown, value: unknown): unknown {
  if (value == null) return fallback;

  if (Array.isArray(fallback) && Array.isArray(value)) {
    return value.map((item, index) => mergePublishedContentWithFallback(fallback[index], item));
  }

  if (isRecord(fallback) && isRecord(value)) {
    const keys = new Set([...Object.keys(fallback), ...Object.keys(value)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, mergePublishedContentWithFallback(fallback[key], value[key])]),
    );
  }

  return value;
}

export async function fetchPayloadContent(): Promise<PublicPayloadContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAYLOAD_FETCH_TIMEOUT_MS);
  const publishedContentUrl = resolvePublishedContentUrl();
  const endpointHost = new URL(publishedContentUrl).host;

  logPayloadFetch('Fetch started.', { host: endpointHost });

  try {
    const response = await fetch(publishedContentUrl, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    logPayloadFetch('Fetch response received.', { host: endpointHost, status: response.status, ok: response.ok });

    if (!response.ok) {
      logPayloadFetch('Fallback used because Payload endpoint returned a non-OK response.', {
        host: endpointHost,
        status: response.status,
      });
      return defaultPayloadContent;
    }

    const content: unknown = await response.json();
    if (!isRecord(content)) {
      logPayloadFetch('Fallback used because Payload endpoint returned invalid JSON shape.', { host: endpointHost });
      return defaultPayloadContent;
    }

    logPayloadFetch('Fetch succeeded; published Payload content will be used.', { host: endpointHost });
    return mergePublishedContentWithFallback(defaultPayloadContent, content) as PublicPayloadContent;
  } catch {
    logPayloadFetch('Fallback used because Payload fetch failed or timed out.', { host: endpointHost });
    return defaultPayloadContent;
  } finally {
    clearTimeout(timeout);
  }
}
