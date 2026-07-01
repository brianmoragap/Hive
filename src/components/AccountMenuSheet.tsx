import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { radii, shadows, spacing } from '../theme/tokens';

type ActionIconName = React.ComponentProps<typeof Feather>['name'];

interface AccountMenuSheetProps {
  onClose: () => void;
  onOpenMyEvents: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  visible: boolean;
}

export function AccountMenuSheet({
  onClose,
  onOpenMyEvents,
  onOpenProfile,
  onOpenSettings,
  onSignOut,
  visible,
}: AccountMenuSheetProps) {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          mass: 0.9,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [opacity, translateY, visible]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={mounted}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlayDark }]}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceStrong,
            },
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>{copy.home.menuTitle}</Text>
          <Text style={[styles.sheetBody, { color: theme.colors.textMuted }]}>{copy.home.menuBody}</Text>

          <View style={styles.actions}>
            <ActionRow
              iconName="calendar"
              label={copy.home.menuMyEvents}
              onPress={() => {
                onClose();
                onOpenMyEvents();
              }}
            />
            <ActionRow
              iconName="user"
              label={copy.home.menuProfile}
              onPress={() => {
                onClose();
                onOpenProfile();
              }}
            />
            <ActionRow
              iconName="sliders"
              label={copy.home.menuSettings}
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
            />
            <ActionRow
              destructive
              iconName="log-out"
              label={copy.common.closeSession}
              onPress={() => {
                onClose();
                onSignOut();
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ActionRow({
  destructive = false,
  iconName,
  label,
  onPress,
}: {
  destructive?: boolean;
  iconName: ActionIconName;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        { backgroundColor: theme.colors.surface },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: destructive ? 'rgba(192, 57, 90, 0.12)' : theme.colors.primarySoft },
          destructive ? styles.iconWrapDanger : undefined,
        ]}
      >
        <Feather
          color={destructive ? theme.colors.danger : theme.colors.primaryDeep}
          name={iconName}
          size={16}
        />
      </View>
      <Text
        style={[
          styles.actionLabel,
          { color: destructive ? theme.colors.danger : theme.colors.text },
          destructive ? styles.actionLabelDanger : undefined,
        ]}
      >
        {label}
      </Text>
      <Feather color={theme.colors.textSoft} name="chevron-right" size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 96,
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    width: '72%',
    maxWidth: 280,
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  sheetTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    lineHeight: 22,
  },
  sheetBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(192, 57, 90, 0.12)',
  },
  actionLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  actionLabelDanger: {
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
