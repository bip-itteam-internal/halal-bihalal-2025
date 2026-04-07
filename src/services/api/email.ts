import nodemailer from 'nodemailer'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: any[]
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: SendEmailParams) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    return {
      success: false,
      message: 'Email credentials (EMAIL_USER, EMAIL_PASS) not configured',
    }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Bharata Group" <${user}>`,
      to,
      subject,
      html,
      attachments,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Nodemailer Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
