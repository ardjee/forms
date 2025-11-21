# Firebase Fix - Meterscan NL Herstellen

## Probleem
Je hebt per ongeluk in **meterscan NL** Firebase gewerkt terwijl je dacht dat je in **wissel-focus** Firebase was. Dit heeft geleid tot:
1. Security rules in meterscan NL zijn aangepast (moeten teruggedraaid worden)
2. Collectie "syntess-contracten" is toegevoegd in meterscan NL (moet verplaatst worden naar wissel-focus Firebase)

## Situatie
- **meterscan NL** Firebase → Moet gebruikt worden door **zon-ecn-forms** alleen
- **wissel-focus** Firebase → Moet gebruikt worden door **wissel-focus** project
- Collectie "syntess-contracten" → Staat nu in meterscan NL, moet naar wissel-focus Firebase

## Oplossing

### Stap 1: Verplaats collectie "syntess-contracten" van meterscan NL naar wissel-focus Firebase

#### Optie A: Via Firebase Console (handmatig, voor kleine datasets)

1. **Export uit meterscan NL:**
   - Ga naar Firebase Console → **meterscan NL** project
   - Ga naar Firestore Database → Data
   - Klik op de collectie "syntess-contracten"
   - Selecteer alle documenten (of gebruik de select all functie)
   - Kopieer de data handmatig of gebruik export

2. **Import in wissel-focus Firebase:**
   - Ga naar Firebase Console → **wissel-focus** project
   - Ga naar Firestore Database → Data
   - Maak een nieuwe collectie aan: "syntess-contracten"
   - Plak/import de data

#### Optie B: Via Firebase CLI (aanbevolen voor grote datasets)

1. **Installeer Firebase CLI** (als je die nog niet hebt):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Export uit meterscan NL:**
   ```bash
   # Selecteer meterscan NL project
   firebase use meterscan-nl  # of het exacte project ID
   
   # Export alleen de syntess-contracten collectie
   firebase firestore:export gs://[BUCKET]/syntess-export --collection-ids=syntess-contracten
   ```

3. **Import in wissel-focus Firebase:**
   ```bash
   # Selecteer wissel-focus project
   firebase use wissel-focus  # of het exacte project ID
   
   # Import de data
   firebase firestore:import gs://[BUCKET]/syntess-export
   ```

#### Optie C: Via Node.js script (als je veel data hebt)

Zie onderstaand script voor het verplaatsen van de collectie.

### Stap 2: Verwijder collectie "syntess-contracten" uit meterscan NL

**LET OP:** Doe dit ALLEEN nadat je zeker weet dat de data succesvol is verplaatst naar wissel-focus Firebase!

1. Ga naar Firebase Console → **meterscan NL** project
2. Ga naar Firestore Database → Data
3. Klik op "syntess-contracten" collectie
4. Verwijder alle documenten (of verwijder de hele collectie)

### Stap 3: Herstel Security Rules in meterscan NL

De security rules in meterscan NL moeten terug naar de oorspronkelijke staat voor zon-ecn-forms.

**Huidige rules (die je waarschijnlijk hebt aangepast):**
Controleer wat er nu staat in meterscan NL → Firestore Database → Rules

**Oorspronkelijke rules voor zon-ecn-forms (meterscan NL):**
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Unified contracts collectie (hoofdcollectie voor zon-ecn-forms)
    match /contracts/{document=**} {
      allow read, write: if true;
    }
    
    // Oude collecties (voor backwards compatibility)
    match /cv-contract/{document=**} {
      allow read, write: if true;
    }
    
    match /airco-contracten/{document=**} {
      allow read, write: if true;
    }
    
    match /warmtepomp-contracten/{document=**} {
      allow read, write: if true;
    }
    
    // Blokkeer toegang tot alle andere collecties
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**BELANGRIJK:** 
- Verwijder eventuele regels voor "syntess-contracten" uit meterscan NL
- Zorg dat alleen zon-ecn-forms collecties toegang hebben

### Stap 4: Update Security Rules in wissel-focus Firebase

Voeg de "syntess-contracten" collectie toe aan de security rules van wissel-focus Firebase:

1. Ga naar Firebase Console → **wissel-focus** project
2. Ga naar Firestore Database → Rules
3. Voeg de syntess-contracten collectie toe:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Voeg hier de collecties toe die wissel-focus gebruikt
    match /syntess-contracten/{document=**} {
      allow read, write: if true;
    }
    
    // Voeg andere wissel-focus collecties toe zoals nodig
    // match /andere-collectie/{document=**} {
    //   allow read, write: if true;
    // }
    
    // Blokkeer toegang tot alle andere collecties
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Klik op "Publish"

## Checklist

- [ ] Collectie "syntess-contracten" geëxporteerd uit meterscan NL
- [ ] Collectie "syntess-contracten" geïmporteerd in wissel-focus Firebase
- [ ] Data gecontroleerd in wissel-focus Firebase (zit alles erin?)
- [ ] Collectie "syntess-contracten" verwijderd uit meterscan NL
- [ ] Security Rules in meterscan NL hersteld (zonder syntess-contracten)
- [ ] Security Rules in wissel-focus Firebase geüpdatet (met syntess-contracten)
- [ ] Verifieerd dat zon-ecn-forms nog steeds werkt met meterscan NL
- [ ] Verifieerd dat wissel-focus werkt met wissel-focus Firebase

## Belangrijk

- ⚠️ **Backup eerst** voordat je iets verwijdert!
- ⚠️ **Verifieer** dat de data succesvol is verplaatst voordat je iets verwijdert uit meterscan NL
- ⚠️ **Test** beide projecten na de wijzigingen
- ⚠️ **Controleer** altijd welk Firebase project je selecteert in Firebase Console

