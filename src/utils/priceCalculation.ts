// Centrale prijsberekening voor alle contracttypes
import type { UnifiedContract } from '@/types';

// Prijzen per contract type, frequentie en abonnement
const cvPrijzen: Record<string, Record<string, Record<string, number>>> = {
  'tot-45kw': {
    '12': { 'onderhoud': 17.10, 'service-plus': 23.17 },
    '18': { 'onderhoud': 13.06, 'service-plus': 17.09 },
    '24': { 'onderhoud': 11.09, 'service-plus': 14.08 }
  },
  '45-70kw': {
    '12': { 'onderhoud': 23.34, 'service-plus': 32.35 },
    '18': { 'onderhoud': 17.52, 'service-plus': 23.54 },
    '24': { 'onderhoud': 14.46, 'service-plus': 18.96 }
  }
};

const warmtepompPrijzen: Record<string, Record<string, number>> = {
  '12': { 'onderhoud': 12.10, 'service-plus': 18.17 },
  '18': { 'onderhoud': 10.06, 'service-plus': 14.09 },
  '24': { 'onderhoud': 8.09, 'service-plus': 11.08 }
};

const hybrideWarmtepompPrijzen: Record<string, Record<string, number>> = {
  '12': { 'onderhoud': 8.29, 'service-plus': 10.42 },
  '18': { 'onderhoud': 6.53, 'service-plus': 8.95 },
  '24': { 'onderhoud': 5.65, 'service-plus': 7.71 }
};

const grondgebondenWarmtepompPrijzen: Record<string, Record<string, number>> = {
  '12': { 'onderhoud': 12.30, 'service-plus': 18.42 },
  '18': { 'onderhoud': 10.23, 'service-plus': 14.30 },
  '24': { 'onderhoud': 8.23, 'service-plus': 11.16 }
};

const gasboilerPrijzen: Record<string, Record<string, number>> = {
  '12': { 'onderhoud': 8.94, 'service-plus': 11.99 },
  '18': { 'onderhoud': 8.94, 'service-plus': 11.99 }
};

const aircoPrijzen: Record<string, Record<string, Record<string, number>>> = {
  '1': {
    '12': { 'onderhoud': 17.10, 'service-plus': 23.17 },
    '18': { 'onderhoud': 13.06, 'service-plus': 17.09 },
    '24': { 'onderhoud': 11.09, 'service-plus': 14.08 }
  },
  '2': {
    '12': { 'onderhoud': 20.46, 'service-plus': 30.37 },
    '18': { 'onderhoud': 15.61, 'service-plus': 22.80 },
    '24': { 'onderhoud': 13.27, 'service-plus': 18.91 }
  },
  '3': {
    '12': { 'onderhoud': 23.82, 'service-plus': 37.56 },
    '18': { 'onderhoud': 18.16, 'service-plus': 28.51 },
    '24': { 'onderhoud': 15.44, 'service-plus': 23.73 }
  },
  '4': {
    '12': { 'onderhoud': 27.17, 'service-plus': 44.76 },
    '18': { 'onderhoud': 20.71, 'service-plus': 34.22 },
    '24': { 'onderhoud': 17.62, 'service-plus': 28.56 }
  }
};

const monitoringPrijs = 11.50;

const voorrijdkostenPrijzen: Record<string, number> = {
  '0-15km': 0,
  '15-30km': 5.75,
  '31-50km': 9.40
};

/**
 * Herberekent de maandelijkse prijs voor een contract op basis van nieuwe frequentie
 * @param contract Het originele contract
 * @param newFreq De nieuwe onderhoudsfrequentie in maanden
 * @returns De nieuwe maandelijkse prijs, of null als deze niet kan worden berekend
 */
export function recalculatePrice(contract: UnifiedContract, newFreq: number): number | null {
  const freq = String(newFreq);
  const abonnement = contract.typeAbonnement || 'onderhoud';
  
  let basisPrijs: number | undefined;

  // Bepaal basisprijs op basis van contracttype
  switch (contract.contractType) {
    case 'cv-ketel':
      const cvVermogen = contract.cvVermogen || 'tot-45kw';
      basisPrijs = cvPrijzen[cvVermogen]?.[freq]?.[abonnement];
      break;
      
    case 'warmtepomp-all-electric':
      basisPrijs = warmtepompPrijzen[freq]?.[abonnement];
      break;
      
    case 'warmtepomp-hybride':
      basisPrijs = hybrideWarmtepompPrijzen[freq]?.[abonnement];
      break;
      
    case 'warmtepomp-grondgebonden':
      basisPrijs = grondgebondenWarmtepompPrijzen[freq]?.[abonnement];
      break;
      
    case 'gasboiler':
      basisPrijs = gasboilerPrijzen[freq]?.[abonnement];
      break;
      
    case 'airco':
      const aantalUnits = String(contract.aantalBinnenunits || 1);
      basisPrijs = aircoPrijzen[aantalUnits]?.[freq]?.[abonnement];
      break;
      
    default:
      // Voor andere types gebruiken we proportionele berekening
      const oldPrice = contract.maandelijksePrijs || 0;
      const oldFreq = contract.onderhoudsfrequentie;
      if (oldFreq && oldPrice > 0) {
        const totalYearlyPrice = oldPrice * oldFreq;
        return parseFloat((totalYearlyPrice / newFreq).toFixed(2));
      }
      return null;
  }

  if (basisPrijs === undefined) {
    console.warn(`Geen prijs gevonden voor ${contract.contractType} met frequentie ${freq}`);
    return null;
  }

  // Voeg monitoring toe indien van toepassing
  const monitoringKosten = contract.monitoring === 'ja' ? monitoringPrijs : 0;
  
  // Voeg voorrijdkosten toe indien van toepassing
  const voorrijdkostenKosten = contract.voorrijdkosten ? (voorrijdkostenPrijzen[contract.voorrijdkosten] || 0) : 0;

  const totaalPrijs = basisPrijs + monitoringKosten + voorrijdkostenKosten;
  
  return parseFloat(totaalPrijs.toFixed(2));
}

