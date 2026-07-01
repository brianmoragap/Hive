import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

interface StarRatingFieldProps {
  helper?: string;
  label: string;
  onChange?: (value: number) => void;
  value: number;
}

export function StarRatingField({
  helper,
  label,
  onChange,
  value,
}: StarRatingFieldProps) {
  const { theme } = useAppTheme();
  const interactive = Boolean(onChange);

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      {helper ? (
        <Text style={[styles.helper, { color: theme.colors.textMuted }]}>{helper}</Text>
      ) : null}

      <View style={styles.starsRow}>
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const active = starValue <= value;

          return (
            <Pressable
              key={starValue}
              disabled={!interactive}
              onPress={() => onChange?.(starValue)}
              style={({ pressed }) => [
                styles.starButton,
                {
                  backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.ghostBorder,
                },
                pressed && interactive ? styles.pressed : undefined,
              ]}
            >
              <MaterialCommunityIcons
                color={active ? theme.colors.primaryDeep : theme.colors.textSoft}
                name={active ? 'star' : 'star-outline'}
                size={22}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  helper: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  starButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
