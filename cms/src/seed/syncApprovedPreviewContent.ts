import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defaultPayloadContent } from '../../../src/payload/content'

type RecordValue = Record<string, unknown>

type PayloadLike = {
  create: (args: {
    collection: 'media'
    data: RecordValue
    filePath?: string
  }) => Promise<RecordValue>
  find: (args: {
    collection: 'media'
    limit: number
    where: RecordValue
  }) => Promise<{ docs?: RecordValue[] }>
  findGlobal: (args: { depth: number; draft: boolean; slug: string }) => Promise<unknown>
  update: (args: {
    id: string | number
    collection: 'media'
    data: RecordValue
  }) => Promise<RecordValue>
  updateGlobal: (args: { data: RecordValue; draft: boolean; slug: string }) => Promise<unknown>
}

type ImageValue = { src: string; alt: string }

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const verificationRoot = path.join(repoRoot, '.verification', 'payload-sync')

const globalSeeds = [
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

function isCanonicalImage(value: unknown): value is ImageValue {
  return isRecord(value) && typeof value.src === 'string' && typeof value.alt === 'string'
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function collectScalarDiffs(before: unknown, after: unknown, prefix = ''): RecordValue[] {
  if (JSON.stringify(before) === JSON.stringify(after)) return []

  if (isCanonicalImage(before) || isCanonicalImage(after)) {
    return [{
      path: prefix,
      before,
      after,
    }]
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const beforeArray = Array.isArray(before) ? before : []
    const afterArray = Array.isArray(after) ? after : []
    const length = Math.max(beforeArray.length, afterArray.length)
    return Array.from({ length }, (_, index) =>
      collectScalarDiffs(beforeArray[index], afterArray[index], `${prefix}[${index}]`),
    ).flat()
  }

  if (isRecord(before) || isRecord(after)) {
    const beforeRecord = isRecord(before) ? before : {}
    const afterRecord = isRecord(after) ? after : {}
    const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)])
    return [...keys].flatMap((key) => collectScalarDiffs(
      beforeRecord[key],
      afterRecord[key],
      prefix ? `${prefix}.${key}` : key,
    ))
  }

  return [{ path: prefix, before, after }]
}

async function ensureMedia(payload: PayloadLike, image: ImageValue): Promise<string | number | undefined> {
  const filename = path.basename(image.src)
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: {
      internalName: {
        equals: image.src,
      },
    },
  })
  let existingDoc = existing.docs?.[0]

  if (!existingDoc) {
    const matchingFilename = await payload.find({
      collection: 'media',
      limit: 1,
      where: {
        filename: {
          equals: filename,
        },
      },
    })
    existingDoc = matchingFilename.docs?.[0]
  }

  if (existingDoc?.id) {
    await payload.update({
      collection: 'media',
      id: existingDoc.id as string | number,
      data: {
        alt: image.alt,
        internalName: image.src,
      },
    })
    return existingDoc.id as string | number
  }

  const localFile = path.join(repoRoot, 'public', image.src)
  if (!fs.existsSync(localFile)) return undefined

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: image.alt,
      internalName: image.src,
    },
    filePath: localFile,
  })

  return created.id as string | number | undefined
}

async function toPayloadValue(payload: PayloadLike, value: unknown): Promise<unknown> {
  if (isCanonicalImage(value)) return ensureMedia(payload, value)

  if (Array.isArray(value)) {
    return Promise.all(value.map(async (item) => (
      typeof item === 'string' ? { text: item } : toPayloadValue(payload, item)
    )))
  }

  if (!isRecord(value)) return value

  const entries = await Promise.all(
    Object.entries(value).map(async ([key, child]) => [key, await toPayloadValue(payload, child)] as const),
  )

  return Object.fromEntries(entries.filter(([, child]) => child !== undefined))
}

export async function syncApprovedPreviewContent(payload: PayloadLike, backupDir = path.join(verificationRoot, timestamp())) {
  fs.mkdirSync(backupDir, { recursive: true })

  const backup: RecordValue = {}
  const replacements: RecordValue[] = []

  for (const [slug, canonicalContent] of globalSeeds) {
    const existingPublished = await payload.findGlobal({ slug, depth: 2, draft: false })
    backup[slug] = existingPublished as RecordValue
    replacements.push(...collectScalarDiffs(existingPublished, canonicalContent).map((entry) => ({
      global: slug,
      ...entry,
    })))

    const data = await toPayloadValue(payload, canonicalContent)
    await payload.updateGlobal({
      slug,
      data: {
        ...(data as RecordValue),
        _status: 'published',
      },
      draft: false,
    })
  }

  fs.writeFileSync(path.join(backupDir, 'published-globals-before-sync.json'), JSON.stringify(backup, null, 2))
  fs.writeFileSync(path.join(backupDir, 'replacements.json'), JSON.stringify(replacements, null, 2))

  return {
    backupDir,
    globalsUpdated: globalSeeds.map(([slug]) => slug),
    replacements: replacements.length,
  }
}

async function main() {
  if (process.env.METRO_CONFIRM_PAYLOAD_SYNC !== 'approved-preview-baseline') {
    throw new Error('Set METRO_CONFIRM_PAYLOAD_SYNC=approved-preview-baseline to run the one-time Payload sync.')
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])
  const payload = await getPayload({ config })
  const summary = await syncApprovedPreviewContent(payload as unknown as PayloadLike)
  console.log(JSON.stringify(summary, null, 2))
  if (typeof (payload as { destroy?: () => Promise<void> | void }).destroy === 'function') {
    await (payload as { destroy: () => Promise<void> | void }).destroy()
  }
  process.exit(0)
}

const executedFile = process.argv[1]

if (executedFile && path.resolve(executedFile) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
