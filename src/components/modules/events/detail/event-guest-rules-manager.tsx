'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Clock3, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { getEventGuestRules, updateEventGuestRule } from '@/services/api/events'
import { EventGuestRule, GuestType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const GUEST_TYPES: { label: string; value: GuestType }[] = [
  { label: 'Internal (Staf)', value: 'internal' },
  { label: 'External (Umum)', value: 'external' },
  { label: 'Tenant UMKM', value: 'tenant' },
]

interface EventGuestRulesManagerProps {
  eventId: string
}

export function EventGuestRulesManager({
  eventId,
}: EventGuestRulesManagerProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [rules, setRules] = useState<Record<string, Partial<EventGuestRule>>>({})

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getEventGuestRules(eventId)
      const ruleMap: Record<string, EventGuestRule> = {}
      data.forEach((rule) => {
        ruleMap[rule.guest_type] = rule
      })
      setRules(ruleMap)
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat aturan jam masuk.')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleUpdate = async (guestType: GuestType) => {
    const rule = rules[guestType] || {
      open_gate: null,
      close_gate: null,
      start_time: null,
    }

    try {
      setSaving(guestType)
      await updateEventGuestRule(eventId, guestType, {
        open_gate: rule.open_gate || null,
        close_gate: rule.close_gate || null,
        start_time: rule.start_time || null,
      })
      toast.success(`Aturan jam masuk ${guestType} diperbarui.`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan aturan.')
    } finally {
      setSaving(null)
    }
  }

  const handleValueChange = (
    guestType: GuestType,
    field: 'open_gate' | 'close_gate' | 'start_time',
    value: string,
  ) => {
    setRules((prev) => ({
      ...prev,
      [guestType]: {
        ...(prev[guestType] || { guest_type: guestType, event_id: eventId }),
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <Card className="rounded-2xl border-slate-200 py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Clock3 className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base text-slate-950">
              Aturan Jam Operasional
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-slate-500">
              Atur kapan tiket mulai aktif, gate dibuka, dan gate ditutup untuk
              tiap tipe tamu.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 py-5 sm:px-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
          Kosongkan jam tertentu jika tipe tamu tersebut tidak memiliki batasan.
          Simpan tiap baris secara terpisah agar perubahan lebih aman.
        </div>

        <div className="space-y-3">
          {GUEST_TYPES.map((type) => {
            const rule = rules[type.value] || {
              open_gate: '',
              close_gate: '',
              start_time: '',
            }
            const isSaving = saving === type.value

            return (
              <div
                key={type.value}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-1 xl:w-48">
                    <span className="text-sm font-semibold text-slate-900">
                      {type.label}
                    </span>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Atur timeline masuk tamu untuk jalur {type.value}.
                    </p>
                  </div>

                  <div className="grid flex-1 gap-3 sm:grid-cols-3 xl:max-w-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Open Gate
                      </label>
                      <Input
                        type="time"
                        className="h-9 text-xs"
                        value={rule.open_gate || ''}
                        onChange={(e) =>
                          handleValueChange(
                            type.value,
                            'open_gate',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Start Event
                      </label>
                      <Input
                        type="time"
                        className="h-9 text-xs"
                        value={rule.start_time || ''}
                        onChange={(e) =>
                          handleValueChange(
                            type.value,
                            'start_time',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Close Gate
                      </label>
                      <Input
                        type="time"
                        className="h-9 text-xs"
                        value={rule.close_gate || ''}
                        onChange={(e) =>
                          handleValueChange(
                            type.value,
                            'close_gate',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-full shrink-0 xl:w-24"
                    onClick={() => handleUpdate(type.value)}
                    disabled={!!saving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
