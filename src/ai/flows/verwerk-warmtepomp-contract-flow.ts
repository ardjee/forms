'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {formSchema as WarmtepompContractSchema} from '@/components/WarmtepompContractForm';
import type { ContractType } from '@/types';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmation';
import { findMatchingSyntessContract } from '@/utils/addressMatching';

export type WarmtepompContractData = z.infer<typeof WarmtepompContractSchema>;

const COLLECTION_NAME = 'contracts'; // Unified collection

export async function verwerkWarmtepompContract(
  input: WarmtepompContractData,
  contractType: ContractType = 'warmtepomp-all-electric'
): Promise<{success: boolean; documentId: string}> {
  return verwerkWarmtepompContractFlow({...input, _contractType: contractType});
}

const verwerkWarmtepompContractFlow = ai.defineFlow(
  {
    name: 'verwerkWarmtepompContractFlow',
    inputSchema: z.any(),
    outputSchema: z.object({ success: z.boolean(), documentId: z.string() }),
  },
  async (formData) => {
    try {
      const documentId = `${formData.klantPostcode}-${formData.klantNaam.replace(/\s/g, '_')}-${Date.now()}`;

      const docRef = doc(db, COLLECTION_NAME, documentId);

      const { _contractType, ...restOfData } = formData;
      const vasteIngangsdatum = new Date('2026-01-01').toISOString();

      const dataToSave = {
        ...restOfData,
        contractType: _contractType || 'warmtepomp-all-electric', // Add contract type
        ingangsdatum: vasteIngangsdatum,
        createdAt: Date.now(), // Use timestamp instead of ISO string
        status: "Nieuw",
      };

      await setDoc(docRef, dataToSave);

      console.log(`Warmtepomp Contract opgeslagen met ID: ${documentId}`);

      // Try to find matching Syntess contract
      try {
        const adres = restOfData.adresAfwijkend && restOfData.toestelAdres 
          ? restOfData.toestelAdres 
          : restOfData.klantAdres;
        const postcode = restOfData.adresAfwijkend && restOfData.toestelPostcode 
          ? restOfData.toestelPostcode 
          : restOfData.klantPostcode;
        const plaats = restOfData.adresAfwijkend && restOfData.toestelWoonplaats 
          ? restOfData.toestelWoonplaats 
          : restOfData.klantWoonplaats;

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

      // Send confirmation email to customer
      try {
        await sendConfirmationEmail({
          to: formData.klantEmail,
          name: formData.klantNaam,
        });
        console.log(`Confirmation email sent to: ${formData.klantEmail}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the entire submission if email fails
        // The contract is still saved successfully
      }

      return { success: true, documentId };

    } catch (error) {
      console.error("Fout bij het opslaan van het Warmtepomp contract in Firestore:", error);
      if (error instanceof Error) {
        throw new Error(`Databasefout: ${error.message}`);
      }
      throw new Error('Een onbekende databasefout is opgetreden.');
    }
  }
);
