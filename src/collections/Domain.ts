
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
import { CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand } from '@aws-sdk/client-s3'
import { s3Client, getBucketName } from '@/utilities/s3'

// const createDomainBucket = async ({ doc, operation }: { doc: any, operation: string }) => {
//   if (operation === 'create' && doc && doc.slug) {
//     const bucketName = getBucketName(doc.slug)
//     try {
//       try {
//         await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
//         console.log(`Bucket ${bucketName} already exists.`)
//       } catch (err: any) {
//         if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
//           await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
//           console.log(`Successfully created S3 bucket: ${bucketName}`)

//           try {
//             // Remove block public access settings (needed for AWS S3, wrapped in try-catch for custom providers)
//             await s3Client.send(new PutPublicAccessBlockCommand({
//               Bucket: bucketName,
//               PublicAccessBlockConfiguration: 
//               {
//                 BlockPublicAcls: false,
//                 IgnorePublicAcls: false,
//                 BlockPublicPolicy: false,
//                 RestrictPublicBuckets: false
//               },
//             }))
//           } catch (e) {
//             console.log(`Note: PutPublicAccessBlock not supported or failed (expected on some custom S3 providers)`)
//           }

//           // Apply public read bucket policy
//           const publicPolicy = {
//             Version: '2012-10-17',
//             Statement: [
//               {
//                 Sid: 'PublicReadGetObject',
//                 Effect: 'Allow',
//                 Principal: '*',
//                 Action: 's3:GetObject',
//                 Resource: `arn:aws:s3:::${bucketName}/*`,
//               },
//             ],
//           }

//           await s3Client.send(new PutBucketPolicyCommand({
//             Bucket: bucketName,
//             Policy: JSON.stringify(publicPolicy),
//           }))
//           console.log(`Successfully configured public read policy for S3 bucket: ${bucketName}`)
//         } else {
//           throw err
//         }
//       }
//     } catch (error) {
//       console.error(`Failed to create and configure S3 bucket for domain ${doc.slug}:`, error)
//     }
//   }
// }
const createDomainBucket = async ({ doc, operation }: { doc: any, operation: string }) => {
  if (operation === 'create' && doc && doc.slug) {
    const bucketName = getBucketName(doc.slug);
    
    try {
      // 1. Check if bucket exists
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`Bucket ${bucketName} already exists.`);
        return; // Exit early if it already exists
      } catch (err: any) {
        // If it's not a 404, throw the error to the outer catch block
        if (err.name !== 'NotFound' && err.$metadata?.httpStatusCode !== 404) {
          throw err;
        }
      }

      // 2. Create the bucket
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Successfully created S3 bucket: ${bucketName}`);

      // 3. Remove AWS-specific public access blocks
      try {
        await s3Client.send(new PutPublicAccessBlockCommand({
          Bucket: bucketName,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            IgnorePublicAcls: false,
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false
          },
        }));
      } catch (e) {
        console.log(`Note: PutPublicAccessBlock not supported or failed (expected on some custom S3 providers)`);
      }

      // 4. Apply the public read bucket policy (Moved inside the creation block safely)
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      };

      await s3Client.send(new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(publicPolicy),
      }));
      console.log(`Successfully configured public read policy for S3 bucket: ${bucketName}`);

    } catch (error) {
      console.error(`Failed to create and configure S3 bucket for domain ${doc.slug}:`, error);
    }
  }
};

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