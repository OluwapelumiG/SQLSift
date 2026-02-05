import { Head, Link } from '@inertiajs/react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    Terminal, 
    Zap, 
    Search, 
    Shield, 
    ChevronRight, 
    Command, 
    Database, 
    Cpu, 
    Globe, 
    Keyboard,
    Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/app-logo'; // Assuming this exists from previous steps, typical in shadcn/ui setups or I'll implement inline.

// --- Components ---

const TypingEffect = ({ text, speed = 30, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setStarted(true);
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed, started]);

    return <span>{displayedText}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors group"
    >
        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="text-cyan-400 w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
);

const BentoBox = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "rounded-3xl bg-white/5 border border-white/10 p-8 overflow-hidden relative hover:bg-white/[0.07] transition-colors",
            className
        )}
    >
        {children}
    </motion.div>
);

export default function Landing() {
    const [queryFinished, setQueryFinished] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setQueryFinished(true), 2500); // 1.5s delay + 1s typing approx
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
            <Head title="SQLSift - Query without friction" />

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] -translate-x-1/3 translate-y-1/3 rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                   <Link href="/">
                        <AppLogo />
                   </Link>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
                    <a href="#mission" className="hover:text-cyan-400 transition-colors">Mission</a>
                    <a href="#changelog" className="hover:text-cyan-400 transition-colors">Changelog</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
                    <Link 
                        href="/register" 
                        className="px-5 py-2 rounded-lg bg-cyan-500 text-[#0B0E14] text-sm font-bold hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-20 pb-16 px-6 relative">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-6">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                    </span>
                                    v2.0 is now live
                                </div>
                                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                                    Query without <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">friction.</span>
                                </h1>
                            </motion.div>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-xl text-slate-400 max-w-lg leading-relaxed"
                            >
                                The ultra-light, in-browser SQL client designed for speed. No drivers, no installs, just pure data exploration.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <Link 
                                    href="/register"
                                    className="px-8 py-4 rounded-xl bg-cyan-500 text-[#0B0E14] font-bold text-lg hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] flex items-center gap-2"
                                >
                                    Start Sifting — It’s Free
                                    <ChevronRight size={18} />
                                </Link>
                                <button className="px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                                    View Demo
                                </button>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="pt-8 border-t border-white/5"
                            >
                                <p className="text-sm text-slate-500 mb-4 font-mono uppercase tracking-widest">Powered By</p>
                                <div className="flex gap-8 grayscale opacity-50">
                                    {/* Placeholder Logos for "Tech Stack" vibe */}
                                    <div className="flex items-center gap-2 text-lg font-bold"><Database size={20} /> PostgreSQL</div>
                                    <div className="flex items-center gap-2 text-lg font-bold"><Database size={20} /> MySQL</div>
                                    <div className="flex items-center gap-2 text-lg font-bold"><Database size={20} /> SQLite</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Interactive Hero Product Shot */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 rounded-2xl blur-xl" />
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0F1219] shadow-2xl">
                                {/* Window Chrome */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                    </div>
                                    <div className="ml-4 text-xs text-slate-500 font-mono">query.sql</div>
                                </div>

                                <div className="grid grid-rows-[1fr_auto] h-[400px]">
                                    {/* Editor Area */}
                                    <div className="p-6 font-mono text-sm leading-relaxed">
                                        <div className="text-slate-500 select-none mb-2">-- Find high impact insights</div>
                                        <div className="text-purple-400">SELECT <span className="text-cyan-300">*</span> FROM <span className="text-yellow-300">insights</span></div>
                                        <div className="text-purple-400">WHERE <span className="text-orange-300">impact</span> = <span className="text-green-300">'massive'</span></div>
                                        <div className="text-purple-400">ORDER BY <span className="text-orange-300">value</span> DESC;</div>
                                        <div className="mt-2 text-slate-500"><TypingEffect text="|" speed={500} delay={0} /></div>
                                    </div>

                                    {/* Results Area */}
                                    <AnimatePresence>
                                        {queryFinished && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="border-t border-white/10 bg-black/10 backdrop-blur-sm"
                                            >
                                                <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/10">
                                                    <span className="text-xs text-cyan-400 font-medium flex items-center gap-2">
                                                        <Check size={12} strokeWidth={3} /> Query executed in 12ms
                                                    </span>
                                                    <span className="text-xs text-slate-500">5 rows returned</span>
                                                </div>
                                                <div className="p-4 overflow-x-auto">
                                                    <table className="w-full text-left text-xs font-mono">
                                                        <thead>
                                                            <tr className="text-slate-500 border-b border-white/5">
                                                                <th className="pb-2">id</th>
                                                                <th className="pb-2">insight_name</th>
                                                                <th className="pb-2">value</th>
                                                                <th className="pb-2">impact</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-slate-300">
                                                            {[1, 2, 3].map((i) => (
                                                                <motion.tr 
                                                                    key={i}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.1 * i }}
                                                                    className="border-b border-white/5"
                                                                >
                                                                    <td className="py-2 text-slate-500">{1023 + i}</td>
                                                                    <td className="py-2">Optimization_Opportunity_{i}</td>
                                                                    <td className="py-2 text-emerald-400">+{98 - i * 5}%</td>
                                                                    <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">MASSIVE</span></td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Feature Trinity */}
                <section id="features" className="py-24 px-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard 
                                icon={Zap}
                                title="Zero Setup"
                                description="Connect to your database in seconds. No SSH tunneling nightmares or local installs. It just works."
                                delay={0}
                            />
                            <FeatureCard 
                                icon={Search}
                                title="Schema Intelligence"
                                description="Deep-search your schema. Find that one column in a sea of a thousand tables instantly."
                                delay={0.2}
                            />
                            <FeatureCard 
                                icon={Shield}
                                title="Secure by Design"
                                description="Your credentials never leave your browser. End-to-end encryption for every session."
                                delay={0.4}
                            />
                        </div>
                    </div>
                </section>

                {/* Power User Section */}
                <section className="py-24 px-6 bg-gradient-to-b from-[#0B0E14] to-[#0F1219]">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the power user.</h2>
                        <p className="text-xl text-slate-400">Keep your hands on the keyboard. With our <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">Ctrl + K</span> command palette, everything is a keystroke away.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full opacity-20" />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-[#1A1D24] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                <Search className="text-slate-500" size={20} />
                                <span className="text-slate-400 text-lg">Type a command...</span>
                                <span className="ml-auto text-xs font-mono text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">ESC</span>
                            </div>
                            <div className="py-2">
                                {['Export to CSV', 'Format SQL', 'Change Theme to Midnight', 'Generate Migration'].map((cmd, i) => (
                                    <div key={i} className={cn(
                                        "px-4 py-3 flex items-center justify-between cursor-pointer",
                                        i === 0 ? "bg-cyan-500/10 text-cyan-400" : "text-slate-300 hover:bg-white/5"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <Command size={16} className={i === 0 ? "text-cyan-500" : "text-slate-500"} />
                                            {cmd}
                                        </div>
                                        {i === 0 && <span className="text-xs text-cyan-500">Run</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Technical Flex - Bento Grid */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                            {/* Box 1 (Large) */}
                            <BentoBox className="md:col-span-2 md:row-span-2 flex flex-col justify-between group">
                                <div>
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                                        <Cpu size={24} />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">WASM Powered Engine</h3>
                                    <p className="text-slate-400 text-lg">
                                        We compiled SQLite to WebAssembly, giving you near-native performance directly in your browser. No round-trips to a backend server for queries.
                                    </p>
                                </div>
                                <div className="mt-8 h-48 bg-gradient-to-t from-purple-500/10 to-transparent rounded-xl border border-purple-500/10 relative overflow-hidden">
                                     {/* Abstract Viz */}
                                     {Array.from({length: 5}).map((_, i) => (
                                         <motion.div 
                                            key={i}
                                            className="absolute bottom-0 bg-purple-500/40 w-8 rounded-t-lg"
                                            style={{ left: `${i * 20 + 10}%`, height: `${40 + Math.random() * 50}%` }}
                                            animate={{ height: ['40%', '80%', '40%'] }}
                                            transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                                         />
                                     ))}
                                </div>
                            </BentoBox>

                            {/* Box 2 (Wide Top) */}
                            <BentoBox className="md:col-span-2 flex flex-col justify-center" delay={0.2}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold">Multi-Cloud Ready</h3>
                                    <Globe className="text-blue-400" size={24} />
                                </div>
                                <p className="text-slate-400 mb-6">Seamlessly connect to databases across AWS, Azure, and Google Cloud Platform.</p>
                                <div className="flex gap-4">
                                    {['aws', 'gcp', 'azure'].map((cloud) => (
                                        <div key={cloud} className="h-10 w-10 rounded bg-white/10 flex items-center justify-center text-xs font-mono uppercase text-slate-400">
                                            {cloud}
                                        </div>
                                    ))}
                                </div>
                            </BentoBox>

                            {/* Box 3 (Small) */}
                            <BentoBox className="md:col-span-1" delay={0.3}>
                                <Keyboard className="text-orange-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Keyboard First</h3>
                                <p className="text-slate-400 text-sm">Vim-like bindings for those who refuse to touch the mouse.</p>
                            </BentoBox>

                             {/* Box 4 (Small) */}
                             <BentoBox className="md:col-span-1" delay={0.4}>
                                <div className="text-6xl font-black text-white/5 absolute -right-4 -bottom-4">99</div>
                                <h3 className="text-xl font-bold mb-2 text-green-400">99.9% Uptime</h3>
                                <p className="text-slate-400 text-sm">Engineered for reliability when you need it most.</p>
                            </BentoBox>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">
                            Ready to see your <br />
                            <span className="text-white">data clearly?</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10">Join thousands of engineers sifting through the noise.</p>
                        <Link 
                            href="/register"
                            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-cyan-500 text-[#0B0E14] font-bold text-xl hover:bg-cyan-400 transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,245,255,0.4)]"
                        >
                            Launch SQLSift
                            <ChevronRight strokeWidth={3} />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-white/5 bg-[#050609]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white">
                                <Terminal size={14} />
                            </div>
                            <span>SQLSift</span>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Documentation</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Status</a>
                        </div>
                        <div className="text-xs text-slate-700">
                            © 2024 SQLSift Inc.
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
