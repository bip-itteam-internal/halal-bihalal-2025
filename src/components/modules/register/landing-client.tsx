'use client'

import { useState } from 'react'
import { Event } from '@/types'

// Sections
import { Hero } from './sections/Hero'
import { EventInfo } from './sections/EventInfo'
import { Registration } from './sections/Registration'
import { Footer } from './sections/Footer'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export interface LandingClientProps {
  events: Event[]
  registrationsByEvent: Record<string, { external: number; tenant: number }>
}

export function LandingClient({
  events,
  registrationsByEvent,
}: LandingClientProps) {
  const [activeRegTab, setActiveRegTab] = useState<'external' | 'tenant'>(
    'external',
  )

  const mainEvent = events?.[0]

  const scrollToRegister = (tab: 'external' | 'tenant') => {
    setActiveRegTab(tab)
    const element = document.getElementById('register-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-halal-secondary selection:bg-halal-primary relative flex min-h-screen w-full flex-col overflow-x-hidden scroll-smooth font-sans text-[#f8fafc] selection:text-black">
      {/* Dynamic Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1b1a]" />

        {/* Modern Islamic Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />

        {/* Cinematic Lighting */}
        <div className="bg-halal-primary/10 absolute top-[-10%] left-[-10%] h-[70%] w-[70%] animate-pulse rounded-full blur-[120px]" />
        <div className="bg-halal-accent/20 absolute right-[-10%] bottom-[-10%] h-[70%] w-[70%] rounded-full blur-[120px]" />

        {/* Global Noise / Grain */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-[0.05]" />
      </div>

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero
          logoUrl={mainEvent?.logo_url || undefined}
          title={mainEvent?.name || undefined}
          onAction={scrollToRegister}
        />

        <EventInfo
          date={mainEvent?.event_date as unknown as string}
          location={mainEvent?.location || undefined}
        />

        {mainEvent && (
          <Registration
            eventId={mainEvent.id}
            regData={
              registrationsByEvent[mainEvent.id] || { external: 0, tenant: 0 }
            }
            quotas={{
              external: mainEvent.external_quota ?? 0,
              tenant: mainEvent.tenant_quota ?? 0,
            }}
            activeTab={activeRegTab}
            onTabChange={setActiveRegTab}
          />
        )}
      </main>

      <Footer logoUrl={mainEvent?.logo_url || undefined} />
      <ScrollToTop />
    </div>
  )
}
