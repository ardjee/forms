'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UnifiedContract } from '@/types';
// Removed direct import of sendAcceptanceEmail to avoid client-side secret usage
// import { sendAcceptanceEmail } from '@/lib/email/sendAcceptance';

interface UnifiedContractsContextValue {
  contracts: UnifiedContract[];
  isLoading: boolean;
  error: string | null;
  deleteContractsByIds: (ids: string[]) => Promise<void>;
  updateContractStatus: (ids: string[], status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd') => Promise<void>;
  updateContractField: (id: string, field: string, value: any) => Promise<void>;
  refreshContracts: () => Promise<void>;
}

const UnifiedContractsContext = createContext<UnifiedContractsContextValue | undefined>(undefined);

export function UnifiedContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<UnifiedContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch from unified contracts collection
      const contractsRef = collection(db, 'contracts');
      const q = query(contractsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const fetchedContracts: UnifiedContract[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UnifiedContract));

      console.log('UnifiedContractsContext - Fetched contracts:', {
        count: fetchedContracts.length,
        contracts: fetchedContracts.slice(0, 3).map(c => ({ id: c.id, klantNaam: c.klantNaam })) // Log first 3 for debugging
      });

      setContracts(fetchedContracts);
    } catch (err: any) {
      console.error('Error fetching unified contracts:', err);
      setError(err.message || 'Er is een fout opgetreden bij het ophalen van contracten.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContractsByIds = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id => deleteDoc(doc(db, 'contracts', id)))
      );

      setContracts(prev => prev.filter(c => !ids.includes(c.id)));
    } catch (err: any) {
      console.error('Error deleting contracts:', err);
      throw err;
    }
  };

  const updateContractStatus = async (ids: string[], status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd') => {
    try {
      await Promise.all(
        ids.map(id => updateDoc(doc(db, 'contracts', id), { status }))
      );

      // Update local state
      setContracts(prev => prev.map(c =>
        ids.includes(c.id) ? { ...c, status } : c
      ));

      // Send acceptance email if status is 'Actief'
      if (status === 'Actief') {
        // Fetch the latest contract data from Firestore to ensure we have the most recent changes
        const acceptedContracts: UnifiedContract[] = [];
        for (const id of ids) {
          const docRef = doc(db, 'contracts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            acceptedContracts.push({ id: docSnap.id, ...docSnap.data() } as UnifiedContract);
          }
        }

        for (const contract of acceptedContracts) {
          try {
            const details: { label: string; value: string }[] = [
              { label: 'Contracttype', value: contract.contractType },
              { label: 'Naam', value: contract.klantNaam },
              { label: 'E-mail', value: contract.klantEmail },
              { label: 'Telefoon', value: contract.klantTelefoon },
              { label: 'Adres', value: contract.klantAdres },
              { label: 'Postcode', value: contract.klantPostcode },
              { label: 'Woonplaats', value: contract.klantWoonplaats },
              contract.adresAfwijkend ? { label: 'Toesteladres', value: contract.toestelAdres || '' } : null,
              contract.adresAfwijkend ? { label: 'Toestelpostcode', value: contract.toestelPostcode || '' } : null,
              contract.adresAfwijkend ? { label: 'Toestel woonplaats', value: contract.toestelWoonplaats || '' } : null,
              contract.merkToestel ? { label: 'Merk toestel', value: contract.merkToestel } : null,
              contract.typeToestel ? { label: 'Type toestel', value: contract.typeToestel } : null,
              contract.bouwjaar ? { label: 'Bouwjaar', value: contract.bouwjaar } : null,
              contract.serienummer ? { label: 'Serienummer', value: contract.serienummer } : null,
              contract.toestelMerk ? { label: 'Toestel merk', value: contract.toestelMerk } : null,
              contract.toestelType ? { label: 'Toestel type', value: contract.toestelType } : null,
              contract.toestelBouwjaar ? { label: 'Toestel bouwjaar', value: contract.toestelBouwjaar } : null,
              contract.toestelSerienummer ? { label: 'Toestel serienummer', value: contract.toestelSerienummer } : null,
              contract.aantalBinnenunits !== undefined ? { label: 'Aantal binnenunits', value: String(contract.aantalBinnenunits) } : null,
              contract.cvVermogen ? { label: 'Vermogen CV', value: contract.cvVermogen } : null,
              contract.reedsinOnderhoud ? { label: 'Reeds in onderhoud', value: contract.reedsinOnderhoud } : null,
              { label: 'Onderhoudsfrequentie', value: `${contract.onderhoudsfrequentie} maanden` },
              { label: 'Type abonnement', value: contract.typeAbonnement },
              contract.monitoring ? { label: 'Monitoring', value: contract.monitoring } : null,
              contract.voorrijdkosten ? { label: 'Voorrijdkosten', value: contract.voorrijdkosten } : null,
              contract.toeslag ? { label: 'Toeslag', value: contract.toeslag } : null,
              contract.maandelijksePrijs !== undefined ? { label: 'Maandprijs', value: `€${(contract.maandelijksePrijs || 0).toFixed(2)}` } : null,
              { label: 'Ingangsdatum', value: contract.ingangsdatum },
              { label: 'Akkoord voorwaarden', value: contract.akkoordVoorwaarden ? 'ja' : 'nee' },
              { label: 'IBAN', value: contract.iban },
            ].filter((x): x is { label: string; value: string } => !!x && x.value !== '' && x.value !== 'undefined');

            const contractTypeLabels: Record<string, string> = {
              'cv-ketel': 'CV-ketel',
              'warmtepomp-all-electric': 'Warmtepomp All-electric',
              'warmtepomp-hybride': 'Warmtepomp Hybride',
              'warmtepomp-grondgebonden': 'Warmtepomp Grondgebonden',
              'airco': 'Airco',
              'luchtverwarmer': 'Luchtverwarmer',
              'gasboiler': 'Gasboiler',
              'gashaard-kachel': 'Gashaard / Kachel',
              'geiser': 'Geiser',
              'mechanische-ventilatiebox': 'Mechanische Ventilatiebox',
              'warmtepompboiler': 'Warmtepompboiler',
              'warmte-terugwin-unit': 'Warmte-Terugwin-Unit',
              'zonneboiler': 'Zonneboiler',
            };

            const abonnementLabels: Record<string, string> = {
              'onderhoud': 'Onderhoud',
              'service-plus': 'Service Plus',
            };

            // Call server API to send email (server has access to secrets)
            await fetch('/api/send-acceptance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: contract.klantEmail,
                name: contract.klantNaam,
                contractType: contractTypeLabels[contract.contractType] || contract.contractType,
                abonnement: abonnementLabels[contract.typeAbonnement] || contract.typeAbonnement || 'Standaard',
                frequentie: `${contract.onderhoudsfrequentie} maanden`,
                maandPrijs: contract.maandelijksePrijs || 0,
                details,
              }),
            });

            console.log(`Acceptance email requested for: ${contract.klantEmail}`);
          } catch (emailError) {
            console.error(`Failed to send acceptance email to ${contract.klantEmail}:`, emailError);
            // Don't throw - we don't want email failures to prevent status updates
          }
        }
      }
    } catch (err: any) {
      console.error('Error updating contract status:', err);
      throw err;
    }
  };

  const updateContractField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'contracts', id), { [field]: value });

      // Update local state
      setContracts(prev => prev.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ));
    } catch (err: any) {
      console.error('Error updating contract field:', err);
      throw err;
    }
  };

  const refreshContracts = async () => {
    await fetchContracts();
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const value: UnifiedContractsContextValue = {
    contracts,
    isLoading,
    error,
    deleteContractsByIds,
    updateContractStatus,
    updateContractField,
    refreshContracts,
  };

  return (
    <UnifiedContractsContext.Provider value={value}>
      {children}
    </UnifiedContractsContext.Provider>
  );
}

export function useUnifiedContracts() {
  const context = useContext(UnifiedContractsContext);
  if (context === undefined) {
    throw new Error('useUnifiedContracts must be used within UnifiedContractsProvider');
  }
  return context;
}
