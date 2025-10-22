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

interface Activity {
  title: string;
  type: string;
  location: string;
  date: string;
  url: string;
}

interface WeeklyDigestEmailProps {
  name?: string;
  activities: Activity[];
  weekStart: string;
  weekEnd: string;
  appUrl: string;
}

export const WeeklyDigestEmail = ({ 
  name, 
  activities,
  weekStart,
  weekEnd,
  appUrl 
}: WeeklyDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>Il tuo riepilogo settimanale NEIP - {activities.length} nuove iniziative</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📊 Riepilogo Settimanale</Heading>
        <Text style={subtitle}>{weekStart} - {weekEnd}</Text>
        
        <Text style={text}>
          Ciao{name ? ` ${name}` : ''},
        </Text>
        
        <Text style={text}>
          Ecco le {activities.length} nuove iniziative pubblicate questa settimana nella tua zona:
        </Text>
        
        {activities.map((activity, index) => (
          <Section key={index} style={activityCard}>
            <Heading style={h2}>{activity.title}</Heading>
            <Text style={activityDetail}>📌 {activity.type}</Text>
            <Text style={activityDetail}>📍 {activity.location}</Text>
            <Text style={activityDetail}>📅 {activity.date}</Text>
            <Link href={activity.url} style={cardLink}>
              Scopri di più →
            </Link>
          </Section>
        ))}
        
        <Section style={buttonContainer}>
          <Link href={`${appUrl}/activities`} style={button}>
            Vedi Tutte le Iniziative
          </Link>
        </Section>
        
        <Section style={statsBox}>
          <Text style={statsText}>
            📈 <strong>Questa settimana:</strong> {activities.length} nuove iniziative pubblicate
          </Text>
        </Section>
        
        <Text style={text}>
          Non vuoi più ricevere il riepilogo settimanale? Puoi modificare le tue preferenze nelle{' '}
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

export default WeeklyDigestEmail

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
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '0',
  marginBottom: '12px',
}

const text = {
  color: '#17324D',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0',
}

const activityCard = {
  backgroundColor: '#F8F9FA',
  padding: '20px',
  borderRadius: '4px',
  margin: '16px 0',
  borderLeft: '3px solid #0066CC',
}

const activityDetail = {
  color: '#5C6F82',
  fontSize: '13px',
  margin: '6px 0',
  lineHeight: '1.5',
}

const cardLink = {
  color: '#0066CC',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '12px',
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

const statsBox = {
  backgroundColor: '#E6F0FF',
  padding: '16px',
  borderRadius: '4px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const statsText = {
  color: '#17324D',
  fontSize: '14px',
  margin: '0',
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
