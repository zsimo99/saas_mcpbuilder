import type { Access, CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { hasDomainAccess } from './Domain'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, getBucketName } from '@/utilities/s3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const uploadToS3Bucket = async ({ doc, req }: { doc: any, req: any }) => {
  if (doc && doc.domain && doc.filename && req.payload) {
    try {
      const domainDoc = await req.payload.findByID({
        collection: 'domain',
        id: typeof doc.domain === 'object' ? doc.domain.id : doc.domain,
      })
      if (domainDoc && typeof domainDoc === 'object' && 'slug' in domainDoc && domainDoc.slug) {
        const bucketName = getBucketName(domainDoc.slug)
        const endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com'
        const s3Url = `${endpoint}/${bucketName}/${doc.filename}`

        if (doc.url !== s3Url) {
          const filePath = path.resolve(dirname, '../../media', doc.filename)
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath)
            await s3Client.send(new PutObjectCommand({
              Bucket: bucketName,
              Key: doc.filename,
              Body: fileBuffer,
              ContentType: doc.mimeType || undefined,
            }))
            console.log(`Successfully uploaded file ${doc.filename} to S3 bucket ${bucketName}`)

            await req.payload.update({
              collection: 'media',
              id: doc.id,
              data: {
                url: s3Url,
              },
              overrideAccess: true,
            })

            fs.unlinkSync(filePath)
            console.log(`Successfully deleted local copy of ${doc.filename}`)
          }
        }
      }
    } catch (error) {
      console.error('Error handling S3 dynamic upload:', error)
    }
  }
}

const deleteFromS3Bucket = async ({ doc, req }: { doc: any, req: any }) => {
  if (doc && doc.domain && doc.filename && req.payload) {
    try {
      const domainDoc = await req.payload.findByID({
        collection: 'domain',
        id: typeof doc.domain === 'object' ? doc.domain.id : doc.domain,
      })
      if (domainDoc && typeof domainDoc === 'object' && 'slug' in domainDoc && domainDoc.slug) {
        const bucketName = getBucketName(domainDoc.slug)
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: doc.filename,
        }))
        console.log(`Successfully deleted file ${doc.filename} from S3 bucket ${bucketName}`)
      }
    } catch (error) {
      console.error('Error deleting file from S3:', error)
    }
  }
}

const hasMediaAccess: Access = ({ req }) => {
  const user = req.user as User | null
  const url = req.url || ''

  // 1. Allow reading static files publicly (so images load on any domain)
  const isFileRequest = url.includes('/api/media/file/') || url.includes('/media/')
  if (isFileRequest) return true

  // 2. If no user is logged in, allow reading
  if (!user) return true

  // 3. If user is admin, allow viewing all media in dashboard
  if (user.role === 'admin') return true

  // 4. For standard logged-in users, restrict dashboard listings to their assigned domains
  if (user.domain && Array.isArray(user.domain) && user.domain.length > 0) {
    const ids = user.domain.map((d) => (typeof d === 'object' ? d.id : d))
    return {
      domain: {
        in: ids,
      },
    }
  }

  // Default: deny dashboard listing access if no domains are assigned
  return false
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: hasMediaAccess,
    update: hasDomainAccess,
    delete: hasDomainAccess,
    create: hasDomainAccess,
  },
  hooks: {
    afterChange: [uploadToS3Bucket],
    afterDelete: [deleteFromS3Bucket],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: "domain",
      type: "relationship",
      relationTo: "domain",
      required: true,
      
    },
  ],
  upload: true,

}
