import type { GlobalAfterChangeHook, GlobalBeforeOperationHook, PayloadRequest } from 'payload'

export const DEPLOY_HOOK_TIMEOUT_MS = 10_000

let configuredPagesDeployHookUrl: string | undefined
export const SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY = 'skipPagesDeployAfterChange'
const RESTORE_VERSION_STATUS_CONTEXT_KEY = 'restoreVersionDeployStatus'

export function configurePagesDeployHookUrl(url: string | undefined): void {
  configuredPagesDeployHookUrl = url
}

export function shouldTriggerPagesDeploy(doc: { _status?: string } | null | undefined): boolean {
  return doc?._status === 'published'
}

function logDeployHookInfo(req: Pick<PayloadRequest, 'payload'>, message: string, data?: Record<string, unknown>): void {
  req.payload.logger?.info?.(data ? { ...data, msg: message } : message)
}

function getPagesDeployHookUrl(): string | undefined {
  const processEnvUrl = process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL

  if (processEnvUrl && processEnvUrl !== 'undefined') return processEnvUrl
  return configuredPagesDeployHookUrl
}

export async function triggerPagesDeployForPublishedDoc<TDoc extends { _status?: string } | null | undefined>(
  doc: TDoc,
  req: Pick<PayloadRequest, 'payload'>,
): Promise<TDoc> {
  if (!shouldTriggerPagesDeploy(doc as { _status?: string })) {
    logDeployHookInfo(req, 'Payload deploy hook skipped for non-published content.', {
      status: doc?._status ?? null,
    })
    return doc
  }

  const url = getPagesDeployHookUrl()
  if (!url) {
    req.payload.logger?.warn?.('CLOUDFLARE_PAGES_DEPLOY_HOOK_URL is not configured; skipping frontend rebuild.')
    return doc
  }

  logDeployHookInfo(req, 'Payload deploy hook request started.')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEPLOY_HOOK_TIMEOUT_MS)

  try {
    const response = await fetch(url, { method: 'POST', signal: controller.signal })
    logDeployHookInfo(req, 'Payload deploy hook response received.', {
      status: response.status,
      ok: response.ok,
    })
    if (!response.ok) {
      req.payload.logger?.error?.(`Cloudflare Pages deploy hook failed with status ${response.status}.`)
    }
  } catch {
    req.payload.logger?.error?.('Cloudflare Pages deploy hook request failed.')
  } finally {
    clearTimeout(timeout)
  }

  return doc
}

export type RestoreGlobalVersionOperation = (args: {
  depth?: number
  draft?: boolean
  globalConfig: unknown
  id: number | string
  populate?: unknown
  req: PayloadRequest
}) => Promise<{ _status?: string }>

type RestoredVersionStatusLookup = (args: {
  draft?: boolean
  globalConfig: unknown
  id: number | string
  req: PayloadRequest
}) => Promise<string | undefined>

type RestoredGlobalStatusLookup = (args: {
  expectedRestoredStatus?: string
  globalConfig: unknown
  req: PayloadRequest
  restoredDoc: { _status?: string }
}) => Promise<string | undefined>

type FindGlobalLocal = (args: {
  overrideAccess: boolean
  req: PayloadRequest
  slug: string
}) => Promise<unknown>

type FindGlobalVersionByIDLocal = (args: {
  id: number | string
  overrideAccess: boolean
  req: PayloadRequest
  slug: string
}) => Promise<unknown>

function getGlobalSlug(globalConfig: unknown): string | undefined {
  if (
    typeof globalConfig === 'object'
    && globalConfig !== null
    && 'slug' in globalConfig
    && typeof globalConfig.slug === 'string'
  ) {
    return globalConfig.slug
  }

  return undefined
}

function extractPublishedStatus(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined

  const record = value as Record<string, unknown>
  if (typeof record._status === 'string') return record._status
  if (typeof record.version__status === 'string') return record.version__status

  if (typeof record.version === 'object' && record.version !== null) {
    const version = record.version as Record<string, unknown>
    if (typeof version._status === 'string') return version._status
    if (typeof version.version__status === 'string') return version.version__status
  }

  return undefined
}

async function findSavedGlobalStatus({
  globalConfig,
  req,
}: {
  globalConfig: unknown
  req: PayloadRequest
}): Promise<string | undefined> {
  const slug = getGlobalSlug(globalConfig)
  if (!slug) return undefined

  const findGlobal = req.payload.db?.findGlobal
  if (typeof findGlobal === 'function') {
    try {
      const savedDoc = await findGlobal({ slug, req })
      const savedStatus = extractPublishedStatus(savedDoc)
      if (savedStatus) return savedStatus
    } catch {
      req.payload.logger?.error?.('Unable to verify Global status from database adapter; trying Payload local API.')
    }
  }

  const findGlobalLocal = (req.payload as { findGlobal?: FindGlobalLocal }).findGlobal
  if (typeof findGlobalLocal !== 'function') return undefined

  try {
    const localDoc = await findGlobalLocal({
      overrideAccess: true,
      req,
      slug,
    })
    return extractPublishedStatus(localDoc)
  } catch {
    req.payload.logger?.error?.('Unable to verify Global status from Payload local API.')
  }

  return undefined
}

async function getGlobalStatus({
  globalConfig,
  req,
  doc,
}: {
  globalConfig: unknown
  req: PayloadRequest
  doc: { _status?: string }
}): Promise<string | undefined> {
  return extractPublishedStatus(doc) ?? await findSavedGlobalStatus({ globalConfig, req })
}

async function getRestoredVersionStatus({
  draft,
  globalConfig,
  id,
  req,
}: {
  draft?: boolean
  globalConfig: unknown
  id: number | string
  req: PayloadRequest
}): Promise<string | undefined> {
  if (draft) return 'draft'

  const slug = getGlobalSlug(globalConfig)
  if (!slug) return undefined

  const findGlobalVersions = req.payload.db?.findGlobalVersions
  if (typeof findGlobalVersions === 'function') {
    try {
      const result = await findGlobalVersions({
        global: slug as never,
        limit: 1,
        req,
        where: {
          id: {
            equals: id,
          },
        },
      })
      const dbStatus = extractPublishedStatus(result?.docs?.[0])
      if (dbStatus) return dbStatus
    } catch {
      req.payload.logger?.error?.('Unable to verify source Global version status from database adapter; trying Payload local API.')
    }
  }

  const findGlobalVersionByID = (req.payload as { findGlobalVersionByID?: FindGlobalVersionByIDLocal }).findGlobalVersionByID
  if (typeof findGlobalVersionByID !== 'function') return undefined

  try {
    const version = await findGlobalVersionByID({
      id,
      overrideAccess: true,
      req,
      slug,
    })
    return extractPublishedStatus(version)
  } catch {
    req.payload.logger?.error?.('Unable to verify source Global version status from Payload local API.')
  }

  return undefined
}

async function getRestoredGlobalStatus({
  expectedRestoredStatus,
  globalConfig,
  req,
  restoredDoc,
}: {
  expectedRestoredStatus?: string
  globalConfig: unknown
  req: PayloadRequest
  restoredDoc: { _status?: string }
}): Promise<string | undefined> {
  return (
    await findSavedGlobalStatus({ globalConfig, req })
    ?? expectedRestoredStatus
    ?? extractPublishedStatus(restoredDoc)
  )
}

async function triggerPagesDeployForGlobalStatus({
  doc,
  globalConfig,
  req,
}: {
  doc: { _status?: string }
  globalConfig: unknown
  req: PayloadRequest
}) {
  try {
    const status = await getGlobalStatus({ doc, globalConfig, req })
    logDeployHookInfo(req, 'Payload deploy hook status resolved.', {
      global: getGlobalSlug(globalConfig) ?? null,
      status: status ?? null,
      docHadStatus: Boolean(doc._status),
    })

    await triggerPagesDeployForPublishedDoc({ _status: status }, req)
  } catch {
    req.payload.logger?.error?.('Unable to verify Global publish status; skipping frontend rebuild.')
  }
}

export async function restoreGlobalVersionAndTriggerPagesDeploy(args: {
  depth?: number
  draft?: boolean
  globalConfig: unknown
  id: number | string
  populate?: unknown
  req: PayloadRequest
  restoredGlobalStatusLookup?: RestoredGlobalStatusLookup
  restoredVersionStatusLookup?: RestoredVersionStatusLookup
  restoreVersionOperation: RestoreGlobalVersionOperation
}) {
  const {
    restoredGlobalStatusLookup = getRestoredGlobalStatus,
    restoredVersionStatusLookup = getRestoredVersionStatus,
    restoreVersionOperation,
    req,
    ...restoreArgs
  } = args
  let expectedRestoredStatus: string | undefined
  try {
    expectedRestoredStatus = await restoredVersionStatusLookup({
      draft: restoreArgs.draft,
      globalConfig: restoreArgs.globalConfig,
      id: restoreArgs.id,
      req,
    })
  } catch {
    req.payload.logger?.error?.('Unable to verify source Global version status before restore; continuing restore.')
  }

  req.context = {
    ...req.context,
    [SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY]: true,
  }

  const restoredDoc = await restoreVersionOperation({
    ...restoreArgs,
    req,
  })

  try {
    const restoredStatus = await restoredGlobalStatusLookup({
      expectedRestoredStatus,
      globalConfig: restoreArgs.globalConfig,
      req,
      restoredDoc,
    })

    await triggerPagesDeployForPublishedDoc({ _status: restoredStatus }, req)
  } catch {
    req.payload.logger?.error?.('Unable to verify restored Global publish status; skipping frontend rebuild.')
  }

  return restoredDoc
}

export const triggerPagesDeployAfterPublish: GlobalAfterChangeHook = async ({ doc, global, req }) => {
  if (req.context?.[SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY]) return doc

  if (RESTORE_VERSION_STATUS_CONTEXT_KEY in (req.context || {})) {
    const restoreVersionStatus = req.context?.[RESTORE_VERSION_STATUS_CONTEXT_KEY]
    const status = typeof restoreVersionStatus === 'string'
      ? restoreVersionStatus
      : await getGlobalStatus({ doc: doc as { _status?: string }, globalConfig: global, req })

    logDeployHookInfo(req, 'Payload restore deploy hook afterChange entered.', {
      global: getGlobalSlug(global) ?? null,
      status: status ?? null,
    })
    await triggerPagesDeployForPublishedDoc({ _status: status }, req)
    return doc
  }

  logDeployHookInfo(req, 'Payload deploy hook afterChange entered.', {
    global: getGlobalSlug(global) ?? null,
    docStatus: (doc as { _status?: string })._status ?? null,
  })

  await triggerPagesDeployForGlobalStatus({
    doc: doc as { _status?: string },
    globalConfig: global,
    req,
  })

  return doc
}

export const triggerPagesDeployAfterNativeRestore: GlobalBeforeOperationHook = async ({ args, global, operation, req }) => {
  if (operation !== 'restoreVersion') return args
  if (req.context?.[SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY]) return args

  let restoreStatus: string | undefined
  try {
    restoreStatus = await getRestoredVersionStatus({
      draft: (args as { draft?: boolean } | undefined)?.draft,
      globalConfig: global,
      id: (args as { id?: number | string } | undefined)?.id ?? '',
      req,
    })
  } catch {
    req.payload.logger?.error?.('Unable to verify source Global version status before native restore; skipping restore deploy marker.')
  }

  req.context = {
    ...req.context,
    [RESTORE_VERSION_STATUS_CONTEXT_KEY]: restoreStatus ?? null,
  }

  return args
}
