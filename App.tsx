
import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { UserRole, SessionStatus, Language } from './types';
import { Login } from './components/Login';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { LiveSessionView } from './components/LiveSessionView';
import { LanguageToggle } from './components/LanguageToggle';
import { TRANSLATIONS } from './constants';
import { CheckCircle, Info, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { role, session, language, setLanguage, setRole, setSession, updateSessionStatus } = useAppStore();
  const [loading, setLoading] = React.useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('session');
    
    if (sessionToken && !role) {
      setLoading(true);
      // Vérifier la session en base de données via l'API
      fetch(`/api/session/${sessionToken}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setRole(UserRole.CLIENT);
            setSession({
              id: data.id.toString(),
              clientPhone: data.client_phone,
              carrier: data.carrier,
              token: data.token,
              createdAt: new Date(data.created_at).getTime(),
              status: data.status as SessionStatus
            });
          }
        })
        .catch(err => console.error("Session invalide"))
        .finally(() => setLoading(false));
    }

    if (!role) {
      const browserLang = navigator.language.split('-')[0].toUpperCase();
      if (browserLang === 'EN' || browserLang === 'FR') {
        setLanguage(browserLang as Language);
      }
    }
  }, [role, setLanguage, setRole, setSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-600 font-medium">Chargement de la session...</p>
      </div>
    );
  }

  if (!role) return <Login />;

  if (role === UserRole.CLIENT) {
    if (session?.status === SessionStatus.CONNECTED) return <LiveSessionView />;
    if (session?.status === SessionStatus.COMPLETED) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{t.sessionEnded}</h1>
                    <button 
                        onClick={() => {
                            window.history.replaceState({}, '', window.location.pathname);
                            window.location.reload();
                        }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Info size={32} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">{t.clientWelcome}</h1>
                    <p className="text-slate-500 leading-relaxed">{t.clientInstructions}</p>
                </div>
                <button
                    onClick={() => updateSessionStatus(SessionStatus.CONNECTED)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                >
                    {t.allowCamera}
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {session?.status === SessionStatus.CONNECTED ? (
        <LiveSessionView />
      ) : (
        <>
          <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                    <span className="font-bold text-xl text-slate-800">Support-Eye</span>
                </div>
                <LanguageToggle />
            </div>
          </nav>
          <TechnicianDashboard />
        </>
      )}
    </div>
  );
};

export default App;
