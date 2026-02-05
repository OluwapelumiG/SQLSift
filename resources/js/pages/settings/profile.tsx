import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { SharedData } from '@/types';
import { User, Mail, Save } from 'lucide-react';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <SettingsLayout>
            <Head title="Profile settings" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
                            Profile Information
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Update your account's profile information and email address.
                    </p>
                </div>

                <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-6">
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            id="name"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all placeholder:text-slate-600"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 text-sm">
                                            <p>
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="underline hover:text-yellow-400 transition-colors"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>

                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 font-medium text-green-400">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        disabled={processing}
                                        className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
                                    >
                                        <Save size={16} />
                                        Save Changes
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

                <div className="pt-8 border-t border-white/5">
                        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 space-y-6">
                        <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Danger Zone
                        </h3>
                            <DeleteUser />
                        </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
