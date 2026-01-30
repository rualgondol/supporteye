
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../constants';
import { UserRole } from '../types';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

export const Login: React.FC = () => {
  const { language, setRole } = useAppStore();
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setRole(UserRole.TECHNICIAN);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t.login}</h1>
          <p className="text-slate-500">Secure access for Support-Eye SISL</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.username}</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="tech_john_doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.password}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? '...' : t.signIn}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="text-center">
            <button 
                type="button"
                onClick={() => setRole(UserRole.CLIENT)}
                className="text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
                Enter as Client (Simulation)
            </button>
        </div>
      </div>
      
      <p className="mt-8 text-white/40 text-sm font-medium">© 2026 Support-Eye • Data Protected via PIPEDA</p>
    </div>
  );
};
