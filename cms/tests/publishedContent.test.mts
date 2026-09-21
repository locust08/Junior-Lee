import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'node-html-parser'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { normalizeForFrontend } from '../src/endpoints/publishedContent'
import { defaultPayloadContent } from '../../src/payload/content'
import { fetchPayloadContent } from '../../src/payload/fetchPayloadContent'
import { renderLegacyContent } from '../../src/payload/renderLegacyContent'

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('published content media normalization', () => {
  it('makes uploaded media URLs absolute to the configured CMS origin', () => {
    expect(normalizeForFrontend(
      { id: 4, url: '/api/media/file/example.png', alt: 'Example' },
      'https://cms.example.test',
    )).toEqual({
      src: 'https://cms.example.test/api/media/file/example.png',
      alt: 'Example',
    })
  })

  it('preserves already absolute media URLs', () => {
    expect(normalizeForFrontend(
      { url: 'https://images.example.test/example.png', alt: 'Example' },
      'https://cms.example.test',
    )).toEqual({
      src: 'https://images.example.test/example.png',
      alt: 'Example',
    })
  })

  it('renders seeded single-text array rows as text through the published content flow', async () => {
    const payloadResponse = structuredClone(defaultPayloadContent) as unknown as {
      aboutUsPage: { whoWeAre: { paragraphs: Array<{ text: string }> } }
      loanPage: {
        personalLoan: { requirements: { items: Array<{ text: string }> } }
        businessLoan: { requirements: { items: Array<{ text: string }> } }
      }
      howToApplyPage: { eligibility: { items: Array<{ text: string }> } }
    }
    const expectedRows = {
      paragraphs: ['Payload about paragraph one', 'Payload about paragraph two'],
      highlights: ['Payload highlight one', 'Payload highlight two', 'Payload highlight three'],
      personalRequirements: Array.from({ length: 8 }, (_, index) => `Payload personal requirement ${index + 1}`),
      businessRequirements: Array.from({ length: 11 }, (_, index) => `Payload business requirement ${index + 1}`),
      eligibility: ['Payload eligibility one', 'Payload eligibility two', 'Payload eligibility three', 'Payload eligibility four'],
    }

    payloadResponse.aboutUsPage.whoWeAre.paragraphs = expectedRows.paragraphs.map((text) => ({ text }))
    ;(payloadResponse.aboutUsPage.whoWeAre as unknown as { highlights: Array<{ text: string }> }).highlights = expectedRows.highlights.map((text) => ({ text }))
    payloadResponse.loanPage.personalLoan.requirements.items = expectedRows.personalRequirements.map((text) => ({ text }))
    payloadResponse.loanPage.businessLoan.requirements.items = expectedRows.businessRequirements.map((text) => ({ text }))
    payloadResponse.howToApplyPage.eligibility.items = expectedRows.eligibility.map((text) => ({ text }))

    vi.stubEnv('PAYLOAD_PUBLIC_CONTENT_URL', 'https://cms.example.test/api/published-content')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(
      normalizeForFrontend(payloadResponse, 'https://cms.example.test'),
    ))))

    const content = await fetchPayloadContent()
    const templates = {
      aboutUs: fs.readFileSync(path.join(workspaceRoot, 'src/legacy-pages/about_us.html'), 'utf8'),
      loan: fs.readFileSync(path.join(workspaceRoot, 'src/legacy-pages/loan.html'), 'utf8'),
      howToApply: fs.readFileSync(path.join(workspaceRoot, 'src/legacy-pages/how_to_apply.html'), 'utf8'),
    }
    const renderedAbout = renderLegacyContent(templates.aboutUs, 'aboutUs', content)
    const renderedLoan = renderLegacyContent(templates.loan, 'loan', content)
    const renderedHowToApply = renderLegacyContent(templates.howToApply, 'howToApply', content)

    expect([renderedAbout, renderedLoan, renderedHowToApply].join('')).not.toContain('[object Object]')
    expect(parse(renderedAbout).querySelector('#about-us-who-we-are-paragraph-1')?.text.trim()).toBe(expectedRows.paragraphs[0])
    expect(expectedRows.highlights.map((_, index) => parse(renderedAbout).querySelector(`#about-us-who-we-are-highlight-${index + 1}`)?.text.trim())).toEqual(expectedRows.highlights)
    expect(expectedRows.personalRequirements.map((_, index) => parse(renderedLoan).querySelector(`#loan-personal-requirement-${index + 1}`)?.text.trim())).toEqual(expectedRows.personalRequirements)
    expect(expectedRows.businessRequirements.map((_, index) => parse(renderedLoan).querySelector(`#loan-business-requirement-${index + 1}`)?.text.trim())).toEqual(expectedRows.businessRequirements)
    expect(expectedRows.eligibility.map((_, index) => parse(renderedHowToApply).querySelector(`#how-to-apply-eligibility-${index + 1}`)?.text.trim())).toEqual(expectedRows.eligibility)
  })
})
