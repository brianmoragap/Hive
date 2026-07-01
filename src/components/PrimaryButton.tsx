import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, shadows, spacing } from '../theme/tokens';

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
  const { theme } = useAppTheme();

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
          colors={theme.primaryGradient}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={[styles.gradientButton, disabled && styles.buttonDisabled]}
        >
          <Text style={[styles.primaryLabel, { color: theme.colors.white }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.flatButton,
            variant === 'secondary'
              ? [
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.colors.surfaceStrong,
                    borderColor: theme.colors.ghostBorder,
                  },
                ]
              : [styles.ghostButton, { borderColor: theme.colors.ghostBorder }],
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.secondaryLabel,
              { color: variant === 'ghost' ? theme.colors.primaryDeep : theme.colors.text },
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
    borderWidth: 1,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  secondaryLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
