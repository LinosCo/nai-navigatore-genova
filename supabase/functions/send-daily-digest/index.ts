import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY'); // Optional: use Resend for better email delivery
const APP_URL = Deno.env.get('APP_URL') || 'https://nai-navigatore-genova-8vw3-jn86ykaff-linoscos-projects.vercel.app'; // URL dell'applicazione frontend

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface DigestData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  newInitiatives: any[];
  upcomingEvents: any[];
  unreadNotifications: number;
}

async function sendDigestEmail(data: DigestData) {
  const { email, firstName, newInitiatives, upcomingEvents, unreadNotifications } = data;

  // HTML Email Template
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066CC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .section { background: white; margin: 15px 0; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .initiative { border-left: 3px solid #0066CC; padding-left: 10px; margin: 10px 0; }
        .button { display: inline-block; background: #0066CC; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 Il Tuo Riepilogo Giornaliero NEIP</h1>
        </div>
        <div class="content">
          <p>Ciao <strong>${firstName}</strong>,</p>
          <p>Ecco cosa c'è di nuovo oggi sulla piattaforma NEIP:</p>

          ${unreadNotifications > 0 ? `
          <div class="section">
            <h3>🔔 Notifiche Non Lette</h3>
            <p>Hai <strong>${unreadNotifications}</strong> notifiche non lette.</p>
            <a href="${APP_URL}/notifiche" class="button">
              Visualizza Notifiche
            </a>
          </div>
          ` : ''}

          ${newInitiatives.length > 0 ? `
          <div class="section">
            <h3>✨ Nuove Iniziative (${newInitiatives.length})</h3>
            ${newInitiatives.map(init => `
              <div class="initiative">
                <h4>${init.title}</h4>
                <p>${init.description?.substring(0, 150)}...</p>
                <p><small>📍 ${init.location || 'Online'} | 📅 ${new Date(init.start_date).toLocaleDateString('it-IT')}</small></p>
              </div>
            `).join('')}
            <a href="${APP_URL}/" class="button">
              Esplora Tutte
            </a>
          </div>
          ` : ''}

          ${upcomingEvents.length > 0 ? `
          <div class="section">
            <h3>📅 Eventi Imminenti (${upcomingEvents.length})</h3>
            ${upcomingEvents.map(event => `
              <div class="initiative">
                <h4>${event.title}</h4>
                <p><strong>${new Date(event.start_date).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}</strong></p>
                <p>📍 ${event.location || 'Online'}</p>
              </div>
            `).join('')}
            <a href="${APP_URL}/calendario" class="button">
              Vedi Calendario
            </a>
          </div>
          ` : ''}

          ${newInitiatives.length === 0 && upcomingEvents.length === 0 && unreadNotifications === 0 ? `
          <div class="section">
            <p>📭 Nessuna novità oggi. Controlla domani!</p>
          </div>
          ` : ''}

        </div>
        <div class="footer">
          <p>Questa email è stata inviata automaticamente da NEIP Platform.</p>
          <p><a href="${APP_URL}/impostazioni-notifiche">Gestisci preferenze email</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Use Resend API if available, otherwise use Supabase built-in (which uses Resend internally)
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
        subject: `📬 Il Tuo Riepilogo Giornaliero NEIP - ${new Date().toLocaleDateString('it-IT')}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${await response.text()}`);
    }

    return await response.json();
  } else {
    // Fallback to Supabase Auth email (limited functionality)
    console.log('RESEND_API_KEY not set, email sending skipped in development');
    console.log('Email would be sent to:', email);
    return { success: true, message: 'Email skipped (dev mode)' };
  }
}

serve(async (req) => {
  try {
    // Verify this is a scheduled job (cron) or authorized request
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all users with daily digest enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, notification_preferences')
      .not('notification_preferences->email_daily_digest', 'is', null);

    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      // Check if user has daily digest enabled
      const prefs = user.notification_preferences as any;
      if (!prefs?.email_daily_digest) continue;

      // Get new initiatives from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: newInitiatives } = await supabase
        .from('initiatives')
        .select('title, description, location, start_date')
        .gte('created_at', yesterday)
        .eq('status', 'published')
        .limit(5);

      // Get upcoming events in next 7 days
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: upcomingEvents } = await supabase
        .from('initiatives')
        .select('title, location, start_date')
        .gte('start_date', new Date().toISOString())
        .lte('start_date', nextWeek)
        .eq('status', 'published')
        .limit(5);

      // Get unread notifications count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      // Send email only if there's content
      if ((newInitiatives?.length || 0) > 0 ||
          (upcomingEvents?.length || 0) > 0 ||
          (unreadCount || 0) > 0) {

        const emailResult = await sendDigestEmail({
          userId: user.id,
          email: user.email,
          firstName: user.first_name || 'Utente',
          lastName: user.last_name || '',
          newInitiatives: newInitiatives || [],
          upcomingEvents: upcomingEvents || [],
          unreadNotifications: unreadCount || 0,
        });

        results.push({
          email: user.email,
          sent: true,
          result: emailResult
        });
      } else {
        results.push({
          email: user.email,
          sent: false,
          reason: 'No content'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        sent: results.filter(r => r.sent).length,
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
