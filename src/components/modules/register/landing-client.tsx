'use client'

import { useState, useEffect, useMemo } from 'react'
import { Event, EventGuestRule } from '@/types'

// Sections
import { Hero } from './sections/Hero'
import { EventInfo } from './sections/EventInfo'
import { Registration } from './sections/Registration'
import { EventCountdown } from './sections/EventCountdown'
import { AccessBanner } from './sections/AccessBanner'

import { Footer } from './sections/Footer'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export interface LandingClientProps {
  events: Event[]
  guestRules: EventGuestRule[]
}

export function LandingClient({ events, guestRules }: LandingClientProps) {
  const [isGateOpen, setIsGateOpen] = useState(false)
  const mainEvent = events?.[0]

  // Calculate Internal Open Gate
  const targetDate = useMemo(() => {
    if (!mainEvent) return new Date()
    const internalRule = guestRules?.find(
      (r) => r.guest_type === 'internal' && r.event_id === mainEvent.id,
    )
    const openGateTime = internalRule?.open_gate || '08:00:00'
    // Safely parse date and time
    const datePart = mainEvent.event_date.split(/[T ]/)[0]
    return new Date(`${datePart}T${openGateTime}`)
  }, [mainEvent, guestRules])

  useEffect(() => {
    const checkGate = () => {
      setIsGateOpen(new Date() >= targetDate)
    }
    checkGate()
    const timer = setInterval(checkGate, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="theme-halal bg-halal-secondary selection:bg-halal-primary relative flex min-h-screen w-full flex-col overflow-x-hidden scroll-smooth font-sans text-slate-900 selection:text-black">
      {/* Atmosphere Layer - Gradient & Pattern Unification */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Ivory Gradient Base - Perfect Continuity across all sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#F6E8CD] to-[#FFFDF5]" />

        {/* Global Islamic Pattern Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-multiply grayscale"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />

        {/* Ambient Orchestration - Cinematic Light Flows */}
        <div className="absolute top-0 right-0 left-0 h-[120vh] bg-[radial-gradient(circle_at_50%_0%,_rgba(var(--halal-primary-rgb),0.08)_0%,_transparent_50%)]" />
        <div className="absolute right-0 bottom-0 left-0 h-[100vh] bg-[radial-gradient(circle_at_50%_100%,_rgba(var(--halal-primary-rgb),0.05)_0%,_transparent_50%)]" />

        {/* Subtle center-glow for premium look */}
        <div className="absolute top-1/2 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 opacity-10 blur-[150px]" />
      </div>

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero title={mainEvent?.name || undefined} />

        {/* Dynamic Internal Access: Countdown or Login */}
        {mainEvent && (
          <>
            {!isGateOpen ? (
              <EventCountdown
                targetDate={targetDate}
                eventName={mainEvent.name}
                onComplete={() => setIsGateOpen(true)}
              />
            ) : (
              <AccessBanner eventId={mainEvent.id} />
            )}
          </>
        )}

        {mainEvent && <Registration />}

        <EventInfo
          date={mainEvent?.event_date as unknown as string}
          location={mainEvent?.location || undefined}
          guestRules={guestRules?.filter((r) => r.event_id === mainEvent?.id)}
        />
      </main>

      <Footer logoUrl={mainEvent?.logo_url || undefined} />
      <ScrollToTop />
    </div>
  )
}
