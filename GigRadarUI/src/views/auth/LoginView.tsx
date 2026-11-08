import React, { useState } from 'react';
import { Radio, Lock, Mail, Eye, EyeOff, ArrowRight, Shield, AlertCircle } from 'lucide-react';
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
    if (!targetPassword) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(targetEmail.trim(), targetPassword);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Email atau kata sandi tidak sesuai.');
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

        {/* Quick Demo Access (§28 Demo Accounts with The Jeblogs & FSTVLST) */}
        <div className="space-y-2.5 pt-2 border-t border-[#27272a]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Pilih Akun Demo untuk Masuk Cepat:</span>
            <span className="text-[10px] font-mono text-[#b7ff00]">1-Klik Masuk</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* The Jeblogs (Band Artist) */}
            <button
              type="button"
              onClick={() => {
                setEmail('jeblogs@gigradar.com');
                setPassword('artist123');
                handleLogin('jeblogs@gigradar.com', 'artist123');
              }}
              className="p-2.5 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-[#b7ff00]/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-950/60 text-orange-400 flex items-center justify-center font-bold shrink-0 ring-1 ring-orange-500/30 group-hover:scale-105 transition-transform">
                🎸
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white group-hover:text-[#b7ff00] transition-colors truncate">The Jeblogs</p>
                  <span className="text-[9px] font-mono px-1 rounded bg-[#b7ff00]/15 text-[#b7ff00]">ARTIST</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">jeblogs@gigradar.com</p>
              </div>
            </button>

            {/* FSTVLST (Band Artist) */}
            <button
              type="button"
              onClick={() => {
                setEmail('fstvlst@gigradar.com');
                setPassword('artist123');
                handleLogin('fstvlst@gigradar.com', 'artist123');
              }}
              className="p-2.5 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-[#b7ff00]/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-950/60 text-sky-400 flex items-center justify-center font-bold shrink-0 ring-1 ring-sky-500/30 group-hover:scale-105 transition-transform">
                🎨
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white group-hover:text-[#b7ff00] transition-colors truncate">FSTVLST</p>
                  <span className="text-[9px] font-mono px-1 rounded bg-[#b7ff00]/15 text-[#b7ff00]">ARTIST</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">fstvlst@gigradar.com</p>
              </div>
            </button>

            {/* EO Koloni Gigs */}
            <button
              type="button"
              onClick={() => {
                setEmail('eo@gigradar.com');
                setPassword('eo123');
                handleLogin('eo@gigradar.com', 'eo123');
              }}
              className="p-2.5 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-[#b7ff00]/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold shrink-0 ring-1 ring-emerald-500/30 group-hover:scale-105 transition-transform">
                🏢
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white group-hover:text-[#b7ff00] transition-colors truncate">Koloni Gigs</p>
                  <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/15 text-emerald-400">EO</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">eo@gigradar.com</p>
              </div>
            </button>

            {/* Regular User Dimas */}
            <button
              type="button"
              onClick={() => {
                setEmail('user@gigradar.com');
                setPassword('user123');
                handleLogin('user@gigradar.com', 'user123');
              }}
              className="p-2.5 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-[#b7ff00]/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center font-bold shrink-0 ring-1 ring-purple-500/30 group-hover:scale-105 transition-transform">
                👤
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white group-hover:text-[#b7ff00] transition-colors truncate">Dimas W.</p>
                  <span className="text-[9px] font-mono px-1 rounded bg-purple-500/15 text-purple-400">USER</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">user@gigradar.com</p>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Access Information */}
        <div className="p-3.5 rounded-2xl bg-[#18181b]/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#b7ff00] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Masuk dengan kredensial email dan kata sandi akun Anda. Hak akses dan antarmuka akan otomatis disesuaikan berdasarkan peran akun Anda (<strong>User</strong>, <strong>Artist</strong>, <strong>EO</strong>, atau <strong>Admin</strong>).
          </p>
        </div>

      </div>
    </div>
  );
};
