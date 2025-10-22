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

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check rate limiting
    const isBlocked = await checkRateLimit(supabaseClient, clientIP);
    if (isBlocked) {
      await logSecurityEvent(supabaseClient, 'spid_rate_limit_exceeded', clientIP, {
        ip: clientIP,
        userAgent,
        severity: 'warning'
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many authentication attempts. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { spidAssertion, returnUrl } = await req.json()

    // Input validation
    if (!spidAssertion || typeof spidAssertion !== 'string') {
      await recordFailedAttempt(supabaseClient, clientIP);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request: missing SPID assertion' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize assertion to prevent XXE and injection attacks
    const sanitizedAssertion = sanitizeXmlInput(spidAssertion);

    console.log('SPID authentication request received from IP:', clientIP);

    // Enhanced SPID assertion validation
    const spidUser = await validateSpidAssertion(sanitizedAssertion)
    
    if (!spidUser) {
      await recordFailedAttempt(supabaseClient, clientIP);
      await logSecurityEvent(supabaseClient, 'spid_invalid_assertion', clientIP, {
        ip: clientIP,
        userAgent,
        severity: 'warning'
      });
      
      console.error('Invalid SPID assertion from IP:', clientIP);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid SPID assertion' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('SPID user validated:', spidUser.codice_fiscale);

    // Log successful SPID access
    await logSpidAccess(supabaseClient, spidUser, clientIP, userAgent);

    // Check for existing user
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('codice_fiscale', spidUser.codice_fiscale)
      .maybeSingle()

    // Check if user is disabled
    if (existingUser && !existingUser.enabled) {
      await logSecurityEvent(supabaseClient, 'spid_disabled_user_attempt', spidUser.codice_fiscale, {
        ip: clientIP,
        userAgent,
        codice_fiscale: spidUser.codice_fiscale,
        severity: 'warning'
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Account disabled' 
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let userId: string

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          email: spidUser.email,
          ultimo_accesso_spid: new Date().toISOString(),
          livello_autenticazione_spid: spidUser.livello_autenticazione,
          provider_autenticazione: 'spid',
          dati_spid: spidUser,
          updated_at: new Date().toISOString()
        })
        .eq('codice_fiscale', spidUser.codice_fiscale)

      if (updateError) throw updateError
      userId = existingUser.id
    } else {
      // Create new user
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

      // Create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          codice_fiscale: spidUser.codice_fiscale,
          nome: spidUser.nome,
          cognome: spidUser.cognome,
          email: spidUser.email,
          provider_autenticazione: 'spid',
          livello_autenticazione_spid: spidUser.livello_autenticazione,
          dati_spid: spidUser
        })

      if (profileError) throw profileError
    }

    // Generate authentication token
    const { data: session, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: spidUser.email || `${spidUser.codice_fiscale}@spid.local`,
      options: {
        redirectTo: returnUrl
      }
    })

    if (sessionError) throw sessionError

    // Log successful authentication
    await logSecurityEvent(supabaseClient, 'spid_auth_success', spidUser.codice_fiscale, {
      ip: clientIP,
      userAgent,
      codice_fiscale: spidUser.codice_fiscale,
      livello_autenticazione: spidUser.livello_autenticazione,
      severity: 'info'
    });

    console.log('SPID authentication successful for user:', userId);

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
    
    // Log critical error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await logSecurityEvent(supabaseClient, 'spid_auth_error', null, {
        ip: clientIP,
        userAgent,
        error: error.message,
        severity: 'critical'
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication failed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function validateSpidAssertion(assertion: string): Promise<SpidUser | null> {
  try {
    // Enhanced SAML assertion validation
    const parsedAssertion = await parseSamlAssertion(assertion)
    
    // Validate assertion structure
    if (!parsedAssertion || !parsedAssertion.attributes) {
      console.error('Invalid SAML assertion structure');
      return null;
    }
    
    // Validate timestamp (check for replay attacks)
    if (!validateTimestamp(parsedAssertion)) {
      console.error('SAML assertion timestamp validation failed');
      return null;
    }
    
    // Validate digital signature
    const isValid = await validateSamlSignature(parsedAssertion)
    if (!isValid) {
      console.error('SAML signature validation failed');
      return null;
    }
    
    // Validate issuer (must be a trusted SPID IdP)
    if (!validateIssuer(parsedAssertion)) {
      console.error('SAML issuer validation failed');
      return null;
    }

    return extractUserAttributes(parsedAssertion)
  } catch (error) {
    console.error('SAML validation error:', error)
    return null
  }
}

function extractUserAttributes(assertion: any): SpidUser {
  // Extract and validate user attributes from the parsed SAML assertion
  const attributes = assertion.attributes;
  
  // Validate required attributes
  if (!attributes.fiscalNumber || !attributes.name || !attributes.familyName) {
    throw new Error('Missing required SPID attributes');
  }
  
  // Validate codice fiscale format
  if (!validateCodiceFiscale(attributes.fiscalNumber)) {
    throw new Error('Invalid codice fiscale format');
  }
  
  return {
    codice_fiscale: sanitizeString(attributes.fiscalNumber),
    nome: sanitizeString(attributes.name),
    cognome: sanitizeString(attributes.familyName),
    email: attributes.email ? sanitizeString(attributes.email) : undefined,
    data_nascita: attributes.dateOfBirth ? sanitizeString(attributes.dateOfBirth) : undefined,
    livello_autenticazione: attributes.spidLevel || 'SpidL2'
  }
}

// Enhanced security functions
function sanitizeXmlInput(xml: string): string {
  // Remove potential XXE attack vectors and excessive content
  if (xml.length > 100000) { // Limit size to prevent DoS
    throw new Error('SAML assertion too large');
  }
  
  // Remove dangerous XML entities and DTD declarations
  return xml
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!ENTITY[^>]*>/gi, '')
    .replace(/&[a-zA-Z][a-zA-Z0-9]*;/g, '')
    .trim();
}

function sanitizeString(input: string): string {
  // Basic string sanitization
  return input.replace(/[<>'"&]/g, '').trim().substring(0, 255);
}

function validateCodiceFiscale(cf: string): boolean {
  // Basic Italian tax code validation
  const cfRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return cfRegex.test(cf);
}

function validateTimestamp(assertion: any): boolean {
  // Check NotBefore and NotOnOrAfter conditions
  const now = new Date();
  const notBefore = assertion.conditions?.notBefore ? new Date(assertion.conditions.notBefore) : null;
  const notOnOrAfter = assertion.conditions?.notOnOrAfter ? new Date(assertion.conditions.notOnOrAfter) : null;
  
  if (notBefore && now < notBefore) {
    return false;
  }
  
  if (notOnOrAfter && now >= notOnOrAfter) {
    return false;
  }
  
  // Check assertion age (prevent replay attacks)
  const maxAge = 5 * 60 * 1000; // 5 minutes
  const assertionTime = assertion.issueInstant ? new Date(assertion.issueInstant) : null;
  if (assertionTime && (now.getTime() - assertionTime.getTime()) > maxAge) {
    return false;
  }
  
  return true;
}

function validateIssuer(assertion: any): boolean {
  // List of trusted SPID Identity Providers
  const trustedIssuers = [
    'https://identity.infocert.it',
    'https://id.lepida.it',
    'https://spid.intesigroup.com',
    'https://identity.sieltecloud.it',
    'https://spid.aruba.it',
    'https://identity.tim.it',
    'https://id.namirial.com',
    'https://spid.posteid.it'
  ];
  
  const issuer = assertion.issuer;
  return issuer && trustedIssuers.includes(issuer);
}

async function parseSamlAssertion(assertion: string): Promise<any> {
  // Enhanced XML parsing with security considerations
  try {
    // Basic XML structure validation
    if (!assertion.includes('<saml:Assertion') && !assertion.includes('<Assertion')) {
      throw new Error('Invalid SAML assertion format');
    }
    
    // TODO: Implement proper XML parsing using a secure XML parser
    // For now, return a mock structure for development
    // In production, use a library like 'xml2js' with XXE protection
    
    return {
      issuer: 'https://identity.test.it',
      issueInstant: new Date().toISOString(),
      conditions: {
        notBefore: new Date(Date.now() - 60000).toISOString(),
        notOnOrAfter: new Date(Date.now() + 300000).toISOString()
      },
      attributes: {
        fiscalNumber: 'RSSMRA80A01H501U', // Mock data for development
        name: 'MARIO',
        familyName: 'ROSSI',
        email: 'mario.rossi@example.com',
        spidLevel: 'SpidL2'
      }
    };
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error('Failed to parse SAML assertion');
  }
}

async function validateSamlSignature(assertion: any): Promise<boolean> {
  // TODO: Implement proper SAML signature validation
  // This should verify the digital signature against trusted SPID certificates
  // For now, return true for development
  
  try {
    // In production, implement:
    // 1. Extract signature from assertion
    // 2. Verify against trusted SPID IdP certificates
    // 3. Validate certificate chain
    // 4. Check certificate revocation status
    
    console.log('SAML signature validation (development mode)');
    return true;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

// Rate limiting functions
async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  try {
    const { data: rateLimit } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();
    
    if (!rateLimit) {
      return false; // No rate limit record, allow request
    }
    
    // Check if currently blocked
    if (rateLimit.blocked_until && new Date() < new Date(rateLimit.blocked_until)) {
      return true; // Still blocked
    }
    
    // Check if within rate limit window
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);
    if (new Date(rateLimit.first_attempt) > windowStart) {
      // Within window, check attempt count
      if (rateLimit.attempt_count >= MAX_ATTEMPTS) {
        // Block for duration
        await supabase
          .from('auth_rate_limits')
          .update({
            blocked_until: new Date(Date.now() + BLOCK_DURATION).toISOString()
          })
          .eq('identifier', identifier);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Allow request on error
  }
}

async function recordFailedAttempt(supabase: any, identifier: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();
    
    if (existing) {
      // Update existing record
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);
      const isWithinWindow = new Date(existing.first_attempt) > windowStart;
      
      await supabase
        .from('auth_rate_limits')
        .update({
          attempt_count: isWithinWindow ? existing.attempt_count + 1 : 1,
          first_attempt: isWithinWindow ? existing.first_attempt : new Date().toISOString(),
          last_attempt: new Date().toISOString()
        })
        .eq('identifier', identifier);
    } else {
      // Create new record
      await supabase
        .from('auth_rate_limits')
        .insert({
          identifier,
          attempt_count: 1,
          first_attempt: new Date().toISOString(),
          last_attempt: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Failed to record attempt:', error);
  }
}

async function logSecurityEvent(supabase: any, eventType: string, targetResource: string | null, details: any): Promise<void> {
  try {
    await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        target_resource: targetResource,
        details,
        severity: details.severity || 'info'
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

async function logSpidAccess(supabase: any, spidUser: SpidUser, ip: string, userAgent: string): Promise<void> {
  try {
    await supabase
      .from('spid_access_logs')
      .insert({
        codice_fiscale: spidUser.codice_fiscale,
        identity_provider: 'mock-idp', // Extract from actual assertion
        livello_autenticazione: spidUser.livello_autenticazione,
        ip_address: ip,
        user_agent: userAgent,
        session_id: crypto.randomUUID()
      });
  } catch (error) {
    console.error('Failed to log SPID access:', error);
  }
}