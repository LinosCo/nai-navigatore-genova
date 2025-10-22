import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EventReminderEmailProps {
  name?: string;
  activityTitle: string;
  location: string;
  date: string;
  time: string;
  address?: string;
  activityUrl: string;
  hoursUntil: number;
}

export const EventReminderEmail = ({ 
  name, 
  activityTitle, 
  location, 
  date,
  time,
  address,
  activityUrl,
  hoursUntil
}: EventReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Promemoria: {activityTitle} tra {hoursUntil} ore</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⏰ Promemoria Evento</Heading>
        <Text style={subtitle}>Il tuo evento inizia tra {hoursUntil} ore</Text>
        
        <Text style={text}>
          Ciao{name ? ` ${name}` : ''},
        </Text>
        
        <Text style={text}>
          Questo è un promemoria per l'iniziativa a cui ti sei iscritto:
        </Text>
        
        <Section style={reminderCard}>
          <Heading style={h2}>{activityTitle}</Heading>
          <Text style={detailItem}>📅 <strong>Data:</strong> {date}</Text>
          <Text style={detailItem}>🕐 <strong>Orario:</strong> {time}</Text>
          <Text style={detailItem}>📍 <strong>Luogo:</strong> {location}</Text>
          {address && (
            <Text style={detailItem}>🗺️ <strong>Indirizzo:</strong> {address}</Text>
          )}
        </Section>
        
        <Section style={tipsBox}>
          <Text style={tipsTitle}>📝 Consigli per l'evento:</Text>
          <Text style={tipItem}>✓ Arriva 10 minuti prima</Text>
          <Text style={tipItem}>✓ Porta un documento d'identità</Text>
          <Text style={tipItem}>✓ Controlla il meteo e vestiti adeguatamente</Text>
          <Text style={tipItem}>✓ Porta con te questa conferma</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={activityUrl} style={button}>
            Visualizza Dettagli Completi
          </Link>
        </Section>
        
        <Section style={urgentBox}>
          <Text style={urgentText}>
            ⚠️ Se non puoi più partecipare, ti preghiamo di disdire la tua iscrizione 
            per lasciare il posto ad altri interessati.
          </Text>
        </Section>
        
        <Text style={text}>
          Ci vediamo all'evento!
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            Questo è un messaggio automatico, per favore non rispondere a questa email.
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} NEIP. Tutti i diritti riservati.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EventReminderEmail

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Titillium Web, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  padding: '40px',
  margin: '0 auto',
  maxWidth: '600px',
  boxShadow: '0 1px 3px 0 rgba(220, 228, 237, 0.4)',
}

const h1 = {
  color: '#0066CC',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
}

const subtitle = {
  color: '#5C6F82',
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0 0 30px 0',
}

const h2 = {
  color: '#17324D',
  fontSize: '20px',
  fontWeight: '600',
  marginTop: '0',
  marginBottom: '20px',
  textAlign: 'center' as const,
}

const text = {
  color: '#17324D',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0',
}

const reminderCard = {
  backgroundColor: '#E6F0FF',
  padding: '24px',
  borderRadius: '4px',
  margin: '20px 0',
  borderLeft: '4px solid #0066CC',
}

const detailItem = {
  color: '#17324D',
  fontSize: '14px',
  margin: '12px 0',
  lineHeight: '1.6',
}

const tipsBox = {
  backgroundColor: '#F0F7FF',
  padding: '20px',
  borderRadius: '4px',
  margin: '20px 0',
}

const tipsTitle = {
  color: '#17324D',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const tipItem = {
  color: '#17324D',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '1.6',
}

const urgentBox = {
  backgroundColor: '#FFF8E6',
  padding: '16px',
  borderRadius: '4px',
  margin: '20px 0',
  borderLeft: '4px solid #FFB800',
}

const urgentText = {
  color: '#17324D',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.6',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#0066CC',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #DFE4E8',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#5C6F82',
  fontSize: '14px',
  margin: '10px 0',
}
