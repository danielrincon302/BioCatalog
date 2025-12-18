'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { es, en, Language, TranslationKeys } from './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  translateCollection: (name: string) => string;
  translateRole: (name: string) => string;
}

const translations: Record<Language, TranslationKeys> = {
  es,
  en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[language];

  const translateCollection = useCallback((name: string): string => {
    return t.data.collections[name] || name;
  }, [t]);

  const translateRole = useCallback((name: string): string => {
    return t.data.roles[name] || name;
  }, [t]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCollection, translateRole }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
