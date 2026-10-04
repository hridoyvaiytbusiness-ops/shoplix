import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.bn) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (key) => translations.bn[key] || String(key),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('shoplix_lang');
    return (saved as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shoplix_lang', lang);
  };

  const t = (key: keyof typeof translations.bn): string => {
    const dict = translations[language] || translations.bn;
    return (dict as any)[key] || translations.bn[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
