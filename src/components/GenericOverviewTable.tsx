"use client";

import { useState, useMemo, type ReactNode } from 'react';
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

  const selectedIds = useMemo(() => Object.keys(selection).filter(id => selection[id]), [selection]);

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
    <div className="space-y-4">
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
        <Table>
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {columns.map(col => (
                <TableHead key={col.key}>
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