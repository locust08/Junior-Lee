import type { Endpoint, GlobalConfig } from 'payload'
import {
  headersWithCors,
  restoreVersionOperationGlobal,
  sanitizePopulateParam,
} from 'payload'

import {
  restoreGlobalVersionAndTriggerPagesDeploy,
  type RestoreGlobalVersionOperation,
} from '../hooks/triggerPagesDeploy'

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

type RestoreGlobalVersionEndpointOptions = {
  restoreVersionOperation?: RestoreGlobalVersionOperation
}

type VersionSummary = {
  id: number | string
  status?: string
  updatedAt?: string
}

const restoreWarnings = [
  'All fields will match the selected snapshot.',
  'Version history will remain available.',
]

function getVersionStatus(version: unknown): string | undefined {
  if (typeof version !== 'object' || version === null) return undefined

  const record = version as Record<string, unknown>
  if (typeof record.version__status === 'string') return record.version__status
  if (typeof record._status === 'string') return record._status

  if (typeof record.version === 'object' && record.version !== null) {
    const versionRecord = record.version as Record<string, unknown>
    if (typeof versionRecord._status === 'string') return versionRecord._status
    if (typeof versionRecord.version__status === 'string') return versionRecord.version__status
  }

  return undefined
}

function summarizeVersion(version: unknown): VersionSummary | undefined {
  if (typeof version !== 'object' || version === null) return undefined

  const record = version as Record<string, unknown>
  const id = record.id
  if (typeof id !== 'string' && typeof id !== 'number') return undefined

  return {
    id,
    status: getVersionStatus(version),
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  }
}

async function findPublishedVersions(req: Parameters<Endpoint['handler']>[0], globalConfig: GlobalConfig) {
  const result = await req.payload.findGlobalVersions({
    limit: 20,
    overrideAccess: true,
    req,
    slug: globalConfig.slug as never,
    sort: '-updatedAt',
  })

  return result.docs
    .map(summarizeVersion)
    .filter((version): version is VersionSummary => Boolean(version) && version?.status === 'published')
}

async function findCurrentPublishedVersion(req: Parameters<Endpoint['handler']>[0], globalConfig: GlobalConfig) {
  return (await findPublishedVersions(req, globalConfig))[0]
}

async function findSelectedVersion(req: Parameters<Endpoint['handler']>[0], globalConfig: GlobalConfig, id: string | number) {
  const version = await req.payload.findGlobalVersionByID({
    id,
    overrideAccess: true,
    req,
    slug: globalConfig.slug as never,
  })

  return summarizeVersion(version)
}

function jsonWithCors(req: Parameters<Endpoint['handler']>[0], body: unknown, status = 200) {
  const headers = new Headers()
  if (!req.payload.config) return Response.json(body, { headers, status })

  return Response.json(body, {
    headers: headersWithCors({
      headers,
      req,
    }),
    status,
  })
}

function rejectUnauthenticated(req: Parameters<Endpoint['handler']>[0]) {
  if (req.user) return undefined

  return jsonWithCors(req, {
    errors: [{ message: 'You must be logged in to restore a version.' }],
  }, 401)
}

export function restoreGlobalVersionWithDeployEndpoint(
  globalConfig: GlobalConfig,
  options: RestoreGlobalVersionEndpointOptions = {},
): Endpoint {
  return {
    handler: async (req) => {
      const authError = rejectUnauthenticated(req)
      if (authError) return authError

      const depth = parseOptionalNumber(req.searchParams.get('depth'))
      const draft = req.searchParams.get('draft') === 'true' ? true : undefined
      const { id } = req.routeParams

      req.payload.logger?.info?.({
        global: globalConfig.slug,
        id,
        draft: draft ?? false,
        msg: 'Payload restore-with-deploy endpoint entered.',
      })

      if (typeof id !== 'string' && typeof id !== 'number') {
        return jsonWithCors(req, { errors: [{ message: 'Missing ID of version to restore.' }] }, 400)
      }

      const doc = await restoreGlobalVersionAndTriggerPagesDeploy({
        depth,
        draft,
        globalConfig,
        id,
        populate: sanitizePopulateParam(req.query.populate),
        req,
        restoreVersionOperation: options.restoreVersionOperation ?? (restoreVersionOperationGlobal as RestoreGlobalVersionOperation),
      })

      return jsonWithCors(req, {
        doc,
        message: req.t?.('version:restoredSuccessfully') ?? 'Restored successfully',
      })
    },
    method: 'post',
    path: '/versions/:id',
  }
}

export function selectedGlobalVersionInfoEndpoint(globalConfig: GlobalConfig): Endpoint {
  return {
    handler: async (req) => {
      const authError = rejectUnauthenticated(req)
      if (authError) return authError

      const { id } = req.routeParams
      if (typeof id !== 'string' && typeof id !== 'number') {
        return jsonWithCors(req, { errors: [{ message: 'Missing ID of selected version.' }] }, 400)
      }

      const [selectedVersion, currentVersion] = await Promise.all([
        findSelectedVersion(req, globalConfig, id),
        findCurrentPublishedVersion(req, globalConfig),
      ])

      if (!selectedVersion) {
        return jsonWithCors(req, { errors: [{ message: 'Selected version was not found.' }] }, 404)
      }

      return jsonWithCors(req, {
        currentVersion,
        isCurrentVersion: currentVersion?.id === selectedVersion.id,
        selectedVersion,
        warnings: restoreWarnings,
      })
    },
    method: 'get',
    path: '/versions/:id/restore-info',
  }
}

export function undoLatestPublishedGlobalVersionEndpoint(
  globalConfig: GlobalConfig,
  options: RestoreGlobalVersionEndpointOptions = {},
): Endpoint {
  return {
    handler: async (req) => {
      const authError = rejectUnauthenticated(req)
      if (authError) return authError

      const publishedVersions = await findPublishedVersions(req, globalConfig)
      const [currentVersion, previousPublishedVersion] = publishedVersions

      if (!currentVersion || !previousPublishedVersion) {
        return jsonWithCors(req, {
          errors: [{ message: 'No previous published version is available to restore.' }],
        }, 409)
      }

      const doc = await restoreGlobalVersionAndTriggerPagesDeploy({
        globalConfig,
        id: previousPublishedVersion.id,
        req,
        restoreVersionOperation: options.restoreVersionOperation ?? (restoreVersionOperationGlobal as RestoreGlobalVersionOperation),
      })

      return jsonWithCors(req, {
        action: 'undo-latest-published-change',
        currentVersion,
        doc,
        message: 'Restored the previous published version.',
        restoredFromVersion: previousPublishedVersion,
        warnings: restoreWarnings,
      })
    },
    method: 'post',
    path: '/undo-latest-published-change',
  }
}

export function undoLatestPublishedGlobalVersionInfoEndpoint(globalConfig: GlobalConfig): Endpoint {
  return {
    handler: async (req) => {
      const authError = rejectUnauthenticated(req)
      if (authError) return authError

      const publishedVersions = await findPublishedVersions(req, globalConfig)
      const [currentVersion, previousPublishedVersion] = publishedVersions

      if (!currentVersion || !previousPublishedVersion) {
        return jsonWithCors(req, {
          errors: [{ message: 'No previous published version is available to restore.' }],
        }, 409)
      }

      return jsonWithCors(req, {
        action: 'undo-latest-published-change',
        currentVersion,
        restoredFromVersion: previousPublishedVersion,
        warnings: restoreWarnings,
      })
    },
    method: 'get',
    path: '/undo-latest-published-change',
  }
}

export function withRestoreDeployEndpoint<TGlobal extends GlobalConfig>(globalConfig: TGlobal): TGlobal {
  globalConfig.endpoints = [
    selectedGlobalVersionInfoEndpoint(globalConfig),
    undoLatestPublishedGlobalVersionInfoEndpoint(globalConfig),
    undoLatestPublishedGlobalVersionEndpoint(globalConfig),
    restoreGlobalVersionWithDeployEndpoint(globalConfig),
    ...(globalConfig.endpoints || []),
  ]

  return globalConfig
}
