export const AppLogo = () => (
    <div className="flex items-center gap-3 select-none">
        <div className="relative w-8 h-8 flex flex-col justify-center gap-1.5 overflow-hidden">
            <div className="h-[3px] bg-slate-400 rounded-full w-full opacity-60"></div>
            <div className="h-[3px] bg-cyan-400 rounded-full w-full"></div>
            <div className="h-[3px] bg-slate-400 rounded-full w-full opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-[2px] bg-cyan-400/50 rotate-[20deg]"></div>
            </div>
        </div>
        <div className="flex items-baseline tracking-tight">
            <span className="text-xl font-light text-slate-400 uppercase">SQL</span>
            <span className="text-2xl font-extrabold text-white">Sift</span>
        </div>
    </div>
);
