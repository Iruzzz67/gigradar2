import React, { useState } from 'react';
import { Radio, Lock, Mail, Eye, EyeOff, ArrowRight, UserCheck, Mic2, CalendarDays, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export interface LoginViewProps {
  onGoToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onGoToRegister,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (targetEmail: string, targetPassword: string) => {
    if (!targetEmail.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(targetEmail.trim(), targetPassword);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Email atau password tidak sesuai.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menyambung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-4 py-8 select-none relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#b7ff00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#111113] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header (§24 Identity) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#b7ff00] mx-auto shadow-[0_0_25px_rgba(183,255,0,0.25)]">
            <Radio className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-widest">
            GIG<span className="text-[#b7ff00]">RADAR</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Menghubungkan skena, menemukan suara lokal.
          </p>
        </div>

        {/* Tab Toggle: Masuk / Daftar */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <button
            type="button"
            className="py-2.5 rounded-xl font-bold text-xs bg-[#111113] text-[#b7ff00] shadow-sm border border-zinc-700/80 cursor-default"
          >
            Masuk ke Akun
          </button>
          <button
            type="button"
            onClick={onGoToRegister}
            className="py-2.5 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com (cth: user@gigradar.com)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-bold pt-3 pb-3 mt-2 shadow-[0_0_20px_rgba(183,255,0,0.2)]"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Masuk ke GigRadar
          </Button>
        </form>

        {/* Multi-Account Quick Login Selector */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#b7ff00]" />
              Pilih Akun Skena untuk Uji Coba:
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">1-Klik Masuk</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Akun User */}
            <div
              onClick={() => handleQuickLogin('user@gigradar.com', 'user123')}
              className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800/80 hover:border-zinc-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#b7ff00]">
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Akun User</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    Penikmat
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">user@gigradar.com</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Explore radar, beli tiket & gigs favorit.</p>
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-sky-400 group-hover:underline">Masuk sebagai User →</span>
              </div>
            </div>

            {/* 2. Akun Artist */}
            <div
              onClick={() => handleQuickLogin('artist@gigradar.com', 'artist123')}
              className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800/80 hover:border-zinc-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-fuchsia-400">
                    <Mic2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Akun Artist</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800">
                    Musisi
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">artist@gigradar.com</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Kelola band Hollow Men, lagu & feed.</p>
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-fuchsia-400 group-hover:underline">Masuk sebagai Artist →</span>
              </div>
            </div>

            {/* 3. Akun EO */}
            <div
              onClick={() => handleQuickLogin('eo@gigradar.com', 'eo123')}
              className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800/80 hover:border-zinc-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-orange-400">
                    <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                    <span>Akun EO</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
                    Organizer
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">eo@gigradar.com</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Buat event, kelola tiket & validator gate.</p>
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-orange-400 group-hover:underline">Masuk sebagai EO →</span>
              </div>
            </div>

            {/* 4. Akun Admin (Developer & Internal Perusahaan) */}
            <div
              onClick={() => handleQuickLogin('admin@gigradar.com', 'admin123')}
              className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800/80 hover:border-zinc-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#b7ff00]">
                    <Shield className="w-3.5 h-3.5 text-[#b7ff00]" />
                    <span>Admin Perusahaan</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#b7ff00]/10 text-[#b7ff00] border border-[#b7ff00]/30">
                    Internal
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">admin@gigradar.com</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Developer & governance verifikasi role.</p>
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-[#b7ff00] group-hover:underline">Masuk Portal Admin →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Policy Reminder */}
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <span>
            <strong>Hak Akses Admin:</strong> Akun Admin dikhususkan bagi Developer & Tim Internal Perusahaan. Pengguna umum dapat mendaftar sebagai User, Musisi (Artist), atau Penyelenggara (EO).
          </span>
        </div>

      </div>
    </div>
  );
};
