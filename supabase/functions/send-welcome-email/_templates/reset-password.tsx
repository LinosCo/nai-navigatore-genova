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

interface ResetPasswordEmailProps {
  name?: string;
  resetLink: string;
}

export const ResetPasswordEmail = ({ name, resetLink }: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reimposta la tua password su NEIP</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔐 Recupero Password</Heading>
        <Text style={subtitle}>Richiesta di reimpostazione password</Text>
        
        <Text style={text}>
          Ciao{name ? ` ${name}` : ''},
        </Text>
        
        <Text style={text}>
          Abbiamo ricevuto una richiesta per reimpostare la password del tuo account NEIP.
        </Text>
        
        <Text style={text}>
          Clicca sul pulsante qui sotto per creare una nuova password:
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={resetLink} style={button}>
            Reimposta Password
          </Link>
        </Section>
        
        <Text style={warningText}>
          ⚠️ Questo link è valido per 24 ore e può essere utilizzato una sola volta.
        </Text>
        
        <Text style={text}>
          Se non hai richiesto il recupero della password, ignora questa email. 
          La tua password rimarrà invariata.
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            Per motivi di sicurezza, non condividere mai questo link con nessuno.
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} NEIP. Tutti i diritti riservati.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordEmail

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

const text = {
  color: '#17324D',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0',
}

const warningText = {
  color: '#D9364F',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#FFF0F0',
  borderRadius: '4px',
  borderLeft: '4px solid #D9364F',
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
