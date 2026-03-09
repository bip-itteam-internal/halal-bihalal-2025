'use client'

import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EventInfo } from '@/components/modules/register/event-info'
import { RegistrationForm } from '@/components/modules/register/registration-form'

type RegisterEventClientProps = {
  eventIdentifier: string
  event: Event
  initialType: 'external' | 'tenant' | null
}

export function RegisterEventClient({
  eventIdentifier,
  event,
  initialType,
}: RegisterEventClientProps) {
  const router = useRouter()

  return (
    <div className="bg-muted/40 min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Link
          href="/bharata-group-spesial-konser-wali-band-2026"
          className="inline-flex"
        >
          <Button variant="outline" size="icon" aria-label="Kembali">
            <MoveLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <EventInfo event={event} />

              <div className="lg:border-l lg:pl-6">
                <RegistrationForm
                  eventIdentifier={eventIdentifier}
                  forcedGuestType={initialType}
                  onSuccess={(data) => {
                    const nameSlug = slugify(data.registeredName || '', {
                      lower: true,
                      strict: true,
                    })
                    const eventSlug = slugify(event.name || '', {
                      lower: true,
                      strict: true,
                    })
                    router.push(
                      `/invite/${data.guest_id}-${nameSlug}-${eventSlug}`,
                    )
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
