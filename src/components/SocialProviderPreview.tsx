import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { colors, radii, spacing } from '../theme/tokens';

const providers = [
  { iconName: 'google', id: 'google', label: 'Google' },
  { iconName: 'apple', id: 'apple', label: 'Apple' },
] as const;

interface SocialProviderPreviewProps {
  helperText?: string;
  title?: string;
}

export function SocialProviderPreview({
  helperText,
  title,
}: SocialProviderPreviewProps) {
  const { copy } = useLocale();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title ?? copy.socialPreview.title}</Text>

      <View style={styles.row}>
        {providers.map((provider) => (
          <View key={provider.id} style={styles.providerButton}>
            <MaterialCommunityIcons
              color={colors.textSoft}
              name={provider.iconName}
              size={18}
            />
            <Text style={styles.providerLabel}>{provider.label}</Text>
            <Text style={styles.providerBadge}>{copy.common.soon}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.helperText}>{helperText ?? copy.socialPreview.helperText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  providerButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: colors.ghostBorder,
  },
  providerLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.text,
  },
  providerBadge: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  helperText: {
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
