'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { registerGuest } from '@/services/api/registration'

// Modular Components
import { RegistrationFormHeader } from './components/form-header'
import { GuestTypeToggle } from './components/guest-type-toggle'
import { FormFields } from './components/form-fields'
import { SubmitButton } from './components/submit-button'

// Lib & Schema
import {
  registrationSchema,
  RegistrationFormValues,
} from './lib/registration-schema'

interface RegistrationFormProps {
  eventIdentifier: string
  forcedGuestType: 'external' | 'tenant' | null
  onSuccess: (data: {
    invitation_code: string
    registeredName: string
    registrationType: 'external' | 'tenant'
  }) => void
  hideHeader?: boolean
  paymentFile?: File | null
  setPaymentFile?: (file: File | null) => void
}

export function RegistrationForm({
  eventIdentifier,
  forcedGuestType,
  onSuccess,
  hideHeader = false,
  paymentFile: externalPaymentFile,
  setPaymentFile: setExternalPaymentFile,
}: RegistrationFormProps) {
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [internalPaymentFile, setInternalPaymentFile] = useState<File | null>(
    null,
  )

  const effectivePaymentFile =
    externalPaymentFile !== undefined
      ? externalPaymentFile
      : internalPaymentFile

  const effectiveSetPaymentFile =
    setExternalPaymentFile || setInternalPaymentFile

  const [registrationType, setRegistrationType] = useState<
    'external' | 'tenant'
  >(forcedGuestType === 'tenant' ? 'tenant' : 'external')
  const [eventData, setEventData] = useState<Event | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/register/${eventIdentifier}`)
        if (res.ok) {
          const data = await res.json()
          setEventData(data)
        }
      } catch (err) {
        console.error('Failed to fetch event data:', err)
      }
    }
    fetchEvent()
  }, [eventIdentifier])

  const isPaid =
    registrationType === 'tenant'
      ? eventData?.is_tenant_paid
      : eventData?.is_paid && (eventData.price_external || 0) > 0

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address: '',
      umkm_product: '',
    },
  })

  const handleSubmit = async (values: RegistrationFormValues) => {
    form.clearErrors()
    setRegisterLoading(true)
    setRegisterError('')

    try {
      const cleanedAddress = values.address?.trim() || ''
      const cleanedUmkmProduct = values.umkm_product?.trim() || ''

      if (registrationType === 'tenant') {
        let hasValidationError = false
        if (!cleanedAddress) {
          form.setError('address', {
            type: 'manual',
            message: 'Alamat tenant wajib diisi.',
          })
          hasValidationError = true
        }
        if (!cleanedUmkmProduct) {
          form.setError('umkm_product', {
            type: 'manual',
            message: 'Produk UMKM wajib diisi.',
          })
          hasValidationError = true
        }
        if (hasValidationError) {
          setRegisterLoading(false)
          return
        }
      } else if (!cleanedAddress) {
        form.setError('address', {
          type: 'manual',
          message: 'Alamat wajib diisi.',
        })
        setRegisterLoading(false)
        return
      }

      let paymentProofUrl = ''
      if (isPaid) {
        if (!effectivePaymentFile) {
          setRegisterError('Bukti pembayaran wajib diunggah.')
          setRegisterLoading(false)
          return
        } else {
          setIsUploading(true)
          try {
            const fileExt = effectivePaymentFile.name.split('.').pop()
            const fileName = `${eventIdentifier}-${Date.now()}.${fileExt}`
            const filePath = `payment-proofs/${fileName}`
            const { error: uploadError } = await supabase.storage
              .from('event-assets')
              .upload(filePath, effectivePaymentFile)
            if (uploadError) throw uploadError
            const {
              data: { publicUrl },
            } = supabase.storage.from('event-assets').getPublicUrl(filePath)
            paymentProofUrl = publicUrl
          } catch (err) {
            console.error('Upload error:', err)
            setRegisterError('Gagal mengunggah bukti pembayaran.')
            setRegisterLoading(false)
            setIsUploading(false)
            return
          } finally {
            setIsUploading(false)
          }
        }
      }

      const data = await registerGuest(eventIdentifier, {
        full_name: values.full_name,
        phone: values.phone,
        guest_type: registrationType,
        address: cleanedAddress,
        payment_proof_url: paymentProofUrl,
        metadata:
          registrationType === 'tenant'
            ? { umkm_product: cleanedUmkmProduct }
            : {},
      })

      onSuccess({
        invitation_code: data.invitation_code,
        registeredName: values.full_name,
        registrationType: registrationType,
      })
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      )
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <RegistrationFormHeader forcedGuestType={forcedGuestType} />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {registerError && (
            <Alert variant="destructive">
              <AlertTitle>Pendaftaran Gagal</AlertTitle>
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}

          {!forcedGuestType && (
            <GuestTypeToggle
              registrationType={registrationType}
              setRegistrationType={setRegistrationType}
            />
          )}

          <FormFields
            form={form}
            registrationType={registrationType}
            isPaid={isPaid}
            paymentFile={effectivePaymentFile}
            setPaymentFile={effectiveSetPaymentFile}
          />

          <SubmitButton loading={registerLoading} isUploading={isUploading} />
        </form>
      </Form>
    </div>
  )
}
