import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: true,
})

export const getBucketName = (domainSlug: string): string => {
  // S3 bucket names must be lowercase, between 3 and 63 characters,
  // and contain only letters, numbers, hyphens, and dots.
  const prefix = 'payload-'
  const sanitized = domainSlug
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${prefix}${sanitized}`
}
