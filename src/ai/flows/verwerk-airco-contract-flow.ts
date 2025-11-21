'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {formSchema as AircoContractSchema} from '@/components/AircoContractForm';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmation';
import { findMatchingSyntessContract } from '@/utils/addressMatching';

export type AircoContractData = z.infer<typeof AircoContractSchema>;

const COLLECTION_NAME = 'contracts'; // Unified collection

export async function verwerkAircoContract(input: AircoContractData): Promise<{success: boolean; documentId: string}> {
  return verwerkAircoContractFlow(input);
}

const verwerkAircoContractFlow = ai.defineFlow(
  {
    name: 'verwerkAircoContractFlow',
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
        contractType: 'airco', // Add contract type for unified system
        ingangsdatum: vasteIngangsdatum,
        createdAt: Date.now(), // Use timestamp instead of ISO string
        status: "Nieuw",
      };

      await setDoc(docRef, dataToSave);

      console.log(`Airco Contract opgeslagen met ID: ${documentId}`);

      // Try to find matching Syntess contract
      try {
        const adres = formData.adresAfwijkend && formData.toestelAdres 
          ? formData.toestelAdres 
          : formData.klantAdres;
        const postcode = formData.adresAfwijkend && formData.toestelPostcode 
          ? formData.toestelPostcode 
          : formData.klantPostcode;
        const plaats = formData.adresAfwijkend && formData.toestelWoonplaats 
          ? formData.toestelWoonplaats 
          : formData.klantWoonplaats;

        const syntessMatch = await findMatchingSyntessContract(adres, postcode, plaats);
        
        if (syntessMatch) {
          // Update contract with match
          await setDoc(docRef, {
            ...dataToSave,
            syntessMatch: {
              installatieOmschrijving: syntessMatch.installatieOmschrijving,
            },
          }, { merge: true });
          console.log(`✅ Syntess match found: ${syntessMatch.installatieOmschrijving}`);
        } else {
          console.log('ℹ️  No Syntess match found for this address');
        }
      } catch (matchError) {
        console.error('Error finding Syntess match:', matchError);
        // Don't fail the entire submission if matching fails
      }

      // Send confirmation email to customer and Abel&Co
      try {
        await sendConfirmationEmail({
          to: formData.klantEmail,
          name: formData.klantNaam,
          contractData: dataToSave as any, // Pass contract data for Abel&Co email
        });
        console.log(`Confirmation email sent to: ${formData.klantEmail}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the entire submission if email fails
        // The contract is still saved successfully
      }

      return { success: true, documentId };

    } catch (error) {
      console.error("Fout bij het opslaan van het Airco contract in Firestore:", error);
      if (error instanceof Error) {
        throw new Error(`Databasefout: ${error.message}`);
      }
      throw new Error('Een onbekende databasefout is opgetreden.');
    }
  }
);
