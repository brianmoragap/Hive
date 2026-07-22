import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuSheet } from '../components/AccountMenuSheet';
import { AppFooterTabs, APP_FOOTER_HEIGHT } from '../components/AppFooterTabs';
import { AppHeader } from '../components/AppHeader';
import { EventFeedCard } from '../components/EventFeedCard';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { AppTab, SportType } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import { compareByStart, eventMatchesSearch, formatNotificationLine } from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function ActivityScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const { signOut, user } = useSession();
  const { joinedEvents, markAllNotificationsRead, notifications, unreadNotifications } =
    useEvents();
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportType | 'all'>('all');

  useEffect(() => {
    Animated.stagger(
      75,
      entranceAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [entranceAnims]);

  const scheduledJoinedEvents = useMemo(
    () => joinedEvents.filter((event) => event.status !== 'cancelled'),
    [joinedEvents],
  );

  const filteredEvents = useMemo(
    () =>
      scheduledJoinedEvents
        .filter((event) => {
          const sportMatches = sportFilter === 'all' || event.sport === sportFilter;
          return sportMatches && eventMatchesSearch(event, searchQuery);
        })
        // Soonest first, so what is about to happen is always on top.
        .sort(compareByStart),
    [scheduledJoinedEvents, searchQuery, sportFilter],
  );

  const filterOptions = useMemo(
    () => [
      {
        id: 'all' as const,
        iconName: 'apps',
        label: copy.activity.filterAll,
      },
      ...copy.home.sportOptions.map((sport) => ({
        id: sport.id,
        iconName: sport.iconName,
        label: sport.label,
      })),
    ],
    [copy.activity.filterAll, copy.home.sportOptions],
  );

  const getEntranceStyle = (index: number, offsetY: number) => ({
    opacity: entranceAnims[index],
    transform: [
      {
        translateY: entranceAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  });

  const openNotifications = () => {
    markAllNotificationsRead();
    const body = notifications.length
      ? notifications
          .slice(0, 4)
          .map((notification) => `• ${formatNotificationLine(copy, notification)}`)
          .join('\n')
      : copy.home.notificationsEmpty;

    Alert.alert(copy.home.notificationsTitle, body);
  };

  const openEvent = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  return (
    <ScreenFrame contentStyle={styles.safeArea}>
      <StatusBar style={theme.statusBarStyle} />

      <View style={styles.container}>
        <Animated.View style={getEntranceStyle(0, -18)}>
          <AppHeader
            notificationCount={unreadNotifications}
            onMenuPress={() => setMenuVisible(true)}
            onNotificationsPress={openNotifications}
          />
        </Animated.View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: APP_FOOTER_HEIGHT + insets.bottom + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.heroSection, getEntranceStyle(1, 18)]}>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{copy.activity.title}</Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>
              {copy.activity.copy}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.searchShell,
              { backgroundColor: theme.colors.inputBackground },
              getEntranceStyle(2, 24),
            ]}
          >
            <Feather color={theme.colors.textSoft} name="search" size={18} />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder={copy.activity.searchPlaceholder}
              placeholderTextColor={theme.colors.inputPlaceholder}
              selectionColor={theme.colors.primary}
              style={[styles.searchInput, { color: theme.colors.text }]}
              value={searchQuery}
            />
          </Animated.View>

          <Animated.View style={[styles.filtersWrap, getEntranceStyle(2, 30)]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersRow}>
                {filterOptions.map((option) => {
                  const active = sportFilter === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSportFilter(option.id)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: active
                            ? theme.colors.primaryDeep
                            : theme.colors.surfaceStrong,
                        },
                        pressed ? styles.cardPressed : undefined,
                      ]}
                    >
                      <MaterialCommunityIcons
                        color={active ? theme.colors.white : theme.colors.primaryDeep}
                        name={option.iconName as never}
                        size={16}
                      />
                      <Text
                        style={[
                          styles.filterChipLabel,
                          { color: active ? theme.colors.white : theme.colors.primaryDeep },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          <Animated.View style={[styles.cardsColumn, getEntranceStyle(3, 38)]}>
            {filteredEvents.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceStrong }]}>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  {copy.activity.emptyTitle}
                </Text>
                <Text style={[styles.emptyCopy, { color: theme.colors.textMuted }]}>
                  {copy.activity.emptyCopy}
                </Text>
              </View>
            ) : (
              filteredEvents.map((event) => {
                return (
                  <EventFeedCard
                    key={event.id}
                    actionLabel={copy.activity.viewAction}
                    event={event}
                    onActionPress={() => openEvent(event.id)}
                    onPress={() => openEvent(event.id)}
                    role={event.creatorId === user?.id ? 'host' : 'attendee'}
                  />
                );
              })
            )}
          </Animated.View>
        </ScrollView>

        <Animated.View style={getEntranceStyle(3, 48)}>
          <AppFooterTabs
            activeTab="activity"
            bottomInset={insets.bottom}
            onTabPress={(nextTab: AppTab) =>
              handleAppTabPress('activity', nextTab, copy, navigation)
            }
          />
        </Animated.View>

        <AccountMenuSheet
          onClose={() => setMenuVisible(false)}
          onOpenMyEvents={() => navigation.navigate('MyEvents')}
          onOpenProfile={() => navigation.navigate('Profile')}
          onOpenSettings={() => navigation.navigate('Settings')}
          onSignOut={() => {
            void signOut();
          }}
          visible={menuVisible}
        />
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  heroSection: {
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -1.2,
    color: colors.text,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  searchShell: {
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 214, 219, 0.52)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  filtersWrap: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  filterChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primaryDeep,
  },
  filterChipLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primaryDeep,
  },
  filterChipLabelActive: {
    color: colors.white,
  },
  cardsColumn: {
    gap: spacing.md,
  },
  emptyCard: {
    borderRadius: 30,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: spacing.sm,
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    lineHeight: 26,
    color: colors.text,
  },
  emptyCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
