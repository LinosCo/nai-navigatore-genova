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
        
        // Estrazione più avanzata del contenuto
        let textContent = html
          // Rimuovi script, style e altri elementi non necessari
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')
          .replace(/<!--[\s\S]*?-->/g, '')
          // Sostituisci alcuni tag con spazi per preservare la separazione
          .replace(/<\/?(div|p|br|section|article|header|footer|nav|main)[^>]*>/gi, ' ')
          // Rimuovi tutti gli altri tag HTML
          .replace(/<[^>]*>/g, ' ')
          // Pulisci gli spazi multipli e i caratteri speciali
          .replace(/&[a-zA-Z0-9#]+;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Estrai anche il titolo della pagina se presente
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        
        if (pageTitle) {
          textContent = `Titolo pagina: ${pageTitle}\n\n${textContent}`;
        }
        
        contentToAnalyze = textContent.substring(0, 3000); // Aumenta il limite per più contesto
        console.log('Extracted content length:', contentToAnalyze.length);
        console.log('Page title extracted:', pageTitle);
      } catch (error) {
        console.error('Error fetching URL content:', error);
        throw new Error('Errore nel recupero del contenuto dall\'URL');
      }
    }

    const systemPrompt = `Sei un assistente AI specializzato nell'educazione interculturale per la piattaforma NEIP di Genova. 
    Crei schede dettagliate per attività educative rivolte a studenti NAI (Nuovi Arrivati in Italia) con focus su integrazione e apprendimento linguistico.
    
    PERSONALIZZAZIONI SPECIFICHE:
    - Enfatizza attività pratiche e interattive per l'apprendimento dell'italiano
    - Privilegia iniziative che favoriscono l'integrazione culturale e sociale
    - Considera le specifiche esigenze di famiglie migranti e studenti stranieri
    - Includi sempre elementi di supporto psicologico e sociale quando appropriato
    
    Genera una risposta in formato JSON con questa struttura ESATTA:
    {
      "title": "Titolo coinvolgente e specifico dell'attività (max 80 caratteri)",
      "description": "Descrizione dettagliata in testo pulito senza HTML (180-250 parole). Specifica obiettivi educativi, metodologia didattica innovativa, benefici concreti per l'integrazione sociale e linguistica. Includi modalità di supporto per famiglie e studenti con difficoltà.",
      "location": "Nome specifico del luogo e indirizzo completo a Genova (es: 'Centro Interculturale, Via del Mare 3, Genova')",
      "address": "Indirizzo completo e verificabile per geolocalizzazione precisa",
      "date": "Data e orario nel formato 'DD/MM/YYYY - HH:MM' o descrizione periodo (es: 'Ogni lunedì 15:00-17:00 dal 01/10/2024')",
      "participants": "Numero specifico o range realistico (es: '8-12 studenti NAI' o 'Max 15 famiglie')",
      "contact": "Contatto reale con email istituzionale o telefono verificabile",
      "type": "l2|cultura|social|sport",
      "organization": "Nome completo dell'organizzazione o ente responsabile",
      "latitude": numero decimale preciso per Genova (verifica coordinate reali),
      "longitude": numero decimale preciso per Genova (verifica coordinate reali)
    }
    
    REQUISITI TECNICI CRITICI:
    - DESCRIPTION: Solo testo pulito, NO HTML, NO markdown, NO caratteri speciali
    - LOCATION: Nome luogo + indirizzo completo separati da virgola
    - ADDRESS: Indirizzo completo per geolocalizzazione Google Maps
    - COORDINATES: Sempre coordinate GPS reali e verificate di Genova
    - TYPE: Deve essere uno dei 4 valori: l2, cultura, social, sport
    - CONTACT: Email formato corretto o telefono italiano valido
    
    REQUISITI EDUCATIVI:
    - Attività sempre appropriate per studenti NAI di diverse età
    - Obiettivi chiari di integrazione linguistica e culturale
    - Metodologie didattiche inclusive e multiculturali
    - Considerazione delle difficoltà specifiche di apprendimento L2
    - Supporto per famiglie e studenti con background migratorio
    
    Luoghi verificati di Genova con coordinate GPS precise:
    - Centro Interculturale: 44.4076, 8.9343 (Via Garibaldi area)
    - Biblioteca Berio: 44.4055, 8.9251 (Via del Seminario)
    - Palazzo Ducale: 44.4082, 8.9320 (Piazza Matteotti)
    - Scuole Sampierdarena: 44.4200, 8.8950 (area quartiere)
    - Centro Civico Maddalena: 44.4150, 8.9180 (zona centro storico)
    - Palazzo Rosso: 44.4076, 8.9343 (Musei di Strada Nuova)`;

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

    // Parsing più robusto del JSON
    let contentCard;
    try {
      // Estrai il JSON dal contenuto generato
      let jsonString = generatedContent;
      
      // Se c'è il wrapper ```json, estrailo
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      // Pulisci la stringa prima del parsing
      jsonString = jsonString
        .trim()
        .replace(/^\s*```json\s*/g, '')
        .replace(/\s*```\s*$/g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      contentCard = JSON.parse(jsonString);
      
      // Pulisci la descrizione da HTML e formattala meglio
      if (contentCard.description) {
        contentCard.description = contentCard.description
          .replace(/<[^>]*>/g, '') // Rimuovi tag HTML
          .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Rimuovi entità HTML
          .replace(/\s+/g, ' ') // Rimuovi spazi multipli
          .trim();
      }
      
      // Assicurati che le coordinate siano numeri
      if (contentCard.latitude && typeof contentCard.latitude === 'string') {
        contentCard.latitude = parseFloat(contentCard.latitude);
      }
      if (contentCard.longitude && typeof contentCard.longitude === 'string') {
        contentCard.longitude = parseFloat(contentCard.longitude);
      }
      
      // Se non c'è address, usa location
      if (!contentCard.address && contentCard.location) {
        contentCard.address = contentCard.location;
      }
      
    } catch (e) {
      console.error('JSON parsing error:', e);
      // If not valid JSON, create a structured response
      contentCard = {
        title: "Attività Generata",
        description: generatedContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        location: location || "Genova Centro",
        address: location || "Genova Centro",
        date: new Date().toLocaleDateString('it-IT'),
        participants: "10-15 studenti",
        contact: "info@neip.genova.it",
        type: activityType || "cultura",
        organization: "NEIP Genova",
        latitude: 44.4063,
        longitude: 8.9241
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