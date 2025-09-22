import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, activityType, targetAge, location, url } = await req.json();

    if (!prompt && !url) {
      throw new Error('Prompt o URL è richiesto');
    }

    console.log('Generating content card for:', { prompt, activityType, targetAge, location, url });

    let contentToAnalyze = prompt;

    // Se è stato fornito un URL, estrai il contenuto
    if (url) {
      try {
        console.log('Fetching content from URL:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Impossibile accedere all\'URL fornito');
        }
        const html = await response.text();
        
        // Estrai testo dalla pagina HTML (versione semplificata)
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        contentToAnalyze = textContent.substring(0, 2000); // Limita la lunghezza
        console.log('Extracted content length:', contentToAnalyze.length);
      } catch (error) {
        console.error('Error fetching URL content:', error);
        throw new Error('Errore nel recupero del contenuto dall\'URL');
      }
    }

    const systemPrompt = `Sei un assistente esperto nell'educazione interculturale per la piattaforma NEIP di Genova. 
    Crea schede dettagliate per attività educative rivolte a studenti NAI (Nuovi Arrivati in Italia).
    
    Genera una risposta in formato JSON con questa struttura:
    {
      "title": "Titolo attività",
      "description": "Descrizione dettagliata dell'attività (100-150 parole)",
      "location": "Luogo specifico a Genova",
      "date": "Data suggerita nel formato DD/MM/YYYY",
      "participants": "Numero partecipanti suggerito",
      "contact": "Contatto di riferimento",
      "type": "l2|cultura|social|sport",
      "organization": "Nome organizzazione"
    }
    
    Considera sempre:
    - Attività appropriate per studenti NAI
    - Luoghi reali a Genova
    - Obiettivi di integrazione e apprendimento linguistico
    - Accessibilità e inclusività`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
        { 
            role: 'user', 
            content: url 
              ? `Analizza questo contenuto web e crea una scheda attività educativa per studenti NAI: ${contentToAnalyze}. 
                 Tipo attività: ${activityType || 'ricava dal contenuto'}. 
                 Età target: ${targetAge || 'ricava dal contenuto'}. 
                 Area Genova: ${location || 'centro città'}.`
              : `Crea una scheda per: ${prompt}. 
                 Tipo attività: ${activityType || 'non specificato'}. 
                 Età target: ${targetAge || 'non specificata'}. 
                 Area Genova: ${location || 'centro città'}.` 
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Errore nella generazione del contenuto');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Try to parse as JSON, fallback to structured text
    let contentCard;
    try {
      contentCard = JSON.parse(generatedContent);
    } catch (e) {
      // If not valid JSON, create a structured response
      contentCard = {
        title: "Attività Generata",
        description: generatedContent,
        location: location || "Genova",
        date: new Date().toLocaleDateString('it-IT'),
        participants: "10-15 studenti",
        contact: "info@neip.genova.it",
        type: activityType || "cultura",
        organization: "NEIP Genova"
      };
    }

    return new Response(JSON.stringify({ contentCard }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-card function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});