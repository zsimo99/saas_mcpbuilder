import type { Access, CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

export const hasUserAccess: Access = ({ req }) => {
  const user = req.user as User | null;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.domain && Array.isArray(user.domain) && user.domain.length > 0) {
    const ids = user.domain.map((d) => (typeof d === 'object' ? d.id : d));
    return {
      domain: {
        in: ids,
      },
    };
  }
  return false;
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: hasUserAccess,
    update: hasUserAccess,
    delete: hasUserAccess,
    create: hasUserAccess,
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      defaultValue: "user",
      required: true,
      access :{
        update: ({ req }) => (req.user as User | null)?.role === 'admin',
        read: ({ req }) => (req.user as User | null)?.role === 'admin',
        
      }
    },
    {
      name: "domain",
      type: "relationship",
      relationTo: "domain",
      hasMany: true,
      access :{
        update: ({ req }) => (req.user as User | null)?.role === 'admin',
        // read: ({ req: { user } }) => user?.role === 'admin',      
      }
    }
  ],
}
