import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import alasql from 'alasql';
import Papa from 'papaparse';
import { Plus, Trash2, Upload, Database, Play, Download, X, Search, Terminal, AlertCircle } from 'lucide-react';
import { Editor, loader } from '@monaco-editor/react';
import '../../css/MigrationHelper.css';
import { DetailedDataTable } from '@/components/DetailedDataTable';

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
        setTables([...tables, { name: `table${tables.length + 1}`, columns: [{ name: 'id', type: 'INT' }], data: [] }]);
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

    const sqlKeywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 
        'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS',
        'SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'DATABASE', 'TABLE', 'CREATE', 'DROP', 'INSERT', 'INTO', 'VALUES',
        'UNION', 'ALL', 'DISTINCT', 'HAVING', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];

    const validateSQL = (value: string, monaco: any, model: any) => {
        const markers: any[] = [];
        const lines = value.split('\n');
        
        // Simple heuristic: if a word looks like a keyword (all caps or start of statement) 
        // but isn't in our list, mark it.
        const keywordMap = new Set(sqlKeywords.map(k => k.toLowerCase()));
        
        lines.forEach((line, lineIdx) => {
            // Match potential keywords (words that are all caps or common prefixes)
            const words = line.matchAll(/\b[A-Za-z]+\b/g);
            for (const match of words) {
                const word = match[0];
                const lowerWord = word.toLowerCase();
                
                // If the word is a known common SQL typo or a misspelled keyword
                // This is a simplified check. We look for words that are "close" to keywords or
                // words that are used where keywords usually are.
                if (!keywordMap.has(lowerWord)) {
                    // Check for common typos
                    const commonTypos: Record<string, string> = {
                        'selct': 'SELECT',
                        'frmo': 'FROM',
                        'joinn': 'JOIN',
                        'wher': 'WHERE',
                        'limitat': 'LIMIT',
                        'grup': 'GROUP',
                        'ordr': 'ORDER'
                    };

                    if (commonTypos[lowerWord]) {
                        markers.push({
                            startLineNumber: lineIdx + 1,
                            startColumn: (match.index || 0) + 1,
                            endLineNumber: lineIdx + 1,
                            endColumn: (match.index || 0) + word.length + 1,
                            message: `Possible typo. Did you mean '${commonTypos[lowerWord]}'?`,
                            severity: monaco.MarkerSeverity.Error,
                        });
                    }
                }
            }
        });

        monaco.editor.setModelMarkers(model, 'sql-validator', markers);
    };

    const handleEditorWillMount = (monaco: any) => {
        monaco.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: ['.'],
            provideCompletionItems: (model: any, position: any) => {
                const word = model.getWordUntilPosition(position);
                const lineContent = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
                const tableMatch = lineContent.match(/(\w+)\.$/);
                
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                let suggestions: any[] = [];

                if (tableMatch) {
                    const tableName = tableMatch[1];
                    const targetTable = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    
                    if (targetTable) {
                        suggestions = targetTable.columns.map(col => ({
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `${targetTable.name} column (${col.type})`,
                            range: range,
                        }));
                    }
                } else {
                    suggestions = [
                        ...sqlKeywords.map(keyword => ({
                            label: keyword,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: keyword,
                            range: range,
                        })),
                        ...tables.map(table => ({
                            label: table.name,
                            kind: monaco.languages.CompletionItemKind.Struct,
                            insertText: table.name,
                            detail: 'Table',
                            range: range,
                        })),
                        // Also suggest all columns as general fields
                        ...tables.flatMap(table => 
                            table.columns.map(col => ({
                                label: col.name,
                                kind: monaco.languages.CompletionItemKind.Field,
                                insertText: col.name,
                                detail: `Column in ${table.name}`,
                                range: range,
                            }))
                        )
                    ];
                }

                return { suggestions };
            },
        });
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
                            <button onClick={addTable} className="btn-primary flex items-center gap-2">
                                <Plus size={18} /> Add Table
                            </button>
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Terminal className="text-sky-400" size={20} />
                                SQL Playground
                            </h2>
                            <span className="text-xs text-slate-500 font-mono">In-Browser Query Engine</span>
                        </div>
                        
                        <div className="sql-editor-container mb-6">
                            <div className="editor-header">
                                <div className="window-controls">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                </div>
                                <div className="editor-title">
                                    <Terminal size={12} />
                                    query_engine.sql
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="text-[10px] text-slate-600 font-mono tracking-widest">VERSION 1.0</span>
                                </div>
                            </div>
                            
                            <Editor
                                height="220px"
                                defaultLanguage="sql"
                                theme="vs-dark"
                                value={query}
                                onChange={(value) => setQuery(value || '')}
                                onMount={(editor, monaco) => {
                                    const model = editor.getModel();
                                    if (model) {
                                        editor.onDidChangeModelContent(() => {
                                            validateSQL(editor.getValue(), monaco, model);
                                        });
                                        validateSQL(editor.getValue(), monaco, model);
                                    }
                                }}
                                beforeMount={handleEditorWillMount}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: '"Fira Code", monospace',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabCompletion: 'on',
                                    padding: { top: 20 },
                                    renderLineHighlight: 'all',
                                    lineNumbers: 'on',
                                    glyphMargin: false,
                                    folding: false,
                                    lineDecorationsWidth: 10,
                                    lineNumbersMinChars: 3,
                                    quickSuggestions: {
                                        other: true,
                                        comments: false,
                                        strings: false
                                    }
                                }}
                            />
                            
                            <div className="editor-status-bar">
                                <div className="status-item active">
                                    <div className="status-indicator"></div>
                                    Context: {tables.length} Tables Loaded
                                </div>
                                <div className="status-item">
                                    UTF-8
                                </div>
                                <div className="status-item">
                                    SQL / STANDARDIZED
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={runQuery} className="btn-primary bg-blue-600 hover:bg-blue-500 flex items-center gap-3 px-6 py-2.5 shadow-lg shadow-blue-900/20">
                                <Play size={18} fill="currentColor" /> Run Migration Query
                            </button>
                            {results.length > 0 && (
                                <button onClick={downloadCSV} className="btn-primary bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2">
                                    <Download size={18} /> Export Results
                                </button>
                            )}
                        </div>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg"
                            >
                                <div className="font-bold mb-1 flex items-center gap-2 text-red-400">
                                    <X size={14} /> Query Error
                                </div>
                                {error}
                            </motion.div>
                        )}
                    </section>

                    {/* Results Table */}
                    {results.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Migration Results</h2>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                                    {results.length} ROWS FOUND
                                </span>
                            </div>
                            <DetailedDataTable data={results} columns={[]} />
                        </motion.section>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
