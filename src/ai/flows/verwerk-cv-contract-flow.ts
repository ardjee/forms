
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {formSchema as CvContractSchema} from '@/components/CvContractForm';

export type CvContractData = z.infer<typeof CvContractSchema>;

const COLLECTION_NAME = 'contracts'; // Unified collection

export async function verwerkCvContract(input: CvContractData): Promise<{success: boolean; documentId: string}> {
  return verwerkCvContractFlow(input);
}

const verwerkCvContractFlow = ai.defineFlow(
  {
    name: 'verwerkCvContractFlow',
    inputSchema: z.any(),
    outputSchema: z.object({ success: z.boolean(), documentId: z.string() }),
  },
  async (formData) => {
    try {
      const documentId = `${formData.klantPostcode}-${formData.klantNaam.replace(/\s/g, '_')}-${Date.now()}`;
      const docRef = doc(db, COLLECTION_NAME, documentId);

      const vasteIngangsdatum = new Date('2026-01-01').toISOString();

      const dataToSave = {
        ...formData,
        contractType: 'cv-ketel', // Add contract type for unified system
        ingangsdatum: vasteIngangsdatum,
        createdAt: Date.now(), // Use timestamp instead of ISO string
        status: "Nieuw",
      };

      await setDoc(docRef, dataToSave);
      
      console.log(`CV Contract opgeslagen met ID: ${documentId}`);
      return { success: true, documentId };

    } catch (error) {
      console.error("Fout bij het opslaan van het CV contract in Firestore:", error);
      if (error instanceof Error) {
        throw new Error(`Databasefout: ${error.message}`);
      }
      throw new Error('Een onbekende databasefout is opgetreden.');
    }
  }
);
