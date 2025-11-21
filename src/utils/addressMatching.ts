import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SyntessContract } from '@/types';

/**
 * Normalize address string for comparison
 * - Remove all spaces
 * - Convert to lowercase
 * - Remove special characters (keep only alphanumeric)
 */
export function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two normalized addresses
 * Returns a value between 0 and 1, where 1 is an exact match
 */
function calculateSimilarity(normalized1: string, normalized2: string): number {
  if (normalized1 === normalized2) return 1.0;
  
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  if (maxLength === 0) return 1.0;
  
  return 1 - (distance / maxLength);
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
 * Find matching Syntess contract based on address, postcode, and plaats
 * Uses fuzzy matching for address to tolerate small typos and spacing differences
 * 
 * @param adres - Address string (will be normalized and fuzzy matched)
 * @param postcode - Postcode (exact match required)
 * @param plaats - City/plaats (exact match required)
 * @returns Matching SyntessContract or null if no match found
 */
export async function findMatchingSyntessContract(
  adres: string,
  postcode: string,
  plaats: string
): Promise<SyntessContract | null> {
  try {
    // Normalize input values
    const normalizedPostcode = normalizePostcode(postcode);
    const normalizedPlaats = normalizePlaats(plaats);
    const normalizedAdres = normalizeAddress(adres);

    // Query Firestore for contracts with matching postcode and plaats
    const syntessRef = collection(db, 'syntess_contracten');
    const q = query(
      syntessRef,
      where('postcode', '==', normalizedPostcode),
      where('plaats', '==', normalizedPlaats)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Find best match using fuzzy matching on address
    let bestMatch: SyntessContract | null = null;
    let bestSimilarity = 0;
    const similarityThreshold = 0.85; // 85% similarity required

    querySnapshot.forEach((doc) => {
      const contract = { id: doc.id, ...doc.data() } as SyntessContract;
      const contractNormalizedAdres = normalizeAddress(contract.adres);
      const similarity = calculateSimilarity(normalizedAdres, contractNormalizedAdres);

      if (similarity > bestSimilarity && similarity >= similarityThreshold) {
        bestSimilarity = similarity;
        bestMatch = contract;
      }
    });

    return bestMatch;
  } catch (error) {
    console.error('Error finding matching Syntess contract:', error);
    return null;
  }
}

