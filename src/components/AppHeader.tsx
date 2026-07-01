import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface AppHeaderProps {
  notificationCount?: number;
  onMenuPress: () => void;
  onNotificationsPress: () => void;
}

export function AppHeader({
  notificationCount = 0,
  onMenuPress,
  onNotificationsPress,
}: AppHeaderProps) {
  const { theme } = useAppTheme();
  const safeNotificationCount = useMemo(
    () => (notificationCount > 9 ? '9+' : String(notificationCount)),
    [notificationCount],
  );

  return (
    <View style={styles.headerShell}>
      <View style={styles.topBar}>
        <HeaderActionButton accessibilityLabel="menu" iconName="menu" onPress={onMenuPress} />
        <Text style={[styles.wordmark, { color: theme.colors.iconOnBackground }]}>HIVE</Text>
        <View>
          <HeaderActionButton
            accessibilityLabel="notifications"
            iconName="bell"
            onPress={onNotificationsPress}
          />
          {notificationCount > 0 ? (
            <View
              style={[
                styles.notificationBadge,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.background,
                },
              ]}
            >
              <Text style={[styles.notificationBadgeLabel, { color: theme.colors.white }]}>
                {safeNotificationCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function HeaderActionButton({
  accessibilityLabel,
  iconName,
  onPress,
}: {
  accessibilityLabel: string;
  iconName: FeatherIconName;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed ? styles.pressed : undefined]}
    >
      <Feather color={theme.colors.iconOnBackground} name={iconName} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.9,
    transform: [{ skewX: '-8deg' }],
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 1,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
