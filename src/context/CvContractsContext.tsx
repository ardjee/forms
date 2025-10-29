"use client";

import type { CvContract } from '@/types';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  query,
  orderBy,
  doc
} from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

const COLLECTION_NAME = 'cv-contract';

interface CvContractsContextType {
  contracts: CvContract[];
  isLoading: boolean;
  error: string | null;
  deleteContractsByIds: (idsToDelete: string[]) => Promise<void>;
}

const CvContractsContext = createContext<CvContractsContextType | undefined>(undefined);

export function CvContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<CvContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const firestoreContracts: CvContract[] = [];
      querySnapshot.forEach((docSnap) => {
        firestoreContracts.push({ 
          id: docSnap.id, 
          ...docSnap.data()
        } as CvContract);
      });
      setContracts(firestoreContracts);
    } catch (err: any) {
        console.error(`Error loading from ${COLLECTION_NAME}:`, err);
        let description = "Kon de opgeslagen contracten niet ophalen.";
        if (err.code === 'failed-precondition' && err.message.includes('index')) {
            description = "De database vereist een index die nog niet is aangemaakt. Controleer de foutmelding in de console voor een link om deze aan te maken."
        } else if (err.code === 'permission-denied') {
            description = "Toegang tot de database is geweigerd. Controleer uw Firestore security rules."
        }
        setError(`Kon ${COLLECTION_NAME} niet laden: ${err.message}`);
        toast({
            variant: "destructive",
            title: "Database Fout",
            description: description,
        });
        setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);


  const deleteContractsByIds = useCallback(async (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;
    
    const originalContracts = [...contracts];
    setContracts(prev => prev.filter(c => !idsToDelete.includes(c.id))); 

    try {
      const batch = writeBatch(db);
      idsToDelete.forEach(id => {
        batch.delete(doc(db, COLLECTION_NAME, id));
      });
      await batch.commit();
      toast({
        title: `${idsToDelete.length} contract(en) verwijderd`,
      });
    } catch (err: any) {
      console.error(`Error deleting from ${COLLECTION_NAME}:`, err);
      setError("Fout bij het verwijderen van contracten.");
      toast({
        variant: "destructive",
        title: "Verwijderen Mislukt",
      });
      setContracts(originalContracts); 
    }
  }, [contracts, toast]);

  return (
    <CvContractsContext.Provider value={{ contracts, isLoading, error, deleteContractsByIds }}>
      {children}
    </CvContractsContext.Provider>
  );
}

export function useCvContracts(): CvContractsContextType {
  const context = useContext(CvContractsContext);
  if (context === undefined) {
    throw new Error('useCvContracts must be used within a CvContractsProvider');
  }
  return context;
}