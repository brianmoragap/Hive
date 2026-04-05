import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';
import type { SportOption } from '../types/domain';

interface SportTileProps {
  sport: SportOption;
  onPress: () => void;
}

export function SportTile({ sport, onPress }: SportTileProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}>
      <LinearGradient colors={sport.accent} end={{ x: 1, y: 0 }} start={{ x: 0, y: 1 }} style={styles.gradient}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            color={colors.white}
            name={sport.iconName as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
            size={24}
          />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.title}>{sport.label}</Text>
          <Text style={styles.subtitle}>{sport.subtitle}</Text>
        </View>

        <MaterialCommunityIcons color="rgba(255,255,255,0.85)" name="chevron-right" size={24} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.xl,
  },
  wrapperPressed: {
    transform: [{ scale: 0.99 }],
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    color: colors.white,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.86)',
  },
});
