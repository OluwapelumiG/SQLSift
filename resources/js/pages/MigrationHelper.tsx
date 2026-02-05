import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import alasql from 'alasql';
import Papa from 'papaparse';
import { Plus, Trash2, Upload, Database, Play, Download, X } from 'lucide-react';
import '../../css/MigrationHelper.css';

interface Column {
    name: string;
    type: string;
}

interface Table {
    name: string;
    columns: Column[];
    data: any[];
}

export default function MigrationHelper() {
    const [tables, setTables] = useState<Table[]>([
        { name: 'table1', columns: [{ name: 'id', type: 'INT' }], data: [] },
        { name: 'table2', columns: [{ name: 'id', type: 'INT' }], data: [] }
    ]);
    const [query, setQuery] = useState('SELECT * FROM table1');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addTable = () => {
        if (tables.length < 2) {
            setTables([...tables, { name: `table${tables.length + 1}`, columns: [{ name: 'id', type: 'INT' }], data: [] }]);
        }
    };

    const removeTable = (index: number) => {
        setTables(tables.filter((_, i) => i !== index));
    };

    const addColumn = (tableIndex: number) => {
        const newTables = [...tables];
        newTables[tableIndex].columns.push({ name: '', type: 'STRING' });
        setTables(newTables);
    };

    const removeColumn = (tableIndex: number, colIndex: number) => {
        const newTables = [...tables];
        newTables[tableIndex].columns.splice(colIndex, 1);
        setTables(newTables);
    };

    const updateTable = (index: number, field: string, value: any) => {
        const newTables = [...tables];
        (newTables[index] as any)[field] = value;
        setTables(newTables);
    };

    const updateColumn = (tableIndex: number, colIndex: number, field: string, value: string) => {
        const newTables = [...tables];
        (newTables[tableIndex].columns[colIndex] as any)[field] = value;
        setTables(newTables);
    };

    const handleFileUpload = (tableIndex: number, file: File) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results: Papa.ParseResult<any>) => {
                const newTables = [...tables];
                newTables[tableIndex].data = results.data;
                setTables(newTables);
            },
            error: (err: Error) => {
                setError(`File upload error: ${err.message}`);
            }
        });
    };

    const runQuery = () => {
        try {
            setError(null);
            // Drop existing tables in alasql to refresh
            tables.forEach(table => {
                alasql(`DROP TABLE IF EXISTS ${table.name}`);
                alasql(`CREATE TABLE ${table.name}`);
                alasql.tables[table.name].data = table.data;
            });

            const res = alasql(query);
            setResults(Array.isArray(res) ? res : [res]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const downloadCSV = () => {
        if (results.length === 0) return;
        const csv = Papa.unparse(results);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'migration_result.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="migration-container">
            <Head title="Database Migration Helper" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-black title-gradient mb-2">Migration Helper</h1>
                    <p className="text-slate-400">Define schema, upload data, and query in-browser.</p>
                </header>

                <div className="grid gap-8">
                    {/* Schema Definition */}
                    <section className="glass-card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Database className="text-indigo-400" size={20} />
                                Schema Definition
                            </h2>
                            {tables.length < 2 && (
                                <button onClick={addTable} className="btn-primary flex items-center gap-2">
                                    <Plus size={18} /> Add Table
                                </button>
                            )}
                        </div>

                        <div className="table-schema-grid">
                            {tables.map((table, tIdx) => (
                                <div key={tIdx} className="glass-card bg-white/5 p-4 border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <input 
                                            value={table.name}
                                            onChange={(e) => updateTable(tIdx, 'name', e.target.value)}
                                            className="input-glass font-bold w-full mr-2"
                                            placeholder="Table Name"
                                        />
                                        <button onClick={() => removeTable(tIdx)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        {table.columns.map((col, cIdx) => (
                                            <div key={cIdx} className="column-row">
                                                <input 
                                                    value={col.name}
                                                    onChange={(e) => updateColumn(tIdx, cIdx, 'name', e.target.value)}
                                                    className="input-glass text-sm"
                                                    placeholder="Col Name"
                                                />
                                                <select 
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(tIdx, cIdx, 'type', e.target.value)}
                                                    className="input-glass text-sm bg-slate-800"
                                                >
                                                    <option value="STRING">STRING</option>
                                                    <option value="INT">INT</option>
                                                    <option value="FLOAT">FLOAT</option>
                                                    <option value="BOOLEAN">BOOLEAN</option>
                                                </select>
                                                <button onClick={() => removeColumn(tIdx, cIdx)} className="text-slate-500 hover:text-white">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={() => addColumn(tIdx)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-4">
                                        <Plus size={14} /> Add Column
                                    </button>

                                    <div className="data-upload-zone">
                                        <label className="cursor-pointer">
                                            <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                                            <span className="text-xs block text-slate-400">
                                                {table.data.length > 0 ? `${table.data.length} rows loaded` : 'Upload CSV/JSON'}
                                            </span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept=".csv,.json"
                                                onChange={(e) => e.target.files && handleFileUpload(tIdx, e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Query Section */}
                    <section className="glass-card">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Play className="text-emerald-400" size={20} />
                            SQL Query
                        </h2>
                        <textarea 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="sql-editor mb-4"
                            placeholder="SELECT * FROM table1 JOIN table2 ON table1.id = table2.user_id"
                        />
                        <div className="flex justify-between items-center">
                            <button onClick={runQuery} className="btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2">
                                <Play size={18} fill="currentColor" /> Run Query
                            </button>
                            {results.length > 0 && (
                                <button onClick={downloadCSV} className="btn-primary bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2">
                                    <Download size={18} /> Download CSV
                                </button>
                            )}
                        </div>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded"
                            >
                                {error}
                            </motion.div>
                        )}
                    </section>

                    {/* Results Table */}
                    {results.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Results ({results.length} rows)</h2>
                            <div className="results-table-container">
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            {Object.keys(results[0]).map(key => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j}>{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
