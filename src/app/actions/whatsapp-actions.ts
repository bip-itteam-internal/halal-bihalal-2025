'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWhatsapp } from '@/services/api/whatsapp'
// import { formatJakartaDate } from '@/lib/utils' // Commented out or removed

export async function bulkSendWhatsappAction(
  guestIds: string[],
  eventName: string,
  eventId: string,
) {
  const supabase = await createClient()

  // 1. Fetch guests
  const { data: guests, error } = await supabase
    .from('guests')
    .select('id, full_name, phone, invitation_code')
    .in('id', guestIds)

  if (error) {
    return { success: false, message: error.message }
  }

  if (!guests || guests.length === 0) {
    return { success: false, message: 'Tidak ada tamu yang ditemukan.' }
  }

  // 1.5 Fetch event details to get real date and location
  const [eventRes, rulesRes] = await Promise.all([
    supabase
      .from('events')
      .select('event_date, location')
      .eq('id', eventId)
      .single(),
    supabase
      .from('event_guest_rules')
      .select('open_gate, guest_type')
      .eq('event_id', eventId)
      .in('guest_type', ['internal', 'external']),
  ])

  const eventData = eventRes.data
  const allRules = rulesRes.data || []

  const internalRule = allRules.find((r) => r.guest_type === 'internal')
  const externalRule = allRules.find((r) => r.guest_type === 'external')

  const displayDate = 'Rabu, 8 April 2026'

  const halalTime = internalRule?.open_gate
    ? internalRule.open_gate.substring(0, 5).replace(':', '.')
    : '08:00'

  const concertTime = externalRule?.open_gate
    ? externalRule.open_gate.substring(0, 5).replace(':', '.')
    : '18:30'

  const displayLocation =
    eventData?.location ||
    'Lap. Parkir PT. Bharata Internasional Pharmaceutical'

  const results = []
  let successCount = 0

  for (const guest of guests) {
    if (!guest.phone) {
      results.push({
        id: guest.id,
        name: guest.full_name,
        success: false,
        message: 'Nomor telepon tidak ada',
      })
      continue
    }

    // Invitation link (using the requested Bitly link)
    const loginLink = 'https://bit.ly/HALALBIHALALBHARATAGROUP2026'

    // Formal & Personal Invitation Template
    const message = `Yth. *${guest.full_name}*\n\n🌙 *UNDANGAN HALAL BIHALAL BHARATA GROUP & SPESIAL KONSER 2026* 🌙\n\nKepada seluruh keluarga besar *Bharata Group*,\n\nDengan penuh rasa syukur dan kebersamaan, kami mengundang Bapak/Ibu serta seluruh tim untuk hadir dalam acara *Halal Bihalal Keluarga Besar Bharata Group 2026 dan Spesial Konser Charly Setia Band* sebagai momentum untuk mempererat silaturahmi, saling memaafkan, dan memperkuat sinergi dalam kebersamaan.\n\nHari / Tanggal : ${displayDate}\nWaktu : Halal Bihalal (${halalTime} - Selesai) & Spesial Konser (${concertTime} - Selesai)\nTempat : ${displayLocation}\nTema : Grow Together\nLink Undangan : ${loginLink}\n\nKami berharap Bapak/Ibu dapat berkenan hadir untuk bersama-sama merajut kebersamaan, memperkuat sinergi, dan melangkah bersama mencapai tujuan perusahaan.\n\nDemikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya kami ucapkan terima kasih.\n\n*Noted* : Jika ada kendala bisa hubungi 089676258026 (FARIZ)\n_(Mohon untuk tidak membalas pesan ini karena dikirim otomatis oleh sistem)_\n\nRegards,\n*Panitia ${eventName}* 🙏`

    const res = await sendWhatsapp({ phone: guest.phone, message })

    if (res.status) {
      successCount++
      // Update last sent timestamp
      await supabase
        .from('guests')
        .update({ wa_sent_at: new Date().toISOString() })
        .eq('id', guest.id)
    }

    results.push({
      id: guest.id,
      name: guest.full_name,
      success: res.status,
      message: res.message,
    })
  }

  return {
    success: true,
    message: `Berhasil memproses ${guests.length} pesan. ${successCount} terkirim.`,
    results,
  }
}

export async function sendTenantVerificationAction(guestId: string) {
  const supabase = await createClient()

  // 1. Fetch guest details
  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, full_name, phone, guest_type')
    .eq('id', guestId)
    .single()

  if (error || !guest) {
    return { success: false, message: 'Tamu tidak ditemukan.' }
  }

  if (guest.guest_type !== 'tenant') {
    return { success: false, message: 'Bukan akun tenant.' }
  }

  if (!guest.phone) {
    return { success: false, message: 'Nomor telepon tidak tersedia.' }
  }

  // 2. Prepare message
  const tenantLoginLink = `https://bharata-event.vercel.app/tenant-login/halal-bihalal-dan-spesial-konser-setia-band-2026`
  const message = `Yth. *${guest.full_name}*,\n\nPembayaran Anda telah kami *Verifikasi*. Terima kasih telah melakukan registrasi tenant.\n\nSilakan login ke sistem untuk mengelola tenant Anda melalui link berikut:\n🔗 ${tenantLoginLink}\n\nMohon simpan link ini untuk keperluan login di kemudian hari.\n\n*Noted* : Jika ada kendala bisa hubungi 089676258026 (FARIZ)\n_(Mohon untuk tidak membalas pesan ini karena dikirim otomatis oleh sistem)_\n\nRegards,\n*Panitia Bharata Group* 🙏`

  // 3. Send WhatsApp
  const res = await sendWhatsapp({ phone: guest.phone, message })

  if (res.status) {
    // Update last sent timestamp
    await supabase
      .from('guests')
      .update({ wa_sent_at: new Date().toISOString() })
      .eq('id', guest.id)

    return { success: true, message: 'WhatsApp Verifikasi Terkirim.' }
  }

  return { success: false, message: res.message || 'Gagal mengirim WhatsApp.' }
}
