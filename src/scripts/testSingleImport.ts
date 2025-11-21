/**
 * Test script to import a single Syntess contract to debug INVALID_ARGUMENT error
 */

// Load environment variables first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SyntessContract } from '@/types';

const COLLECTION_NAME = 'syntess_contracten';

async function testSingleImport() {
  try {
    console.log('Testing single document import...');
    
    // Simple test document
    const testContract: SyntessContract = {
      adres: 'Test Straat 123',
      postcode: '1234AB',
      plaats: 'AMSTERDAM',
      installatieOmschrijving: 'Test Installatie',
      importedAt: Date.now(),
    };

    const docId = 'test_document_1';
    const docRef = doc(db, COLLECTION_NAME, docId);

    console.log('Attempting to write document:', testContract);
    
    await setDoc(docRef, testContract);
    
    console.log('Success! Document written successfully.');
    console.log('Document ID:', docId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error writing document:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testSingleImport();

export { testSingleImport };

