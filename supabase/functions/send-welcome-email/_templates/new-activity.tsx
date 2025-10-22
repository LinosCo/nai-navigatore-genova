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

interface NewActivityEmailProps {
  name?: string;
  activityTitle: string;
  activityType: string;
  location: string;
  date: string;
  activityUrl: string;
  appUrl: string;
}

export const NewActivityEmail = ({ 
  name, 
  activityTitle, 
  activityType, 
  location, 
  date,
  activityUrl,
  appUrl 
}: NewActivityEmailProps) => (
  <Html>
    <Head />
    <Preview>Nuova iniziativa nella tua zona: {activityTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎯 Nuova Iniziativa!</Heading>
        <Text style={subtitle}>C'è una nuova attività nella tua zona</Text>
        
        <Text style={text}>
          Ciao{name ? ` ${name}` : ''},
        </Text>
        
        <Text style={text}>
          È stata pubblicata una nuova iniziativa che potrebbe interessarti:
        </Text>
        
        <Section style={activityCard}>
          <Heading style={h2}>{activityTitle}</Heading>
          <Text style={activityDetail}>📌 Tipo: {activityType}</Text>
          <Text style={activityDetail}>📍 Luogo: {location}</Text>
          <Text style={activityDetail}>📅 Data: {date}</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={activityUrl} style={button}>
            Scopri di più
          </Link>
        </Section>
        
        <Text style={text}>
          Vuoi disattivare le notifiche? Puoi gestire le tue preferenze nelle{' '}
          <Link href={`${appUrl}/notification-settings`} style={link}>
            impostazioni
          </Link>.
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

export default NewActivityEmail

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
  marginBottom: '16px',
}

const text = {
  color: '#17324D',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0',
}

const activityCard = {
  backgroundColor: '#E6F0FF',
  padding: '24px',
  borderRadius: '4px',
  margin: '20px 0',
  borderLeft: '4px solid #0066CC',
}

const activityDetail = {
  color: '#17324D',
  fontSize: '14px',
  margin: '8px 0',
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

const link = {
  color: '#0066CC',
  textDecoration: 'underline',
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
