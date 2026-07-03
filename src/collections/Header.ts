import type { Access, CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

export const hasHeaderAccess: Access = ({ req }) => {
  const user = req.user as User;
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

export const Headers: CollectionConfig = {
  slug: 'headers',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: hasHeaderAccess,
    create: hasHeaderAccess,
    update: hasHeaderAccess,
    delete: hasHeaderAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g. Main Navigation Header'
      }
    },
    {
      name: 'domain',
      type: 'relationship',
      relationTo: 'domain',
      required: true,
      unique: true,
      admin: {
        placeholder: 'Select the domain this header belongs to...'
      }
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload the logo image for the website header.'
      }
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      labels: {
        singular: 'Navigation Item',
        plural: 'Navigation Items',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g. Home, Pricing, Contact'
          }
        },
        {
          name: 'link',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g. /pricing, https://external.com'
          }
        }
      ]
    }
  ]
}
