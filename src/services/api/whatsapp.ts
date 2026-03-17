export interface SendWhatsappParams {
  phone: string
  message: string
}

export interface WoowaResponse {
  status: boolean
  message: string
  data?: unknown
}

export async function sendWhatsapp({ phone, message }: SendWhatsappParams): Promise<WoowaResponse> {
  const apiKey = process.env.WOOWA_API_KEY
  
  if (!apiKey) {
    return { status: false, message: 'Woo-Wa API Key is not configured in environment variables.' }
  }

  // Normalize phone number to 62 format
  let normalizedPhone = phone.replace(/\D/g, '')
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '62' + normalizedPhone.slice(1)
  } else if (normalizedPhone.startsWith('8')) {
    normalizedPhone = '62' + normalizedPhone
  }

  try {
    const response = await fetch('https://notifapi.com/async_send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_no: normalizedPhone,
        key: apiKey,
        message: message,
      }),
    })

    const data = await response.json()
    
    // Woo-wa response format might vary, but usually has status or equivalent
    return {
      status: response.ok,
      message: data.message || (response.ok ? 'Success' : 'Failed to send message'),
      data
    }
  } catch (error) {
    console.error('Woo-Wa Error:', error)
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function bulkSendWhatsapp(guests: { phone: string, full_name: string, invitation_code: string }[], eventName: string, baseUrl: string) {
  const results = []
  
  for (const guest of guests) {
    if (!guest.phone) continue
    
    const inviteLink = `${baseUrl}/invite/${guest.invitation_code}`
    const message = `Halo *${guest.full_name}*,\n\nKami mengundang Anda untuk hadir di acara *${eventName}*.\n\nSilakan akses undangan digital Anda pada tautan di bawah ini:\n${inviteLink}\n\nSampai jumpa di lokasi!`
    
    const res = await sendWhatsapp({ phone: guest.phone, message })
    results.push({ guest: guest.full_name, ...res })
    
    // Optional: add a small delay to avoid rate limiting if needed, though async_send_message is designed for speed
    // await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}
