/**
 * HIVE — Brand tokens (v1 redesign)
 *
 * Ported from the brand manual (hive-tokens.css) shared by the design team.
 * Scoped to screens being redesigned under the new identity — does not
 * replace `appTheme.ts`, which still drives the rest of the (legacy) app.
 *
 * Usage rules from the manual:
 * - Off-white/white = ~75% of any composition.
 * - Lima = active navigation, tags, badges, positive accents.
 * - Fucsia = SOS / critical CTAs only — never as a full-screen background.
 * - Negro = typography only (plus the SOS inverse screen).
 * - Never pair lima and fucsia in equal proportion on one element.
 */

export const hiveColors = {
  lima: '#CCFF00',
  limaTints: {
    50: '#F7FFD6',
    100: '#EEFFAA',
    200: '#E0FF77',
    400: '#D9FF44',
    600: '#CCFF00',
  },
  fucsia: '#FF0080',
  fucsiaTints: {
    50: '#FFF0F7',
    100: '#FFD6EC',
    200: '#FFB3D9',
    400: '#FF66B2',
    600: '#FF0080',
  },
  negro: '#0D0D0D',
  blanco: '#FFFFFF',
  offwhite: '#F5F5F2',
  grisClaro: '#E8E8E4',
  grisMedio: '#9B9B96',
  textLimaDark: '#3A5A00',
  textFucsiaDark: '#AA0054',
} as const;

export const hiveFonts = {
  heavy: 'ArticulatCF-Heavy',
  bold: 'ArticulatCF-Bold',
  demiBold: 'ArticulatCF-DemiBold',
  medium: 'ArticulatCF-Medium',
  normal: 'ArticulatCF-Normal',
} as const;

export const hiveFontAssets = {
  'ArticulatCF-Heavy': require('../../assets/fonts/ArticulatCF-Heavy.otf'),
  'ArticulatCF-Bold': require('../../assets/fonts/ArticulatCF-Bold.otf'),
  'ArticulatCF-DemiBold': require('../../assets/fonts/ArticulatCF-DemiBold.otf'),
  'ArticulatCF-Medium': require('../../assets/fonts/ArticulatCF-Medium.otf'),
  'ArticulatCF-Normal': require('../../assets/fonts/ArticulatCF-Normal.otf'),
};
