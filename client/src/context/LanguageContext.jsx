import React, { createContext, useContext, useState, useCallback } from 'react';
import ka from '../locales/ka';
import en from '../locales/en';

const translations = { ka, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ka');

  const t = useCallback(
    (keyPath) => {
      const keys = keyPath.split('.');
      let result = translations[lang];
      for (const key of keys) {
        if (result === undefined || result === null) return keyPath;
        result = result[key];
      }
      if (result === undefined || result === null) return keyPath;
      return result;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
