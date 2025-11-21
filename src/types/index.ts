import type { z } from 'zod';
import type { formSchema as CvContractSchema } from '@/components/CvContractForm';
import type { formSchema as AircoContractSchema } from '@/components/AircoContractForm';
import type { formSchema as WarmtepompContractSchema } from '@/components/WarmtepompContractForm';


export interface MeterImageFileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export interface MeterImage {
  id: string;
  file: MeterImageFileMetadata;
  dataUrl: string;
  extractedData?: {
    meterReading: string;
    serialNumber: string; // Changed from connectionNumber
  } | null;
  validation?: {
    isValid: boolean;
    validationReason: string;
  } | null;
  isProcessing: boolean;
  isSaving: boolean;
  isSaved: boolean;
  error?: string | null;
  readingTimestamp?: number; // Timestamp for the actual reading
  createdAt?: number; // Timestamp (Date.now()) for Firestore document creation
  updatedAt?: number; // Timestamp (Date.now()) for Firestore document update
}

// Type for the example table (no longer used by zon-ecn page)
export interface SolarReading {
    id: string;
    timestamp: number;
    generatedPower: number; // in kWh
    notes: string;
    createdAt: number;
}

// The CV Contract form data plus Firestore metadata
export type CvContract = z.infer<typeof CvContractSchema> & {
  id: string;
  createdAt: number;
  ingangsdatum: string;
  status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd';
};

// The Airco Contract form data plus Firestore metadata
export type AircoContract = z.infer<typeof AircoContractSchema> & {
  id: string;
  createdAt: string;
  ingangsdatum: string;
  status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd';
};

type WarmtepompFormData = Omit<z.infer<typeof WarmtepompContractSchema>, "abonnementBasis" | "heeftMonitoring">;

// The Warmtepomp Contract form data plus Firestore metadata
export type WarmtepompContract = WarmtepompFormData & {
  id: string;
  createdAt: string;
  status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd';
  ingangsdatum: string; // Ensure this is here
  abonnement: {
    basis: 'onderhoud' | 'service-plus';
    monitoring: boolean;
  };
};

// Contract Types enum for unified system
export type ContractType =
  | 'cv-ketel'
  | 'warmtepomp-all-electric'
  | 'warmtepomp-hybride'
  | 'warmtepomp-grondgebonden'
  | 'airco'
  | 'luchtverwarmer'
  | 'gasboiler'
  | 'gashaard-kachel'
  | 'geiser'
  | 'mechanische-ventilatiebox'
  | 'warmtepompboiler'
  | 'warmte-terugwin-unit'
  | 'zonneboiler';

// Unified Contract interface that covers all contract types
export interface UnifiedContract {
  // Firebase metadata
  id: string;
  createdAt: number;
  status: 'Nieuw' | 'In behandeling' | 'Actief' | 'Geannuleerd';

  // Contract type
  contractType: ContractType;

  // Klantgegevens (common to all)
  klantNaam: string;
  klantAdres: string;
  klantPostcode: string;
  klantWoonplaats: string;
  klantTelefoon: string;
  klantEmail: string;

  // Afwijkend toesteladres (optional, common to all)
  adresAfwijkend: boolean;
  toestelAdres?: string;
  toestelPostcode?: string;
  toestelWoonplaats?: string;
  toestelTelefoon?: string;

  // Toestelgegevens (common to all)
  merkToestel?: string;
  typeToestel?: string;
  bouwjaar?: string;
  serienummer?: string;

  // Airco specific
  aantalBinnenunits?: number;

  // CV specific
  toestelMerk?: string;
  toestelType?: string;
  toestelBouwjaar?: string;
  toestelSerienummer?: string;
  cvVermogen?: 'tot-45kw' | '45-70kw';
  reedsinOnderhoud?: 'ja' | 'nee';

  // Onderhoudsabonnement
  onderhoudsfrequentie: '12' | '18' | '24';
  typeAbonnement: 'onderhoud' | 'service-plus';
  monitoring?: 'ja' | 'nee';

  // Warmtepomp specific format (legacy)
  abonnement?: {
    basis: 'onderhoud' | 'service-plus';
    monitoring: boolean;
  };

  // Toeslag & Betaling (optional, not for all types)
  voorrijdkosten?: string;
  toeslag?: string;

  // Pricing
  maandelijksePrijs?: number; // Total monthly price including all surcharges

  // Akkoord & Ingangsdatum
  ingangsdatum: string;
  akkoordVoorwaarden: boolean;
  iban: string;

  // Syntess matching
  syntessMatch?: {
    installatieOmschrijving: string;
  };
}

// Syntess Contract interface for existing contracts
export interface SyntessContract {
  adres: string;
  postcode: string;
  plaats: string;
  installatieOmschrijving: string;
  importedAt: number;
}