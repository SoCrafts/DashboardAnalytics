import React, { useMemo, useState } from 'react';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Row = Record<string, string | number | boolean | null>;

interface DatasetTableProps {
  columns: { name: string; dataType: string }[];
  rows: Row[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  columns: rawColumns,
  rows,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Row>[]>(() => {
    return rawColumns.map((col) => ({
      accessorKey: col.name,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-tighter flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {col.name}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue(col.name);

        if (value === null || value === undefined) {
          return <span className="text-slate-300 italic font-medium">NULL</span>;
        }

        let valueStr;

        if (typeof value === "boolean") {
          valueStr = value ? "Yes" : "No";
        } else if (typeof value === "number") {
          valueStr = new Intl.NumberFormat('it-IT', {
            maximumFractionDigits: 10,
          }).format(value as number);
        } else {
          valueStr = String(value);
        }

        return (
          <div className="flex items-center gap-2 group">
            <span className="truncate max-w-[200px] font-medium text-slate-700 tabular-nums">
              {valueStr}
            </span>
          </div>
        );
      }
    }));
  }, [rawColumns]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(event.target.value)}
            className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl h-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="page-size" className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Rows per page
          </Label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger id="page-size" className="w-[80px] h-10 rounded-xl border-slate-200 shadow-sm">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)} className="rounded-lg">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 border-slate-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-slate-400 font-medium">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900">{rows.length}</span> of <span className="text-slate-900">{totalRows.toLocaleString()}</span> records
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-900 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              {page}
            </span>
            <span className="text-xs font-medium text-slate-300">of</span>
            <span className="text-xs font-bold text-slate-500 px-2">
              {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
