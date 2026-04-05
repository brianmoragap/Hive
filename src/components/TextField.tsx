import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
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
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightActionLabel,
  onRightActionPress,
  error,
}: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightActionLabel ? (
          <Pressable onPress={onRightActionPress}>
            <Text style={styles.actionText}>{rightActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.inputShell, error ? styles.inputShellError : undefined]}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(125, 90, 98, 0.55)"
          secureTextEntry={secureTextEntry}
          selectionColor={colors.primary}
          style={styles.input}
          value={value}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    color: 'rgba(77, 33, 42, 0.62)',
    textTransform: 'uppercase',
  },
  actionText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.primary,
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
    borderColor: 'rgba(192, 57, 90, 0.28)',
  },
  input: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  errorText: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.danger,
  },
});
