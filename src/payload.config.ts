import { z } from 'zod'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import os from 'os'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Domains } from './collections/Domain'
import { Pages } from './collections/Pages'
import { Headers } from './collections/Header'

import { mcpPlugin } from '@payloadcms/plugin-mcp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  upload: {
    useTempFiles: true,
    tempFileDir: os.tmpdir(), // Ensures Vercel's or system's writable zone is utilized
  },
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
      // mcp: {
      //   tools: [
      //     {
      //       name: 'uploadMedia',
      //       description: 'Upload a media file to Payload CMS for a specific domain. Supports local file paths and base64-encoded data.',
      //       parameters: {
      //         domain: z.union([z.number(), z.string()]),
      //         alt: z.string(),
      //         filePath: z.string().optional().describe('Local file path (if running locally)'),
      //         base64Data: z.string().optional().describe('Base64-encoded file content (required for remote/cloud agents like ChatGPT)'),
      //         filename: z.string().optional().describe('The filename with extension (required if base64Data is provided)'),
      //       } as any,
      //       handler: async (args, req) => {
      //         const fs = await import('fs')
      //         const os = await import('os')
      //         let tempFilePath: string | null = null
      //         try {
      //           const domainInput = args.domain
      //           const domain = typeof domainInput === 'string' ? parseInt(domainInput, 10) : (domainInput as number)
      //           const alt = args.alt as string
      //           const filename = args.filename as string | undefined
      //           const filePath = args.filePath as string | undefined
      //           const base64Data = args.base64Data as string | undefined

      //           let absolutePath: string

      //           if (base64Data) {
      //             if (!filename) {
      //               return {
      //                 content: [
      //                   {
      //                     type: 'text',
      //                     text: JSON.stringify({
      //                       success: false,
      //                       error: 'filename is required when uploading using base64Data.',
      //                     }),
      //                   },
      //                 ],
      //               }
      //             }
      //             // Decode base64 and write to a temporary file
      //             const buffer = Buffer.from(base64Data, 'base64')
      //             const tempDir = os.tmpdir()
      //             tempFilePath = path.resolve(tempDir, `mcp-upload-${Date.now()}-${filename}`)
      //             fs.writeFileSync(tempFilePath, buffer)
      //             absolutePath = tempFilePath
      //           } else if (filePath) {
      //             absolutePath = path.resolve(filePath);

      //             // Check if file exists
      //             if (!fs.existsSync(absolutePath)) {
      //               return {
      //                 content: [
      //                   {
      //                     type: 'text',
      //                     text: JSON.stringify({
      //                       success: false,
      //                       error: `File not found at path: ${filePath}`,
      //                     }),
      //                   },
      //                 ],
      //               }
      //             }
      //           } else {
      //             return {
      //               content: [
      //                 {
      //                   type: 'text',
      //                   text: JSON.stringify({
      //                     success: false,
      //                     error: 'Either filePath or base64Data (along with filename) must be provided.',
      //                   }),
      //                 },
      //               ],
      //             }
      //           }

      //           // Create the media using the Local API
      //           const result = await req.payload.create({
      //             collection: 'media',
      //             data: {
      //               alt,
      //               domain,
      //             },
      //             filePath: absolutePath,
      //           });

      //           // Clean up the temp file if one was created
      //           if (tempFilePath && fs.existsSync(tempFilePath)) {
      //             fs.unlinkSync(tempFilePath)
      //           }

      //           return {
      //             content: [
      //               {
      //                 type: 'text',
      //                 text: JSON.stringify({
      //                   success: true,
      //                   message: 'Media successfully uploaded.',
      //                   media: result,
      //                 }),
      //               },
      //             ],
      //           }
      //         } catch (error: any) {
      //           console.error('Error in custom uploadMedia tool:', error);
      //           if (tempFilePath && fs.existsSync(tempFilePath)) {
      //             try {
      //               fs.unlinkSync(tempFilePath)
      //             } catch (_) { }
      //           }
      //           return {
      //             content: [
      //               {
      //                 type: 'text',
      //                 text: JSON.stringify({
      //                   success: false,
      //                   error: error.message || 'An unexpected error occurred during upload.',
      //                 }),
      //               },
      //             ],
      //           }
      //         }
      //       },
      //     },
      //   ],
      // },
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

