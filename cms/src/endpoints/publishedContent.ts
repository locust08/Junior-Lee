import type { Endpoint } from 'payload'

type MediaValue = {
  alt?: string
  url?: string
}

export const DEFAULT_PAYLOAD_PUBLIC_SERVER_URL =
  'https://metropinjamanberlesen-payload-cms.easondev.workers.dev'

const globalSlugs = [
  ['siteSettings', 'site-settings'],
  ['homePage', 'home-page'],
  ['aboutUsPage', 'about-us-page'],
  ['loanPage', 'loan-page'],
  ['howToApplyPage', 'how-to-apply-page'],
  ['contactUsPage', 'contact-us-page'],
] as const

const singleTextArrayPaths = new Set([
  'aboutUsPage.whoWeAre.paragraphs',
  'aboutUsPage.whoWeAre.highlights',
  'loanPage.personalLoan.requirements.items',
  'loanPage.businessLoan.requirements.items',
  'howToApplyPage.eligibility.items',
])

function isMediaValue(value: unknown): value is MediaValue {
  return typeof value === 'object' && value !== null && ('url' in value || 'alt' in value)
}

function isTextRow(value: unknown): value is { text: string } {
  return typeof value === 'object' && value !== null && 'text' in value && typeof value.text === 'string'
}

function normalizeMediaUrl(url: string | undefined, publicServerUrl: string): string {
  if (!url) return ''

  try {
    return new URL(url, `${publicServerUrl.replace(/\/$/, '')}/`).toString()
  } catch {
    return ''
  }
}

export function normalizeForFrontend(value: unknown, publicServerUrl: string, path: string[] = []): unknown {
  if (Array.isArray(value)) {
    if (singleTextArrayPaths.has(path.join('.')) && value.every(isTextRow)) {
      return value.map(({ text }) => text)
    }

    return value.map((child) => normalizeForFrontend(child, publicServerUrl, path))
  }

  if (isMediaValue(value)) {
    return {
      src: normalizeMediaUrl(value.url, publicServerUrl),
      alt: value.alt ?? '',
    }
  }

  if (typeof value !== 'object' || value === null) return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !['id', 'createdAt', 'updatedAt', '_status'].includes(key))
      .map(([key, child]) => [key, normalizeForFrontend(child, publicServerUrl, [...path, key])]),
  )
}

export const publishedContentEndpoint: Endpoint = {
  path: '/published-content',
  method: 'get',
  handler: async (req) => {
    const publicServerUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || DEFAULT_PAYLOAD_PUBLIC_SERVER_URL
    const payload = req.payload as unknown as {
      findGlobal: (args: { depth: number; draft: boolean; slug: string }) => Promise<unknown>
    }
    const values = await Promise.all(
      globalSlugs.map(([, slug]) => payload.findGlobal({ slug, depth: 1, draft: false })),
    )

    const responseBody = Object.fromEntries(
      globalSlugs.map(([key], index) => [key, normalizeForFrontend(values[index], publicServerUrl, [key])]),
    )

    return Response.json(responseBody, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  },
}
