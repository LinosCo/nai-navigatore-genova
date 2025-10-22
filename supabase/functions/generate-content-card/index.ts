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
    Crei schede dettagliate per attività educative rivolte a studenti NAI (Nuovi Arrivati in Italia).
    
    COMPORTAMENTO DIVERSO PER URL vs PROMPT:
    - Se analizzi un URL: mantieni la descrizione originale dell'evento e aggiungi analisi benefici separata
    - Se generi da prompt: crea descrizione completa personalizzata per NAI
    
    CLASSIFICAZIONE RIGOROSA DEI TIPI:
    - "l2": Corsi di lingua italiana, laboratori linguistici, supporto didattico linguistico
    - "cultura": Eventi culturali, visite musei, laboratori artistici, attività di scoperta del territorio
    - "social": Supporto sociale, orientamento servizi, mediazione culturale, supporto famiglie
    - "sport": Attività sportive, ricreative, motorie, giochi di squadra
    
    Genera una risposta in formato JSON con questa struttura ESATTA:
    {
      "title": "Titolo dell'attività (se da URL: mantieni originale, se da prompt: crea per NAI)",
      "description": "Se da URL: descrizione originale dell'evento SENZA modifiche. Se da prompt: descrizione completa per studenti NAI (180-250 parole)",
      "nai_benefits": "SEMPRE presente: Analisi specifica dei benefici per studenti NAI (120-150 parole). Spiega come questa attività supporta integrazione linguistica, sociale e culturale degli studenti stranieri. Includi aspetti pedagogici e sociali specifici.",
      "location": "Nome specifico del luogo e indirizzo completo a Genova",
      "address": "Indirizzo completo e verificabile per geolocalizzazione precisa",
      "date": "Data e orario nel formato 'DD/MM/YYYY - HH:MM' o descrizione periodo",
      "participants": "Numero specifico o range realistico",
      "contact": "Contatto reale con email istituzionale o telefono verificabile",
      "type": "l2|cultura|social|sport",
      "organization": "Nome completo dell'organizzazione o ente responsabile",
      "latitude": numero decimale preciso per Genova,
      "longitude": numero decimale preciso per Genova
    }
    
    REQUISITI CRITICI PER LA CLASSIFICAZIONE:
    - TYPE: DEVE essere esattamente uno dei 4 valori: "l2", "cultura", "social", "sport"
    - Analizza attentamente il contenuto per scegliere il tipo più appropriato
    - Se hai dubbi, usa questa priorità: lingua italiana = l2, eventi culturali = cultura, supporto/orientamento = social, attività motorie = sport
    - DESCRIPTION: Se da URL = testo originale pulito senza HTML. Se da prompt = descrizione completa per NAI
    - NAI_BENEFITS: Sempre presente, analisi educativa specifica per target NAI
    - LOCATION: Nome luogo + indirizzo completo separati da virgola  
    - COORDINATES: Sempre coordinate GPS reali e verificate di Genova
    
    ANALISI BENEFICI NAI - Considera sempre:
    - Opportunità di pratica linguistica italiana in contesto reale
    - Interazione sociale con coetanei italiani e altri studenti stranieri
    - Apprendimento culturale attraverso attività pratiche
    - Sviluppo di competenze sociali e comunicative
    - Supporto all'autostima e all'identità multiculturale
    - Facilitazione del processo di integrazione nel tessuto sociale
    
    Luoghi verificati di Genova con coordinate GPS precise:
    - Centro Interculturale: 44.4076, 8.9343 (Via Garibaldi area)
    - Biblioteca Berio: 44.4055, 8.9251 (Via del Seminario)
    - Palazzo Ducale: 44.4082, 8.9320 (Piazza Matteotti)
    - Scuole Sampierdarena: 44.4200, 8.8950 (area quartiere)
    - Centro Civico Maddalena: 44.4150, 8.9180 (zona centro storico)`;

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
              ? `Analizza questo contenuto web e crea una scheda attività. IMPORTANTE: mantieni la descrizione originale dell'evento e aggiungi un'analisi separata dei benefici per studenti NAI: ${contentToAnalyze}. 
                 Tipo attività: ${activityType || 'ricava dal contenuto'}. 
                 Età target: ${targetAge || 'ricava dal contenuto'}. 
                 Area Genova: ${location || 'centro città'}.`
              : `Crea una scheda completa per studenti NAI: ${prompt}. 
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
      
      
      // Validazione e pulizia del tipo
      if (contentCard.type && !['l2', 'cultura', 'social', 'sport'].includes(contentCard.type)) {
        console.log(`Invalid type detected: ${contentCard.type}, defaulting to 'cultura'`);
        contentCard.type = 'cultura';
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
      
      // Assicurati che nai_benefits esista sempre
      if (!contentCard.nai_benefits) {
        contentCard.nai_benefits = "Questa attività offre opportunità di integrazione sociale e linguistica per studenti NAI attraverso l'interazione con coetanei e l'apprendimento di competenze utili in un ambiente inclusivo.";
      }
      
    } catch (e) {
      console.error('JSON parsing error:', e);
      // If not valid JSON, create a structured response
      contentCard = {
        title: "Attività Generata",
        description: generatedContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        nai_benefits: "Questa attività offre opportunità di integrazione sociale e linguistica per studenti NAI attraverso l'interazione con coetanei italiani e l'apprendimento di competenze pratiche in un ambiente inclusivo.",
        location: location || "Genova Centro",
        address: location || "Genova Centro",
        date: new Date().toLocaleDateString('it-IT'),
        participants: "10-15 studenti",
        contact: "info@neip.genova.it",
        type: (activityType && ['l2', 'cultura', 'social', 'sport'].includes(activityType)) ? activityType : "cultura",
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