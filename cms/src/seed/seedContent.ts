import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defaultPayloadContent } from '../../../src/payload/content'

type RecordValue = Record<string, unknown>

export type SeedPayload = {
  findGlobal: (args: { depth: number; draft: boolean; slug: string }) => Promise<unknown>
  updateGlobal: (args: { data: RecordValue; draft: boolean; slug: string }) => Promise<unknown>
}

export type SeedLogger = (message: string, details?: Record<string, unknown>) => void

export type SeedSummary = {
  completed: boolean
  createdOrUpdated: string[]
  skipped: string[]
  failed: string[]
}

type SeedOptions = {
  logger?: SeedLogger
  operationTimeoutMs?: number
}

export const globalSeeds = [
  ['site-settings', defaultPayloadContent.siteSettings],
  ['home-page', defaultPayloadContent.homePage],
  ['about-us-page', defaultPayloadContent.aboutUsPage],
  ['loan-page', defaultPayloadContent.loanPage],
  ['how-to-apply-page', defaultPayloadContent.howToApplyPage],
  ['contact-us-page', defaultPayloadContent.contactUsPage],
] as const

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCanonicalImage(value: unknown): value is { src: string; alt: string } {
  return isRecord(value) && typeof value.src === 'string' && typeof value.alt === 'string'
}

function toPayloadValue(value: unknown): unknown {
  if (isCanonicalImage(value)) return undefined

  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? { text: item } : toPayloadValue(item)))
  }

  if (!isRecord(value)) return value

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, child]) => [key, toPayloadValue(child)] as const)
      .filter(([, child]) => child !== undefined),
  )
}

function missingValues(existing: unknown, defaults: unknown): unknown {
  if (existing === null || existing === undefined) return defaults
  if (!isRecord(existing) || !isRecord(defaults)) return undefined

  const missing = Object.entries(defaults)
    .map(([key, defaultValue]) => [key, missingValues(existing[key], defaultValue)] as const)
    .filter(([, value]) => value !== undefined)

  return missing.length > 0 ? Object.fromEntries(missing) : undefined
}

function isPersistedGlobal(value: unknown): boolean {
  return isRecord(value) && (typeof value.id === 'number' || typeof value.id === 'string' || typeof value.updatedAt === 'string')
}

function isEmptySeedPlaceholder(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (!isRecord(value)) return false

  const contentEntries = Object.entries(value).filter(([key]) => !['id', 'createdAt', 'updatedAt', '_status'].includes(key))
  return contentEntries.length === 0 || contentEntries.every(([, child]) => isEmptySeedPlaceholder(child))
}

function logSeed(logger: SeedLogger | undefined, message: string, details?: Record<string, unknown>) {
  logger?.(message, details)
}

async function withTimeout<T>(label: string, timeoutMs: number, action: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      action(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function seedPayloadContent(
  payload: SeedPayload,
  seeds: readonly (readonly [string, unknown])[] = globalSeeds,
  options: SeedOptions = {},
): Promise<SeedSummary> {
  const logger = options.logger
  const operationTimeoutMs = options.operationTimeoutMs ?? 60_000
  const summary: SeedSummary = { completed: false, createdOrUpdated: [], skipped: [], failed: [] }

  for (const [slug, canonicalContent] of seeds) {
    logSeed(logger, `Reading ${slug}`)
    const existingDraft = await withTimeout(`Reading ${slug}`, operationTimeoutMs, () =>
      payload.findGlobal({ slug, depth: 0, draft: true }))
    const existingPublished = await withTimeout(`Reading published ${slug}`, operationTimeoutMs, () =>
      payload.findGlobal({ slug, depth: 0, draft: false }))
    const defaults = toPayloadValue(canonicalContent)
    logSeed(logger, `Read ${slug}`, {
      draftPersisted: isPersistedGlobal(existingDraft),
      draftEmptyPlaceholder: isEmptySeedPlaceholder(existingDraft),
      publishedPersisted: isPersistedGlobal(existingPublished),
      publishedEmptyPlaceholder: isEmptySeedPlaceholder(existingPublished),
      keys: isRecord(existingDraft) ? Object.keys(existingDraft).filter((key) => !['id', 'createdAt', 'updatedAt'].includes(key)) : [],
    })
    const publishedEmptyPlaceholder = isEmptySeedPlaceholder(existingPublished)
    const draftEmptyPlaceholder = isEmptySeedPlaceholder(existingDraft)
    const data = isPersistedGlobal(existingPublished) && !publishedEmptyPlaceholder
      ? missingValues(existingDraft, defaults)
      : defaults

    if (data !== undefined) {
      logSeed(logger, `Updating ${slug}`)
      await withTimeout(`Updating ${slug}`, operationTimeoutMs, () => payload.updateGlobal({
        slug,
        data: data as RecordValue,
        draft: isRecord(existingDraft) && existingDraft._status === 'draft' && !draftEmptyPlaceholder && !publishedEmptyPlaceholder,
      }))
      summary.createdOrUpdated.push(slug)
    } else {
      logSeed(logger, `Skipping ${slug}`)
      summary.skipped.push(slug)
    }
  }

  summary.completed = true
  return summary
}

async function seedContent() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])
  const logger: SeedLogger = (message, details) => {
    console.log(JSON.stringify({ level: 'info', message, ...(details ?? {}) }))
  }
  logger('Payload initialising')
  const payload = await getPayload({ config })
  logger('Payload initialised')
  const summary = await seedPayloadContent(payload as unknown as SeedPayload, globalSeeds, { logger })
  logger('Seed completed', summary)
  if (typeof (payload as { destroy?: () => Promise<void> | void }).destroy === 'function') {
    await (payload as { destroy: () => Promise<void> | void }).destroy()
  }
}

const executedFile = process.argv[1]

if (executedFile && path.resolve(executedFile) === fileURLToPath(import.meta.url)) {
  seedContent()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unable to seed default CMS content.', error)
      process.exit(1)
    })
}
