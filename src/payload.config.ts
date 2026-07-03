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
    }),
  ],
})

