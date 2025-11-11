'use client';

// Dashboard for managing service subscriptions
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedContracts } from '@/context/UnifiedContractsContext';
import type { UnifiedContract, ContractType } from '@/types';
import { format, isValid as isValidDate, parseISO } from 'date-fns';
import {
  AlertTriangle, User, Mail, Phone, FileText, LogOut,
  Filter, Download, Users, List, Search, CheckCircle, XCircle, MapPin, CreditCard, Wrench, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { recalculatePrice } from '@/utils/priceCalculation';
import { GenericOverviewTable, type ColumnDef } from '@/components/GenericOverviewTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

// Contract type labels
const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
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

type ViewMode = 'list' | 'customer';

interface CustomerGroup {
  klantNaam: string;
  klantEmail: string;
  klantTelefoon: string;
  klantAdres: string;
  klantPostcode: string;
  klantWoonplaats: string;
  contracts: UnifiedContract[];
}

// Helper function to generate order details from contract
function generateOrderDetails(contract: UnifiedContract): { label: string; value: string }[] {
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

function UnifiedDataPageContent() {
  const { contracts, isLoading, error, deleteContractsByIds, updateContractStatus, updateContractField, refreshContracts } = useUnifiedContracts();
  const { toast } = useToast();
  const { logout } = useAuth();
  const router = useRouter();
  
  // Debug: Log when contracts change
  useEffect(() => {
    console.log('📊 Dashboard - contracts updated from context:', {
      count: contracts.length,
      firstPrices: contracts.slice(0, 5).map(c => ({ id: c.id, price: c.maandelijksePrijs, name: c.klantNaam }))
    });
  }, [contracts]);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<ContractType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  
  // Order summary modal state
  const [selectedContract, setSelectedContract] = useState<UnifiedContract | null>(null);
  
  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAcceptContracts = async (ids: string[]) => {
    try {
      await updateContractStatus(ids, 'Actief');
      toast({
        title: "Abonnement(en) geaccepteerd",
        description: `${ids.length} abonnement(en) zijn gemarkeerd als Actief.`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive"
      });
    }
  };

  const handleRejectContracts = async (ids: string[]) => {
    try {
      await updateContractStatus(ids, 'Geannuleerd');
      toast({
        title: "Abonnement(en) geweigerd",
        description: `${ids.length} abonnement(en) zijn gemarkeerd als Geannuleerd.`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive"
      });
    }
  };

  // Filter and search contracts
  const filteredContracts = useMemo(() => {
    console.log('Dashboard - Filtering contracts:', {
      totalContracts: contracts.length,
      filterType,
      filterStatus,
      searchTerm,
    });
    const filtered = contracts.filter(contract => {
      // Type filter
      if (filterType !== 'all' && contract.contractType !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && contract.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          contract.klantNaam?.toLowerCase().includes(search) ||
          contract.klantEmail?.toLowerCase().includes(search) ||
          contract.klantTelefoon?.toLowerCase().includes(search)
        );
      }

      return true;
    });
    console.log('Dashboard - Filtered contracts result:', {
      filteredCount: filtered.length,
      firstFew: filtered.slice(0, 3).map(c => ({ 
        id: c.id, 
        klantNaam: c.klantNaam,
        price: c.maandelijksePrijs 
      }))
    });
    return filtered;
  }, [contracts, filterType, filterStatus, searchTerm]);

  // Group contracts by customer
  const customerGroups = useMemo((): CustomerGroup[] => {
    const groups = new Map<string, CustomerGroup>();

    filteredContracts.forEach(contract => {
      const key = contract.klantEmail.toLowerCase();

      if (!groups.has(key)) {
        groups.set(key, {
          klantNaam: contract.klantNaam,
          klantEmail: contract.klantEmail,
          klantTelefoon: contract.klantTelefoon,
          klantAdres: contract.klantAdres,
          klantPostcode: contract.klantPostcode,
          klantWoonplaats: contract.klantWoonplaats,
          contracts: [],
        });
      }

      groups.get(key)!.contracts.push(contract);
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.klantNaam.localeCompare(b.klantNaam)
    );
  }, [filteredContracts]);

  // Table columns for list view
  const columns: ColumnDef<UnifiedContract>[] = [
    {
      key: 'createdAt',
      header: 'Ingevoerd',
      sortable: true,
      renderCell: (contract) => {
        const timestamp = contract.createdAt;
        if (!timestamp) return '-';
        const dateObj = new Date(timestamp);
        return <span className="text-xs">{isValidDate(dateObj) ? format(dateObj, 'dd-MM-yy HH:mm') : '-'}</span>;
      },
    },
    {
      key: 'contractType',
      header: 'Type',
      sortable: true,
      renderCell: (contract) => (
        <Badge variant="outline" className="whitespace-nowrap">
          {CONTRACT_TYPE_LABELS[contract.contractType]}
        </Badge>
      ),
    },
    {
      key: 'toestelMerk',
      header: 'Merk',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <Wrench className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate max-w-[100px]">
            {contract.merkToestel || contract.toestelMerk || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'toestelType',
      header: 'Model',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <Wrench className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate max-w-[120px]">
            {contract.typeToestel || contract.toestelType || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'klantNaam',
      header: 'Klantnaam',
      sortable: true,
      renderCell: (contract) => (
        <div 
          className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedContract(contract);
          }}
        >
          <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate max-w-[150px] text-sm">{contract.klantNaam}</span>
        </div>
      ),
    },
    {
      key: 'klantAdres',
      header: 'Adres',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate max-w-[150px]">{contract.klantAdres}</span>
        </div>
      ),
    },
    {
      key: 'klantWoonplaats',
      header: 'Woonplaats',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate max-w-[100px]">{contract.klantWoonplaats}</span>
        </div>
      ),
    },
    {
      key: 'klantEmail',
      header: 'Email',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <a href={`mailto:${contract.klantEmail}`} className="hover:underline truncate max-w-[120px] text-xs">
            {contract.klantEmail}
          </a>
        </div>
      ),
    },
    {
      key: 'klantTelefoon',
      header: 'Telefoon',
      sortable: false,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <a href={`tel:${contract.klantTelefoon}`} className="hover:underline text-xs">
            {contract.klantTelefoon}
          </a>
        </div>
      ),
    },
    {
      key: 'iban',
      header: 'IBAN',
      sortable: false,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-mono">
            {contract.iban ? '****' + contract.iban.slice(-4) : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'typeAbonnement',
      header: 'Abonnement',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs capitalize">{contract.typeAbonnement}</span>
        </div>
      ),
    },
    {
      key: 'onderhoudsfrequentie',
      header: 'Freq.',
      sortable: true,
      renderCell: (contract) => (
        <Select
          value={String(contract.onderhoudsfrequentie)}
          onValueChange={async (value) => {
            try {
              const newFreq = parseInt(value);
              
              // Recalculate price using the centralized price calculation
              const newPrice = recalculatePrice(contract, newFreq);
              
              if (newPrice === null) {
                toast({
                  title: "Waarschuwing",
                  description: "Kon nieuwe prijs niet berekenen. Alleen frequentie wordt bijgewerkt.",
                  variant: "destructive"
                });
                await updateContractField(contract.id, 'onderhoudsfrequentie', value);
                return;
              }
              
              console.log('💰 Prijs herberekening:', {
                contractType: contract.contractType,
                oldFreq: contract.onderhoudsfrequentie,
                newFreq,
                oldPrice: contract.maandelijksePrijs,
                newPrice
              });
              
              // Update both frequency and price
              await updateContractField(contract.id, 'onderhoudsfrequentie', value);
              await updateContractField(contract.id, 'maandelijksePrijs', newPrice);
              
              toast({
                title: "Bijgewerkt",
                description: `Frequentie: ${value} mnd → Prijs: €${newPrice.toFixed(2)}/mnd`
              });
            } catch (error) {
              console.error('Error updating frequency:', error);
              toast({
                title: "Fout",
                description: "Kon frequentie niet bijwerken.",
                variant: "destructive"
              });
            }
          }}
        >
          <SelectTrigger className="w-[80px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 mnd</SelectItem>
            <SelectItem value="18">18 mnd</SelectItem>
            <SelectItem value="24">24 mnd</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'monitoring',
      header: 'Monitor',
      sortable: true,
      renderCell: (contract) => (
        <Select
          value={contract.monitoring || 'nee'}
          onValueChange={async (value: 'ja' | 'nee') => {
            try {
              const oldMonitoring = contract.monitoring;
              
              // Recalculate price with new monitoring setting
              const contractWithNewMonitoring = { ...contract, monitoring: value };
              const newPrice = recalculatePrice(contractWithNewMonitoring, contract.onderhoudsfrequentie);
              
              if (newPrice === null) {
                toast({
                  title: "Waarschuwing",
                  description: "Kon nieuwe prijs niet berekenen. Alleen monitoring wordt bijgewerkt.",
                  variant: "destructive"
                });
                await updateContractField(contract.id, 'monitoring', value);
                return;
              }
              
              console.log('📡 Monitoring wijziging:', {
                contractType: contract.contractType,
                oldMonitoring,
                newMonitoring: value,
                oldPrice: contract.maandelijksePrijs,
                newPrice,
                priceDiff: (newPrice - (contract.maandelijksePrijs || 0)).toFixed(2)
              });
              
              // Update both monitoring and price
              await updateContractField(contract.id, 'monitoring', value);
              await updateContractField(contract.id, 'maandelijksePrijs', newPrice);
              
              toast({
                title: "Bijgewerkt",
                description: `Monitoring: ${value === 'ja' ? 'Ja' : 'Nee'} → Prijs: €${newPrice.toFixed(2)}/mnd`
              });
            } catch (error) {
              console.error('Error updating monitoring:', error);
              toast({
                title: "Fout",
                description: "Kon monitoring niet bijwerken.",
                variant: "destructive"
              });
            }
          }}
        >
          <SelectTrigger className="w-[70px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ja">Ja</SelectItem>
            <SelectItem value="nee">Nee</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'maandelijksePrijs',
      header: 'Prijs/mnd',
      sortable: true,
      renderCell: (contract) => {
        const price = contract.maandelijksePrijs;
        console.log(`Rendering price for contract ${contract.id}:`, price);
        return (
          <span className="font-semibold text-green-600 text-sm">
            {price ? `€${price.toFixed(2)}` : '-'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      renderCell: (contract) => {
        const getStatusStyle = (status: string) => {
          switch (status) {
            case 'Actief':
              return 'bg-green-100 text-green-800 border-green-200';
            case 'Nieuw':
              return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Geannuleerd':
              return 'bg-red-100 text-red-800 border-red-200';
            case 'In behandeling':
              return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        return (
          <Badge variant="outline" className={getStatusStyle(contract.status)}>
            {contract.status}
          </Badge>
        );
      },
    },
    {
      key: 'ingangsdatum',
      header: 'Ingang',
      sortable: true,
      renderCell: (contract) => {
        const dateStr = contract.ingangsdatum;
        if (!dateStr) return '-';
        const dateObj = parseISO(dateStr);
        return <span className="text-xs">{isValidDate(dateObj) ? format(dateObj, 'dd-MM-yyyy') : '-'}</span>;
      },
    },
  ];

  const handleDownloadCsv = () => {
    if (filteredContracts.length === 0) {
      toast({ title: "Geen data", description: "Er is geen data om te downloaden." });
      return;
    }

    const headers = [
      // Metadata
      'Ingevoerd op', 'Type', 'Status',
      // Klantgegevens
      'Klantnaam', 'Adres', 'Postcode', 'Woonplaats', 'Telefoon', 'Email',
      // Afwijkend toesteladres
      'Adres Afwijkend', 'Toestel Adres', 'Toestel Postcode', 'Toestel Woonplaats', 'Toestel Telefoon',
      // Toestelgegevens
      'Toestel Merk', 'Toestel Type', 'Bouwjaar', 'Serienummer',
      // CV specifiek
      'Reeds in Onderhoud bij ZON_ECN',
      // CV/Warmtepomp specifiek
      'CV Vermogen', 'Aantal Binnenunits',
      // Onderhoudsabonnement
      'Type Abonnement', 'Frequentie (maanden)', 'Monitoring',
      // Toeslag & Betaling
      'Voorrijdkosten', 'Maandelijkse Prijs',
      // Contract details
      'Ingangsdatum', 'IBAN (laatste 4)', 'Akkoord Voorwaarden'
    ];

    const csvRows = [headers.join(',')];

    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    filteredContracts.forEach(contract => {
      const row = [
        // Metadata
        escapeCsvField(contract.createdAt ? format(new Date(contract.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''),
        escapeCsvField(CONTRACT_TYPE_LABELS[contract.contractType]),
        escapeCsvField(contract.status),
        // Klantgegevens
        escapeCsvField(contract.klantNaam),
        escapeCsvField(contract.klantAdres),
        escapeCsvField(contract.klantPostcode),
        escapeCsvField(contract.klantWoonplaats),
        escapeCsvField(contract.klantTelefoon),
        escapeCsvField(contract.klantEmail),
        // Afwijkend toesteladres
        escapeCsvField(contract.adresAfwijkend ? 'Ja' : 'Nee'),
        escapeCsvField(contract.toestelAdres || ''),
        escapeCsvField(contract.toestelPostcode || ''),
        escapeCsvField(contract.toestelWoonplaats || ''),
        escapeCsvField(contract.toestelTelefoon || ''),
        // Toestelgegevens
        escapeCsvField(contract.merkToestel || contract.toestelMerk || ''),
        escapeCsvField(contract.typeToestel || contract.toestelType || ''),
        escapeCsvField(contract.bouwjaar || contract.toestelBouwjaar || ''),
        escapeCsvField(contract.serienummer || contract.toestelSerienummer || ''),
        // CV specifiek
        escapeCsvField(contract.reedsinOnderhoud ? (contract.reedsinOnderhoud === 'ja' ? 'Ja' : 'Nee') : ''),
        // CV/Warmtepomp specifiek
        escapeCsvField(contract.cvVermogen || ''),
        escapeCsvField(contract.aantalBinnenunits || ''),
        // Onderhoudsabonnement
        escapeCsvField(contract.typeAbonnement),
        escapeCsvField(contract.onderhoudsfrequentie),
        escapeCsvField(contract.monitoring || ''),
        // Toeslag & Betaling
        escapeCsvField(contract.voorrijdkosten || contract.toeslag || ''),
        escapeCsvField(contract.maandelijksePrijs != null ? `€${contract.maandelijksePrijs.toFixed(2)}` : ''),
        // Contract details
        escapeCsvField(contract.ingangsdatum ? format(parseISO(contract.ingangsdatum), 'yyyy-MM-dd') : ''),
        escapeCsvField(contract.iban ? '****' + contract.iban.slice(-4) : ''),
        escapeCsvField(contract.akkoordVoorwaarden ? 'Ja' : 'Nee'),
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `abonnementen_overzicht_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Download Gestart", description: "Het CSV-bestand wordt gedownload." });
  };

  if (error) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-4 md:py-8 text-center text-destructive">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4"/>
        <h2 className="text-xl font-semibold">Fout bij laden</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Measure height of the freeze pane (header + filters) for sticky offsets below
  const freezeRef = useRef<HTMLDivElement>(null);
  const [freezeHeight, setFreezeHeight] = useState(0);
  useEffect(() => {
    const el = freezeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFreezeHeight(el.offsetHeight));
    ro.observe(el);
    setFreezeHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-4 md:py-8">
        {/* Freeze pane: header + filters always visible */}
        <div ref={freezeRef} className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {/* Header */}
          <header className="py-3 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary font-headline">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overzicht van {filteredContracts.length} abonnement{filteredContracts.length !== 1 ? 'en' : ''}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </header>

          {/* Filters and View Mode */}
          <Card className="mb-4 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Weergave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* View Mode Toggle */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Weergave</Label>
                <RadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="list" />
                    <Label htmlFor="list" className="flex items-center gap-2 cursor-pointer">
                      <List className="h-4 w-4" />
                      Lijst weergave
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      Klant weergave
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type-filter" className="text-sm font-medium mb-2 block">Type</Label>
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as ContractType | 'all')}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Alle types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle types</SelectItem>
                      {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Alle statussen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statussen</SelectItem>
                      <SelectItem value="Nieuw">Nieuw</SelectItem>
                      <SelectItem value="In behandeling">In behandeling</SelectItem>
                      <SelectItem value="Actief">Actief</SelectItem>
                      <SelectItem value="Geannuleerd">Geannuleerd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">Zoeken</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Naam, email of telefoon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Table Header Row - Only show in list view */}
              {viewMode === 'list' && (
                <div className="pt-4 border-t">
                  <div className="overflow-x-auto -mx-6 px-6">
                    <div className="inline-flex min-w-full gap-2 text-xs font-medium text-muted-foreground h-12 items-center">
                      <div className="w-[50px] flex-shrink-0 px-4"></div>
                      {columns.map((col) => (
                        <div 
                          key={col.key} 
                          className={`px-4 flex-shrink-0 whitespace-nowrap h-12 flex items-center ${
                            col.sortable ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                          }`}
                          onClick={() => col.sortable && handleSortChange(col.key, sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'desc' : 'asc')}
                        >
                          <div className="flex items-center gap-1">
                            {col.header}
                            {col.sortable && (
                              <span className="text-xs">
                                {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          <>
            <div className="sticky z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ top: freezeHeight }}>
              <div className="flex justify-end items-center py-2">
                <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
            <GenericOverviewTable
            key={`table-${filteredContracts.length}-${filteredContracts.map(c => c.id).join(',').substring(0, 100)}`}
            data={filteredContracts}
            columns={columns}
            isLoading={isLoading}
            onDelete={deleteContractsByIds}
            idKey="id"
            caption="Een overzicht van alle onderhoudsabonnementen."
            defaultSortKey="createdAt"
            entityName="abonnementen"
            stickyTopOffset={freezeHeight}
            externalSortConfig={sortConfig}
            onSortChange={handleSortChange}
            customActions={(selectedIds) => (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAcceptContracts(selectedIds)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accepteren ({selectedIds.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectContracts(selectedIds)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Weigeren ({selectedIds.length})
                </Button>
              </>
            )}
          />
          </>
        ) : (
          <CustomerGroupView
            customerGroups={customerGroups}
            isLoading={isLoading}
            onDelete={deleteContractsByIds}
            onDownloadCsv={handleDownloadCsv}
            onAccept={handleAcceptContracts}
            onReject={handleRejectContracts}
          />
        )}
      </div>
      
      {/* Order Summary Modal */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orderoverzicht - {selectedContract?.klantNaam}</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="mt-4">
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm font-semibold text-gray-800 mb-2">Abonnementsgegevens:</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Abonnement: {selectedContract.typeAbonnement === 'onderhoud' ? 'Onderhoud' : selectedContract.typeAbonnement === 'service-plus' ? 'Service Plus' : selectedContract.typeAbonnement}</p>
                  <p>• Frequentie: {selectedContract.onderhoudsfrequentie} maanden</p>
                  {selectedContract.maandelijksePrijs !== undefined && (
                    <p>• Maandbedrag: €{selectedContract.maandelijksePrijs.toFixed(2)} per maand</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-800 mb-3">Uw keuzes uit het formulier:</p>
                <div className="border rounded-lg overflow-hidden border-gray-200">
                  <Table>
                    <TableBody>
                      {generateOrderDetails(selectedContract).map((item, index) => (
                        <TableRow key={index} className="border-b border-gray-200 last:border-b-0">
                          <TableCell className="w-[45%] bg-gray-50 font-medium text-gray-700 border-r border-gray-200 py-3 px-4 text-sm">
                            {item.label}
                          </TableCell>
                          <TableCell className="text-gray-900 py-3 px-4 text-sm">
                            {item.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Customer Group View Component
function CustomerGroupView({
  customerGroups,
  isLoading,
  onDelete,
  onDownloadCsv,
  onAccept,
  onReject
}: {
  customerGroups: CustomerGroup[];
  isLoading: boolean;
  onDelete: (ids: string[]) => Promise<void>;
  onDownloadCsv: () => void;
  onAccept: (ids: string[]) => Promise<void>;
  onReject: (ids: string[]) => Promise<void>;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSelectContract = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    try {
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast({ title: "Succesvol verwijderd", description: `${selectedIds.size} abonnement(en) verwijderd.` });
    } catch (error) {
      toast({ title: "Fout", description: "Kon abonnementen niet verwijderen.", variant: "destructive" });
    }
  };

  const handleAcceptSelected = async () => {
    if (selectedIds.size === 0) return;

    try {
      await onAccept(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      // Error already handled in parent component
    }
  };

  const handleRejectSelected = async () => {
    if (selectedIds.size === 0) return;

    try {
      await onReject(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      // Error already handled in parent component
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {customerGroups.length} klant{customerGroups.length !== 1 ? 'en' : ''} met in totaal {customerGroups.reduce((sum, g) => sum + g.contracts.length, 0)} abonnement{customerGroups.reduce((sum, g) => sum + g.contracts.length, 0) !== 1 ? 'en' : ''}
        </p>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                onClick={handleAcceptSelected}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepteren ({selectedIds.size})
              </Button>
              <Button
                onClick={handleRejectSelected}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Weigeren ({selectedIds.size})
              </Button>
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                Verwijder geselecteerde ({selectedIds.size})
              </Button>
            </>
          )}
          <Button onClick={onDownloadCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Customer Groups */}
      {customerGroups.map((group, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {group.klantNaam}
            </CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${group.klantEmail}`} className="hover:underline">{group.klantEmail}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <a href={`tel:${group.klantTelefoon}`} className="hover:underline">{group.klantTelefoon}</a>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectContract(contract.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contract.id)}
                      onChange={() => handleSelectContract(contract.id)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="font-medium">{CONTRACT_TYPE_LABELS[contract.contractType]}</div>
                      <div className="text-sm text-muted-foreground">
                        {contract.typeAbonnement} • {contract.onderhoudsfrequentie} maanden
                        {contract.monitoring === 'ja' && ' • Monitoring'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={(() => {
                      switch (contract.status) {
                        case 'Actief':
                          return 'bg-green-100 text-green-800 border-green-200';
                        case 'Nieuw':
                          return 'bg-gray-100 text-gray-800 border-gray-200';
                        case 'Geannuleerd':
                          return 'bg-red-100 text-red-800 border-red-200';
                        case 'In behandeling':
                          return 'bg-blue-100 text-blue-800 border-blue-200';
                        default:
                          return 'bg-gray-100 text-gray-800 border-gray-200';
                      }
                    })()}>
                      {contract.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(contract.createdAt), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UnifiedDataPageWrapper() {
  return <ProtectedRoute><UnifiedDataPageContent /></ProtectedRoute>;
}

export default UnifiedDataPageWrapper;
