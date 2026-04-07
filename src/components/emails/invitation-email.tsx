import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface InvitationEmailProps {
  guestName: string
  invitationCode?: string
  eventName?: string
  eventDate?: string
  eventTime?: string
  location?: string
}

export const InvitationEmail = ({ guestName }: InvitationEmailProps) => {
  const loginLink = `https://bit.ly/HALALBIHALALBHARATAGROUP2026`
  const displayDate = 'Rabu, 8 April 2026'
  const displayLocation = 'Lap. Parkir PT. Bharata Internasional Pharmaceutical'

  return (
    <Html>
      <Head />
      <Preview>
        UNDANGAN HALAL BIHALAL BHARATA GROUP & SPESIAL KONSER 2026
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>BHARATA GROUP</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>
              Yth. <strong>{guestName}</strong>
            </Text>

            <Heading style={subHeading}>
              UNDANGAN HALAL BIHALAL BHARATA GROUP & <br />
              SPESIAL KONSER 2026
            </Heading>

            <Text style={paragraph}>
              Kepada seluruh keluarga besar <strong>Bharata Group</strong>,
            </Text>

            <Text style={paragraph}>
              Dengan penuh rasa syukur dan kebersamaan, kami mengundang
              Bapak/Ibu serta seluruh tim untuk hadir dalam acara
              <strong>
                {' '}
                Halal Bihalal Keluarga Besar Bharata Group 2026 dan Spesial
                Konser Charly Setia Band
              </strong>{' '}
              sebagai momentum untuk mempererat silaturahmi, saling memaafkan,
              dan memperkuat sinergi dalam kebersamaan.
            </Text>

            <Section style={infoSection}>
              <div style={infoItem}>
                <Text style={infoLabel}>HARI / TANGGAL</Text>
                <Text style={infoValue}>{displayDate}</Text>
              </div>
              <div style={infoItem}>
                <Text style={infoLabel}>WAKTU</Text>
                <Text style={infoValue}>
                  Halal Bihalal (08.00 - Selesai)
                  <br />
                  Spesial Konser (18.30 - Selesai)
                </Text>
              </div>
              <div style={infoItem}>
                <Text style={infoLabel}>TEMPAT</Text>
                <Text style={infoValue}>{displayLocation}</Text>
              </div>
              <div style={infoItem}>
                <Text style={infoLabel}>TEMA</Text>
                <Text style={infoValue}>Grow Together</Text>
              </div>
            </Section>

            <Section style={buttonContainer}>
              <Link href={loginLink} style={button}>
                BUKA UNDANGAN DIGITAL
              </Link>
            </Section>

            <Text style={paragraph}>
              Kami berharap Bapak/Ibu dapat berkenan hadir untuk bersama-sama
              merajut kebersamaan, memperkuat sinergi, dan melangkah bersama
              mencapai tujuan perusahaan.
            </Text>

            <Text style={paragraph}>
              Demikian undangan ini kami sampaikan. Atas perhatian dan
              kehadirannya kami ucapkan terima kasih.
            </Text>

            <Section style={noteSection}>
              <Text style={noteText}>
                <strong>Noted</strong> : Jika ada kendala bisa hubungi
                089676258026 (FARIZ)
              </Text>
              <Text style={noteText}>
                <em>
                  (Mohon untuk tidak membalas pesan ini karena dikirim otomatis
                  oleh sistem)
                </em>
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Regards,
              <br />
              <strong>Panitia Silaturahmi & Halal Bihalal 2026</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  maxWidth: '600px',
  overflow: 'hidden',
}

const header = {
  padding: '40px 0',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
}

const heading = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: '900',
  letterSpacing: '3px',
  margin: '0',
}

const content = {
  padding: '40px 50px',
}

const greeting = {
  fontSize: '18px',
  lineHeight: '26px',
  color: '#334155',
  marginBottom: '24px',
}

const subHeading = {
  fontSize: '15px',
  fontWeight: '800',
  textAlign: 'center' as const,
  color: '#0f172a',
  margin: '10px 0 30px',
  letterSpacing: '0.5px',
  lineHeight: '1.5',
  textTransform: 'uppercase' as const,
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#475569',
  marginBottom: '20px',
}

const infoSection = {
  backgroundColor: '#f8fafc',
  padding: '30px',
  borderRadius: '12px',
  marginBottom: '35px',
  border: '1px solid #e2e8f0',
}

const infoItem = {
  marginBottom: '20px',
}

const infoLabel = {
  fontSize: '11px',
  color: '#64748b',
  fontWeight: '800',
  letterSpacing: '1.5px',
  margin: '0 0 4px',
}

const infoValue = {
  fontSize: '14px',
  color: '#1e293b',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.6',
}

const hr = {
  borderColor: '#f1f5f9',
  margin: '30px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '10px 0 35px',
}

const button = {
  backgroundColor: '#d97706',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textDecoration: 'none',
  padding: '18px 40px',
  display: 'inline-block',
  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)',
}

const noteSection = {
  marginTop: '10px',
}

const noteText = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 5px',
}

const footer = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
}
