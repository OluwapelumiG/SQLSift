import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import { Lock, Key, ShieldCheck, Save, RefreshCw } from 'lucide-react';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <SettingsLayout>
            <Head title="Password settings" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
                            Update Password
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Ensure your account is using a long, random password to stay secure.
                    </p>
                </div>

                <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-6">
                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="space-y-2">
                                    <label htmlFor="current_password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                                            autoComplete="current-password"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    {errors.current_password && <p className="text-red-400 text-xs mt-1">{errors.current_password}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm Password</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        {errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{errors.password_confirmation}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        disabled={processing}
                                        className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
                                    >
                                        <RefreshCw size={16} className={processing ? "animate-spin" : ""} />
                                        Update Password
                                    </button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-cyan-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,1)]"></span>
                                            Saved Successfully
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </SettingsLayout>
    );
}
