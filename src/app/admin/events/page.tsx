'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { AppLayout } from '@/components/layout/app-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateEventSheet } from '@/components/modules/events/create-event-sheet'
import { PageHeader } from '@/components/shared/page-header'
import { useProfile } from '@/hooks/use-profile'
import { Event } from '@/types'
import { getEvents } from '@/services/api/events'
import { EventCard } from '@/components/modules/events/event-card'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const { role } = useProfile()
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const canManageEvent = role === 'super_admin' || role === 'admin'

  return (
    <AppLayout
      header={
        <PageHeader
          title="Manajemen Event"
          subtitle="Buat dan kelola seluruh daftar acara yang terdaftar di sistem."
          actions={
            canManageEvent && <CreateEventSheet onSuccess={fetchEvents} />
          }
        />
      }
    >
      <div className="flex-1 space-y-6 p-5 pt-4">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-4/5" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <Skeleton className="mb-2 h-3 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div>
                      <Skeleton className="mb-2 h-3 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center">
            <p>
              Belum ada event. Klik &quot;Buat Event&quot; untuk menambahkan.
            </p>
            {canManageEvent && (
              <CreateEventSheet
                onSuccess={fetchEvents}
                trigger={
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Baru
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canManageEvent={canManageEvent}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
