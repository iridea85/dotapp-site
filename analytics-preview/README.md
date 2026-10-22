# dōtapp · Conteggio anonimo · CANDIDATA PRIVATA

**Stato:** codice preparato per collaudo, NON pubblicato, database di produzione NON modificato.

- Il titolare può attivare **Non conteggiare questo dispositivo**: è soltanto una preferenza locale, senza invio di un identificatore. Non sottrae le visite già contate.
- Contatori giornalieri **aperture** e **sessioni di scheda** (una nuova sessione al giorno per scheda del browser, deduplicata con `sessionStorage`). Nessuna pretesa di utenti unici.
- Dati nel database: **solo data, aperture, sessioni**; nessun ID persistente, email, IP, user-agent, ricetta o scorta. I normali log infrastrutturali Supabase possono comunque registrare gli indirizzi IP durante il trasporto.
- Misura soltanto `https://do-tapp.it/`, non l'app legacy né le preview o i crawler che non eseguono Javascript. Conta solo dopo il primo frame Flutter.
- Le statistiche sono leggibili esclusivamente dall'admin grazie alle policy RLS (`sd_private.is_admin()`); il nuovo pulsante è accanto all'accesso Admin nelle Impostazioni e richiede di autenticarsi separatamente (token solo in memoria). Nessuna registrazione utenti.
- Un client malevolo potrebbe falsare i conteggi chiamando l'RPC pubblico; questi sono numeri indicativi, non una misura antifrode. Nessun dato storico è ricostruibile dal nuovo contatore.

## Integrazione (NON eseguire prima dell'approvazione)

1. Eseguire `001_sd_anonymous_daily.sql` su Supabase `Scorta doTERRA` e verificare SQL permissions/RLS.
2. Dopo la verifica dell'archivio immutabile, del file `iphone-bridge-files.json` e PRIMA di creare l'artifact Pages, eseguire `python3 analytics-preview/apply_metrics_after_verification.py site` nel workflow; i 2 JS vanno copiati dalla directory della candidata. Non modificare l'archivio V47 né la candidata iPhone.
3. Aggiornare l'informativa privacy dell'app con una nota sul conteggio aggregato e sui log tecnici di Supabase; verificarne la conformità prima della pubblicazione.
4. Verificare la PWA su Android e iPhone (cache, aggiornamento SW, no perdita dati, login Admin e RLS). Non pubblicare senza approvazione esplicita.

## Test minimi

- Senza `flutter-first-frame`: zero chiamate.
- Host ChatGPT/localhost: zero chiamate.
- Prima apertura del giorno: `{p_first_session:true}`; refresh stessa scheda: `{p_first_session:false}`; nuova scheda: nuova sessione.
- Supabase senza rete: l'app resta funzionante.
- Ruolo `anon`: SELECT su tabella negato; solo Admin autenticato legge statistiche.
- `sd_private.is_admin()` non va alterata.