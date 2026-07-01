import { Feather } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { colors, radii, spacing } from '../theme/tokens';

interface LanguageToggleProps {
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'overlay';
}

export function LanguageToggle({
  style,
  variant = 'light',
}: LanguageToggleProps) {
  const { copy, language, toggleLanguage } = useLocale();
  const isOverlay = variant === 'overlay';

  return (
    <Pressable
      accessibilityLabel={copy.common.language}
      onPress={() => void toggleLanguage()}
      style={({ pressed }) => [
        styles.button,
        isOverlay ? styles.buttonOverlay : styles.buttonLight,
        pressed ? styles.buttonPressed : undefined,
        style,
      ]}
    >
      <Feather
        color={isOverlay ? colors.white : colors.text}
        name="globe"
        size={15}
      />
      <Text style={[styles.label, isOverlay ? styles.labelOverlay : undefined]}>
        {language.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
  },
  buttonLight: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: colors.ghostBorder,
  },
  buttonOverlay: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.text,
  },
  labelOverlay: {
    color: colors.white,
  },
});
