import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://neiptest.linos.co'; // URL dell'applicazione frontend

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendReminderEmail(email: string, firstName: string, initiative: any) {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .event-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B35; margin: 20px 0; }
        .info-row { display: flex; margin: 10px 0; }
        .icon { font-size: 20px; margin-right: 10px; }
        .button { display: inline-block; background: #FF6B35; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Promemoria Evento NEIP</h1>
        </div>
        <div class="content">
          <p>Ciao <strong>${firstName}</strong>,</p>
          <p>Ti ricordiamo che tra <strong>24 ore</strong> inizierà questa iniziativa:</p>

          <div class="event-card">
            <h2>${initiative.title}</h2>
            <div class="info-row">
              <span class="icon">📅</span>
              <span><strong>${new Date(initiative.start_date).toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</strong></span>
            </div>
            <div class="info-row">
              <span class="icon">📍</span>
              <span>${initiative.location || 'Online'}</span>
            </div>
            ${initiative.organizer_name ? `
            <div class="info-row">
              <span class="icon">👤</span>
              <span>Organizzatore: ${initiative.organizer_name}</span>
            </div>
            ` : ''}
            ${initiative.contact_email ? `
            <div class="info-row">
              <span class="icon">📧</span>
              <span><a href="mailto:${initiative.contact_email}">${initiative.contact_email}</a></span>
            </div>
            ` : ''}
            ${initiative.description ? `
            <div style="margin-top: 15px;">
              <p>${initiative.description}</p>
            </div>
            ` : ''}
          </div>

          <p style="text-align: center;">
            <a href="${APP_URL}/calendario" class="button">
              Vedi Dettagli Completi
            </a>
          </p>

          <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            💡 <strong>Suggerimento:</strong> Aggiungi questo evento al tuo calendario personale per non dimenticartelo!
          </p>

        </div>
        <div class="footer">
          <p>Questa email è stata inviata automaticamente da NEIP Platform.</p>
          <p><a href="${APP_URL}/impostazioni-notifiche">Gestisci preferenze email</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NEIP Platform <noreply@neip.app>',
        to: [email],
        subject: `⏰ Promemoria: ${initiative.title} - Domani!`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${await response.text()}`);
    }

    return await response.json();
  } else {
    console.log('RESEND_API_KEY not set, email sending skipped');
    return { success: true, message: 'Email skipped (dev mode)' };
  }
}

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get events starting in 24 hours (+/- 1 hour window for cron tolerance)
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: upcomingInitiatives, error: initError } = await supabase
      .from('initiatives')
      .select('id, title, description, location, start_date, organizer_name, contact_email, user_id')
      .gte('start_date', in23Hours.toISOString())
      .lte('start_date', in25Hours.toISOString())
      .eq('status', 'published');

    if (initError) throw initError;

    const results = [];

    for (const initiative of upcomingInitiatives || []) {
      // Get creator's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, notification_preferences')
        .eq('id', initiative.user_id)
        .single();

      if (!profile) continue;

      // Check if user has event reminders enabled
      const prefs = profile.notification_preferences as any;
      if (!prefs?.email_event_reminders) continue;

      // Send reminder
      const emailResult = await sendReminderEmail(
        profile.email,
        profile.first_name || 'Utente',
        initiative
      );

      // Create in-app notification
      await supabase
        .from('notifications')
        .insert({
          user_id: initiative.user_id,
          type: 'event_reminder',
          title: `Promemoria: ${initiative.title}`,
          message: `La tua iniziativa inizia domani alle ${new Date(initiative.start_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
          link: `/calendario`,
        });

      results.push({
        initiative: initiative.title,
        email: profile.email,
        sent: true,
        result: emailResult
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
