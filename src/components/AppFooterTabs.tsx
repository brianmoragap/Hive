import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import type { AppTab } from '../types/domain';

const FOOTER_HEIGHT = 88;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface AppFooterTabsProps {
  activeTab?: AppTab | null;
  bottomInset: number;
  onTabPress: (tab: AppTab) => void;
}

export function AppFooterTabs({
  activeTab,
  bottomInset,
  onTabPress,
}: AppFooterTabsProps) {
  const { copy } = useLocale();
  const { theme } = useAppTheme();

  const tabs: Array<{ id: AppTab; iconName: FeatherIconName; label: string }> = [
    { id: 'home', iconName: 'home', label: copy.home.tabHome },
    { id: 'activity', iconName: 'activity', label: copy.home.tabActivity },
    { id: 'community', iconName: 'users', label: copy.home.tabCommunity },
    { id: 'profile', iconName: 'user', label: copy.home.tabProfile },
  ];

  return (
    <View style={[styles.footerShell, { paddingBottom: Math.max(bottomInset, spacing.sm) }]}>
      <BlurView
        intensity={26}
        style={[
          styles.footerBlur,
          {
            backgroundColor: theme.colors.appChrome,
            borderColor: theme.colors.appChromeBorder,
          },
        ]}
        tint={theme.blurTint}
      >
        <View style={styles.footerBar}>
          {tabs.map((tab) => (
            <FooterTab
              key={tab.id}
              active={activeTab === tab.id}
              iconName={tab.iconName}
              label={tab.label}
              onPress={() => onTabPress(tab.id)}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

export const APP_FOOTER_HEIGHT = FOOTER_HEIGHT;

function FooterTab({
  active,
  iconName,
  label,
  onPress,
}: {
  active: boolean;
  iconName: FeatherIconName;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.footerTab, pressed ? styles.pressed : undefined]}
    >
      <View
        style={[
          styles.footerIconChip,
          active ? [styles.footerIconChipActive, { backgroundColor: theme.colors.primaryDeep }] : undefined,
        ]}
      >
        <Feather
          color={active ? theme.colors.white : theme.colors.textMuted}
          name={iconName}
          size={18}
        />
      </View>
      <Text
        style={[
          styles.footerLabel,
          { color: theme.colors.textSoft },
          active ? [styles.footerLabelActive, { color: theme.colors.primaryDeep }] : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footerShell: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
  },
  footerBlur: {
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 1,
  },
  footerBar: {
    minHeight: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  footerTab: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 64,
  },
  footerIconChip: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIconChipActive: {
  },
  footerLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  footerLabelActive: {
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
