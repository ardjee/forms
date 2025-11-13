import type { UnifiedContract } from '@/types';

export function generateOrderDetails(contract: UnifiedContract): { label: string; value: string }[] {
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

  const details: { label: string; value: string }[] = [
    { label: 'Contracttype', value: contractTypeLabels[contract.contractType] || contract.contractType },
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

  return details;
}

