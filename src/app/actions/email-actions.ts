'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/services/api/email'
import { InvitationEmail } from '@/components/emails/invitation-email'
import * as React from 'react'
import { render } from '@react-email/render'

export async function bulkSendEmailAction(
  guestIds: string[],
) {
  const supabase = await createClient()

  // 1. Fetch guests
  const { data: guests, error } = await supabase
    .from('guests')
    .select('id, full_name, email, invitation_code')
    .in('id', guestIds)

  if (error) {
    return { success: false, message: error.message }
  }

  if (!guests || guests.length === 0) {
    return { success: false, message: 'Tidak ada tamu yang ditemukan.' }
  }


  const results = []
  let successCount = 0

  for (const guest of guests) {
    if (!guest.email) {
      results.push({
        id: guest.id,
        name: guest.full_name,
        success: false,
        message: 'Email tidak ada',
      })
      continue
    }

    try {
      // Add a randomized delay (2-5 seconds) between emails to prevent Gmail ban
      if (guests.indexOf(guest) > 0) {
        const delay = Math.floor(Math.random() * 3000) + 2000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      // Render React template to HTML string
      const emailHtml = await render(
        React.createElement(InvitationEmail, {
          guestName: guest.full_name,
        }),
      )

      const { success, message } = await sendEmail({
        to: guest.email,
        subject: `Undangan Silaturahmi & Halal Bihalal 2026 - ${guest.full_name}`,
        html: emailHtml,
      })

      if (success) {
        successCount++
      }

      results.push({
        id: guest.id,
        name: guest.full_name,
        success,
        message: message || 'Success',
      })
    } catch (e) {
      results.push({
        id: guest.id,
        name: guest.full_name,
        success: false,
        message: e instanceof Error ? e.message : 'Unknown error',
      })
    }
  }

  return {
    success: true,
    message: `Berhasil memproses ${guests.length} email. ${successCount} terkirim.`,
    results,
  }
}

export async function sendSingleEmailAction(
  guestId: string,
) {
  const supabase = await createClient()

  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, full_name, email, invitation_code')
    .eq('id', guestId)
    .single()

  if (error || !guest) {
    return { success: false, message: error?.message || 'Tamu tidak ditemukan' }
  }

  if (!guest.email) {
    return { success: false, message: 'Email tidak ada' }
  }

  try {
    const emailHtml = await render(
      React.createElement(InvitationEmail, {
        guestName: guest.full_name,
      }),
    )

    const { success, message } = await sendEmail({
      to: guest.email,
      subject: `Undangan Silaturahmi & Halal Bihalal 2026 - ${guest.full_name}`,
      html: emailHtml,
    })

    return { success, message: message || 'Success' }
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Unknown error',
    }
  }
}
