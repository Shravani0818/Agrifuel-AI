// AgriFuel AI - Global Language State & Centralized Translation Hook
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  AppLanguage,
  getSavedLanguage,
  setSavedLanguage as persistSavedLanguage,
  subscribeToLanguageChange,
} from '../services/multilingualService';
import { TRANSLATIONS, SupportedLanguage } from '../i18n/translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, defaultText?: string) => string;
  isHindi: boolean;
  isMarathi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Build reverse lookup map from English string to translation key
function getEnglishValueMap(): Map<string, string> {
  const map = new Map<string, string>();
  if (TRANSLATIONS?.en) {
    for (const [key, value] of Object.entries(TRANSLATIONS.en)) {
      if (typeof value === 'string' && value.trim()) {
        const normalized = value.trim().toLowerCase();
        if (!map.has(normalized)) {
          map.set(normalized, key);
        }
      }
    }
  }
  return map;
}

const ENGLISH_VALUE_TO_KEY = getEnglishValueMap();

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getSavedLanguage);

  useEffect(() => {
    // Subscribe to external/storage changes
    const unsubscribe = subscribeToLanguageChange((newLang) => {
      setLanguageState(newLang);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    persistSavedLanguage(newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      if (!key && !defaultText) return '';
      const currentDict = TRANSLATIONS[language as SupportedLanguage] || TRANSLATIONS.en;

      // 1. Exact key in current language
      if (currentDict && key && currentDict[key] !== undefined) {
        return currentDict[key];
      }

      // 2. Exact defaultText in current language
      if (currentDict && defaultText && currentDict[defaultText] !== undefined) {
        return currentDict[defaultText];
      }

      // 3. Trimmed key in current language
      const trimmedKey = key?.trim?.();
      if (trimmedKey && currentDict && currentDict[trimmedKey] !== undefined) {
        return currentDict[trimmedKey];
      }

      // 4. Trimmed defaultText in current language
      const trimmedDefault = defaultText?.trim?.();
      if (trimmedDefault && currentDict && currentDict[trimmedDefault] !== undefined) {
        return currentDict[trimmedDefault];
      }

      // 5. Reverse lookup from English text to key for Marathi / Hindi
      if (language !== 'en') {
        const lowerKey = trimmedKey?.toLowerCase?.();
        if (lowerKey && ENGLISH_VALUE_TO_KEY.has(lowerKey)) {
          const mappedKey = ENGLISH_VALUE_TO_KEY.get(lowerKey)!;
          if (currentDict && currentDict[mappedKey] !== undefined) {
            return currentDict[mappedKey];
          }
        }

        const lowerDefault = trimmedDefault?.toLowerCase?.();
        if (lowerDefault && ENGLISH_VALUE_TO_KEY.has(lowerDefault)) {
          const mappedKey = ENGLISH_VALUE_TO_KEY.get(lowerDefault)!;
          if (currentDict && currentDict[mappedKey] !== undefined) {
            return currentDict[mappedKey];
          }
        }
      }

      // 6. English translation lookup
      const englishDict = TRANSLATIONS.en;
      if (englishDict && key && englishDict[key] !== undefined) {
        return englishDict[key];
      }

      return defaultText !== undefined ? defaultText : key;
    },
    [language]
  );

  const value: LanguageContextType = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isHindi: language === 'hi',
      isMarathi: language === 'mr',
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLang = getSavedLanguage();
    return {
      language: fallbackLang,
      setLanguage: persistSavedLanguage,
      t: (key: string, defaultText?: string) => {
        const dict = TRANSLATIONS[fallbackLang as SupportedLanguage] || TRANSLATIONS.en;
        return dict[key] || TRANSLATIONS.en[key] || defaultText || key;
      },
      isHindi: fallbackLang === 'hi',
      isMarathi: fallbackLang === 'mr',
    };
  }
  return context;
}

export const useTranslation = useLanguage;

