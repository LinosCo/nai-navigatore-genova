# 🌍 Stato Internazionalizzazione (i18n)

## ✅ Implementato (Solo IT + EN)

L'internazionalizzazione è stata implementata utilizzando `i18next` e `react-i18next`.

**IMPORTANTE**: Supporto limitato a **SOLO 2 LINGUE** per garantire stabilità.

### Lingue Supportate

- 🇮🇹 **Italiano** (default) - Completo
- 🇬🇧 **Inglese** - Completo

### Lingue Rimosse

- ❌ **Francese** - Rimosso per semplificazione
- ❌ **Arabo** - Rimosso (causava problemi layout RTL)

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

### "Solo 2 lingue? Voglio aggiungerne altre"

**Non consigliato.** Il supporto multilingua completo richiede:
1. Traduzioni complete di tutti i testi UI
2. Testing approfondito per ogni lingua
3. Gestione layout RTL per lingue come arabo/ebraico
4. Manutenzione continua delle traduzioni

Per ora, IT + EN copre il 90% degli utenti target.

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

| Componente | IT | EN |
|------------|----|----|
| Navigation | ✅ | ✅ |
| Menu Utente | ✅ | ✅ |
| Login/Logout | ✅ | ✅ |
| Contenuti DB | 📝 | 📝 |

**Legenda**:
- ✅ = Completamente tradotto
- 📝 = Solo in italiano (contenuti da database, non UI)

## 🔥 Test Rapido

Per testare che l'i18n funzioni:

1. Avvia dev server: `npm run dev`
2. Apri http://localhost:8080
3. Clicca icona globo 🌐 nella navigation (in alto a destra)
4. Seleziona "English 🇬🇧"
5. Il menu navigation deve tradursi immediatamente in inglese
6. I link nel menu utente (Profile, Logout, ecc.) devono essere in inglese
7. Ricarica pagina (F5) → Deve rimanere in inglese (salvato in localStorage)

## 💡 Tips

### Per Development

- **Hot Reload**: Le modifiche ai file `.json` si vedono immediatamente con save
- **Console Browser**: Controlla F12 → Console per eventuali errori i18n
- **localStorage**: Pulisci con `localStorage.clear()` per reset lingua

### Per Production

- Le traduzioni sono incluse nel bundle JavaScript (no richieste HTTP extra)
- La scelta lingua è persistente (salvata in localStorage come `neip-language`)
- Solo 2 lingue = bundle size ottimizzato

## 📚 Documentazione

- [i18next Docs](https://www.i18next.com/)
- [react-i18next Docs](https://react.i18next.com/)
- File traduzioni: `src/i18n/locales/*.json`
- Configurazione: `src/i18n/config.ts`

---

**Status**: ✅ Semplificato e funzionante (solo IT + EN)
**Ultima revisione**: 23 Ottobre 2025
**Versione**: 2.0 (Stabile)
