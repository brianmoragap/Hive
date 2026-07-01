import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  copyByLanguage,
  type AppCopy,
  type AppLanguage,
} from '../i18n/copy';

const LANGUAGE_STORAGE_KEY = '@hive/language';

interface LocaleContextValue {
  copy: AppCopy;
  language: AppLanguage;
  setLanguage: (nextLanguage: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('es');

  useEffect(() => {
    let active = true;

    async function hydrateLanguage() {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (!active || (storedLanguage !== 'es' && storedLanguage !== 'en')) {
        return;
      }

      setLanguageState(storedLanguage);
    }

    void hydrateLanguage();

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'es' ? 'en' : 'es');
  };

  const value = useMemo(
    () => ({
      copy: copyByLanguage[language],
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale debe usarse dentro de LocaleProvider.');
  }

  return context;
}
