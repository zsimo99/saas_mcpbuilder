import { z } from 'zod'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Domains } from './collections/Domain'
import { Pages } from './collections/Pages'
import { Headers } from './collections/Header'

import { mcpPlugin } from '@payloadcms/plugin-mcp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Domains, Pages, Headers],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    mcpPlugin({
      collections: {
        domain: {
          enabled: {
            find: true,
            create: true,
            update: true,
          },
          description: 'Collection for domains.',
        },
        headers: {
          enabled: {
            find: true,
            create: true,  // Allow the agent to create headers
            update: true,
          },
          description: 'Collection for headers. Contains a structural blocks layout field.',
        },
        pages: {
          enabled: {
            find: true,
            create: true,  // Allow the agent to create pages
            update: true,
          },
          description: 'Collection for landing pages. Contains a structural blocks layout field.',
        },
        media: {
          enabled: {
            find: true,
            create: true,  // Allow the agent to upload assets if needed
          },
          description: 'Uploaded images, assets, and graphics used inside page blocks.',
        },
      },
      mcp: {
        tools: [
          {
            name: 'uploadMedia',
            description: 'Upload a local media file to Payload CMS for a specific domain.',
            parameters: {
              domain: z.union([z.number(), z.string()]),
              alt: z.string(),
              filePath: z.string(),
            } as any,
            handler: async (args, req) => {
              const fs = await import('fs')
              try {
                const domainInput = args.domain
                const domain = typeof domainInput === 'string' ? parseInt(domainInput, 10) : (domainInput as number)
                const alt = args.alt as string
                const filePath = args.filePath as string

                const absolutePath = path.resolve(filePath);
                
                // Check if file exists
                if (!fs.existsSync(absolutePath)) {
                  return {
                    content: [
                      {
                        type: 'text',
                        text: JSON.stringify({
                          success: false,
                          error: `File not found at path: ${filePath}`,
                        }),
                      },
                    ],
                  }
                }

                // Create the media using the Local API
                const result = await req.payload.create({
                  collection: 'media',
                  data: {
                    alt,
                    domain,
                  },
                  filePath: absolutePath,
                });

                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        success: true,
                        message: 'Media successfully uploaded.',
                        media: result,
                      }),
                    },
                  ],
                }
              } catch (error: any) {
                console.error('Error in custom uploadMedia tool:', error);
                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        success: false,
                        error: error.message || 'An unexpected error occurred during upload.',
                      }),
                    },
                  ],
                }
              }
            },
          },
        ],
      },
      overrideAuth: async (req, getDefaultMcpAccessSettings) => {
        console.log("req", req)
        const url = new URL(req.url || '', 'http://localhost')
        const token = url.searchParams.get('token')
        if (token) {
          req.headers.set('Authorization', `Bearer ${token}`)
        }
        return getDefaultMcpAccessSettings()
      },
    }),
  ],
})

