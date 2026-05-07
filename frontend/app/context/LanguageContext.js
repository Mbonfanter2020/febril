'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('es'); // Default to Spanish

  // Initialize from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('app-language');
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem('app-language', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  /**
   * Traduce valores dinámicos que pueden venir de la DB.
   * Soporta:
   * 1. Match exacto (ej: "Femenino")
   * 2. Prefijos dinámicos (ej: "Taquicardia (FC:")
   * 3. Retorna el valor original si no hay match.
   */
  const translateValue = (val) => {
    if (!val) return val;
    // 1. Match exacto
    if (translations[language][val]) return translations[language][val];

    // 2. Prefijos dinámicos
    const prefixes = [
      'Taquicardia (FC:', 'Hipoxia (SO₂:', 'Bradycardia (FC:', 'Triage TEP:',
      'Cayados elevados (', 'Procalcitonina elevada (', 'PCR elevada (', 'Hipoalbuminemia ('
    ];
    for (const p of prefixes) {
      if (val.startsWith(p) && translations[language][p]) {
        return val.replace(p, translations[language][p]);
      }
    }

    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translateValue }}>
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
