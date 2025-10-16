import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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

    const emailResponse = await resend.emails.send({
      from: "NEIP <onboarding@resend.dev>", // Cambia con il tuo dominio verificato
      to: [email],
      subject: "Benvenuto su NEIP!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #2563eb;
                margin: 0 0 10px 0;
                font-size: 28px;
              }
              .content {
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 500;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
              .features {
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .features ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .features li {
                margin: 8px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Benvenuto${name ? ` ${name}` : ''}!</h1>
                <p style="color: #6b7280; font-size: 16px;">Grazie per esserti registrato su NEIP</p>
              </div>
              
              <div class="content">
                <p>Siamo felici di averti con noi! NEIP è la piattaforma per scoprire e partecipare a iniziative nella tua zona.</p>
                
                <div class="features">
                  <h2 style="margin-top: 0; font-size: 18px;">Cosa puoi fare con NEIP:</h2>
                  <ul>
                    <li>📍 Scopri attività ed eventi nella tua zona</li>
                    <li>🗺️ Visualizza le iniziative su mappa interattiva</li>
                    <li>🔔 Ricevi notifiche per nuove iniziative</li>
                    <li>✨ Crea e condividi le tue iniziative</li>
                    <li>🤝 Connettiti con la tua comunità</li>
                  </ul>
                </div>
                
                <p style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://neiptest.linos.co'}" class="button">
                    Inizia ad esplorare
                  </a>
                </p>
                
                <p>Se hai domande o hai bisogno di assistenza, non esitare a contattarci.</p>
              </div>
              
              <div class="footer">
                <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                <p style="margin-top: 10px;">
                  © ${new Date().getFullYear()} NEIP. Tutti i diritti riservati.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
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
