import { describe, expect, it } from 'vitest'

import { Media } from '../src/collections/Media'
import { AboutUsPage } from '../src/globals/AboutUsPage'
import { ContactUsPage } from '../src/globals/ContactUsPage'
import { HomePage } from '../src/globals/HomePage'
import { HowToApplyPage } from '../src/globals/HowToApplyPage'
import { LoanPage } from '../src/globals/LoanPage'
import { SiteSettings } from '../src/globals/SiteSettings'

const globals = [SiteSettings, HomePage, AboutUsPage, LoanPage, HowToApplyPage, ContactUsPage]

function stringify(value: unknown) {
  return JSON.stringify(value)
}

function findNamedField(value: unknown, name: string): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    if (record.name === name) return record
    for (const child of Object.values(record)) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  return undefined
}

describe('Payload section schema', () => {
  it('defines the six required globals', () => {
    expect(globals.map((global) => global.slug)).toEqual([
      'site-settings',
      'home-page',
      'about-us-page',
      'loan-page',
      'how-to-apply-page',
      'contact-us-page',
    ])
  })

  it('does not expose generic slot fields', () => {
    const schema = stringify(globals)
    expect(schema).not.toContain(['Text', 'Slot'].join(' '))
    expect(schema).not.toContain(['text', 'Slots'].join(''))
    expect(schema).not.toContain(['image', 'Slots'].join(''))
    expect(schema).not.toContain(['DOM', 'Index'].join(' '))
  })

  it('requires media alt text', () => {
    const alt = Media.fields.find((field) => 'name' in field && field.name === 'alt')
    expect(alt).toMatchObject({ required: true })
  })

  it('uses fixed rows for approved Metro section layouts', () => {
    const schema = stringify(HomePage)
    expect(schema).toContain('"minRows":3')
    expect(schema).toContain('"maxRows":3')

    const loanSchema = stringify(LoanPage)
    expect(loanSchema).toContain('"minRows":8')
    expect(loanSchema).toContain('"maxRows":8')
    expect(loanSchema).toContain('"minRows":11')
    expect(loanSchema).toContain('"maxRows":11')
  })

  it('enables drafts and versions for every global', () => {
    globals.forEach((global) => {
      expect(global.versions).toMatchObject({ drafts: true, max: 20 })
    })
  })

  it('adds version UX endpoints to every global before Payload defaults', () => {
    globals.forEach((global) => {
      expect(global.endpoints?.slice(0, 4).map((endpoint) => ({
        method: endpoint.method,
        path: endpoint.path,
      }))).toEqual([
        { method: 'get', path: '/versions/:id/restore-info' },
        { method: 'get', path: '/undo-latest-published-change' },
        { method: 'post', path: '/undo-latest-published-change' },
        { method: 'post', path: '/versions/:id' },
      ])
    })
  })

  it('does not expose fields without stable production targets', () => {
    const siteSettings = stringify(SiteSettings)
    for (const field of [
      'telephoneLinkNumber',
      'whatsappNumber',
      'defaultWhatsappMessage',
      'formMessages',
    ]) {
      expect(siteSettings).not.toContain(`"name":"${field}"`)
    }
    expect(siteSettings).not.toContain('"name":"loginButtonLabel"')
    expect(siteSettings).not.toContain('"name":"newsletterLabel"')
    expect(siteSettings).toContain('"name":"businessHours"')
  })
})
