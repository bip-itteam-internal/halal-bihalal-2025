'use client'

import { useState } from 'react'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RegistrationSuccess } from '@/components/modules/register/registration-success'
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
  const [successData, setSuccessData] = useState<{
    guest_id: string
    qr_payload: string
    registeredName: string
    registrationType: 'external' | 'tenant'
  } | null>(null)

  if (successData) {
    return (
      <RegistrationSuccess
        guestId={successData.guest_id}
        qrPayload={successData.qr_payload}
        registeredName={successData.registeredName}
        registeredGuestType={successData.registrationType}
      />
    )
  }

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
                  onSuccess={(data) => setSuccessData(data)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
