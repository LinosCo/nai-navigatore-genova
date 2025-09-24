import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpidUser {
  codice_fiscale: string
  nome: string
  cognome: string
  email?: string
  data_nascita?: string
  livello_autenticazione: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { spidAssertion, returnUrl } = await req.json()

    // Verifica e parse dell'assertion SAML SPID
    const spidUser = await validateSpidAssertion(spidAssertion)
    
    if (!spidUser) {
      throw new Error('Invalid SPID assertion')
    }

    // Crea o aggiorna utente in Supabase
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('codice_fiscale', spidUser.codice_fiscale)
      .single()

    let userId: string

    if (existingUser) {
      // Aggiorna utente esistente
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          email: spidUser.email,
          ultimo_accesso_spid: new Date().toISOString(),
          livello_autenticazione_spid: spidUser.livello_autenticazione
        })
        .eq('codice_fiscale', spidUser.codice_fiscale)

      if (updateError) throw updateError
      userId = existingUser.id
    } else {
      // Crea nuovo utente
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: spidUser.email || `${spidUser.codice_fiscale}@spid.local`,
        email_confirm: true,
        user_metadata: {
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          codice_fiscale: spidUser.codice_fiscale,
          provider: 'spid',
          livello_autenticazione: spidUser.livello_autenticazione
        }
      })

      if (createError) throw createError
      userId = newUser.user!.id

      // Crea profilo
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          codice_fiscale: spidUser.codice_fiscale,
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          email: spidUser.email,
          provider_autenticazione: 'spid',
          livello_autenticazione_spid: spidUser.livello_autenticazione
        })

      if (profileError) throw profileError
    }

    // Genera JWT token per l'utente
    const { data: session, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: spidUser.email || `${spidUser.codice_fiscale}@spid.local`,
      options: {
        redirectTo: returnUrl
      }
    })

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify({
        success: true,
        accessToken: session.properties?.action_link,
        user: {
          id: userId,
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          codice_fiscale: spidUser.codice_fiscale,
          livello_autenticazione: spidUser.livello_autenticazione
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('SPID Auth Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function validateSpidAssertion(assertion: string): Promise<SpidUser | null> {
  // Implementazione validazione SAML assertion SPID
  // Questo richiede librerie SAML specifiche per validare:
  // - Firma digitale
  // - Timestamp
  // - Audience
  // - Attributi utente
  
  try {
    // Pseudo-code per validazione SAML
    const decodedAssertion = await parseSamlAssertion(assertion)
    const isValid = await validateSamlSignature(decodedAssertion)
    
    if (!isValid) {
      throw new Error('Invalid SAML signature')
    }

    return extractUserAttributes(decodedAssertion)
  } catch (error) {
    console.error('SAML validation error:', error)
    return null
  }
}

function extractUserAttributes(assertion: any): SpidUser {
  // Estrae attributi standard SPID dall'assertion
  return {
    codice_fiscale: assertion.attributes.fiscalNumber,
    nome: assertion.attributes.name,
    cognome: assertion.attributes.familyName,
    email: assertion.attributes.email,
    data_nascita: assertion.attributes.dateOfBirth,
    livello_autenticazione: assertion.attributes.spidLevel
  }
}

function parseSamlAssertion(assertion: string) {
  // Parse XML SAML assertion
  // Implementazione specifica per SPID
}

function validateSamlSignature(assertion: any) {
  // Valida firma digitale con certificati SPID
  // Implementazione specifica per SPID
}