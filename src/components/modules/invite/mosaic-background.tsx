'use client'

import React from 'react'
import Image from 'next/image'
import { PartyPopper } from 'lucide-react'

interface MosaicBackgroundProps {
  logoUrl?: string | null
  isFullScreen?: boolean
  opacity?: number
}

export function MosaicBackground({
  logoUrl,
  isFullScreen = false,
  opacity = 0.1,
}: MosaicBackgroundProps) {
  return (
    <div
      className={`pointer-events-none ${isFullScreen ? 'fixed' : 'absolute'} inset-0 z-0 flex scale-125 rotate-[-15deg] flex-wrap items-center justify-center`}
      style={{ opacity }}
    >
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="p-8 grayscale">
          {logoUrl ? (
            <Image
              src="/logo/LOGO%20A.png"
              alt=""
              width={80}
              height={80}
              className="object-contain opacity-80"
            />
          ) : (
            <PartyPopper className="h-16 w-16" />
          )}
        </div>
      ))}
    </div>
  )
}
