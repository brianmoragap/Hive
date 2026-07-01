export type ThemeMode = 'light' | 'dark';
export type ThemePaletteId = 'coral' | 'neutral' | 'ocean' | 'sunset' | 'forest';

export interface AppThemeColors {
  background: string;
  backgroundWarm: string;
  surface: string;
  surfaceStrong: string;
  surfaceMuted: string;
  surfaceSoft: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  mint: string;
  lilac: string;
  peach: string;
  success: string;
  warning: string;
  danger: string;
  white: string;
  overlayDark: string;
  overlaySoft: string;
  ghostBorder: string;
  shadow: string;
  appChrome: string;
  appChromeBorder: string;
  panelBorder: string;
  panelGradientStart: string;
  panelGradientEnd: string;
  inputBackground: string;
  inputPlaceholder: string;
  iconOnBackground: string;
  blobCoral: string;
  blobMint: string;
  blobLilac: string;
}

export interface AppTheme {
  colors: AppThemeColors;
  mode: ThemeMode;
  palette: ThemePaletteId;
  statusBarStyle: 'dark' | 'light';
  blurTint: 'light' | 'dark';
  primaryGradient: [string, string, string];
  photoOverlay: [string, string, string];
}

interface PaletteTokens {
  backgroundDark: string;
  backgroundLight: string;
  backgroundWarmDark: string;
  backgroundWarmLight: string;
  highlight: string;
  primary: string;
  primaryDeepLight: string;
  primaryDeepDark: string;
  primarySoftDark: string;
  primarySoftLight: string;
  surfaceDark: string;
  surfaceLight: string;
  surfaceStrongDark: string;
  surfaceStrongLight: string;
  textDark: string;
  textLight: string;
  textMutedDark: string;
  textMutedLight: string;
  textSoftDark: string;
  textSoftLight: string;
  mint: string;
  lilac: string;
  peach: string;
}

const paletteTokens: Record<ThemePaletteId, PaletteTokens> = {
  coral: {
    backgroundDark: '#110D10',
    backgroundLight: '#FFF5F2',
    backgroundWarmDark: '#1A1216',
    backgroundWarmLight: '#FFE9E2',
    highlight: '#FF9C93',
    primary: '#FF5E5E',
    primaryDeepLight: '#AF232B',
    primaryDeepDark: '#FFB0B0',
    primarySoftDark: '#3A1E27',
    primarySoftLight: '#FFDADA',
    surfaceDark: '#1D1519',
    surfaceLight: '#FFF8F6',
    surfaceStrongDark: '#271B20',
    surfaceStrongLight: '#FFFFFF',
    textDark: '#FFF3F5',
    textLight: '#4D212A',
    textMutedDark: '#D8C5C9',
    textMutedLight: '#7D5A62',
    textSoftDark: '#AA959A',
    textSoftLight: '#9B7A81',
    mint: '#BCE7DE',
    lilac: '#E8D7FF',
    peach: '#FFD8C7',
  },
  neutral: {
    backgroundDark: '#11100E',
    backgroundLight: '#F4F0E9',
    backgroundWarmDark: '#171512',
    backgroundWarmLight: '#EAE3D8',
    highlight: '#B4ABA0',
    primary: '#8E857C',
    primaryDeepLight: '#4A433D',
    primaryDeepDark: '#E6DED5',
    primarySoftDark: '#302B26',
    primarySoftLight: '#E6DFD7',
    surfaceDark: '#1B1815',
    surfaceLight: '#FAF6F1',
    surfaceStrongDark: '#25211D',
    surfaceStrongLight: '#FFFFFF',
    textDark: '#F4EFEA',
    textLight: '#443E38',
    textMutedDark: '#CEC6BE',
    textMutedLight: '#756C63',
    textSoftDark: '#A79D94',
    textSoftLight: '#8E8378',
    mint: '#D8E2DA',
    lilac: '#E7E3E9',
    peach: '#EDE2D8',
  },
  ocean: {
    backgroundDark: '#0C1518',
    backgroundLight: '#EDF8F8',
    backgroundWarmDark: '#102024',
    backgroundWarmLight: '#DDEEEF',
    highlight: '#69CAC8',
    primary: '#38A7A2',
    primaryDeepLight: '#135E63',
    primaryDeepDark: '#B9F0EC',
    primarySoftDark: '#15363A',
    primarySoftLight: '#D5F1EE',
    surfaceDark: '#132327',
    surfaceLight: '#F7FDFC',
    surfaceStrongDark: '#1B3034',
    surfaceStrongLight: '#FFFFFF',
    textDark: '#E8F7F7',
    textLight: '#194548',
    textMutedDark: '#BED7D7',
    textMutedLight: '#5E7E80',
    textSoftDark: '#8AA8A8',
    textSoftLight: '#78989A',
    mint: '#C7EEE7',
    lilac: '#DCEBFA',
    peach: '#D7F6F3',
  },
  sunset: {
    backgroundDark: '#17100C',
    backgroundLight: '#FFF4EA',
    backgroundWarmDark: '#211811',
    backgroundWarmLight: '#FFE3D0',
    highlight: '#FFB68A',
    primary: '#F38B5B',
    primaryDeepLight: '#A34A1E',
    primaryDeepDark: '#FFD4BB',
    primarySoftDark: '#39241A',
    primarySoftLight: '#FFE2D4',
    surfaceDark: '#231A14',
    surfaceLight: '#FFF9F5',
    surfaceStrongDark: '#2D211A',
    surfaceStrongLight: '#FFFFFF',
    textDark: '#FFF2EA',
    textLight: '#5A301C',
    textMutedDark: '#E5CABB',
    textMutedLight: '#8A634F',
    textSoftDark: '#BC9C8A',
    textSoftLight: '#A1806D',
    mint: '#FFEBC5',
    lilac: '#F8E0D4',
    peach: '#FFD8C7',
  },
  forest: {
    backgroundDark: '#0F1410',
    backgroundLight: '#F1F7F1',
    backgroundWarmDark: '#151D17',
    backgroundWarmLight: '#E1EDE3',
    highlight: '#95C2A2',
    primary: '#5E9B72',
    primaryDeepLight: '#2F5F43',
    primaryDeepDark: '#D5F1DF',
    primarySoftDark: '#203328',
    primarySoftLight: '#DCEFE1',
    surfaceDark: '#16221A',
    surfaceLight: '#FBFDFB',
    surfaceStrongDark: '#1F2C22',
    surfaceStrongLight: '#FFFFFF',
    textDark: '#EEF7EF',
    textLight: '#264632',
    textMutedDark: '#CBD9CE',
    textMutedLight: '#617666',
    textSoftDark: '#9DB2A3',
    textSoftLight: '#7C9383',
    mint: '#CDEBD8',
    lilac: '#E1EAD8',
    peach: '#EEE4D8',
  },
};

export const themePaletteIds: ThemePaletteId[] = [
  'coral',
  'neutral',
  'ocean',
  'sunset',
  'forest',
];

export function withAlpha(hex: string, alphaHex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length === 6) {
    return `#${normalized}${alphaHex}`;
  }

  if (normalized.length === 8) {
    return `#${normalized.slice(0, 6)}${alphaHex}`;
  }

  return hex;
}

export function buildAppTheme(palette: ThemePaletteId, mode: ThemeMode): AppTheme {
  const tokens = paletteTokens[palette];
  const isDark = mode === 'dark';
  const background = isDark ? tokens.backgroundDark : tokens.backgroundLight;
  const backgroundWarm = isDark ? tokens.backgroundWarmDark : tokens.backgroundWarmLight;
  const surface = isDark ? tokens.surfaceDark : tokens.surfaceLight;
  const surfaceStrong = isDark ? tokens.surfaceStrongDark : tokens.surfaceStrongLight;
  const text = isDark ? tokens.textDark : tokens.textLight;
  const textMuted = isDark ? tokens.textMutedDark : tokens.textMutedLight;
  const textSoft = isDark ? tokens.textSoftDark : tokens.textSoftLight;

  const colors: AppThemeColors = {
    background,
    backgroundWarm,
    surface,
    surfaceStrong,
    surfaceMuted: isDark ? withAlpha(tokens.surfaceStrongDark, 'F2') : withAlpha(tokens.surfaceStrongLight, 'D9'),
    surfaceSoft: isDark ? withAlpha(tokens.surfaceDark, 'EA') : withAlpha(tokens.surfaceLight, 'C7'),
    text,
    textMuted,
    textSoft,
    primary: tokens.primary,
    primaryDeep: isDark ? tokens.primaryDeepDark : tokens.primaryDeepLight,
    primarySoft: isDark ? tokens.primarySoftDark : tokens.primarySoftLight,
    mint: tokens.mint,
    lilac: tokens.lilac,
    peach: tokens.peach,
    success: '#2F8E6D',
    warning: '#F59E0B',
    danger: '#C0395A',
    white: '#FFFFFF',
    overlayDark: isDark ? 'rgba(3, 5, 8, 0.68)' : 'rgba(36, 17, 24, 0.34)',
    overlaySoft: isDark ? withAlpha(tokens.surfaceStrongDark, '8C') : 'rgba(255, 255, 255, 0.2)',
    ghostBorder: isDark ? withAlpha(tokens.textDark, '1F') : withAlpha(tokens.primaryDeepLight, '14'),
    shadow: isDark ? 'rgba(0, 0, 0, 0.42)' : 'rgba(53, 31, 40, 0.08)',
    appChrome: isDark ? withAlpha(tokens.surfaceStrongDark, 'F2') : withAlpha(tokens.surfaceStrongLight, 'D9'),
    appChromeBorder: isDark ? withAlpha(tokens.textDark, '14') : withAlpha(tokens.primaryDeepLight, '0D'),
    panelBorder: isDark ? withAlpha(tokens.textDark, '10') : withAlpha(tokens.primaryDeepLight, '08'),
    panelGradientStart: isDark ? withAlpha(tokens.surfaceStrongDark, 'F5') : withAlpha(tokens.surfaceStrongLight, 'F2'),
    panelGradientEnd: isDark ? withAlpha(tokens.surfaceDark, 'F0') : withAlpha(tokens.surfaceLight, 'EB'),
    inputBackground: isDark ? withAlpha(tokens.surfaceStrongDark, 'F0') : withAlpha(tokens.surfaceStrongLight, 'F0'),
    inputPlaceholder: isDark ? withAlpha(tokens.textDark, '80') : withAlpha(tokens.textSoftLight, '99'),
    iconOnBackground: isDark ? tokens.textDark : tokens.primaryDeepLight,
    blobCoral: isDark ? withAlpha(tokens.highlight, '18') : withAlpha(tokens.highlight, '24'),
    blobMint: isDark ? withAlpha(tokens.mint, '1A') : withAlpha(tokens.mint, '38'),
    blobLilac: isDark ? withAlpha(tokens.lilac, '14') : withAlpha(tokens.lilac, '34'),
  };

  return {
    blurTint: isDark ? 'dark' : 'light',
    colors,
    mode,
    palette,
    photoOverlay: isDark
      ? ['rgba(9, 8, 10, 0.78)', 'rgba(17, 16, 19, 0.52)', 'rgba(255, 255, 255, 0.03)']
      : ['rgba(25, 12, 18, 0.42)', 'rgba(74, 28, 38, 0.18)', 'rgba(255, 255, 255, 0.08)'],
    primaryGradient: [tokens.primary, tokens.highlight, isDark ? tokens.primaryDeepDark : tokens.primaryDeepLight],
    statusBarStyle: isDark ? 'light' : 'dark',
  };
}

export const defaultAppTheme = buildAppTheme('coral', 'light');
