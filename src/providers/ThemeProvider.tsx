import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  buildAppTheme,
  defaultAppTheme,
  themePaletteIds,
  type AppTheme,
  type ThemeMode,
  type ThemePaletteId,
} from '../theme/appTheme';

const THEME_MODE_STORAGE_KEY = '@hive/theme-mode';
const THEME_PALETTE_STORAGE_KEY = '@hive/theme-palette';

interface ThemeContextValue {
  mode: ThemeMode;
  palette: ThemePaletteId;
  setMode: (nextMode: ThemeMode) => Promise<void>;
  setPalette: (nextPalette: ThemePaletteId) => Promise<void>;
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(defaultAppTheme.mode);
  const [palette, setPaletteState] = useState<ThemePaletteId>(defaultAppTheme.palette);

  useEffect(() => {
    let active = true;

    async function hydrateTheme() {
      const [storedMode, storedPalette] = await Promise.all([
        AsyncStorage.getItem(THEME_MODE_STORAGE_KEY),
        AsyncStorage.getItem(THEME_PALETTE_STORAGE_KEY),
      ]);

      if (!active) {
        return;
      }

      if (storedMode === 'light' || storedMode === 'dark') {
        setModeState(storedMode);
      }

      if (
        storedPalette &&
        themePaletteIds.includes(storedPalette as ThemePaletteId)
      ) {
        setPaletteState(storedPalette as ThemePaletteId);
      }
    }

    void hydrateTheme();

    return () => {
      active = false;
    };
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
  };

  const setPalette = async (nextPalette: ThemePaletteId) => {
    setPaletteState(nextPalette);
    await AsyncStorage.setItem(THEME_PALETTE_STORAGE_KEY, nextPalette);
  };

  const value = useMemo(
    () => ({
      mode,
      palette,
      setMode,
      setPalette,
      theme: buildAppTheme(palette, mode),
    }),
    [mode, palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme debe usarse dentro de ThemeProvider.');
  }

  return context;
}
