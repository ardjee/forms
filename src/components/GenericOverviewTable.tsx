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
}: GenericOverviewTableProps<T>) {
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: defaultSortKey, direction: 'desc' });
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
    setSortConfig({ key, direction });
  };
  
  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter]);

  const sortedData = useMemo(() => {
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
    return sortableData;
  }, [filteredData, sortConfig]);

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    await onDelete(selectedIds);
    setSelection({});
    setIsDeleting(false);
  };

  const renderLoadingState = () => (
     Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`loading-${i}`}>
          <TableCell className="w-[50px]"><Skeleton className="h-5 w-5" /></TableCell>
          {columns.map((col) => <TableCell key={col.key}><Skeleton className="h-5 w-full" /></TableCell>)}
        </TableRow>
     ))
  );

  return (
    <div className="space-y-4" ref={tableContainerRef} style={{ paddingBottom: showStickyScrollbar ? 16 : 0 }}>
      <div className="flex justify-between items-center">
        <Input
          placeholder={`Filter ${entityName}...`}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
            {onDownloadCsv && (
              <Button variant="outline" size="sm" onClick={onDownloadCsv}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            )}
            {customActions && selectedIds.length > 0 && customActions(selectedIds)}
            {selectedIds.length > 0 && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedIds.length})
                </Button>
            )}
        </div>
      </div>
      <div className="rounded-md border">
        <div 
          ref={scrollContainerRef}
          className="relative w-full overflow-x-auto overflow-y-visible [&::-webkit-scrollbar]:hidden"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <Table style={{ minWidth: '100%', width: 'max-content' }}>
            <TableCaption>{caption}</TableCaption>
            {/* Offset under the sticky filters/header area */}
            <TableHeader className="sticky top-28 z-30 bg-white shadow-sm">
              <TableRow>
                <TableHead className="w-[50px] sticky top-28 z-30 bg-white">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              {columns.map(col => (
                <TableHead key={col.key} className="sticky top-28 z-30 bg-white">
                  {col.sortable ? (
                    <Button variant="ghost" onClick={() => requestSort(col.key)}>
                      {col.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderLoadingState() : (
                sortedData.length > 0 ? (
                  sortedData.map(item => (
                    <TableRow key={item.id} data-state={selection[item.id] && "selected"}>
                      <TableCell>
                        <Checkbox
                          checked={selection[item.id] || false}
                          onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                          aria-label={`Select row ${item.id}`}
                        />
                      </TableCell>
                    {columns.map(col => (
                      <TableCell key={col.key}>{col.renderCell(item)}</TableCell>
                    ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
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