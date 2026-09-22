import { describe, expect, it, vi } from 'vitest'

import {
  restoreGlobalVersionWithDeployEndpoint,
  selectedGlobalVersionInfoEndpoint,
  undoLatestPublishedGlobalVersionInfoEndpoint,
  undoLatestPublishedGlobalVersionEndpoint,
} from '../src/endpoints/restoreGlobalVersionWithDeploy'

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    context: {},
    headers: new Headers({ Origin: 'https://metropinjamanberlesen-payload-cms.easondev.workers.dev' }),
    payload: {
      config: {
        cors: ['https://metropinjamanberlesen-payload-cms.easondev.workers.dev'],
      },
      logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
    },
    query: {
      populate: {
        websiteLogo: 'true',
      },
    },
    routeParams: {
      id: '26',
    },
    searchParams: new URLSearchParams('depth=2'),
    t: vi.fn((key: string) => `translated:${key}`),
    user: { id: 1 },
    ...overrides,
  }
}

describe('restore Global version endpoint', () => {
  it('restores the selected Global version and returns a Payload-compatible Admin response', async () => {
    const restoredDoc = {
      _status: 'published',
      footer: {
        copyrightText: '© 2026 Metro Pinjaman Berlesen. All rights reserved.  ',
      },
      id: 30,
    }
    const restoreVersionOperation = vi.fn().mockResolvedValue(restoredDoc)
    const endpoint = restoreGlobalVersionWithDeployEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    const response = await endpoint.handler(makeReq() as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://metropinjamanberlesen-payload-cms.easondev.workers.dev')
    expect(body).toEqual({
      doc: restoredDoc,
      message: 'translated:version:restoredSuccessfully',
    })
    expect(restoreVersionOperation).toHaveBeenCalledWith(expect.objectContaining({
      depth: 2,
      globalConfig: { slug: 'site-settings' },
      id: '26',
      populate: { websiteLogo: 'true' },
      req: expect.any(Object),
    }))
  })

  it('returns a controlled 400 when the Admin restore request does not include a version ID', async () => {
    const restoreVersionOperation = vi.fn()
    const endpoint = restoreGlobalVersionWithDeployEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    const response = await endpoint.handler(makeReq({ routeParams: {} }) as never)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ errors: [{ message: 'Missing ID of version to restore.' }] })
    expect(restoreVersionOperation).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated restore requests', async () => {
    const restoreVersionOperation = vi.fn()
    const endpoint = restoreGlobalVersionWithDeployEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    const response = await endpoint.handler(makeReq({ user: undefined }) as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ errors: [{ message: 'You must be logged in to restore a version.' }] })
    expect(restoreVersionOperation).not.toHaveBeenCalled()
  })

  it('does not return success until the restore operation has completed', async () => {
    const events: string[] = []
    const restoreVersionOperation = vi.fn().mockImplementation(async () => {
      events.push('restore-started')
      await Promise.resolve()
      events.push('restore-completed')
      return { _status: 'published', id: 31 }
    })
    const endpoint = restoreGlobalVersionWithDeployEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    const response = await endpoint.handler(makeReq() as never)
    events.push(`response-${response.status}`)

    expect(events).toEqual(['restore-started', 'restore-completed', 'response-200'])
  })

  it('reports selected and current version details before restoring a snapshot', async () => {
    const endpoint = selectedGlobalVersionInfoEndpoint({ slug: 'site-settings' } as never)
    const response = await endpoint.handler(makeReq({
      payload: {
        findGlobalVersionByID: vi.fn().mockResolvedValue({
          id: 26,
          updatedAt: '2026-07-14T12:00:00.000Z',
          version: { _status: 'published' },
        }),
        findGlobalVersions: vi.fn().mockResolvedValue({
          docs: [{ id: 42, updatedAt: '2026-07-14T13:00:00.000Z', version: { _status: 'published' } }],
        }),
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
      routeParams: { id: '26' },
    }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      currentVersion: { id: 42, status: 'published' },
      isCurrentVersion: false,
      selectedVersion: { id: 26, status: 'published' },
      warnings: expect.arrayContaining([
        'All fields will match the selected snapshot.',
        'Version history will remain available.',
      ]),
    })
  })

  it('finds the previous published version and restores it for undo latest published change', async () => {
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'published', id: 43 })
    const endpoint = undoLatestPublishedGlobalVersionEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    const response = await endpoint.handler(makeReq({
      payload: {
        findGlobalVersions: vi.fn().mockResolvedValue({
          docs: [
            { id: 42, updatedAt: '2026-07-14T13:00:00.000Z', version: { _status: 'published' } },
            { id: 41, updatedAt: '2026-07-14T12:00:00.000Z', version: { _status: 'published' } },
            { id: 40, updatedAt: '2026-07-14T11:00:00.000Z', version: { _status: 'draft' } },
          ],
        }),
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
      routeParams: {},
    }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(restoreVersionOperation).toHaveBeenCalledWith(expect.objectContaining({
      globalConfig: { slug: 'site-settings' },
      id: 41,
    }))
    expect(body).toMatchObject({
      action: 'undo-latest-published-change',
      currentVersion: { id: 42 },
      restoredFromVersion: { id: 41 },
    })
  })

  it('reports current and previous published versions before undo latest', async () => {
    const endpoint = undoLatestPublishedGlobalVersionInfoEndpoint({ slug: 'site-settings' } as never)

    const response = await endpoint.handler(makeReq({
      payload: {
        findGlobalVersions: vi.fn().mockResolvedValue({
          docs: [
            { id: 42, updatedAt: '2026-07-14T13:00:00.000Z', version: { _status: 'published' } },
            { id: 41, updatedAt: '2026-07-14T12:00:00.000Z', version: { _status: 'published' } },
          ],
        }),
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
      routeParams: {},
    }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      action: 'undo-latest-published-change',
      currentVersion: { id: 42 },
      restoredFromVersion: { id: 41 },
    })
  })

  it('returns controlled 409 when undo latest has no previous published version', async () => {
    const endpoint = undoLatestPublishedGlobalVersionEndpoint({ slug: 'site-settings' } as never)

    const response = await endpoint.handler(makeReq({
      payload: {
        findGlobalVersions: vi.fn().mockResolvedValue({
          docs: [{ id: 42, version: { _status: 'published' } }],
        }),
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
      routeParams: {},
    }) as never)
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.errors[0].message).toContain('No previous published version')
  })

  it('preserves version history by restoring instead of deleting versions', async () => {
    const deleteGlobalVersions = vi.fn()
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'published', id: 43 })
    const endpoint = undoLatestPublishedGlobalVersionEndpoint(
      { slug: 'site-settings' } as never,
      { restoreVersionOperation: restoreVersionOperation as never },
    )

    await endpoint.handler(makeReq({
      payload: {
        db: { deleteGlobalVersions },
        findGlobalVersions: vi.fn().mockResolvedValue({
          docs: [
            { id: 42, version: { _status: 'published' } },
            { id: 41, version: { _status: 'published' } },
          ],
        }),
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
      routeParams: {},
    }) as never)

    expect(deleteGlobalVersions).not.toHaveBeenCalled()
  })
})
