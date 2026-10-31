import { Platform } from 'react-native';

import { hiveFontAssets } from '../theme/hiveBrand';

/**
 * expo-font's web loader (FontFace API) doesn't reliably pick up these local
 * OTF requires in a static export, so Articulat CF silently falls back to
 * the browser's default serif. Injecting plain @font-face rules sidesteps
 * that and is a no-op on native (this file only runs on web).
 */
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const rules = Object.entries(hiveFontAssets)
    .map(([family, source]) => {
      const url = typeof source === 'string' ? source : null;

      if (!url) {
        return '';
      }

      return `@font-face { font-family: '${family}'; src: url('${url}') format('opentype'); font-display: swap; }`;
    })
    .filter(Boolean)
    .join('\n');

  if (rules && !document.querySelector('style[data-hive-fonts]')) {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-hive-fonts', 'true');
    styleTag.textContent = rules;
    document.head.appendChild(styleTag);
  }
}
