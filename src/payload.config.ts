import fs from 'fs'
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
            description: 'Upload a media file (using local path, base64 string, or remote image URL) to Payload CMS.',
            parameters: {
              domain: z.union([z.number(), z.string()]),
              alt: z.string(),
              fileName: z.string().optional(),
              filePath: z.string().optional(),
              fileBase64: z.string().optional(),
              imageUrl: z.string().optional(),
            } as any,
            handler: async (args, req) => {
              let tempFilePath: string | null = null;
              let shouldCleanupTemp = false;
              try {
                const domainInput = args.domain
                const domain = typeof domainInput === 'string' ? parseInt(domainInput, 10) : (domainInput as number)
                const alt = args.alt as string
                const fileName = args.fileName as string | undefined
                const filePath = args.filePath as string | undefined
                const fileBase64 = args.fileBase64 as string | undefined
                const imageUrl = args.imageUrl as string | undefined

                let targetPath = '';

                if (filePath) {
                  // Mode 1: Local file path
                  targetPath = path.resolve(filePath);
                  if (!fs.existsSync(targetPath)) {
                    throw new Error(`File not found at path: ${filePath}`);
                  }
                } else {
                  // We need a temp file name
                  const resolvedFileName = fileName || 'temp_file_' + Date.now();

                  // Create temp directory if it doesn't exist in workspace
                  const tempDir = path.resolve(dirname, '../.tmp');
                  if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                  }

                  tempFilePath = path.join(tempDir, resolvedFileName);
                  targetPath = tempFilePath;
                  shouldCleanupTemp = true;

                  if (fileBase64) {
                    // Mode 2: Base64 data
                    const fileBuffer = Buffer.from(fileBase64, 'base64');
                    fs.writeFileSync(tempFilePath, fileBuffer);
                  } else if (imageUrl) {
                    // Mode 3: Image URL download
                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                      throw new Error(`Failed to download image from URL: ${response.statusText}`);
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
                  } else {
                    throw new Error('At least one of the parameters [filePath, fileBase64, imageUrl] must be provided.');
                  }
                }

                // Create the media using the Local API
                const result = await req.payload.create({
                  collection: 'media',
                  data: {
                    alt,
                    domain,
                  },
                  filePath: targetPath,
                });

                // Cleanup temp file
                if (shouldCleanupTemp && tempFilePath && fs.existsSync(tempFilePath)) {
                  fs.unlinkSync(tempFilePath);
                }

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
                
                // Cleanup temp file on error
                if (shouldCleanupTemp && tempFilePath && fs.existsSync(tempFilePath)) {
                  try {
                    fs.unlinkSync(tempFilePath);
                  } catch (cleanupError) {
                    console.error('Failed to cleanup temp file:', cleanupError);
                  }
                }

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

