import React from 'react'
import './styles.css'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { HeaderComponent } from '@/components/Header'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const host = headers.get('host')
  let headerDoc = null
  let domainName = undefined

  try {
    const domainData = await payload.find({
      collection: 'domain',
      where: {
        domain: {
          equals: host || '',
        }
      }
    })

    if (domainData.docs.length > 0) {
      const domainId = domainData.docs[0].id
      domainName = domainData.docs[0].title
      const headerData = await payload.find({
        collection: 'headers',
        where: {
          domain: {
            equals: domainId,
          }
        }
      })
      if (headerData.docs.length > 0) {
        headerDoc = headerData.docs[0]
      }
    }
  } catch (error) {
    console.error('Error fetching layout header data:', error)
  }

  return (
    <html lang="en">
      <body>
        <HeaderComponent header={headerDoc} domainName={domainName} />
        <main>{children}</main>
      </body>
    </html>
  )
}
