import { slugField, type Access, type CollectionConfig } from 'payload'
import { HeroBlock } from '@/blocks/hero/config'
import  { User } from '@/payload-types'


export const hasPageAccess: Access = ({ req }) => {
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

export const Pages: CollectionConfig = {
    slug: "pages",
    admin: {
        useAsTitle: "title",
    },
    access: {
        read: hasPageAccess,
        update: hasPageAccess,
        delete: hasPageAccess,
        create: hasPageAccess,
      },
    fields: [
      {
            name:"domain",
            type:"relationship",
            relationTo:"domain",
            required:true,          
        },
        {
            name: "title",
            type: "text",
            required: true,
            admin: {
                placeholder: "e.g. Home Page"
            }
        },
        {
            name: "layout",
            type: "blocks",
            blocks: [
                HeroBlock,
            ]
        },slugField()
    ]
}