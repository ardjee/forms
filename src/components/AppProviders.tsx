"use client";

import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CvContractsProvider } from '@/context/CvContractsContext';
import { AircoContractsProvider } from '@/context/AircoContractsContext';
import { WarmtepompContractsProvider } from '@/context/WarmtepompContractsContext';
import { UnifiedContractsProvider } from '@/context/UnifiedContractsContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UnifiedContractsProvider>
        <CvContractsProvider>
          <AircoContractsProvider>
            <WarmtepompContractsProvider>
              {children}
            </WarmtepompContractsProvider>
          </AircoContractsProvider>
        </CvContractsProvider>
      </UnifiedContractsProvider>
    </AuthProvider>
  );
}