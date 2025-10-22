import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { WelcomeEmail } from './_templates/welcome.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    // Renderizza il template React Email
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        name,
        appUrl: 'https://neiptest.linos.co',
      })
    );

    // Genera anche la versione plain text
    const plainText = `
Benvenuto${name ? ` ${name}` : ''}!

Grazie per esserti registrato su NEIP

Siamo felici di averti con noi! NEIP è la piattaforma per scoprire e partecipare a iniziative nella tua zona.

Cosa puoi fare con NEIP:

- Scopri attività ed eventi nella tua zona
- Visualizza le iniziative su mappa interattiva
- Ricevi notifiche per nuove iniziative
- Crea e condividi le tue iniziative
- Connettiti con la tua comunità

Inizia ad esplorare: ${appUrl}

Se hai domande o hai bisogno di assistenza, non esitare a contattarci.

---
Questo è un messaggio automatico, per favore non rispondere a questa email.
© ${new Date().getFullYear()} NEIP. Tutti i diritti riservati.
`;

    const emailResponse = await resend.emails.send({
      from: "NEIP <noreply@neiptest.linos.co>",
      to: [email],
      subject: "Benvenuto su NEIP - Inizia a scoprire la tua comunità",
      html,
      text: plainText,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
