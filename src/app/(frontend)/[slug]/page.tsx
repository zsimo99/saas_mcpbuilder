import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'

import config from '@/payload.config'
import '../styles.css'
import { RenderBlocks } from '@/blocks/RenderBlocks'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  
  // Do not handle 'home' route here, since it is handled by the root page


  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const host = headers.get('host')
  const domainData = await payload.find({
    collection: 'domain',
    where: {
      domain: {
        equals: host,
      }
    }
  })

  if (domainData.docs.length === 0) {
    return notFound()
  }

  const pageData = await payload.find({
    collection: 'pages',
    where: {
      domain: {
        equals: domainData.docs[0].id,
      },
      slug: {
        equals: slug,
      }
    }
  })

  if (pageData.docs.length === 0) {
    return notFound()
  }

  return (
    <div>
      <RenderBlocks blocks={pageData.docs[0].layout} />
    </div>
  )
}
