import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows, spacing } from '../theme/tokens';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[colors.primary, '#FF7B72', colors.primaryDeep]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={[styles.gradientButton, disabled && styles.buttonDisabled]}
        >
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.flatButton,
            variant === 'secondary' ? styles.secondaryButton : styles.ghostButton,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.secondaryLabel,
              variant === 'ghost' ? styles.ghostLabel : undefined,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: radii.pill,
  },
  gradientButton: {
    minHeight: 58,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.button,
  },
  flatButton: {
    minHeight: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    borderColor: colors.ghostBorder,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.ghostBorder,
  },
  primaryLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  secondaryLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  ghostLabel: {
    color: colors.primaryDeep,
  },
  buttonPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
