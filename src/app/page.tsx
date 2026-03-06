'use client'

import Link from 'next/link'
import { MoveRight, Ticket, UserCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-6xl space-y-12 py-12">
        <div className="flex flex-col items-center space-y-6 text-center">
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-slate-200 bg-white px-4 py-1"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-600">
              20 June 2026 • 16:30 WIB
            </span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Halal Bihalal
              <br />
              <span className="text-emerald-600">Bharata Group</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              Next-generation event invitation system. Seamless QR Check-in,
              Real-time Analytics, and Instant E-Ticketing.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <Ticket className="mb-4 h-10 w-10 text-emerald-600" />
              <CardTitle>Public Registration</CardTitle>
              <CardDescription>
                Get instant E-Tickets for external guests through the digital
                system.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link href="/register/halal-bihalal-2025" className="w-full">
                <Button className="w-full" variant="default">
                  Register Now <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <UserCheck className="mb-4 h-10 w-10 text-slate-900" />
              <CardTitle>Scanner Mode</CardTitle>
              <CardDescription>
                Committee panel to verify VIP and regular guest QR Codes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link href="/scanner" className="w-full">
                <Button className="w-full" variant="secondary">
                  Open Scanner <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <ShieldCheck className="mb-4 h-10 w-10 text-blue-600" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Real-time analytics, guest management, and doorprize engine.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full" variant="outline">
                  Admin Panel <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
