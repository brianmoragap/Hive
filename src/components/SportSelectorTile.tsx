import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import type { SportOption } from '../types/domain';

interface SportSelectorTileProps {
  isSelected: boolean;
  onPress: () => void;
  sport: SportOption;
}

/**
 * One sport in the home grid. Every sport is always rendered, so tiles never
 * change position; selection is communicated by filling the tile with the
 * sport's own accent gradient instead of removing it from the list.
 */
export function SportSelectorTile({ isSelected, onPress, sport }: SportSelectorTileProps) {
  const { theme } = useAppTheme();
  const selectAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(selectAnim, {
      toValue: isSelected ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selectAnim]);

  const animatePress = (toValue: number) => {
    Animated.timing(pressAnim, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // The selected tile lifts slightly; pressing any tile sinks it a touch.
  const scale = Animated.multiply(
    selectAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
    pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: isSelected ? 'transparent' : theme.colors.panelBorder,
            transform: [{ scale }],
          },
          isSelected ? styles.cardSelected : undefined,
        ]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.fill, { opacity: selectAnim }]}>
          <LinearGradient
            colors={sport.accent}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.checkBadge,
            { backgroundColor: 'rgba(255, 255, 255, 0.26)' },
            {
              opacity: selectAnim,
              transform: [
                { scale: selectAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons color={theme.colors.white} name="check" size={14} />
        </Animated.View>

        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isSelected
                ? 'rgba(255, 255, 255, 0.22)'
                : theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialCommunityIcons
            color={isSelected ? theme.colors.white : theme.colors.primaryDeep}
            name={sport.iconName as never}
            size={28}
          />
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.label,
            { color: isSelected ? theme.colors.white : theme.colors.textSoft },
          ]}
        >
          {sport.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '47.5%',
  },
  card: {
    minHeight: 136,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardSelected: {
    shadowColor: '#2C0F14',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  fill: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
