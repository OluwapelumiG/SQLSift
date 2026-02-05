import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AppLogo } from '@/components/app-logo';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCircle, ChevronDown, User, Lock, ShieldCheck, LayoutGrid } from 'lucide-react';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: Lock,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: ShieldCheck,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const user = auth?.user;

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-[#F8FAFC]">
             {/* Background Effects */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
            
            {/* Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/10 backdrop-blur-md">
                <Link href="/migrate">
                    <AppLogo />
                </Link>
                
                <div className="flex items-center gap-4">
                    <Link href="/migrate" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                         <LayoutGrid size={16} /> Dashboard
                    </Link>
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 outline-none group">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                    <UserCircle size={18} />
                                </div>
                                <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0B0E14] border-white/5 text-slate-300">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </nav>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-8">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl overflow-x-auto no-scrollbar">
                    {navItems.map((item, index) => {
                        const isActive = isCurrentUrl(item.href);
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200",
                                    isActive 
                                        ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]" 
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {item.icon && (
                                    <item.icon 
                                        size={16} 
                                        className={cn(
                                            "transition-colors",
                                            isActive ? "text-black" : "text-slate-500 group-hover:text-slate-300"
                                        )} 
                                    />
                                )}
                                {item.title}
                            </Link>
                        );
                    })}
                </div>

                {/* Content */}
                <main>
                    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-8 shadow-xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
