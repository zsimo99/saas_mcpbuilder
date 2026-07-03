import { Media as MediaType } from '@/payload-types'
import Image from 'next/image'
import React from 'react'

export interface MediaProps {
  resource?: number | MediaType | null | undefined
}

export const Media = ({
  resource
}: MediaProps) => {
  console.log("resource", resource)
  if (!resource || typeof resource !== 'object') return null

  const src = resource.url
  if (!src) return null

  const isVideo = resource.mimeType?.startsWith('video')
console.log("src", src)
  if (isVideo) {
    return (
      <video
        src={src}
        className={""}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  const altText = resource.alt || 'Media'
  const width = resource.width || 800
  const height = resource.height || 600

  return (
    <Image
      src={src}
      alt={altText}
      width={width}
      height={height}
    />
  )
}