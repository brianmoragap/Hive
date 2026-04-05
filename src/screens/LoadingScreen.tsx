import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '../components/ScreenFrame';
import { colors, spacing } from '../theme/tokens';

export function LoadingScreen() {
  return (
    <ScreenFrame>
      <View style={styles.container}>
        <Text style={styles.brand}>HIVE</Text>
        <Text style={styles.copy}>Preparando tu acceso seguro</Text>
        <ActivityIndicator color={colors.primaryDeep} size="large" />
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  brand: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 42,
    color: colors.primary,
    letterSpacing: -1.6,
    transform: [{ skewX: '-8deg' }],
  },
  copy: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.textMuted,
  },
});
