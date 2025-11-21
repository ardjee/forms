# Firebase Project Scheiding - Handleiding

## Probleem
**wissel-focus** project is per ongeluk gekoppeld aan **meterscan NL** Firebase, terwijl het het eigen **wissel-focus** Firebase project zou moeten gebruiken.

## Situatie
- **zon-ecn-forms** (dit project) → Gebruikt **meterscan NL** Firebase ✅ (correct, blijft zo)
- **wissel-focus** (ander project) → Gebruikt nu **meterscan NL** Firebase ❌ (verkeerd!)
- **wissel-focus** → Moet **wissel-focus** Firebase project gebruiken ✅ (dit moet gefixt worden)

## Oplossing

Je hebt al een **wissel-focus** Firebase project aangemaakt, maar het wissel-focus code project gebruikt nog de meterscan NL credentials. We moeten de environment variabelen in het wissel-focus project updaten.

### Stap 1: Controleer het wissel-focus Firebase project

1. Ga naar https://console.firebase.google.com/
2. Selecteer het **wissel-focus** Firebase project (niet meterscan NL!)
3. Controleer dat Firestore Database is ingeschakeld:
   - Ga naar "Firestore Database"
   - Als er nog geen database is, klik op "Create database"
   - Kies "Start in test mode" (tijdelijk)
   - Kies een locatie (bijv. europe-west1 voor Nederland)

### Stap 2: Haal de Firebase configuratie op van wissel-focus project

1. In Firebase Console, selecteer het **wissel-focus** Firebase project (NIET meterscan NL!)
2. Ga naar Project Settings (⚙️)
3. Scroll naar "Your apps"
4. Als er nog geen web app is, klik op het web icoon (</>) om een nieuwe web app toe te voegen
5. Geef de app een naam (bijv. "wissel-focus-web")
6. Kopieer de configuratie object (dit zijn de wissel-focus credentials, NIET meterscan NL!)

Je krijgt zoiets:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "wissel-focus.firebaseapp.com",
  projectId: "wissel-focus",
  storageBucket: "wissel-focus.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Stap 3: Update environment variabelen in wissel-focus code project

**BELANGRIJK:** Dit doe je in het **wissel-focus code project** (niet dit zon-ecn-forms project!)

1. Ga naar het **wissel-focus** code project op je computer
2. Open of maak een `.env.local` bestand in de root van het wissel-focus project
3. **VERWIJDER** alle oude meterscan NL Firebase credentials:
   - Verwijder regels die `meterscan` bevatten in de waarden
   - Of verwijder alle `NEXT_PUBLIC_FIREBASE_*` variabelen

4. **VOEG TOE** de nieuwe wissel-focus Firebase credentials (die je in Stap 2 hebt gekopieerd):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (van wissel-focus project)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wissel-focus.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wissel-focus
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wissel-focus.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Controleer:** Het `NEXT_PUBLIC_FIREBASE_PROJECT_ID` moet "wissel-focus" zijn (of vergelijkbaar), NIET "meterscan"!

### Stap 4: Update Security Rules in het wissel-focus Firebase project

1. Ga naar Firebase Console
2. **Selecteer het wissel-focus Firebase project** (NIET meterscan NL!)
3. Ga naar Firestore Database → Rules
4. Plak deze rules (pas aan op basis van welke collecties wissel-focus gebruikt):
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /contracts/{document=**} {
      allow read, write: if true;
    }
    match /cv-contract/{document=**} {
      allow read, write: if true;
    }
    match /airco-contracten/{document=**} {
      allow read, write: if true;
    }
    match /warmtepomp-contracten/{document=**} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Klik op "Publish"

### Stap 5: Update deployment platform voor wissel-focus

Als je **wissel-focus** deployed hebt (bijv. op Vercel):

1. Ga naar je deployment platform (Vercel/andere)
2. Ga naar het **wissel-focus** project (niet zon-ecn-forms!)
3. Ga naar Settings → Environment Variables
4. **VERWIJDER** alle Firebase environment variabelen die meterscan NL bevatten:
   - Zoek naar variabelen waar de waarde "meterscan" bevat
   - Of verwijder alle `NEXT_PUBLIC_FIREBASE_*` variabelen
5. **VOEG TOE** de nieuwe wissel-focus Firebase environment variabelen (van Stap 2)
6. **Controleer** dat `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = "wissel-focus" (niet "meterscan")
7. Redeploy het wissel-focus project

### Stap 6: Data migratie (indien nodig voor wissel-focus)

Als **wissel-focus** bestaande data heeft in meterscan NL die naar het wissel-focus Firebase project moet:

**LET OP:** 
- Alleen wissel-focus data moet gemigreerd worden
- zon-ecn-forms data blijft in meterscan NL (NIET aanraken!)

1. Identificeer welke collecties bij wissel-focus horen in meterscan NL:
   - Ga naar Firebase Console → meterscan NL project
   - Ga naar Firestore Database → Data
   - Bekijk welke collecties bij wissel-focus horen (niet bij zon-ecn-forms!)

2. Export alleen die wissel-focus collecties:
   - Selecteer alleen wissel-focus collecties
   - Gebruik Firebase CLI of export functie

3. Import in wissel-focus Firebase project:
   - Ga naar Firebase Console → wissel-focus project
   - Gebruik Firebase CLI of import functie om de data te importeren

**Of:** Laat de oude data in meterscan NL staan en begin met een schone lei in wissel-focus Firebase project.

### Stap 7: Verifieer dat zon-ecn-forms nog steeds werkt

Controleer dat **zon-ecn-forms** (dit project) nog steeds correct werkt met meterscan NL:
1. Test de applicatie lokaal
2. Test op de live site
3. Controleer dat data nog steeds wordt opgeslagen/gelezen

## Checklist voor wissel-focus project

- [ ] wissel-focus Firebase project bestaat en is actief
- [ ] Firestore Database ingeschakeld in wissel-focus Firebase project
- [ ] Web app toegevoegd aan wissel-focus Firebase project (of al aanwezig)
- [ ] Firebase configuratie gekopieerd van wissel-focus project (NIET meterscan NL!)
- [ ] `.env.local` bestand geüpdatet in **wissel-focus code project** met wissel-focus credentials
- [ ] **Alle** oude meterscan NL credentials verwijderd uit wissel-focus code project
- [ ] Security Rules geüpdatet in wissel-focus Firebase project
- [ ] Deployment platform geüpdatet voor wissel-focus (Vercel/etc)
- [ ] Oude meterscan NL credentials verwijderd van deployment platform
- [ ] Nieuwe wissel-focus credentials toegevoegd aan deployment platform
- [ ] Getest of wissel-focus werkt met nieuwe credentials (lokaal en live)
- [ ] Data gemigreerd van meterscan NL naar wissel-focus (indien nodig)
- [ ] Verifieerd dat zon-ecn-forms nog steeds werkt met meterscan NL (NIET aanraken!)

## Belangrijk - Lees dit goed!

- ⚠️ **Werk ALLEEN in het wissel-focus project**, NIET in zon-ecn-forms!
- ⚠️ **zon-ecn-forms blijft meterscan NL gebruiken** - NIETS aanpassen in dit project!
- ⚠️ **Controleer altijd** welk Firebase project je selecteert in Firebase Console
- ⚠️ **Verwijder ALLE meterscan NL credentials** uit wissel-focus (zowel lokaal als op deployment)
- ⚠️ **Deel NOOIT** `.env.local` in git (staat al in .gitignore)
- ⚠️ **Test lokaal** voordat je deployed
- ⚠️ **Backup** bestaande data voordat je iets verwijdert
- ⚠️ **Controleer** dat wissel-focus nu het wissel-focus Firebase project gebruikt (niet meterscan NL)
- ⚠️ **Wees voorzichtig** bij data migratie - zorg dat je alleen wissel-focus data migreert, niet zon-ecn-forms data

## Hoe te controleren of het werkt

1. **In wissel-focus code project:**
   - Check `.env.local` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID` moet "wissel-focus" zijn (niet "meterscan")
   - Run lokaal en check of data wordt opgeslagen in wissel-focus Firebase project

2. **In Firebase Console:**
   - meterscan NL project → zou alleen zon-ecn-forms data moeten bevatten
   - wissel-focus project → zou alleen wissel-focus data moeten bevatten

3. **In zon-ecn-forms (dit project):**
   - Blijft meterscan NL gebruiken - alles zou moeten blijven werken zoals het was

