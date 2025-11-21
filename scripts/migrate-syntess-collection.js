/**
 * Script om de "syntess-contracten" collectie te verplaatsen
 * van meterscan NL Firebase naar wissel-focus Firebase
 * 
 * Gebruik:
 * 1. Zorg dat je Firebase Admin SDK credentials hebt voor beide projecten
 * 2. Pas de project IDs aan in de configuratie hieronder
 * 3. Run: node scripts/migrate-syntess-collection.js
 */

const admin = require('firebase-admin');

// Firebase project configuratie
const METERSCAN_PROJECT_ID = 'meterscan-nl'; // Pas aan naar je exacte project ID
const WISSEL_FOCUS_PROJECT_ID = 'wissel-focus'; // Pas aan naar je exacte project ID
const COLLECTION_NAME = 'syntess-contracten';

// Initialize Firebase Admin voor beide projecten
// Je moet service account keys hebben voor beide projecten
const meterscanApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require('../serviceAccount-meterscan.json')),
    databaseURL: `https://${METERSCAN_PROJECT_ID}.firebaseio.com`
  },
  'meterscan'
);

const wisselFocusApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require('../serviceAccount-wissel-focus.json')),
    databaseURL: `https://${WISSEL_FOCUS_PROJECT_ID}.firebaseio.com`
  },
  'wissel-focus'
);

async function migrateCollection() {
  try {
    console.log('🚀 Start migratie van syntess-contracten collectie...');
    
    const sourceDb = admin.app('meterscan').firestore();
    const targetDb = admin.app('wissel-focus').firestore();
    
    // Haal alle documenten op uit meterscan NL
    console.log(`📥 Ophalen van documenten uit ${COLLECTION_NAME} in meterscan NL...`);
    const snapshot = await sourceDb.collection(COLLECTION_NAME).get();
    
    if (snapshot.empty) {
      console.log('⚠️  Geen documenten gevonden in de collectie.');
      return;
    }
    
    console.log(`✅ ${snapshot.size} documenten gevonden.`);
    
    // Kopieer elk document naar wissel-focus Firebase
    const batch = targetDb.batch();
    let count = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = targetDb.collection(COLLECTION_NAME).doc(doc.id);
      batch.set(docRef, data);
      count++;
      
      // Firestore heeft een batch limit van 500, dus commit en start nieuwe batch
      if (count >= BATCH_SIZE) {
        await batch.commit();
        console.log(`✅ ${count} documenten gekopieerd...`);
        count = 0;
      }
    }
    
    // Commit de laatste batch
    if (count > 0) {
      await batch.commit();
      console.log(`✅ Laatste ${count} documenten gekopieerd.`);
    }
    
    console.log(`\n✅ Migratie voltooid! ${snapshot.size} documenten zijn verplaatst.`);
    console.log(`\n⚠️  Vergeet niet om:`);
    console.log(`   1. De data te verifiëren in wissel-focus Firebase`);
    console.log(`   2. De collectie te verwijderen uit meterscan NL`);
    console.log(`   3. De security rules te updaten`);
    
  } catch (error) {
    console.error('❌ Fout bij migratie:', error);
    throw error;
  } finally {
    // Cleanup
    await meterscanApp.delete();
    await wisselFocusApp.delete();
  }
}

// Run de migratie
migrateCollection()
  .then(() => {
    console.log('\n✅ Script voltooid!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script gefaald:', error);
    process.exit(1);
  });

