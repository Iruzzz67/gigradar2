import React, { useState } from 'react';
import { Radio, Lock, Mail, User, ShieldAlert, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export interface RegisterViewProps {
  onGoToLogin: () => void;
  onRegisterSuccess: (needsOnboarding: boolean) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onGoToLogin,
  onRegisterSuccess,
}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState<'User' | 'Artist' | 'EO'>('User');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 3) {
      setErrorMessage('Nama minimal 3 karakter.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(name, email, password, requestedRole);
      if (res.success) {
        // If registering as User, proceed to genre onboarding
        onRegisterSuccess(true);
      } else {
        setErrorMessage(res.error || 'Email sudah pernah terdaftar.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat pendaftaran akun.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-4 py-8 select-none relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#b7ff00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#111113] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#b7ff00] mx-auto shadow-[0_0_25px_rgba(183,255,0,0.25)]">
            <Radio className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-widest">
            GIG<span className="text-[#b7ff00]">RADAR</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Gabung ke ekosistem skena musik independen lokal
          </p>
        </div>

        {/* Tab Toggle: Masuk / Daftar */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <button
            type="button"
            onClick={onGoToLogin}
            className="py-2.5 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Masuk ke Akun
          </button>
          <button
            type="button"
            className="py-2.5 rounded-xl font-bold text-xs bg-[#111113] text-[#b7ff00] shadow-sm border border-zinc-700/80 cursor-default"
          >
            Daftar Akun Baru
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nama Lengkap / Nama Skena</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Raka Suryo / Hollow Men / Kolektif Sore"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Requested Role Picker (§17 & §25) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">Daftar Sebagai Peran Skena:</label>
              <span className="text-[10px] text-zinc-500 font-mono">Pilih salah satu</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'User', label: 'Penikmat Gigs', sub: 'Langsung aktif' },
                { id: 'Artist', label: 'Band / Musisi', sub: 'Verifikasi admin' },
                { id: 'EO', label: 'Kolektif / EO', sub: 'Verifikasi admin' },
              ].map((roleOption) => {
                const isSelected = requestedRole === roleOption.id;
                return (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() => setRequestedRole(roleOption.id as any)}
                    className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] shadow-[0_0_15px_rgba(183,255,0,0.15)] ring-1 ring-[#b7ff00]'
                        : 'bg-[#18181b]/50 border-[#27272a] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">{roleOption.label}</span>
                    <span className="block text-[9px] text-zinc-500 mt-0.5">{roleOption.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Verification Notice */}
            {requestedRole !== 'User' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 mt-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Permohonan role <strong>{requestedRole}</strong> akan diteruskan ke Tim Admin untuk diverifikasi. Akun Anda dapat langsung digunakan untuk menjelajah sebagai User biasa sembari menunggu persetujuan.
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-bold pt-3 pb-3 mt-3 shadow-[0_0_20px_rgba(183,255,0,0.2)]"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Daftar Akun Baru
          </Button>
        </form>

        {/* Security Notice: Admin strictly restricted to Developer & Company */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#b7ff00] shrink-0 mt-0.5" />
          <span>
            <strong>Kebijakan Hak Akses Perusahaan:</strong> Akun Administrator tidak dapat didaftarkan secara mandiri/publik. Akses Admin dilindungi dan hanya dapat diakses secara internal oleh developer atau staf perusahaan GigRadar.
          </span>
        </div>

      </div>
    </div>
  );
};
