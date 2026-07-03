
import { slugField, type Access, type CollectionConfig } from 'payload'
import { User } from '@/payload-types';

// Access control function
export const hasDomainAccess: Access = ({ req }) => {
  const user = req.user as User;
  // If no user is logged in, deny access
  if (!user) return false;
  // If user is admin, allow full access to all domains
  if (user.role === 'admin') return true;
  // If standard user, filter by their assigned domains
  if (user.domain && Array.isArray(user.domain) && user.domain.length > 0) {
    const ids = user.domain.map((d) => (typeof d === 'object' ? d.id : d));
    return {
      id: {
        in: ids,
      },
    };
  }
  // Deny access if they have no domains assigned
  return false;
}
import { CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { s3Client, getBucketName } from '@/utilities/s3'

const createDomainBucket = async ({ doc, operation }: { doc: any, operation: string }) => {
  if (operation === 'create' && doc && doc.slug) {
    const bucketName = getBucketName(doc.slug)
    try {
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
        console.log(`Bucket ${bucketName} already exists.`)
      } catch (err: any) {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
          await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
          console.log(`Successfully created bucket: ${bucketName}`)
        } else {
          throw err
        }
      }
    } catch (error) {
      console.error(`Failed to create S3 bucket for domain ${doc.slug}:`, error)
    }
  }
}

const isAdmin: Access = ({ req}) => {
  const user = req.user as User;
  return user?.role === 'admin';
};

export const Domains: CollectionConfig = {
  slug: "domain",
  admin: {
    useAsTitle: "title"
  },
  access: {
    read: hasDomainAccess,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [createDomainBucket],
  },
    fields: [
        {
            name: "title",
            type: "text",
            label:"Domain Name",
            required: true,
            unique: true,
            admin: {
                placeholder: "e.g. My SaaS App"
            }
        },
        {
            name: "domain",
            type: "text",
            required: true,
            unique: true,
            admin: {
                placeholder: "e.g. app.domain.com"
            }
        },
        slugField( )
    ]
}