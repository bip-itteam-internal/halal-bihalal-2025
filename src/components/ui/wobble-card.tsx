'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode
  containerClassName?: string
  className?: string
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (clientX - (rect.left + rect.width / 2)) / 20
    const y = (clientY - (rect.top + rect.height / 2)) / 20
    setMousePosition({ x, y })
  }

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.01, 1.01, 1)`
          : 'translate3d(0px, 0px, 0) scale3d(1, 1, 1)',
        transition: 'transform 0.1s ease-out',
      }}
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-3xl bg-slate-900',
        containerClassName,
      )}
    >
      <div
        className={cn('relative h-full px-4 py-8 sm:px-10', className)}
        style={{
          transition: 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </motion.section>
  )
}
