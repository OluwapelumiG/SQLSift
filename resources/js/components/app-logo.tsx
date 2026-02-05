import { Terminal } from 'lucide-react';

export const AppLogo = () => (
    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter select-none">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black">
            <Terminal size={18} strokeWidth={3} />
        </div>
        <span className="text-white">SQL<span className="text-slate-400 font-normal">Sift</span></span>
    </div>
);
