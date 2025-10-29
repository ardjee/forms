'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {formSchema as AircoContractSchema} from '@/components/AircoContractForm';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmation';

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
      console.error("Fout bij het opslaan van het Airco contract in Firestore:", error);
      if (error instanceof Error) {
        throw new Error(`Databasefout: ${error.message}`);
      }
      throw new Error('Een onbekende databasefout is opgetreden.');
    }
  }
);
