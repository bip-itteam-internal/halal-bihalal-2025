'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <motion.div className={cn('relative mx-auto w-full max-w-4xl', className)}>
      <div className="absolute top-3 -left-4 md:-left-12">
        <div className="border-netural-200 ml-[27px] h-4 w-4 rounded-full border shadow-sm" />
      </div>
      <div className="content">{children}</div>
    </motion.div>
  )
}
