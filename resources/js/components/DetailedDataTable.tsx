import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
    data: any[];
    columns: any[];
}

export function DetailedDataTable({ data, columns: rawColumns }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]).map(key => ({
            accessorKey: key,
            header: ({ column }: any) => {
                return (
                    <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {key.toUpperCase()}
                        {column.getIsSorted() === 'asc' ? <ArrowUp size={14} /> : 
                         column.getIsSorted() === 'desc' ? <ArrowDown size={14} /> : 
                         <ArrowUpDown size={14} className="opacity-30" />}
                    </div>
                );
            },
        }));
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (data.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="search-input-container">
                <Search className="search-icon" size={18} />
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="input-glass"
                    placeholder="Search all columns..."
                />
            </div>

            <div className="results-table-container">
                <table className="results-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-controls">
                <div className="pagination-info">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex gap-1">
                    <button
                        className="btn-primary p-1.5"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        className="btn-primary p-1.5"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        className="btn-primary p-1.5"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        className="btn-primary p-1.5"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
                <select
                    className="input-glass text-xs bg-slate-900 border-none"
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
