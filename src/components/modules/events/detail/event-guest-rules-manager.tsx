'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Clock, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getEventGuestRules, updateEventGuestRule } from '@/services/api/events'
import { EventGuestRule, GuestType } from '@/types'

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
  const [rules, setRules] = useState<Record<string, Partial<EventGuestRule>>>(
    {},
  )

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getEventGuestRules(eventId)
      const ruleMap: Record<string, EventGuestRule> = {}
      data.forEach((r) => {
        ruleMap[r.guest_type] = r
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
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 text-emerald-700">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Aturan Jam Operasional (Gate)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-[11px] leading-snug">
          Atur kapan sistem scanner mengizinkan tamu untuk masuk serta jam mulai
          versi e-ticket berdasarkan tipenya. Biarkan kosong jika tidak ada
          batasan.
        </p>

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
                className="group flex flex-col gap-3 rounded-lg border bg-slate-50/50 p-3 transition-colors hover:bg-slate-50 md:flex-row md:items-end"
              >
                <div className="flex-1 space-y-1">
                  <span className="text-sm font-bold text-slate-700">
                    {type.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 md:w-[480px]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-slate-500 uppercase">
                      Open Gate
                    </label>
                    <Input
                      type="time"
                      className="h-8 text-xs"
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
                    <label className="text-[10px] tracking-wider text-slate-500 uppercase">
                      Start Event
                    </label>
                    <Input
                      type="time"
                      className="h-8 text-xs font-bold text-blue-600"
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
                    <label className="text-[10px] tracking-wider text-slate-500 uppercase">
                      Close Gate
                    </label>
                    <Input
                      type="time"
                      className="h-8 text-xs"
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
                  variant="ghost"
                  className="h-8 w-full shrink-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 md:w-10"
                  onClick={() => handleUpdate(type.value)}
                  disabled={!!saving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
