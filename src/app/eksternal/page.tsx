import Link from 'next/link'
import Image from 'next/image'
import { Ticket, CalendarDays, MapPin, Users, Store, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatJakartaDate } from '@/lib/utils'
import { InternalOnlyRegisterButton } from '@/components/modules/events/internal-only-register-button'

function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default async function EksternalPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'public')
    .in('public_reg_status', ['open', 'closed'])
    .order('event_date', { ascending: true })

  const eventIds = (events ?? []).map((event) => event.id)

  const { data: publicGuests } =
    eventIds.length > 0
      ? await supabase
          .from('guests')
          .select('event_id')
          .in('event_id', eventIds)
          .eq('registration_source', 'public_registration')
      : { data: [] }

  const publicRegistrationsByEvent = (publicGuests ?? []).reduce<
    Record<string, number>
  >((acc, guest) => {
    acc[guest.event_id] = (acc[guest.event_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
        <div className="flex flex-col items-center space-y-6 text-center">
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-slate-200 bg-white px-4 py-1"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-600">Upcoming Event</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              <span className="text-emerald-600">Bharata Event</span>
            </h1>
          </div>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,360px))] justify-center gap-6">
            {events.map((event) => {
              const isOpen = event.public_reg_status === 'open'
              const isInternal = event.event_type === 'internal'
              const eventSlug = toEventSlug(event.name || '')
              const publicRegistered = publicRegistrationsByEvent[event.id] ?? 0
              const publicQuotaLeft = Math.max(
                0,
                (event.external_quota ?? 0) - publicRegistered,
              )
              const publicQuotaTotal = event.external_quota ?? 0
              const publicQuotaFilledPercent =
                publicQuotaTotal > 0
                  ? Math.min(
                      100,
                      Math.round((publicRegistered / publicQuotaTotal) * 100),
                    )
                  : 0

              return (
                <Card
                  key={event.id}
                  className="flex w-full flex-col gap-0 overflow-hidden py-0"
                >
                  <div className="bg-muted relative aspect-square border-b">
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          isInternal
                            ? 'border-amber-300 bg-amber-50 text-amber-700 capitalize'
                            : 'border-sky-300 bg-sky-50 text-sky-700 capitalize'
                        }
                      >
                        {isInternal ? 'Internal' : 'Publik'}
                      </Badge>
                      <Badge
                        className={
                          isOpen
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                        }
                      >
                        {isOpen ? 'Buka' : 'Tutup'}
                      </Badge>
                    </div>
                    {event.logo_url ? (
                      <Image
                        src={event.logo_url}
                        alt={`Poster ${event.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-100 to-blue-200 text-sky-700">
                        <CalendarDays className="h-10 w-10" />
                        <span className="text-xs font-medium tracking-wide uppercase">
                          Event
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-xl leading-tight">
                      {event.public_name || event.name}
                    </CardTitle>
                    {event.company_name && (
                      <p className="text-muted-foreground text-xs uppercase">
                        {event.company_name}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 px-4 pb-3">
                    <div className="text-muted-foreground flex items-center text-sm">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {event.event_date
                        ? formatJakartaDate(event.event_date, 'PPP p')
                        : 'TBA'}{' '}
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location || 'TBA'}
                    </div>
                    {!isInternal && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            Kuota publik tersedia
                          </span>
                          <span className="text-muted-foreground">
                            {publicQuotaLeft} tersisa dari {publicQuotaTotal}
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${publicQuotaFilledPercent}%`,
                            }}
                            aria-label={`Kuota terisi ${publicQuotaFilledPercent}%`}
                          />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Sudah terdaftar {publicRegistered} (
                          {publicQuotaFilledPercent}%)
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 mt-auto border-t p-3">
                    {isInternal ? (
                      <div className="flex w-full flex-col gap-2">
                        <InternalOnlyRegisterButton
                          eventName={event.public_name || event.name}
                        />
                        <Link
                          href={`/guest-login/${eventSlug}`}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            Login Tamu
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex w-full flex-col gap-2">
                        <Link
                          href={
                            isOpen
                              ? `/register/${eventSlug}?type=external`
                              : '#'
                          }
                          className="w-full"
                        >
                          <Button
                            className="w-full"
                            variant={isOpen ? 'default' : 'secondary'}
                            disabled={!isOpen}
                          >
                            {isOpen ? (
                              <>
                                <Users className="mr-2 h-4 w-4" />
                                Daftar untuk umum
                              </>
                            ) : (
                              'Pendaftaran Ditutup'
                            )}
                          </Button>
                        </Link>
                        <Link
                          href={
                            isOpen ? `/register/${eventSlug}?type=tenant` : '#'
                          }
                          className="w-full"
                        >
                          <Button
                            variant={isOpen ? 'outline' : 'secondary'}
                            className="w-full"
                            disabled={!isOpen}
                          >
                            <Store className="mr-2 h-4 w-4" />
                            Daftar untuk tenant
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
            <Ticket className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">
              Belum ada event
            </h3>
            <p className="text-sm text-slate-500">
              Saat ini tidak ada event publik yang dibuka.
            </p>
          </div>
        )}

        <footer className="pt-8 pb-2 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Bharata Group
        </footer>
      </div>
    </div>
  )
}
