import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'
import HeroBlockComponent from '@/blocks/hero/component'
import { RenderBlocks } from '@/blocks/RenderBlocks'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  const host = headers.get('host')
  const domainData = await payload.find({
    collection: 'domain',
    where: {
      domain: {
        equals: host,
      }
    }
  })
  if(domainData.docs.length === 0){
    return <div>404</div>
  }
  // get page data 
  const pageData= await payload.find({
    collection: "pages",
    where:{
      domain:{
        equals:domainData.docs[0].id
      },
      slug:{
        equals:"home"
      }
    }
  })
  if(pageData.docs.length === 0){
    return <div>there is no home page for this domain 
    {domainData.docs[0].domain}
    </div>
  }
  return (
    <div>
      <RenderBlocks blocks={pageData.docs[0].layout} />
    </div>
  )
}
