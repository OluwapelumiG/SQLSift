import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <SettingsLayout>
            <Head title="Two-Factor Authentication" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
                            Two-Factor Authentication
                    </h2>
                    <p className="text-slate-400 text-sm">
                            Add additional security to your account using two-factor authentication.
                    </p>
                </div>

                <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-6">
                    {twoFactorEnabled ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-green-400 font-bold">Two-Factor Authentication is Enabled</h3>
                                    <p className="text-sm text-green-500/70">
                                        Your account is secure. You will be prompted for a code when logging in.
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm text-slate-400 leading-relaxed">
                                With two-factor authentication enabled, you will be prompted for a secure, random pin during login, which you can retrieve from your authenticator application.
                            </div>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="pt-4 border-t border-white/5">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20 disabled:opacity-50"
                                        >
                                            <ShieldBan size={16} /> Disable 2FA
                                        </button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-400">
                                    <ShieldBan size={24} />
                                </div>
                                <div>
                                    <h3 className="text-yellow-400 font-bold">Two-Factor Authentication is Disabled</h3>
                                    <p className="text-sm text-yellow-500/70">
                                        We recommend enabling 2FA for account security.
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm text-slate-400 leading-relaxed">
                                When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application like Google Authenticator or Authy.
                            </div>

                            <div>
                                {hasSetupData ? (
                                    <button
                                            onClick={() => setShowSetupModal(true)}
                                            className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
                                    >
                                        <Smartphone size={18} />
                                        Continue Setup
                                    </button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() => setShowSetupModal(true)}
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
                                            >
                                                <ShieldCheck size={18} />
                                                Enable Two-Factor Authentication
                                            </button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </div>
        </SettingsLayout>
    );
}
