import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  error?: string | null;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightActionLabel,
  onRightActionPress,
  error,
}: TextFieldProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.textSoft }]}>{label}</Text>
        {rightActionLabel ? (
          <Pressable onPress={onRightActionPress}>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              {rightActionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.inputShell,
          { backgroundColor: theme.colors.inputBackground },
          error ? [styles.inputShellError, { borderColor: theme.colors.danger }] : undefined,
        ]}
      >
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          secureTextEntry={secureTextEntry}
          selectionColor={theme.colors.primary}
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
        />
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  actionText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  inputShell: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  inputShellError: {
    borderWidth: 1,
  },
  input: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
  },
  errorText: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
});
