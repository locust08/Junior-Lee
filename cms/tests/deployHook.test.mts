import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  configurePagesDeployHookUrl,
  DEPLOY_HOOK_TIMEOUT_MS,
  restoreGlobalVersionAndTriggerPagesDeploy,
  SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY,
  shouldTriggerPagesDeploy,
  triggerPagesDeployAfterNativeRestore,
  triggerPagesDeployAfterPublish,
} from '../src/hooks/triggerPagesDeploy'

describe('Cloudflare Pages deploy hook', () => {
  const originalFetch = global.fetch
  const originalUrl = process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL

  afterEach(() => {
    vi.useRealTimers()
    global.fetch = originalFetch
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = originalUrl
    configurePagesDeployHookUrl(undefined)
    vi.restoreAllMocks()
  })

  it('does not fetch for draft saves', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/deploy-hook'

    await expect(triggerPagesDeployAfterPublish({ doc: { _status: 'draft' }, req: { payload: {} } } as any)).resolves.toMatchObject({ _status: 'draft' })

    expect(shouldTriggerPagesDeploy({ _status: 'draft' })).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('triggers for published content', () => {
    expect(shouldTriggerPagesDeploy({ _status: 'published' })).toBe(true)
  })

  it('calls the deploy hook URL for published content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/deploy-hook'

    await triggerPagesDeployAfterPublish({ doc: { _status: 'published' }, req: { payload: { logger: console } } } as any)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/deploy-hook',
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
    )
  })

  it('uses the configured Worker secret binding when process env is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = undefined
    configurePagesDeployHookUrl('https://example.com/worker-binding-deploy-hook')

    await triggerPagesDeployAfterPublish({ doc: { _status: 'published' }, req: { payload: { logger: console } } } as any)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/worker-binding-deploy-hook',
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
    )
  })

  it('triggers from afterChange when the doc omits status but the saved Global is published', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const findGlobal = vi.fn().mockResolvedValue({ _status: 'published' })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(triggerPagesDeployAfterPublish({
      doc: { id: 30 },
      global: { slug: 'site-settings' },
      req: {
        payload: {
          db: { findGlobal },
          logger: console,
        },
      },
    } as any)).resolves.toMatchObject({ id: 30 })

    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'site-settings' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not trigger from afterChange when the doc omits status and the saved Global is draft', async () => {
    const fetchMock = vi.fn()
    const findGlobal = vi.fn().mockResolvedValue({ _status: 'draft' })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(triggerPagesDeployAfterPublish({
      doc: { id: 31 },
      global: { slug: 'site-settings' },
      req: {
        payload: {
          db: { findGlobal },
          logger: console,
        },
      },
    } as any)).resolves.toMatchObject({ id: 31 })

    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'site-settings' }))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('logs a rejected deploy request without rejecting the save', async () => {
    const secretUrl = 'https://example.com/deploy-hook?token=fake-secret'
    const fetchMock = vi.fn().mockRejectedValue(new Error(`request failed for ${secretUrl}`))
    const error = vi.fn()
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = secretUrl

    await expect(triggerPagesDeployAfterPublish({ doc: { _status: 'published' }, req: { payload: { logger: { error } } } } as any)).resolves.toMatchObject({ _status: 'published' })

    expect(error).toHaveBeenCalledWith('Cloudflare Pages deploy hook request failed.')
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining('fake-secret'))
  })

  it('logs a non-OK deploy response without rejecting the save', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }))
    const error = vi.fn()
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/deploy-hook'

    await expect(triggerPagesDeployAfterPublish({ doc: { _status: 'published' }, req: { payload: { logger: { error } } } } as any)).resolves.toMatchObject({ _status: 'published' })

    expect(error).toHaveBeenCalledWith('Cloudflare Pages deploy hook failed with status 503.')
  })

  it('aborts a deploy hook request that exceeds the timeout without rejecting the save', async () => {
    vi.useFakeTimers()
    const error = vi.fn()
    const fetchMock = vi.fn((_url: string, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(options.signal?.reason))
    }))
    global.fetch = fetchMock as typeof fetch
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/deploy-hook'

    const result = triggerPagesDeployAfterPublish({
      doc: { _status: 'published' },
      req: { payload: { logger: { error } } },
    } as any)
    await vi.advanceTimersByTimeAsync(DEPLOY_HOOK_TIMEOUT_MS)

    await expect(result).resolves.toMatchObject({ _status: 'published' })
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
    expect(error).toHaveBeenCalledWith('Cloudflare Pages deploy hook request failed.')
  })

  it('triggers one deploy after a published Global version restore succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const restoreVersionOperation = vi.fn().mockImplementation(async ({ req }) => {
      expect(req.context[SKIP_AFTER_CHANGE_DEPLOY_CONTEXT_KEY]).toBe(true)
      return { _status: 'published', id: 22 }
    })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: { context: {}, payload: { logger: console } },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ _status: 'published', id: 22 })

    expect(restoreVersionOperation).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/feature-preview-hook',
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
    )
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('production'),
      expect.anything(),
    )
  })

  it('triggers one deploy when the restored Global response omits status but the saved Global is published', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const restoreVersionOperation = vi.fn().mockResolvedValue({ id: 25 })
    const findGlobal = vi.fn().mockResolvedValue({ _status: 'published' })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: {
        context: {},
        payload: {
          db: { findGlobal },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ id: 25 })

    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'site-settings' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('trusts the saved Global status after restore when the restored response incorrectly says draft', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'draft', id: 37 })
    const findGlobal = vi.fn().mockResolvedValue({ _status: 'published' })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 33,
      req: {
        context: {},
        payload: {
          db: { findGlobal },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ _status: 'draft', id: 37 })

    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'site-settings' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('triggers one deploy when the restored response omits status and the source version is published', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const restoreVersionOperation = vi.fn().mockResolvedValue({ id: 32 })
    const findGlobalVersions = vi.fn().mockResolvedValue({
      docs: [{ version: { _status: 'published' } }],
    })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: {
        context: {},
        payload: {
          db: { findGlobalVersions },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ id: 32 })

    expect(findGlobalVersions).toHaveBeenCalledWith(expect.objectContaining({
      global: 'site-settings',
      where: { id: { equals: 14 } },
    }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('triggers one deploy when the source version status is returned in D1 flattened shape', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const restoreVersionOperation = vi.fn().mockResolvedValue({ id: 35 })
    const findGlobalVersions = vi.fn().mockResolvedValue({
      docs: [{ version__status: 'published' }],
    })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 26,
      req: {
        context: {},
        payload: {
          db: { findGlobalVersions },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ id: 35 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not deploy after restoring a draft Global version', async () => {
    const fetchMock = vi.fn()
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'draft', id: 23 })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 15,
      req: { context: {}, payload: { logger: console } },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ _status: 'draft', id: 23 })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not deploy when restoring as draft even if the source version is published', async () => {
    const fetchMock = vi.fn()
    const restoreVersionOperation = vi.fn().mockResolvedValue({ id: 33 })
    const findGlobalVersions = vi.fn().mockResolvedValue({
      docs: [{ version: { _status: 'published' } }],
    })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      draft: true,
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: {
        context: {},
        payload: {
          db: { findGlobalVersions },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ id: 33 })

    expect(findGlobalVersions).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not deploy when the restored Global response omits status and the saved Global is draft', async () => {
    const fetchMock = vi.fn()
    const restoreVersionOperation = vi.fn().mockResolvedValue({ id: 26 })
    const findGlobal = vi.fn().mockResolvedValue({ _status: 'draft' })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 15,
      req: {
        context: {},
        payload: {
          db: { findGlobal },
          logger: console,
        },
      },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ id: 26 })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not reject or roll back the restore when the post-restore deploy hook fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('deploy unavailable'))
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'published', id: 24 })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: { context: {}, payload: { logger: { error: vi.fn() } } },
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ _status: 'published', id: 24 })

    expect(restoreVersionOperation).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('continues the restore when source version status lookup fails', async () => {
    const fetchMock = vi.fn()
    const error = vi.fn()
    const restoreVersionOperation = vi.fn().mockResolvedValue({ _status: 'published', id: 34 })
    const restoredVersionStatusLookup = vi.fn().mockRejectedValue(new Error('lookup failed'))
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = undefined

    await expect(restoreGlobalVersionAndTriggerPagesDeploy({
      globalConfig: { slug: 'site-settings' },
      id: 14,
      req: { context: {}, payload: { logger: { error, warn: vi.fn(), info: vi.fn() } } },
      restoredVersionStatusLookup,
      restoreVersionOperation,
    } as any)).resolves.toMatchObject({ _status: 'published', id: 34 })

    expect(restoreVersionOperation).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('Unable to verify source Global version status before restore; continuing restore.')
  })

  it('triggers one deploy after native Admin restore creates a published Global version', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    const findGlobalVersions = vi.fn().mockResolvedValue({ docs: [{ version__status: 'published' }] })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'
    const req = {
      context: {},
      payload: {
        db: { findGlobalVersions },
        logger: console,
      },
    }

    await triggerPagesDeployAfterNativeRestore({
      args: { id: 33 },
      global: { slug: 'site-settings' },
      operation: 'restoreVersion',
      req,
    } as any)

    await triggerPagesDeployAfterPublish({
      doc: { id: 36 },
      global: { slug: 'site-settings' },
      req,
    } as any)

    expect(findGlobalVersions).toHaveBeenCalledWith(expect.objectContaining({
      global: 'site-settings',
      where: { id: { equals: 33 } },
    }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not deploy after native Admin restore creates a draft Global version', async () => {
    const fetchMock = vi.fn()
    const findGlobalVersions = vi.fn().mockResolvedValue({ docs: [{ version__status: 'draft' }] })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'
    const req = {
      context: {},
      payload: {
        db: { findGlobalVersions },
        logger: console,
      },
    }

    await triggerPagesDeployAfterNativeRestore({
      args: { id: 33 },
      global: { slug: 'site-settings' },
      operation: 'restoreVersion',
      req,
    } as any)

    await triggerPagesDeployAfterPublish({
      doc: { id: 37 },
      global: { slug: 'site-settings' },
      req,
    } as any)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not fail the native Admin restore when the restore deploy hook fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('deploy unavailable'))
    const findGlobalVersions = vi.fn().mockResolvedValue({ docs: [{ version__status: 'published' }] })
    global.fetch = fetchMock
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/feature-preview-hook'
    const req = {
      context: {},
      payload: {
        db: { findGlobalVersions },
        logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
      },
    }

    await triggerPagesDeployAfterNativeRestore({
      args: { id: 33 },
      global: { slug: 'site-settings' },
      operation: 'restoreVersion',
      req,
    } as any)

    await expect(triggerPagesDeployAfterPublish({
      doc: { id: 38 },
      global: { slug: 'site-settings' },
      req,
    } as any)).resolves.toMatchObject({ id: 38 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
