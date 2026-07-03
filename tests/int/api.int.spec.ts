import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('can resolve a page by domain and slug', async () => {
    // 1. Create a test domain
    const testDomain = await payload.create({
      collection: 'domain',
      data: {
        title: 'Test Domain',
        domain: 'test-domain.local',
        slug: 'test-domain-slug',
      },
    })
    expect(testDomain).toBeDefined()

    try {
      // 2. Create a page linked to the domain with a slug
      const testPage = await payload.create({
        collection: 'pages',
        data: {
          title: 'Dynamic Test Page',
          slug: 'dynamic-test-slug',
          domain: testDomain.id,
          layout: [
            {
              blockType: 'Hero',
              content: {
                heading: 'Welcome to test dynamic page',
                subheading: 'This is a subtitle',
              },
            },
          ],
        },
      })
      expect(testPage).toBeDefined()

      // 3. Simulate resolving logic
      const domainResult = await payload.find({
        collection: 'domain',
        where: {
          domain: {
            equals: 'test-domain.local',
          },
        },
      })
      expect(domainResult.docs.length).toBe(1)
      expect(domainResult.docs[0].id).toBe(testDomain.id)

      const pageResult = await payload.find({
        collection: 'pages',
        where: {
          domain: {
            equals: domainResult.docs[0].id,
          },
          slug: {
            equals: 'dynamic-test-slug',
          },
        },
      })
      expect(pageResult.docs.length).toBe(1)
      expect(pageResult.docs[0].title).toBe('Dynamic Test Page')
      expect(pageResult.docs[0].layout?.[0]?.blockType).toBe('Hero')

    } finally {
      // 4. Cleanup
      await payload.delete({
        collection: 'pages',
        where: {
          slug: {
            equals: 'dynamic-test-slug',
          },
        },
      })
      await payload.delete({
        collection: 'domain',
        where: {
          domain: {
            equals: 'test-domain.local',
          },
        },
      })
    }
  })
})
