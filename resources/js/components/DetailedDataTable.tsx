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
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Search all columns..."
                />
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-white/5 bg-white/5">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 text-[10px] uppercase tracking-wider font-bold text-slate-400 select-none">
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
                        <tbody className="divide-y divide-white/5">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">Showing</span>
                    <select
                        className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-slate-300 focus:border-cyan-500/50 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize} rows
                            </option>
                        ))}
                    </select>
                    <span className="text-slate-500">per page</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-mono">
                        Page <span className="text-white">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-white">{table.getPageCount()}</span>
                    </span>
                    
                    <div className="flex items-center gap-1 bg-black/20 border border-white/10 p-1 rounded-lg">
                        <button
                            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            title="First Page"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            title="Previous Page"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            title="Next Page"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            title="Last Page"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
