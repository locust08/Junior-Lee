// @vitest-environment node

import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

let payload: Payload
const hasLocalCmsEnv = Boolean(process.env.PAYLOAD_SECRET)

describe.skipIf(!hasLocalCmsEnv)('API', () => {
  beforeAll(async () => {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@/payload.config'),
    ])
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
