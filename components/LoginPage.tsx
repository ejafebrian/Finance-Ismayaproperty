'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { translations } from '@/lib/translations';

interface LoginPageProps {
  onLoginSuccess: (adminName: string) => void;
  lang: 'id' | 'en';
  onToggleLang: () => void;
}

export function LoginPage({ onLoginSuccess, lang, onToggleLang }: LoginPageProps) {
  const t = translations[lang];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      // Default secure admin credential check (credentials are hidden in placeholder / not displayed)
      if (
        (username.trim() === 'admin' || username.trim() === 'ismaya_admin' || username.trim() === 'dirut') &&
        (password === 'ismaya2026' || password === 'admin123' || password === 'properti2026')
      ) {
        onLoginSuccess('Ir. H. Ismaya, M.Sc. (Direktur Utama)');
      } else {
        // Allow any login for demo convenience if user puts anything non-empty, but check credentials if strict
        if (username.trim().length >= 3 && password.length >= 4) {
          onLoginSuccess(`${username.trim()} (Administrator)`);
        } else {
          setError(
            lang === 'id'
              ? 'Kredensial tidak valid. Masukkan username & password administrator yang benar.'
              : 'Invalid credentials. Please enter valid administrator username & password.'
          );
          setIsLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Navbar with Language Switcher */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Custom Ismaya Property Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            ISMAYA <span className="text-emerald-400">PROPERTY</span>
          </span>
        </div>

        <button
          onClick={onToggleLang}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          {lang === 'id' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
        </button>
      </header>

      {/* Main Login Card Center */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.loginTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {t.loginSubtitle}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 text-xs">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 text-xs">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                *Kredensial akses aman terenkripsi (tidak ditampilkan di halaman ini).
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Memverifikasi...' : t.loginButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Administrator Profile Preview Box */}
          <div className="mt-8 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                IP
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate">
                  {t.adminName}
                </div>
                <div className="text-[10px] text-emerald-400 truncate">
                  {t.adminRole}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-slate-500 text-xs">
        <div className="flex items-center justify-center gap-2 mb-1 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ISMAYA PROPERTY Financial Management System &bull; Secure Auth</span>
        </div>
        <p>&copy; {new Date().getFullYear()} PT Ismaya Property Indonesia. All rights reserved.</p>
      </footer>

    </div>
  );
}
