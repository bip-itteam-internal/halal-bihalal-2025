'use client'

import React, { useEffect, useRef, useState } from 'react'
import { audioManager } from '@/lib/audio-manager'
import { Guest } from '@/types'

interface SpinnerWheelProps {
  candidates: Guest[]
  onWinner: (winner: Guest) => void
  isSpinning: boolean
  setIsSpinning: (isSpinning: boolean) => void
}

export const SpinnerWheel: React.FC<SpinnerWheelProps> = ({
  candidates,
  onWinner,
  isSpinning,
  setIsSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [displayCandidates, setDisplayCandidates] = useState<Guest[]>([])
  
  // Supporting up to 1000 segments for large events
  const MAX_SEGMENTS = 1000
  const [isNearEnd, setIsNearEnd] = useState(false)
  const isAnimating = useRef(false)
  
  useEffect(() => {
    if (candidates.length > 0) {
      // Use all candidates if within limit
      const subset = [...candidates]
        .slice(0, Math.min(candidates.length, MAX_SEGMENTS))
      setDisplayCandidates(subset)
    }
  }, [candidates])

  const spin = () => {
    if (isAnimating.current || displayCandidates.length === 0) return
    
    isAnimating.current = true
    setIsNearEnd(false)
    
    // Heartbeat starts slow
    audioManager.startHeartbeat(60)
    
    // Choose winner from the displayed candidates to ensure visual consistency
    const chosenWinner = displayCandidates[Math.floor(Math.random() * displayCandidates.length)]
    const winnerIndex = displayCandidates.findIndex(c => c.id === chosenWinner.id)
    
    const segmentAngle = 360 / displayCandidates.length
    const extraSpins = 8 + Math.random() * 4 // More spins (8-12)
    const startRot = rotation
    
    // Calculate how much rotation is needed to put winnerIndex at the 3 o'clock position (0 degrees)
    // The wheel drawing starts with a -90 degree offset.
    const targetBaseRot = (90 - (winnerIndex * segmentAngle + segmentAngle / 2) + 360) % 360
    const currentRotMod = startRot % 360
    const rotationNeeded = (targetBaseRot - currentRotMod + 360) % 360
    
    const endRot = startRot + (extraSpins * 360) + rotationNeeded
    
    const startTime = performance.now()
    const duration = 10000 // 10 seconds for suspense
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function: custom quintic-out for longer slowdown
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 5)
      const currentRot = startRot + (endRot - startRot) * easeOut(progress)
      
      const normalizedRot = currentRot % 360
      setRotation(normalizedRot)
      drawWheel(normalizedRot, displayCandidates)
      
      // Dynamic heartbeat based on progress
      if (progress > 0.5 && progress < 0.95) {
        const bpm = 60 + (progress - 0.5) * 200 // Speed up heartbeat
        audioManager.startHeartbeat(bpm)
      } else if (progress >= 0.95) {
        audioManager.stopHeartbeat()
        setIsNearEnd(true)
      }

      // Play tick sound when passing segments
      const prevRot = startRot + (endRot - startRot) * easeOut(Math.max(0, (elapsed - 20) / duration))
      if (Math.floor(currentRot / segmentAngle) > Math.floor(prevRot / segmentAngle)) {
        audioManager.playTick()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        isAnimating.current = false
        setIsSpinning(false)
        setIsNearEnd(false)
        audioManager.stopHeartbeat()
        onWinner(chosenWinner)
      }
    }
    
    requestAnimationFrame(animate)
  }

  const drawWheel = (rot: number, currentDisplayCandidates: Guest[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 15
    
    ctx.clearRect(0, 0, size, size)
    
    // Draw outer ring glow
    const shadowSize = isNearEnd ? 30 : 10
    ctx.shadowBlur = shadowSize
    ctx.shadowColor = 'rgba(14, 165, 233, 0.5)'
    
    const segments = currentDisplayCandidates.length
    const angleStep = (2 * Math.PI) / segments
    
    ctx.save()
    ctx.translate(center, center)
    ctx.rotate((rot * Math.PI) / 180 - Math.PI / 2)
    
    currentDisplayCandidates.forEach((candidate, i) => {
      const startAngle = i * angleStep
      const endAngle = (i + 1) * angleStep
      
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      
      const colors = ['#dfae46', '#102726', '#ffffff', '#1a3a38']
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
      
      // Thinner lines for higher density
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = segments > 200 ? 0.3 : 1
      ctx.stroke()
      
      // Draw text if it's within a reasonable limit for rendering
      // Increased to 500 to support the user's 400+ participants
      if (segments <= 500) {
        ctx.save()
        ctx.rotate(startAngle + angleStep / 2)
        ctx.textAlign = 'right'
        ctx.fillStyle = (i % colors.length === 2) ? '#000' : '#fff'
        
        // Dynamic font size: smaller for more segments
        const fontSize = Math.max(5, Math.min(14, 2500 / (segments * 1.5)))
        ctx.font = `bold ${fontSize}px Outfit, sans-serif`
        
        // Show FULL NAME
        const fullName = candidate.full_name.toUpperCase()
        ctx.fillText(fullName, radius - 15, fontSize / 3)
        ctx.restore()
      }
    })
    
    ctx.restore()
    
    // Reset shadow for pointer
    ctx.shadowBlur = 0
    
    // Pointer with pulse - pointing INWARDS
    const pointerScale = isNearEnd ? 1.2 : 1
    ctx.save()
    ctx.translate(size, center)
    ctx.scale(pointerScale, pointerScale)
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.moveTo(-35, 0)
    ctx.lineTo(-5, -15)
    ctx.lineTo(-5, 15)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
    
    // Center hole
    ctx.beginPath()
    ctx.arc(center, center, 15, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#dfae46'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  useEffect(() => {
    if (displayCandidates.length > 0) {
      drawWheel(rotation, displayCandidates)
    }
  }, [displayCandidates])

  const prevIsSpinning = useRef(false)

  // Trigger spin when isSpinning changes from false to true
  useEffect(() => {
    if (isSpinning && !prevIsSpinning.current) {
      spin()
    }
    prevIsSpinning.current = isSpinning
  }, [isSpinning])

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      <div className="relative h-[500px] w-[500px] md:h-[700px] md:w-[700px] lg:h-[800px] lg:w-[800px]">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[80px] animate-pulse" />
        
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="h-full w-full rounded-full border-[12px] border-white/5 bg-black/20 shadow-2xl backdrop-blur-sm"
        />
        
        {/* Center Button-like indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-8 border-emerald-500 z-10">
           <div className="h-8 w-8 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>
    </div>
  )
}
