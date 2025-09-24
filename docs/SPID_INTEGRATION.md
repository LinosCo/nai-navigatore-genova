# Guida Integrazione SPID

## 📋 Requisiti e Setup

### 1. Registrazione come Service Provider SPID

**Per l'ambiente di test:**
1. Accedi a [spid-testenv2](https://github.com/italia/spid-testenv2)
2. Configura il tuo Service Provider di test
3. Genera i certificati necessari per la firma SAML

**Per l'ambiente di produzione:**
1. Richiedi accredito come Service Provider presso AgID
2. Segui le [Linee Guida Tecniche SPID](https://docs.italia.it/italia/spid/spid-regole-tecniche/)
3. Ottieni certificati qualificati per firma e TLS

### 2. Configurazione Environment Variables

Aggiungi i seguenti secrets in Supabase:

```bash
# SPID Configuration
SPID_ENTITY_ID=https://your-domain.com/metadata
SPID_PRIVATE_KEY=your_private_key_pem
SPID_CERTIFICATE=your_certificate_pem
SPID_IDP_METADATA_URL=https://registry.spid.gov.it/metadata/idp/spid-entities-idps.xml

# Environment
SPID_ENVIRONMENT=test  # o "production"
SPID_SERVICE_NAME=NEIP - Piattaforma Educativa
```

### 3. Implementazione Service Provider

L'edge function `spid-auth` gestisce:
- Validazione assertion SAML
- Verifica firma digitale
- Estrazione attributi utente
- Creazione/aggiornamento profilo Supabase

### 4. Configurazione Frontend

Il componente Auth include:
- Pulsante "Entra con SPID" prominente
- Gestione callback SAML Response
- Fallback email/password per utenti non PA

## 🛠️ Setup Tecnico Dettagliato

### 1. Metadata Service Provider

Crea endpoint `/spid/metadata` che ritorna:

```xml
<?xml version="1.0"?>
<md:EntityDescriptor entityID="https://your-domain.com/metadata" 
                     xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate><!-- YOUR CERTIFICATE --></ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    
    <md:AssertionConsumerService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
        Location="https://your-domain.com/auth?spid=callback" 
        index="0" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

### 2. Librerie SAML Consigliate

Per l'implementazione completa, integra librerie SAML:

```typescript
// In edge function - esempio con saml2-js
import * as saml2 from 'saml2-js';

const sp = new saml2.ServiceProvider({
  entity_id: Deno.env.get('SPID_ENTITY_ID'),
  private_key: Deno.env.get('SPID_PRIVATE_KEY'),
  certificate: Deno.env.get('SPID_CERTIFICATE'),
  assert_endpoint: 'https://your-domain.com/auth?spid=callback'
});
```

### 3. Configurazione Identity Providers

SPID supporta múltipli IdP. Configura per tutti i provider ufficiali:

```typescript
const SPID_IDP_LIST = [
  'https://loginspid.aruba.it',
  'https://identity.sieltecloud.it', 
  'https://spid.intesa.it',
  'https://id.tim.it/identity',
  'https://login.eid.gov.it',
  // ... altri provider SPID
];
```

## 🔐 Sicurezza e Compliance

### 1. Validazione Assertion SAML

```typescript
async function validateSpidAssertion(assertion: string) {
  // 1. Parse XML assertion
  const samlDoc = parseXML(assertion);
  
  // 2. Verifica firma digitale
  if (!await verifySignature(samlDoc)) {
    throw new Error('Invalid SAML signature');
  }
  
  // 3. Verifica timestamp e validità
  if (!isValidTimeframe(samlDoc)) {
    throw new Error('SAML assertion expired');
  }
  
  // 4. Verifica audience restriction
  if (!isValidAudience(samlDoc)) {
    throw new Error('Invalid audience');
  }
  
  // 5. Estrai attributi utente
  return extractUserAttributes(samlDoc);
}
```

### 2. Attributi SPID Standard

Gli attributi disponibili variano per livello SPID:

```typescript
interface SpidAttributes {
  // Livello 1
  fiscalNumber: string;          // Codice fiscale (obbligatorio)
  name: string;                  // Nome (obbligatorio)
  familyName: string;            // Cognome (obbligatorio)
  
  // Livello 2+
  email?: string;                // Email
  dateOfBirth?: string;          // Data di nascita
  placeOfBirth?: string;         // Luogo di nascita
  gender?: string;               // Sesso
  companyName?: string;          // Ragione sociale
  registeredOffice?: string;     // Sede legale
  fiscalNumberCompany?: string;  // P.IVA
  ivaCode?: string;              // Codice IVA
}
```

### 3. Log e Audit per Compliance

```sql
-- Esempio query per audit log SPID
SELECT 
  sal.timestamp,
  sal.codice_fiscale,
  sal.livello_autenticazione,
  sal.identity_provider,
  sal.ip_address,
  p.nome,
  p.cognome
FROM spid_access_logs sal
JOIN profiles p ON sal.user_id = p.id
WHERE sal.timestamp >= NOW() - INTERVAL '30 days'
ORDER BY sal.timestamp DESC;
```

## 🚀 Deploy e Configurazione

### 1. Checklist Pre-Produzione

- [ ] Certificati SSL/TLS configurati
- [ ] Metadata SP pubblicato e accessibile
- [ ] Edge function SPID testata con test IdP
- [ ] Log audit configurati
- [ ] Backup e disaster recovery testati
- [ ] Conformità GDPR verificata

### 2. Monitoraggio

Implementa monitoraggio per:
- Tempi di risposta SAML
- Errori di validazione
- Tentativi di accesso falliti
- Utilizzo per Identity Provider

### 3. Supporto Multi-Tenant

Per riuso in altri enti:

```typescript
// Configurazione per ente
interface EnteConfig {
  entityId: string;
  spidServiceName: string;
  organizationName: string;
  contactPerson: {
    email: string;
    phone: string;
  };
}
```

## 📚 Risorse Aggiuntive

- [Documentazione Tecnica SPID](https://docs.italia.it/italia/spid/)
- [SDK SPID per Node.js](https://github.com/italia/spid-nodejs)
- [Validators SPID](https://www.spid.gov.it/validator/)
- [Test SPID](https://demo.spid.gov.it/)

## ⚠️ Note Importanti

1. **Ambiente Test**: Usa solo IdP di test durante sviluppo
2. **Certificati**: Rinnova certificati prima della scadenza
3. **Metadata**: Mantieni metadata SP aggiornato
4. **Logging**: Conserva log per requisiti di audit
5. **Privacy**: Implementa data retention policy GDPR

---

**Status Implementazione:**
- ✅ Database schema SPID-ready
- ✅ Edge function base structure
- ✅ Frontend UI con SPID button
- ⏳ Integrazione librerie SAML
- ⏳ Configurazione IdP test
- ⏳ Testing e validazione