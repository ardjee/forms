'use client';

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
import { useState, useMemo } from 'react';
import { GenericOverviewTable, type ColumnDef } from '@/components/GenericOverviewTable';

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

function UnifiedDataPageContent() {
  const { contracts, isLoading, error, deleteContractsByIds, updateContractStatus } = useUnifiedContracts();
  const { toast } = useToast();
  const { logout } = useAuth();
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<ContractType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAcceptContracts = async (ids: string[]) => {
    try {
      await updateContractStatus(ids, 'Actief');
      toast({
        title: "Contract(en) geaccepteerd",
        description: `${ids.length} contract(en) zijn gemarkeerd als Actief.`
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
        title: "Contract(en) geweigerd",
        description: `${ids.length} contract(en) zijn gemarkeerd als Geannuleerd.`
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
    return contracts.filter(contract => {
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
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate max-w-[150px] text-sm">{contract.klantNaam}</span>
        </div>
      ),
    },
    {
      key: 'klantWoonplaats',
      header: 'Plaats',
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
      renderCell: (contract) => <span className="text-xs">{contract.onderhoudsfrequentie} mnd</span>,
    },
    {
      key: 'monitoring',
      header: 'Monitor',
      sortable: true,
      renderCell: (contract) => (
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs">
            {contract.monitoring === 'ja' ? 'Ja' : contract.monitoring === 'nee' ? 'Nee' : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'maandelijksePrijs',
      header: 'Prijs/mnd',
      sortable: true,
      renderCell: (contract) => (
        <span className="font-semibold text-green-600 text-sm">
          {contract.maandelijksePrijs ? `€${contract.maandelijksePrijs.toFixed(2)}` : '-'}
        </span>
      ),
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
    link.setAttribute("download", `contracten_overzicht_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`);
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

  return (
    <>
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-4 md:py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overzicht van {filteredContracts.length} contract{filteredContracts.length !== 1 ? 'en' : ''}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </header>

        {/* Filters and View Mode */}
        <Card className="mb-6">
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
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          <GenericOverviewTable
            data={filteredContracts}
            columns={columns}
            isLoading={isLoading}
            onDelete={deleteContractsByIds}
            idKey="id"
            caption="Een overzicht van alle onderhoudscontracten."
            defaultSortKey="createdAt"
            entityName="contracten"
            onDownloadCsv={handleDownloadCsv}
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
      toast({ title: "Succesvol verwijderd", description: `${selectedIds.size} contract(en) verwijderd.` });
    } catch (error) {
      toast({ title: "Fout", description: "Kon contracten niet verwijderen.", variant: "destructive" });
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
          {customerGroups.length} klant{customerGroups.length !== 1 ? 'en' : ''} met in totaal {customerGroups.reduce((sum, g) => sum + g.contracts.length, 0)} contract{customerGroups.reduce((sum, g) => sum + g.contracts.length, 0) !== 1 ? 'en' : ''}
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
