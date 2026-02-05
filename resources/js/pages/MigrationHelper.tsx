import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import alasql from 'alasql';
import Papa from 'papaparse';
import { 
    Plus, Trash2, Upload, Database, Play, Download, X, Search, Terminal, 
    AlertCircle, Command, Sparkles, Layers, ChevronRight, ChevronDown
} from 'lucide-react';
import { Editor, loader } from '@monaco-editor/react';
import { Command as CommandMenu } from 'cmdk';
// CSS removed to prevent conflicts - using pure Tailwind
import { DetailedDataTable } from '@/components/DetailedDataTable';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { UserCircle } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';

interface Column {
    name: string;
    type: 'STRING' | 'INT' | 'FLOAT' | 'BOOLEAN';
}

interface Table {
    name: string;
    columns: Column[];
    data: any[];
}

export default function SQLSift() {
    const [tables, setTables] = useState<Table[]>([]);
    const [query, setQuery] = useState('SELECT * FROM table1');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSuccessGlow, setIsSuccessGlow] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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

    const updateTable = (index: number, field: keyof Table, value: any) => {
        const newTables = [...tables];
        (newTables[index] as any)[field] = value;
        setTables(newTables);
    };

    const updateColumn = (tableIndex: number, colIndex: number, field: keyof Column, value: string) => {
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
            setIsSuccessGlow(false);
            
            // Drop existing tables in alasql to refresh
            tables.forEach(table => {
                alasql(`DROP TABLE IF EXISTS ${table.name}`);
                alasql(`CREATE TABLE ${table.name}`);
                alasql.tables[table.name].data = table.data;
            });

            const res = alasql(query);
            setResults(Array.isArray(res) ? res : [res]);
            
            // Success animation
            setIsSuccessGlow(true);
            setTimeout(() => setIsSuccessGlow(false), 1500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen((open) => !open);
            }
        }
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const sqlKeywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 
        'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS',
        'SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'DATABASE', 'TABLE', 'CREATE', 'DROP', 'INSERT', 'INTO', 'VALUES',
        'UNION', 'ALL', 'DISTINCT', 'HAVING', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];

    const validateSQL = (value: string, monaco: any, model: any) => {
        const markers: any[] = [];
        const lines = value.split('\n');
        
        const keywordMap = new Set(sqlKeywords.map(k => k.toLowerCase()));
        
        lines.forEach((line, lineIdx) => {
            const words = line.matchAll(/\b[A-Za-z]+\b/g);
            for (const match of words) {
                const word = match[0];
                const lowerWord = word.toLowerCase();
                
                if (!keywordMap.has(lowerWord)) {
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
        <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden relative">
             <Head title="Migration Helper" />
             
             {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] -translate-x-1/3 translate-y-1/3 rounded-full" />
            </div>

            <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <AppLogo />
                    </Link>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="flex items-center gap-2 group border border-white/5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                        <Command size={14} className="group-hover:text-cyan-400 transition-colors text-slate-400" />
                        <span className="text-xs hidden md:inline text-slate-400 group-hover:text-slate-200">Palette</span>
                        <kbd className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-slate-500 ml-1 border border-white/5 font-mono">⌘K</kbd>
                    </button>

                    {usePage<{ auth: { user: any } }>().props.auth?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 outline-none group">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                    <UserCircle size={18} />
                                </div>
                                <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0B0E14] border-white/10 text-slate-300">
                                <UserMenuContent user={usePage<{ auth: { user: any } }>().props.auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto space-y-16 pb-32">
                <section className="text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                        Querying at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">speed of thought</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        The world’s data is messy. <span className="text-slate-200 font-medium">Sift through the noise</span> with 
                        our high-performance, in-browser migration engine.
                    </p>
                </section>

                <div className="grid grid-cols-1 gap-16 pt-8">
                    {/* Schema Definition Section */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <Layers size={24} />
                                </div>
                                Schema Definition
                            </h2>
                            <button 
                                onClick={addTable} 
                                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                            >
                                <Plus size={18} /> New Table
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <AnimatePresence>
                                {tables.map((table, tIdx) => (
                                    <motion.div 
                                        key={tIdx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-cyan-500/20 transition-all group/table"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover/table:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => removeTable(tIdx)} 
                                                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                                title="Delete Table"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-5 mb-10 pb-2 border-b border-white/5">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-cyan-400 border border-white/10 shadow-lg">
                                                <Database size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5 block">Table Name</label>
                                                <input 
                                                    value={table.name}
                                                    onChange={(e) => updateTable(tIdx, 'name', e.target.value)}
                                                    className="bg-transparent border-none p-0 focus:ring-0 font-bold text-xl text-white w-full placeholder:text-slate-700"
                                                    placeholder="Enter table name..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-10">
                                            <div className="grid grid-cols-12 gap-4 px-2">
                                                <div className="col-span-7 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Column Name</div>
                                                <div className="col-span-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</div>
                                            </div>
                                            
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {table.columns.map((col, cIdx) => (
                                                    <motion.div 
                                                        layout
                                                        key={cIdx} 
                                                        className="grid grid-cols-12 gap-4 items-center group/row"
                                                    >
                                                        <div className="col-span-7">
                                                            <input 
                                                                value={col.name}
                                                                onChange={(e) => updateColumn(tIdx, cIdx, 'name', e.target.value)}
                                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-700 font-mono"
                                                                placeholder="column_name"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <div className="relative">
                                                                <select 
                                                                    value={col.type}
                                                                    onChange={(e) => updateColumn(tIdx, cIdx, 'type', e.target.value as Column['type'])}
                                                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-4 pr-8 py-3 text-[11px] text-cyan-400 font-bold font-mono focus:border-cyan-500/50 focus:bg-black/40 outline-none appearance-none cursor-pointer hover:bg-black/30 transition-all"
                                                                >
                                                                    <option value="STRING">STRING</option>
                                                                    <option value="INT">INT</option>
                                                                    <option value="FLOAT">FLOAT</option>
                                                                    <option value="BOOLEAN">BOOLEAN</option>
                                                                </select>
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                                    <ChevronDown size={12} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <button 
                                                                onClick={() => removeColumn(tIdx, cIdx)} 
                                                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover/row:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-md"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <button 
                                                onClick={() => addColumn(tIdx)} 
                                                className="w-full py-4 border border-dashed border-slate-700/50 hover:border-cyan-400/50 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/20 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest group/add"
                                            >
                                                <Plus size={14} className="group-hover/add:scale-110 transition-transform" /> Add Column
                                            </button>
                                        </div>

                                        <div className="pt-8 border-t border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Database size={12} /> Data Source
                                                </span>
                                                {table.data.length > 0 && (
                                                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                        {table.data.length} ROWS LOADED
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <label className={`
                                                relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group/upload
                                                ${table.data.length > 0 
                                                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                                                    : 'border-slate-800 hover:border-cyan-500/30 hover:bg-cyan-500/5'}
                                            `}>
                                                <div className="flex flex-col items-center justify-center p-6">
                                                    {table.data.length > 0 ? (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                                <Sparkles size={18} />
                                                            </div>
                                                            <p className="text-sm text-emerald-400 font-medium">Data ready</p>
                                                            <p className="text-[10px] text-slate-500 mt-1">Click to replace file</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500 group-hover/upload:text-cyan-400 group-hover/upload:bg-cyan-500/10 transition-colors">
                                                                <Upload size={18} />
                                                            </div>
                                                            <p className="mb-1 text-sm text-slate-400 group-hover/upload:text-slate-200 transition-colors font-medium">
                                                                <span className="text-cyan-400 group-hover/upload:text-cyan-300">Click to upload</span>
                                                            </p>
                                                            <p className="text-[10px] text-slate-600 tracking-wide uppercase">CSV or JSON</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept=".csv,.json"
                                                    onChange={(e) => e.target.files && handleFileUpload(tIdx, e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Playground Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Terminal size={24} />
                                </div>
                                Playground
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                <Sparkles size={12} className="text-purple-400" />
                                INTELLIGENT AUTOCOMPLETE ENABLED
                            </div>
                        </div>
                        
                        <div className={`
                            relative rounded-xl overflow-hidden border border-white/10 bg-[#050608] shadow-2xl mb-8
                            transition-all duration-500
                            ${isSuccessGlow ? 'shadow-[0_0_50px_rgba(34,211,238,0.15)] border-cyan-500/30' : ''}
                        `}>
                            <div className="bg-[#0B0E14] px-4 py-3 flex items-center justify-between border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono tracking-[0.2em]">MIGRATION_FLOW.SQL</div>
                                <div className="w-10"></div> {/* Spacer */}
                            </div>
                            
                            <Editor
                                height="320px"
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
                                    fontFamily: 'JetBrains Mono, monospace',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabCompletion: 'on',
                                    padding: { top: 24, bottom: 24 },
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
                            
                            <div className="bg-[#0B0E14] px-4 py-2 flex items-center justify-end gap-6 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tables.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                                    {tables.length} DATASOURCES ACTIVE
                                </div>
                                <div>UTF-8</div>
                                <div className="tracking-widest">RAW SQL</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button 
                                onClick={runQuery} 
                                className="bg-white text-black hover:bg-slate-200 font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-xl transition-all active:scale-95"
                            >
                                <Play size={18} fill="currentColor" /> EXECUTE TRANSACTION
                            </button>
                            {results.length > 0 && (
                                <button 
                                    onClick={downloadCSV} 
                                    className="text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Download size={16} /> Export Results
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                                >
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span className="font-mono text-sm">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Results Section */}
                    <AnimatePresence>
                        {results.length > 0 && (
                            <motion.section 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Migration Results</h2>
                                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20 tracking-widest uppercase">
                                        {results.length} ROWS FOUND
                                    </span>
                                </div>
                                <div className="border border-white/5 rounded-xl overflow-hidden">
                                    <DetailedDataTable data={results} columns={[]} />
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Command Palette */}
            <AnimatePresence>
                {isCommandPaletteOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsCommandPaletteOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={e => e.stopPropagation()} 
                            className="w-full max-w-xl bg-[#11141A] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            <CommandMenu label="Command Palette">
                                <div className="flex items-center border-b border-white/5 px-4">
                                    <Search size={18} className="text-slate-500" />
                                    <CommandMenu.Input 
                                        placeholder="Type a command..." 
                                        autoFocus 
                                        className="w-full bg-transparent border-none outline-none p-4 text-white text-lg placeholder:text-slate-600" 
                                    />
                                </div>
                                <CommandMenu.List className="p-2 max-h-[300px] overflow-y-auto">
                                    <CommandMenu.Empty className="p-8 text-center text-slate-500 text-sm">No results found.</CommandMenu.Empty>
                                    
                                    <CommandMenu.Group heading={<span className="text-[10px] px-2 text-slate-500 tracking-[0.2em] font-bold block mb-2 mt-2">ACTIONS</span>}>
                                        <CommandMenu.Item 
                                            value="execute"
                                            onSelect={() => { runQuery(); setIsCommandPaletteOpen(false); }}
                                            className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Play size={14} className="text-cyan-400" />
                                            <span>Execute Current Query</span>
                                        </CommandMenu.Item>
                                        <CommandMenu.Item 
                                            value="new table"
                                            onSelect={() => { addTable(); setIsCommandPaletteOpen(false); }}
                                            className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Plus size={14} className="text-cyan-400" />
                                            <span>Add New Table Definition</span>
                                        </CommandMenu.Item>
                                        <CommandMenu.Item 
                                            value="export"
                                            onSelect={() => { downloadCSV(); setIsCommandPaletteOpen(false); }}
                                            className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Download size={14} className="text-cyan-400" />
                                            <span>Export Last Results</span>
                                        </CommandMenu.Item>
                                    </CommandMenu.Group>

                                    <CommandMenu.Group heading={<span className="text-[10px] px-2 text-slate-500 tracking-[0.2em] font-bold mt-4 block mb-2">DATABASES</span>}>
                                        {tables.map((t, i) => (
                                            <CommandMenu.Item 
                                                key={i} 
                                                value={t.name}
                                                onSelect={() => { 
                                                    setQuery(`SELECT * FROM ${t.name}`);
                                                    setIsCommandPaletteOpen(false);
                                                }}
                                                className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <Database size={14} className="text-slate-500" />
                                                <span>View content of <span className="text-cyan-400 font-mono">{t.name}</span></span>
                                            </CommandMenu.Item>
                                        ))}
                                    </CommandMenu.Group>
                                </CommandMenu.List>
                            </CommandMenu>
                            <div className="bg-white/5 p-2 text-center text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] border-t border-white/5">
                                Press <kbd className="bg-white/10 px-1 rounded text-slate-400">ESC</kbd> to close
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
