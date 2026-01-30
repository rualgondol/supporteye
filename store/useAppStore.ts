
import { create } from 'zustand';
import { Language, UserRole, SessionStatus, Annotation, SessionData } from '../types';

interface AppState {
  language: Language;
  role: UserRole | null;
  session: SessionData | null;
  annotations: Annotation[];
  
  setLanguage: (lang: Language) => void;
  setRole: (role: UserRole | null) => void;
  setSession: (session: SessionData | null) => void;
  updateSessionStatus: (status: SessionStatus) => void;
  addAnnotation: (annotation: Annotation) => void;
  clearAnnotations: () => void;
  resetApp: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: Language.FR,
  role: null,
  session: null,
  annotations: [],

  setLanguage: (language) => set({ language }),
  setRole: (role) => set({ role }),
  setSession: (session) => set({ session }),
  updateSessionStatus: (status) => set((state) => ({
    session: state.session ? { ...state.session, status } : null
  })),
  addAnnotation: (annotation) => set((state) => ({
    annotations: [...state.annotations, annotation]
  })),
  clearAnnotations: () => set({ annotations: [] }),
  resetApp: () => set({ role: null, session: null, annotations: [] })
}));
