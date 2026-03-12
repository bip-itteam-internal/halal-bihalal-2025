'use client'

import { Event, EventGuestRule } from '@/types'

// Sections
import { Hero } from './sections/Hero'
import { EventInfo } from './sections/EventInfo'
import { Registration } from './sections/Registration'
import { TenantBanner } from './sections/TenantBanner'
import { Footer } from './sections/Footer'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export interface LandingClientProps {
  events: Event[]
  guestRules: EventGuestRule[]
}

export function LandingClient({ events, guestRules }: LandingClientProps) {
  const mainEvent = events?.[0]

  return (
    <div className="theme-halal bg-halal-secondary selection:bg-halal-primary relative flex min-h-screen w-full flex-col overflow-x-hidden scroll-smooth font-sans text-[#f8fafc] selection:text-black">
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
        />

        <div id="register-section">
          {mainEvent && (
            <>
              <Registration
                guestRules={guestRules?.filter(
                  (r) => r.event_id === mainEvent?.id,
                )}
              />
            </>
          )}
        </div>
        <EventInfo
          date={mainEvent?.event_date as unknown as string}
          location={mainEvent?.location || undefined}
          guestRules={guestRules?.filter((r) => r.event_id === mainEvent?.id)}
        />
        <TenantBanner eventName={mainEvent.name || ''} />
      </main>

      <Footer logoUrl={mainEvent?.logo_url || undefined} />
      <ScrollToTop />
    </div>
  )
}
