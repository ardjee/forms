/**
 * Import script for Syntess contracts from CSV to Firestore
 * 
 * Usage: 
 *   npx tsx src/scripts/importSyntessContracts.ts
 * 
 * Or with Node:
 *   node --loader tsx src/scripts/importSyntessContracts.ts
 */

// Load environment variables first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { readFileSync } from 'fs';
import { join } from 'path';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SyntessContract } from '@/types';

const CSV_FILE_PATH = join(process.cwd(), 'public', 'Syntess_contracten.csv');
const COLLECTION_NAME = 'syntess_contracten';

/**
 * Parse CSV line (semicolon-separated)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Normalize postcode: uppercase, remove spaces
 */
function normalizePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normalize plaats: uppercase, trim
 */
function normalizePlaats(plaats: string): string {
  return plaats.toUpperCase().trim();
}

/**
 * Import Syntess contracts from CSV to Firestore
 */
async function importSyntessContracts() {
  try {
    console.log('Reading CSV file...');
    const csvContent = readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      console.error('CSV file is empty');
      return;
    }

    // Parse header
    const header = parseCSVLine(lines[0]);
    console.log('CSV Headers:', header);

    // Expected columns: Object adres, Object postcode, Object plaats, Installatie omschrijving
    const adresIndex = header.findIndex(h => h.toLowerCase().includes('adres') && !h.toLowerCase().includes('omschrijving'));
    const postcodeIndex = header.findIndex(h => h.toLowerCase().includes('postcode'));
    const plaatsIndex = header.findIndex(h => h.toLowerCase().includes('plaats'));
    const installatieIndex = header.findIndex(h => h.toLowerCase().includes('installatie') || h.toLowerCase().includes('omschrijving'));

    if (adresIndex === -1 || postcodeIndex === -1 || plaatsIndex === -1 || installatieIndex === -1) {
      console.error('Could not find required columns in CSV');
      console.error('Found columns:', header);
      return;
    }

    console.log(`Found columns: adres=${adresIndex}, postcode=${postcodeIndex}, plaats=${plaatsIndex}, installatie=${installatieIndex}`);

    // Check if collection already has data
    const existingDocs = await getDocs(collection(db, COLLECTION_NAME));
    if (!existingDocs.empty) {
      console.log(`Collection already contains ${existingDocs.size} documents`);
      console.log('Delete existing documents first if you want to re-import');
      return;
    }

    // Parse data rows
    const contracts: SyntessContract[] = [];
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      
      if (row.length < Math.max(adresIndex, postcodeIndex, plaatsIndex, installatieIndex) + 1) {
        skipped++;
        continue;
      }

      const adres = row[adresIndex]?.trim();
      const postcode = row[postcodeIndex]?.trim();
      const plaats = row[plaatsIndex]?.trim();
      const installatieOmschrijving = row[installatieIndex]?.trim();

      if (!adres || !postcode || !plaats || !installatieOmschrijving) {
        skipped++;
        continue;
      }

      contracts.push({
        adres,
        postcode: normalizePostcode(postcode),
        plaats: normalizePlaats(plaats),
        installatieOmschrijving,
        importedAt: Date.now(),
      });
    }

    console.log(`Parsed ${contracts.length} contracts (skipped ${skipped} invalid rows)`);

    // Import to Firestore using batch writes (more efficient and better error handling)
    console.log('Importing to Firestore...');
    let imported = 0;
    let errors = 0;
    const BATCH_SIZE = 500; // Firestore batch limit is 500

    // Validate and prepare contracts
    const validContracts: Array<{ contract: SyntessContract; docId: string; index: number }> = [];

    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      
      // Validate contract data
      const adres = String(contract.adres || '').trim();
      const postcode = String(contract.postcode || '').trim();
      const plaats = String(contract.plaats || '').trim();
      const installatieOmschrijving = String(contract.installatieOmschrijving || '').trim();

      if (!adres || !postcode || !plaats || !installatieOmschrijving) {
        console.warn(`   Skipping contract ${i + 1}: missing required fields`);
        errors++;
        continue;
      }

      // Sanitize strings - remove any problematic characters
      const sanitizeString = (str: string): string => {
        // Remove null bytes and other control characters except newlines/tabs
        return str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
      };

      const validContract: SyntessContract = {
        adres: sanitizeString(adres),
        postcode: sanitizeString(postcode),
        plaats: sanitizeString(plaats),
        installatieOmschrijving: sanitizeString(installatieOmschrijving),
        importedAt: Date.now() + i, // Add index to ensure uniqueness
      };

      // Create document ID from postcode and address (normalized, max 150 chars for Firestore)
      const normalizedAdres = validContract.adres
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 40); // Limit length
      
      const normalizedPostcode = validContract.postcode.replace(/[^A-Z0-9]/g, '').substring(0, 10);
      // Use index to ensure uniqueness
      const docId = `${normalizedPostcode}_${normalizedAdres}_${i}`.substring(0, 150); // Firestore max ID length
      
      if (docId.length === 0) {
        console.warn(`   Skipping contract ${i + 1}: could not generate valid document ID`);
        errors++;
        continue;
      }

      validContracts.push({ contract: validContract, docId, index: i });
    }

    console.log(`Prepared ${validContracts.length} valid contracts for import`);

    // Write in batches
    for (let i = 0; i < validContracts.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchContracts = validContracts.slice(i, i + BATCH_SIZE);
      
      try {
        for (const { contract, docId, index } of batchContracts) {
          const docRef = doc(db, COLLECTION_NAME, docId);
          batch.set(docRef, contract);
        }

        await batch.commit();
        imported += batchContracts.length;
        
        console.log(`   Imported batch ${Math.floor(i / BATCH_SIZE) + 1}: ${imported}/${validContracts.length} contracts`);
      } catch (error) {
        console.error(`   Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
        
        // Try individual writes to find the problematic document
        if (error instanceof Error && error.message.includes('INVALID_ARGUMENT')) {
          console.log(`   Trying individual writes to find problematic document...`);
          
          for (const { contract, docId, index } of batchContracts) {
            try {
              const docRef = doc(db, COLLECTION_NAME, docId);
              await setDoc(docRef, contract);
              imported++;
            } catch (individualError) {
              console.error(`   Error importing contract ${index + 1}:`);
              console.error(`      Adres: ${contract.adres}`);
              console.error(`      Postcode: ${contract.postcode}`);
              console.error(`      Plaats: ${contract.plaats}`);
              console.error(`      Installatie: ${contract.installatieOmschrijving}`);
              console.error(`      Document ID: ${docId}`);
              if (individualError instanceof Error) {
                console.error(`      Error: ${individualError.message}`);
              }
              errors++;
            }
          }
        } else {
          errors += batchContracts.length;
        }
      }
    }

    console.log(`Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total in collection: ${imported}`);

  } catch (error) {
    console.error('Error importing Syntess contracts:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run import if script is executed directly
importSyntessContracts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

export { importSyntessContracts };

