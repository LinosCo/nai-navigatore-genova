# 🌍 Stato Internazionalizzazione (i18n)

## ✅ Implementato

L'internazionalizzazione è stata implementata con successo utilizzando `i18next` e `react-i18next`.

### Lingue Supportate

- 🇮🇹 **Italiano** (default) - Completo
- 🇬🇧 **Inglese** - Traduzioni parziali
- 🇫🇷 **Francese** - Traduzioni parziali
- 🇸🇦 **Arabo** - Traduzioni parziali + supporto RTL

### Componenti Tradotti

Attualmente solo i seguenti componenti utilizzano le traduzioni:

1. **Navigation** (`src/components/Navigation.tsx`)
   - Menu items
   - Profilo dropdown
   - Login/Logout

### Come Funziona

Il sistema i18n è configurato per:
- ✅ Auto-detect lingua del browser
- ✅ Salvare preferenza in localStorage
- ✅ Normalizzare codici lingua (es. `en-US` → `en`)
- ✅ Fallback automatico a italiano
- ✅ Supporto RTL per arabo

## ⚠️ Comportamento Attuale

### Cosa Succede Cambiando Lingua

Quando si cambia lingua tramite il **LanguageSwitcher** (icona globo 🌐 nella navigation):

1. **Componenti tradotti** (Navigation) → Cambiano lingua immediatamente ✅
2. **Componenti NON tradotti** (resto dell'app) → Rimangono in italiano ✅

**Questo è il comportamento corretto e intenzionale.**

### Perché Non Tutto È Tradotto?

I contenuti principali (titoli iniziative, descrizioni, dati da database) sono in italiano e **non devono essere tradotti automaticamente** perché:

1. Sono contenuti utente (inseriti dagli organizzatori)
2. Provengono dal database
3. Tradurre automaticamente richiederebbe Google Translate API (costo)

Solo l'**interfaccia utente** (pulsanti, menu, label) è multilingua.

## 🔧 Debug Mode

In development mode, vedrai un box in basso a destra con info i18n:
- Lingua corrente
- Lingua normalizzata
- Fallback
- Lingue caricate
- Direzione testo (LTR/RTL)

Questo è visibile solo in `npm run dev` (non in production build).

## 📝 Come Aggiungere Traduzioni

### 1. Aggiungere Chiavi di Traduzione

Modifica i file in `src/i18n/locales/`:

```json
// src/i18n/locales/it.json
{
  "myComponent": {
    "title": "Il Mio Titolo",
    "description": "La mia descrizione"
  }
}

// src/i18n/locales/en.json
{
  "myComponent": {
    "title": "My Title",
    "description": "My description"
  }
}
```

### 2. Usare Traduzioni nei Componenti

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
    </div>
  );
}
```

### 3. Con Interpolazione

```json
{
  "welcome": "Benvenuto, {{name}}!"
}
```

```tsx
<p>{t('welcome', { name: user.firstName })}</p>
```

## 🐛 Troubleshooting

### "La piattaforma si blocca quando cambio lingua"

**Soluzione**: Questo dovrebbe essere risolto. Se succede ancora:

1. Apri Console browser (F12)
2. Cerca errori tipo: `Translation key not found`
3. Aggiungi le chiavi mancanti nei file di traduzione

### "Vedo chiavi invece di testo"

Se vedi testo tipo `nav.home` invece di "Home", significa:

1. La chiave di traduzione non esiste nel file lingua attuale
2. Soluzione: Aggiungi la traduzione nei file `locales/*.json`

### "L'arabo non inverte il layout"

Il layout RTL per arabo è configurato ma potrebbe non funzionare su tutti i componenti.

Fix CSS per un componente specifico:

```css
[dir="rtl"] .my-component {
  text-align: right;
  direction: rtl;
}
```

## 🚀 Prossimi Passi

Per completare l'internazionalizzazione:

### Priorità Alta

- [ ] Tradurre tutti i componenti UI principali
- [ ] Aggiungere traduzioni per form errors
- [ ] Tradurre tutti i toast/notifications

### Priorità Media

- [ ] Tradurre pagine Auth complete
- [ ] Tradurre UserProfile page
- [ ] Tradurre TeacherDashboard

### Priorità Bassa

- [ ] Lazy loading delle lingue (ottimizzazione bundle)
- [ ] Traduzione automatica contenuti DB (Google Translate API)
- [ ] Aggiungere più lingue (Spagnolo, Tedesco, etc.)

## 📊 Coverage Attuale

| Componente | IT | EN | FR | AR |
|------------|----|----|----|----|
| Navigation | ✅ | ✅ | ✅ | ✅ |
| Auth | ❌ | ❌ | ❌ | ❌ |
| Profile | ❌ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Search | ❌ | ❌ | ❌ | ❌ |
| Calendar | ❌ | ❌ | ❌ | ❌ |
| Reviews | ❌ | ❌ | ❌ | ❌ |

**Nota**: ❌ = Hardcoded in italiano (funziona, ma non tradotto)

## 🔥 Test Rapido

Per testare che l'i18n funzioni:

1. Avvia dev server: `npm run dev`
2. Apri http://localhost:8080
3. Guarda box debug in basso a destra (deve mostrare `it`)
4. Clicca icona globo 🌐 nella navigation
5. Seleziona "English"
6. Il menu navigation deve tradursi in inglese
7. Box debug deve mostrare `en`
8. Ricarica pagina → Deve rimanere in inglese (localStorage)

## 💡 Tips

### Per Development

- **Debug Box**: Mostra sempre stato i18n attuale
- **Hot Reload**: Le modifiche ai file `.json` si vedono immediatamente
- **Console Warnings**: Se vedi warning per chiavi mancanti, aggiungile

### Per Production

- Il Debug Box è automaticamente nascosto
- Le traduzioni sono bundle nel JavaScript (no richieste HTTP extra)
- La scelta lingua è persistente (localStorage)

## 📚 Documentazione

- [i18next Docs](https://www.i18next.com/)
- [react-i18next Docs](https://react.i18next.com/)
- File traduzioni: `src/i18n/locales/*.json`
- Configurazione: `src/i18n/config.ts`

---

**Status**: ✅ Funzionante con limitazioni documentate
**Ultima revisione**: 23 Ottobre 2025
