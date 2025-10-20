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

interface ActivityConfirmationEmailProps {
  name?: string;
  activityTitle: string;
  location: string;
  date: string;
  time: string;
  activityUrl: string;
}

export const ActivityConfirmationEmail = ({ 
  name, 
  activityTitle, 
  location, 
  date,
  time,
  activityUrl
}: ActivityConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Conferma iscrizione: {activityTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Iscrizione Confermata!</Heading>
        <Text style={subtitle}>Ci vediamo all'evento</Text>
        
        <Text style={text}>
          Ciao{name ? ` ${name}` : ''},
        </Text>
        
        <Text style={text}>
          La tua iscrizione all'iniziativa è stata confermata con successo!
        </Text>
        
        <Section style={confirmationCard}>
          <Heading style={h2}>{activityTitle}</Heading>
          <Text style={detailItem}>📍 <strong>Dove:</strong> {location}</Text>
          <Text style={detailItem}>📅 <strong>Quando:</strong> {date}</Text>
          <Text style={detailItem}>🕐 <strong>Orario:</strong> {time}</Text>
        </Section>
        
        <Section style={infoBox}>
          <Text style={infoText}>
            💡 <strong>Cosa portare:</strong> Porta un documento d'identità e arriva 10 minuti prima dell'inizio.
          </Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={activityUrl} style={button}>
            Visualizza Dettagli
          </Link>
        </Section>
        
        <Text style={text}>
          Riceverai un promemoria 24 ore prima dell'evento.
        </Text>
        
        <Text style={text}>
          Se hai domande o necessiti di ulteriori informazioni, non esitare a contattarci.
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

export default ActivityConfirmationEmail

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

const confirmationCard = {
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

const infoBox = {
  backgroundColor: '#FFF8E6',
  padding: '16px',
  borderRadius: '4px',
  margin: '20px 0',
  borderLeft: '4px solid #FFB800',
}

const infoText = {
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
