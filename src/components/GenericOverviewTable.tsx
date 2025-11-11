"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2, Download } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Reusable Column Definition Type
export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  renderCell: (item: T) => ReactNode;
}

// Props for the Generic Table
interface GenericOverviewTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  onDelete: (ids: string[]) => Promise<void>;
  idKey: keyof T;
  caption: string;
  defaultSortKey: string;
  entityName?: string;
  onDownloadCsv?: () => void;
  customActions?: (selectedIds: string[]) => ReactNode;
  // Optional: vertical offset for sticky elements under a page-level sticky header
  stickyTopOffset?: number;
  // Optional: expose sort state and handler for external use
  onSortChange?: (sortKey: string, direction: 'asc' | 'desc') => void;
  externalSortConfig?: { key: string; direction: 'asc' | 'desc' };
  // Optional: ref to the table element for measuring
  tableRef?: React.RefObject<HTMLTableElement>;
  // Optional: hide the table header (when using external sticky header)
  hideTableHeader?: boolean;
}

export function GenericOverviewTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  onDelete,
  idKey,
  caption,
  defaultSortKey,
  entityName = 'items',
  onDownloadCsv,
  customActions,
  stickyTopOffset = 0,
  onSortChange,
  externalSortConfig,
  tableRef,
  hideTableHeader = false,
}: GenericOverviewTableProps<T>) {
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('');
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: defaultSortKey, direction: 'desc' });
  
  // Use useMemo to ensure sortConfig updates trigger re-renders
  const sortConfig = useMemo(() => {
    return externalSortConfig || internalSortConfig;
  }, [externalSortConfig, internalSortConfig]);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Refs for sticky scrollbar
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const stickyScrollbarRef = useRef<HTMLDivElement>(null);
  const stickyScrollbarContentRef = useRef<HTMLDivElement>(null);
  const [showStickyScrollbar, setShowStickyScrollbar] = useState(false);
  const [stickyScrollbarPosition, setStickyScrollbarPosition] = useState({ left: 0, width: 0 });
  // New: explicit ref to the actual horizontal scroll container (table wrapper)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // New: track visibility in viewport to avoid showing bar when table is off-screen
  const [isInView, setIsInView] = useState<boolean>(false);
  // Guard to prevent scroll feedback loops
  const isSyncingRef = useRef<boolean>(false);
  
  const selectedIds = useMemo(() => Object.keys(selection).filter(id => selection[id]), [selection]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn('GenericOverviewTable: data is not an array', data);
      return [];
    }
    console.log('GenericOverviewTable - filtering data:', {
      dataLength: data.length,
      filterValue: filter,
      firstItemPrice: data[0]?.maandelijksePrijs || 'N/A'
    });
    const filtered = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    );
    console.log('GenericOverviewTable - filtered result:', {
      filteredLength: filtered.length,
      firstItemPrice: filtered[0]?.maandelijksePrijs || 'N/A'
    });
    return filtered;
  }, [data, filter]);

  const sortedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    console.log('GenericOverviewTable - sorted result:', {
      sortedLength: sortableData.length,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
      firstItemPrice: sortableData[0]?.maandelijksePrijs || 'N/A'
    });
    return sortableData;
  }, [filteredData, sortConfig]);

  // Debug: Log data changes
  useEffect(() => {
    console.log('GenericOverviewTable - data received:', {
      dataLength: data?.length || 0,
      isLoading,
      filteredDataLength: filteredData?.length || 0,
      sortedDataLength: sortedData?.length || 0,
      firstItemPrice: data?.[0]?.maandelijksePrijs || 'N/A',
      firstItemName: data?.[0]?.klantNaam || 'N/A',
      allPrices: data?.slice(0, 5).map(d => d.maandelijksePrijs) || []
    });
  }, [data, isLoading, filteredData, sortedData]);

  // Sync scrollbar with table
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const proxy = stickyScrollbarRef.current;
    const proxyInner = stickyScrollbarContentRef.current;
    if (!scrollContainer || !proxy || !proxyInner) return;

    const computeAndUpdate = () => {
      const rect = scrollContainer.getBoundingClientRect();
      const overflowing = scrollContainer.scrollWidth > scrollContainer.clientWidth;
      // Update proxy dimensions and position
      proxyInner.style.width = `${scrollContainer.scrollWidth}px`;
      setStickyScrollbarPosition({ left: rect.left, width: rect.width });
      // Show when horizontally overflowing (always visible while on this page)
      setShowStickyScrollbar(overflowing);
      // Keep initial sync aligned
      if (proxy.scrollLeft !== scrollContainer.scrollLeft) {
        proxy.scrollLeft = scrollContainer.scrollLeft;
      }
    };

    const handleContainerScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      proxy.scrollLeft = scrollContainer.scrollLeft;
      isSyncingRef.current = false;
    };

    const handleProxyScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      scrollContainer.scrollLeft = proxy.scrollLeft;
      isSyncingRef.current = false;
    };

    // Observe visibility of the scroll container in viewport
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
        // Recompute when visibility changes
        computeAndUpdate();
      },
      { root: null, threshold: 0 }
    );
    intersectionObserver.observe(scrollContainer);

    // Keep measurements up to date
    const resizeObserver = new ResizeObserver(computeAndUpdate);
    resizeObserver.observe(scrollContainer);

    // Window events
    const handleWindowScrollOrResize = () => computeAndUpdate();
    window.addEventListener('scroll', handleWindowScrollOrResize);
    window.addEventListener('resize', handleWindowScrollOrResize);

    // Attach scroll listeners
    scrollContainer.addEventListener('scroll', handleContainerScroll);
    proxy.addEventListener('scroll', handleProxyScroll);

    // Initial measurement
    computeAndUpdate();

    return () => {
      scrollContainer.removeEventListener('scroll', handleContainerScroll);
      proxy.removeEventListener('scroll', handleProxyScroll);
      window.removeEventListener('scroll', handleWindowScrollOrResize);
      window.removeEventListener('resize', handleWindowScrollOrResize);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [data, isInView]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    if (checked) {
      filteredData.forEach(item => newSelection[item.id] = true);
    }
    setSelection(newSelection);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelection(prev => ({ ...prev, [id]: checked }));
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSortConfig = { key, direction };
    
    // Update internal state if not using external config
    if (!externalSortConfig) {
      setInternalSortConfig(newSortConfig);
    }
    
    // Notify parent component
    if (onSortChange) {
      onSortChange(key, direction);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    await onDelete(selectedIds);
    setSelection({});
    setIsDeleting(false);
  };

  const renderLoadingState = () => (
     Array.from({ length: 5 }).map((_, i) => (
        <tr key={`loading-${i}`} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 w-[50px]"><Skeleton className="h-5 w-5" /></td>
          {columns.map((col) => <td key={col.key} className="p-4 align-middle [&:has([role=checkbox])]:pr-0"><Skeleton className="h-5 w-full" /></td>)}
        </tr>
     ))
  );

  return (
    <div className="space-y-4" ref={tableContainerRef} style={{ paddingBottom: showStickyScrollbar ? 16 : 0 }}>
      <div className="rounded-md border">
        <div 
          ref={scrollContainerRef}
          className="relative w-full overflow-x-auto overflow-y-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <table ref={tableRef} className="w-full caption-bottom text-sm border-separate" style={{ minWidth: '100%', width: 'max-content' }}>
            <caption className="mt-4 text-sm text-muted-foreground">{caption}</caption>
            {/* Sticky table header under freeze pane */}
            <thead className={`sticky z-30 bg-white shadow-sm [&_tr]:border-b ${hideTableHeader ? 'invisible h-0 overflow-hidden' : ''}`} style={{ top: stickyTopOffset }}>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[50px] bg-white">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              {columns.map(col => (
                <th key={col.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 bg-white">
                  {col.sortable ? (
                    <Button variant="ghost" onClick={() => requestSort(col.key)}>
                      {col.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <>
                  {renderLoadingState()}
                </>
              ) : sortedData.length > 0 ? (
                sortedData.map((item, index) => {
                  // Debug: log first few items to verify data is updating
                  if (index < 3) {
                    console.log(`GenericOverviewTable - Rendering row ${index}:`, {
                      id: item.id,
                      price: item.maandelijksePrijs,
                      klantNaam: item.klantNaam
                    });
                  }
                  return (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted" data-state={selection[item.id] && "selected"}>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Checkbox
                          checked={selection[item.id] || false}
                          onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                          aria-label={`Select row ${item.id}`}
                        />
                      </td>
                    {columns.map(col => {
                      const cellValue = col.renderCell(item);
                      const cellKey = col.key === 'maandelijksePrijs' 
                        ? `${item.id}-${col.key}-${item.maandelijksePrijs}` 
                        : `${item.id}-${col.key}`;
                      return (
                        <td key={cellKey} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{cellValue}</td>
                      );
                    })}
                    </tr>
                  );
                })
              ) : (
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td colSpan={columns.length + 1} className="p-4 align-middle [&:has([role=checkbox])]:pr-0 h-24 text-center">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sticky scrollbar at bottom of viewport */}
      {showStickyScrollbar && (
        <div 
          ref={stickyScrollbarRef}
          className="fixed bottom-0 h-5 overflow-x-auto overflow-y-hidden bg-white border-t-2 border-gray-300 shadow-lg z-50 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
          style={{ 
            left: `${stickyScrollbarPosition.left}px`,
            width: `${stickyScrollbarPosition.width}px`,
          }}
        >
          <div 
            ref={stickyScrollbarContentRef}
            className="h-full"
          />
        </div>
      )}

       <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {selectedIds.length} {entityName} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}