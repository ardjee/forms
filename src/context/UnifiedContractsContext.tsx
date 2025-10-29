'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UnifiedContract } from '@/types';

interface UnifiedContractsContextValue {
  contracts: UnifiedContract[];
  isLoading: boolean;
  error: string | null;
  deleteContractsByIds: (ids: string[]) => Promise<void>;
  updateContractStatus: (ids: string[], status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd') => Promise<void>;
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
    } catch (err: any) {
      console.error('Error updating contract status:', err);
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
