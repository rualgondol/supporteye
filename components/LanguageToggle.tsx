
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Language } from '../types';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/20">
      <button
        onClick={() => setLanguage(Language.EN)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === Language.EN ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage(Language.FR)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === Language.FR ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'
        }`}
      >
        FR
      </button>
    </div>
  );
};
