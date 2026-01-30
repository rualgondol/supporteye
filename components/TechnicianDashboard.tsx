
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../constants';
import { SessionStatus } from '../types';
import { formatCanadianPhone, detectCarrier } from '../services/carrierService';
import { Phone, Send, Loader2, Video, LogOut, Check, Info, AlertTriangle } from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const { language, session, setSession, resetApp } = useAppStore();
  const [phone, setPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  const handleStartSession = async () => {
    if (phone.length < 14) return;
    
    setIsSending(true);
    setError(null);
    const carrierInfo = detectCarrier(phone);
    const token = Math.random().toString(36).substr(2, 6).toUpperCase();

    try {
      // APPEL RÉEL AU BACKEND POUR L'ENVOI DU SMS
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          gateway: carrierInfo?.gateway || 'txt.bell.ca',
          token,
          language
        })
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'envoi");

      setSession({
        id: 'sess_' + Date.now(),
        clientPhone: phone,
        carrier: carrierInfo?.name || 'Inconnu',
        token: token,
        createdAt: Date.now(),
        status: SessionStatus.WAITING
      });
    } catch (err) {
      setError("Impossible d'envoyer le SMS. Vérifiez la configuration SMTP du serveur.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>
        <button onClick={resetApp} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={24} />
        </button>
      </header>

      {!session ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Video className="text-blue-600" /> {t.startSession}
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t.phoneNumber}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+1</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatCanadianPhone(e.target.value))}
                  placeholder="(514) 000-0000"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-700 text-sm">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleStartSession}
              disabled={phone.length < 14 || isSending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
            >
              {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              {t.sendSms}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Phone className="text-blue-600" size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">{session.clientPhone}</h3>
            <p className="text-blue-600 font-medium animate-pulse">{t.waitingClient}</p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
            SMS envoyé via passerelle {session.carrier}
          </div>
          <button onClick={() => setSession(null)} className="text-slate-500 hover:underline">Annuler</button>
        </div>
      )}
    </div>
  );
};
