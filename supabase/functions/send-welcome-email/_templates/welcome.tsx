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

interface WelcomeEmailProps {
  name?: string;
  appUrl: string;
}

export const WelcomeEmail = ({ name, appUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Benvenuto su NEIP - Scopri iniziative nella tua zona</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Benvenuto{name ? ` ${name}` : ''}!</Heading>
        <Text style={subtitle}>Grazie per esserti registrato su NEIP</Text>
        
        <Text style={text}>
          Siamo felici di averti con noi! NEIP è la piattaforma per scoprire e partecipare a iniziative nella tua zona.
        </Text>
        
        <Section style={featuresSection}>
          <Heading style={h2}>Cosa puoi fare con NEIP:</Heading>
          <Text style={featureItem}>📍 Scopri attività ed eventi nella tua zona</Text>
          <Text style={featureItem}>🗺️ Visualizza le iniziative su mappa interattiva</Text>
          <Text style={featureItem}>🔔 Ricevi notifiche per nuove iniziative</Text>
          <Text style={featureItem}>✨ Crea e condividi le tue iniziative</Text>
          <Text style={featureItem}>🤝 Connettiti con la tua comunità</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={appUrl} style={button}>
            Inizia ad esplorare
          </Link>
        </Section>
        
        <Text style={text}>
          Se hai domande o hai bisogno di assistenza, non esitare a contattarci.
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

export default WelcomeEmail

// Stili - Designer Italia Design System
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
  color: '#0066CC', // Blu Italia (primary)
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
}

const subtitle = {
  color: '#5C6F82', // Grigio Italia
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0 0 30px 0',
}

const h2 = {
  color: '#17324D', // Foreground
  fontSize: '18px',
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

const featuresSection = {
  backgroundColor: '#E6F0FF', // Primary light
  padding: '20px',
  borderRadius: '4px',
  margin: '20px 0',
}

const featureItem = {
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
  backgroundColor: '#0066CC', // Blu Italia
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
