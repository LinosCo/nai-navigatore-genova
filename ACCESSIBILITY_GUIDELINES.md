# ♿ Linee Guida Accessibilità NEIP Platform

## WCAG 2.1 Level AA Compliance

Questo documento contiene le linee guida per mantenere la piattaforma NEIP accessibile secondo gli standard **WCAG 2.1 Level AA**.

---

## 📋 Checklist Implementazioni

### ✅ Implementato

- [x] **Focus visibile** - Tutti gli elementi interattivi hanno un focus indicator chiaro (3px outline)
- [x] **Skip links** - Link "Salta al contenuto" per navigazione rapida da tastiera
- [x] **Supporto RTL** - Layout right-to-left per arabo
- [x] **Reduced motion** - Rispetto preferenze `prefers-reduced-motion`
- [x] **High contrast** - Supporto per modalità alto contrasto
- [x] **Screen reader** - Classi `.sr-only` per contenuti accessibili solo a screen reader
- [x] **Touch targets** - Dimensione minima 44x44px per elementi interattivi
- [x] **Form errors** - Stati di errore chiari con `aria-invalid`
- [x] **Text spacing** - Line height 1.5, letter spacing ottimizzato
- [x] **Color contrast** - Link sottolineati, disabilitati chiari

### ⏳ Da Completare Manualmente

- [ ] **ARIA labels** - Aggiungere `aria-label` a tutti i pulsanti icon-only
- [ ] **Landmark roles** - Verificare che header, nav, main, footer abbiano i ruoli corretti
- [ ] **Heading hierarchy** - Assicurare h1 > h2 > h3 senza salti
- [ ] **Alt text** - Verificare che tutte le immagini abbiano alt text appropriato
- [ ] **Live regions** - Usare `aria-live` per contenuti dinamici
- [ ] **Tabindex** - Evitare `tabindex > 0`, usare solo -1 o 0
- [ ] **Language tags** - Aggiungere `lang="it"` o `lang="en"` nei punti chiave

---

## 🎯 Principi WCAG

### 1. Perceivable (Percepibile)

#### 1.1 Text Alternatives
- **Regola**: Tutte le immagini devono avere `alt` text
- **Come**: `<img src="..." alt="Descrizione dettagliata" />`
- **Decorative**: `<img src="..." alt="" role="presentation" />`

#### 1.3 Adaptable
- **Semantic HTML**: Usa `<button>` invece di `<div onClick>`
- **Headings**: Mantieni gerarchia h1 → h2 → h3
- **Lists**: Usa `<ul>`, `<ol>` per liste

#### 1.4 Distinguishable

**Contrasto Colori** (WCAG 1.4.3):
- Testo normale: rapporto **4.5:1**
- Testo grande (18px+ o 14px bold): rapporto **3:1**

**Tool per verificare**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

Esempi NEIP:
- ✅ Blu primario (#0066CC) su bianco: 8.59:1
- ✅ Grigio testo (#2D3748) su bianco: 12.63:1
- ⚠️ Verificare tutti i badge e label personalizzati

### 2. Operable (Operabile)

#### 2.1 Keyboard Accessible
```tsx
// ✅ CORRETTO - Accessibile da tastiera
<button onClick={handleClick}>
  Clicca qui
</button>

// ❌ SBAGLIATO - Non accessibile
<div onClick={handleClick}>
  Clicca qui
</div>

// ✅ ACCETTABILE - Con attributi ARIA
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Clicca qui
</div>
```

#### 2.4 Navigable

**Skip Links** (già implementato):
```tsx
<SkipLinks />
// Genera:
// - Salta al contenuto principale (#main-content)
// - Salta alla navigazione (#main-navigation)
// - Salta alla ricerca (#search)
```

**Page Titles**:
```tsx
// Ogni pagina deve avere un title univoco
<Helmet>
  <title>Dashboard Docenti - NEIP Platform</title>
</Helmet>
```

#### 2.5 Input Modalities

**Touch Targets** (WCAG 2.5.5):
- Dimensione minima: **44x44 pixel**
- Già applicato globalmente via CSS

### 3. Understandable (Comprensibile)

#### 3.1 Readable

**Language Tag**:
```tsx
// Già implementato tramite i18n
<html lang={i18n.language}> // 'it', 'en', 'fr', 'ar'
```

**Content Changes**:
```tsx
// Per contenuti multilingua nella stessa pagina
<span lang="en">Hello</span>
<span lang="ar">مرحبا</span>
```

#### 3.2 Predictable

**Consistent Navigation**: La Navigation è sempre in cima
**Consistent Identification**: Icone e label coerenti in tutta l'app

#### 3.3 Input Assistance

**Form Validation**:
```tsx
// ✅ CORRETTO
<input
  type="email"
  aria-invalid={error ? "true" : "false"}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <span id="email-error" role="alert">
    Email non valida
  </span>
)}

// Required fields
<label className="required">
  Email *
</label>
```

### 4. Robust (Robusto)

#### 4.1 Compatible

**Valid HTML**: Usa semantic HTML5
**ARIA Usage**: Usa ARIA solo quando necessario

---

## 🛠️ Tools per Testing

### Automated Testing

1. **axe DevTools** (Browser Extension)
   - Chrome/Firefox
   - [Download](https://www.deque.com/axe/devtools/)

2. **Lighthouse** (Built-in Chrome)
   - Apri DevTools → Lighthouse → Accessibility

3. **WAVE** (Browser Extension)
   - [Download](https://wave.webaim.org/extension/)

### Manual Testing

1. **Keyboard Navigation**
   - Prova a navigare con `Tab`, `Shift+Tab`, `Enter`, `Esc`
   - Verifica focus visibile su tutti gli elementi

2. **Screen Reader**
   - **Windows**: NVDA (free) o JAWS
   - **macOS**: VoiceOver (Command+F5)
   - **Mobile**: TalkBack (Android), VoiceOver (iOS)

3. **Zoom Text**
   - Aumenta il testo al 200% (Ctrl/Cmd + +)
   - Verifica che nulla si sovrapponga

4. **Color Blind Simulation**
   - Chrome DevTools → Rendering → Emulate vision deficiencies

---

## 📝 Esempi Pratici

### Button con Icon-Only

```tsx
// ❌ SBAGLIATO - No label per screen reader
<Button>
  <Bell />
</Button>

// ✅ CORRETTO
<Button aria-label="Notifiche">
  <Bell />
  <span className="sr-only">Notifiche</span>
</Button>
```

### Dialog/Modal

```tsx
// ✅ CORRETTO
<Dialog
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Conferma Eliminazione</h2>
  <p id="dialog-description">
    Sei sicuro di voler eliminare questo elemento?
  </p>
</Dialog>
```

### Form Input

```tsx
// ✅ CORRETTO
<div>
  <Label htmlFor="email" className="required">
    Email
  </Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={error ? "true" : "false"}
    aria-describedby="email-help email-error"
  />
  <span id="email-help" className="text-sm text-muted-foreground">
    Inserisci la tua email
  </span>
  {error && (
    <span id="email-error" role="alert" className="error-message">
      {error}
    </span>
  )}
</div>
```

### Loading States

```tsx
// ✅ CORRETTO
<div role="status" aria-live="polite" aria-busy="true">
  <Loader className="animate-spin" />
  <span className="sr-only">Caricamento in corso...</span>
</div>
```

### Dynamic Content Updates

```tsx
// ✅ CORRETTO - Notifica screen reader di cambiamenti
<div aria-live="polite" aria-atomic="true">
  {count} nuove notifiche
</div>

// Per aggiornamenti urgenti
<div aria-live="assertive" role="alert">
  Errore: Salvataggio fallito!
</div>
```

---

## 🎨 Palette Colori Accessibile

### Colori Primari (già verificati)

| Colore | Hex | Uso | Contrasto su Bianco | Contrasto su Nero |
|--------|-----|-----|-------------------|------------------|
| Blu Italia | `#0066CC` | Primary | 8.59:1 ✅ | 2.44:1 ❌ |
| Grigio Scuro | `#2D3748` | Text | 12.63:1 ✅ | 1.66:1 ❌ |
| Verde Italia | `#008758` | Success | 4.91:1 ✅ | 4.28:1 ✅ |
| Rosso | `#DC2626` | Error | 5.48:1 ✅ | 3.83:1 ✅ |

### Combinazioni NON Accessibili da Evitare

- ❌ Giallo chiaro (#FFEB3B) su bianco: 1.09:1
- ❌ Grigio chiaro (#E0E0E0) su bianco: 1.45:1
- ❌ Verde lime (#CDDC39) su bianco: 1.49:1

---

## 🚀 Best Practices

### 1. Semantic HTML First

```tsx
// ✅ PREFERITO
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ EVITARE
<div className="nav">
  <div className="list">
    <div className="item" onClick={...}>Home</div>
  </div>
</div>
```

### 2. ARIA Solo Quando Necessario

```tsx
// ✅ CORRETTO - Semantic HTML, no ARIA needed
<button onClick={save}>Salva</button>

// ⚠️ ACCETTABILE - ARIA necessario per custom component
<div role="button" tabIndex={0} onClick={save}>
  Salva
</div>
```

### 3. Focus Management

```tsx
// Gestisci focus dopo azioni
const handleDelete = async () => {
  await deleteItem();
  // Sposta focus al prossimo elemento o indietro
  nextElementRef.current?.focus();
};
```

### 4. Loading States

```tsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <Loader className="animate-spin mr-2" />
      <span>Caricamento...</span>
    </>
  ) : (
    'Invia'
  )}
</Button>
```

---

## 📚 Risorse

### Documentazione

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows - Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- VoiceOver (macOS/iOS - Built-in)
- TalkBack (Android - Built-in)

---

## ✅ Checklist Pre-Deploy

Prima di ogni deploy, verifica:

- [ ] Tutti i pulsanti hanno label (visibile o `aria-label`)
- [ ] Tutte le immagini hanno `alt` text
- [ ] Modals hanno focus trap e `role="dialog"`
- [ ] Form errors hanno `aria-invalid` e `role="alert"`
- [ ] Navigazione completa da tastiera funziona
- [ ] Focus visibile su tutti gli elementi
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] axe DevTools senza errori critici
- [ ] Testato con screen reader (almeno VoiceOver)
- [ ] Testato zoom al 200%
- [ ] Testato con `prefers-reduced-motion`

---

**Ultima revisione**: 23 Ottobre 2025
**Versione WCAG**: 2.1 Level AA
**Platform**: NEIP - Navigatore Educativo per l'Inclusione e la Partecipazione
