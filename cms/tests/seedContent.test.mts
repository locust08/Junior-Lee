import { describe, expect, it, vi } from 'vitest'

import { defaultPayloadContent } from '../../src/payload/content'
import { seedPayloadContent, type SeedPayload } from '../src/seed/seedContent'

type RecordValue = Record<string, unknown>

function merge(target: RecordValue, source: RecordValue): RecordValue {
  return Object.fromEntries(
    new Set([...Object.keys(target), ...Object.keys(source)]).values().map((key) => {
      const targetValue = target[key]
      const sourceValue = source[key]
      return [key, isRecord(targetValue) && isRecord(sourceValue) ? merge(targetValue, sourceValue) : sourceValue ?? targetValue]
    }),
  )
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function createPayload(initial: RecordValue): SeedPayload & {
  findGlobal: ReturnType<typeof vi.fn>
  updateGlobal: ReturnType<typeof vi.fn>
} {
  const content = structuredClone(initial)
  const updateGlobal = vi.fn(async ({ slug, data }: { slug: string; data: RecordValue }) => {
    const existing = isRecord(content[slug]) ? content[slug] as RecordValue : {}
    content[slug] = merge({ id: 1, updatedAt: '2026-07-13T00:00:00.000Z', ...existing }, data)
  })

  return {
    findGlobal: vi.fn(async ({ slug }: { slug: string }) => content[slug]),
    updateGlobal,
  }
}

const homeSeed = [['home-page', defaultPayloadContent.homePage]] as const

describe('canonical content seed', () => {
  it('fills missing and nullish defaults without including existing nested admin values', async () => {
    const payload = createPayload({
      'home-page': {
        id: 1,
        updatedAt: '2026-07-13T00:00:00.000Z',
        hero: {
          mainHeading: 'Admin heading',
          description: null,
        },
      },
    })

    await seedPayloadContent(payload, homeSeed)

    const update = payload.updateGlobal.mock.calls[0][0]
    expect(update.slug).toBe('home-page')
    expect(update.data.hero).toMatchObject({ description: defaultPayloadContent.homePage.hero.description })
    expect(update.data.hero).not.toHaveProperty('mainHeading')
  })

  it('does not update globals after the defaults have already been seeded', async () => {
    const payload = createPayload({ 'home-page': null })

    await seedPayloadContent(payload, homeSeed)
    payload.updateGlobal.mockClear()

    await seedPayloadContent(payload, homeSeed)

    expect(payload.updateGlobal).not.toHaveBeenCalled()
  })

  it('seeds virtual empty globals that Payload returns before a row exists', async () => {
    const payload = createPayload({
      'home-page': {
        hero: {},
        howItWorks: { steps: [] },
        statistics: { items: [] },
      },
    })

    await seedPayloadContent(payload, homeSeed)

    expect(payload.updateGlobal).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'home-page',
      data: expect.objectContaining({
        hero: expect.objectContaining({
          mainHeading: defaultPayloadContent.homePage.hero.mainHeading,
        }),
      }),
    }))
  })

  it('seeds persisted empty draft placeholders as published defaults', async () => {
    const payload = createPayload({
      'home-page': {
        id: 1,
        updatedAt: '2026-07-13T00:00:00.000Z',
        _status: 'draft',
        hero: {},
        howItWorks: { steps: [] },
        statistics: { items: [] },
      },
    })

    await seedPayloadContent(payload, homeSeed)

    expect(payload.updateGlobal).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'home-page',
      draft: false,
      data: expect.objectContaining({
        hero: expect.objectContaining({
          mainHeading: defaultPayloadContent.homePage.hero.mainHeading,
        }),
      }),
    }))
  })

  it('reads the latest draft and keeps pending draft-only edits unpublished', async () => {
    const payload = createPayload({
      'home-page': {
        id: 1,
        updatedAt: '2026-07-13T00:00:00.000Z',
        _status: 'draft',
        hero: {
          mainHeading: 'Pending admin heading',
          description: null,
        },
      },
    })

    await seedPayloadContent(payload, homeSeed)

    expect(payload.findGlobal).toHaveBeenCalledWith({ slug: 'home-page', depth: 0, draft: true })
    expect(payload.updateGlobal).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'home-page',
      draft: true,
    }))
    const update = payload.updateGlobal.mock.calls[0][0]
    expect(update.data.hero).not.toHaveProperty('mainHeading')
  })

  it('does not overwrite existing values while seeding a published global', async () => {
    const payload = createPayload({
      'home-page': {
        id: 1,
        updatedAt: '2026-07-13T00:00:00.000Z',
        _status: 'published',
        hero: {
          mainHeading: 'Published admin heading',
          description: null,
        },
      },
    })

    await seedPayloadContent(payload, homeSeed)

    expect(payload.updateGlobal).toHaveBeenCalledWith(expect.objectContaining({ draft: false }))
    expect(payload.updateGlobal.mock.calls[0][0].data.hero).not.toHaveProperty('mainHeading')
  })
})
