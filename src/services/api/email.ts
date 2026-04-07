import { Resend } from 'resend'
import nodemailer from 'nodemailer'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  provider?: 'resend' | 'gmail'
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  provider = 'resend',
}: SendEmailParams) {
  // --- PROVIDER: RESEND ---
  if (provider === 'resend') {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        message: 'Resend API Key (RESEND_API_KEY) not configured',
      }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Bharata Group <noreply@bharatainternasional.com>',
        to,
        subject,
        html,
      })

      if (error) {
        console.error('Resend Error:', error)
        return { success: false, message: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Unexpected Resend Error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // --- PROVIDER: GMAIL ---
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        success: false,
        message: 'Gmail credentials (EMAIL_USER / EMAIL_PASS) not configured',
      }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"Bharata Group" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Nodemailer Gmail Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown Gmail error',
    }
  }
}
