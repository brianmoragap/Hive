import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
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
import { SportSelectorTile } from '../components/SportSelectorTile';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { useSession } from '../providers/SessionProvider';
import {
  colors,
  homeSpotlightImage,
  sportHeroImages,
  radii,
  shadows,
  spacing,
} from '../theme/tokens';
import { withAlpha } from '../theme/appTheme';
import type { AppTab, EventRecord, SportOption } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import { eventMatchesSearch, formatNotificationLine } from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
const FOOTER_HEIGHT = 88;

function getHeroGradient(
  selectedSportId: SportOption['id'],
  theme: ReturnType<typeof useAppTheme>['theme'],
): [string, string, string] {
  if (selectedSportId === 'mtb') {
    return [withAlpha(theme.colors.peach, 'F0'), withAlpha(theme.colors.primary, 'D4'), withAlpha(theme.colors.primaryDeep, '94')];
  }

  if (selectedSportId === 'trekking') {
    return [withAlpha(theme.colors.mint, 'EE'), withAlpha(theme.colors.primary, 'CF'), withAlpha(theme.colors.primaryDeep, '90')];
  }

  if (selectedSportId === 'trail_running') {
    return [withAlpha(theme.colors.lilac, 'EB'), withAlpha(theme.colors.primary, 'CC'), withAlpha(theme.colors.primaryDeep, '8A')];
  }

  if (selectedSportId === 'gym') {
    return [withAlpha(theme.colors.lilac, 'E6'), withAlpha(theme.colors.primary, 'C8'), withAlpha(theme.colors.primaryDeep, '8E')];
  }

  if (selectedSportId === 'road_cycling') {
    return [withAlpha(theme.colors.peach, 'EE'), withAlpha(theme.colors.primary, 'D8'), withAlpha(theme.colors.primaryDeep, '96')];
  }

  return [withAlpha(theme.colors.primary, 'DE'), withAlpha(theme.colors.primaryDeep, 'CC'), withAlpha(theme.colors.primaryDeep, '82')];
}

export function HomeScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const { signOut } = useSession();
  const {
    markAllNotificationsRead,
    notifications,
    unreadNotifications,
    visibleEvents,
  } = useEvents();
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const focusAnim = useRef(new Animated.Value(1)).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportId, setSelectedSportId] = useState<SportOption['id']>('running');

  const selectedSport = useMemo(
    () =>
      copy.home.sportOptions.find((sport) => sport.id === selectedSportId) ||
      copy.home.sportOptions[0],
    [copy.home.sportOptions, selectedSportId],
  );
  // Every sport stays in the grid: hiding the selected one made the remaining
  // tiles shift up and take each other's place on every tap.
  const sportChoices = copy.home.sportOptions;
  const filteredEvents = useMemo(
    () =>
      visibleEvents.filter(
        (event) =>
          event.status === 'scheduled' &&
          event.sport === selectedSport.id &&
          eventMatchesSearch(event, searchQuery),
      ),
    [searchQuery, selectedSport.id, visibleEvents],
  );
  const featureGradient = useMemo(
    () => getHeroGradient(selectedSport.id, theme),
    [selectedSport.id, theme],
  );

  useEffect(() => {
    Animated.stagger(
      85,
      entranceAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 560,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [entranceAnims]);

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

  const openCreateEvent = () => {
    navigation.navigate('CreateEvent', { prefillSport: selectedSport.id });
  };

  const openEventDetail = (event: EventRecord) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleSportSelection = (nextSport: SportOption) => {
    if (nextSport.id === selectedSport.id) {
      return;
    }

    // Switch right away so the tapped tile highlights instantly; the spotlight
    // below re-enters with its own spring instead of holding the tile back.
    setSelectedSportId(nextSport.id);
    focusAnim.setValue(0);

    requestAnimationFrame(() => {
      Animated.spring(focusAnim, {
        damping: 16,
        mass: 0.9,
        stiffness: 180,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

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

  const focusCardStyle = {
    opacity: focusAnim,
    transform: [
      {
        translateY: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
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
          <Animated.View style={[styles.heroSection, getEntranceStyle(1, 16)]}>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{copy.home.heroTitle}</Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>{copy.home.heroCopy}</Text>
          </Animated.View>

          <Animated.View style={[styles.createCtaSection, getEntranceStyle(2, 22)]}>
            <Pressable
              onPress={openCreateEvent}
              style={({ pressed }) => [styles.createCtaShell, pressed ? styles.cardPressed : undefined]}
            >
              <LinearGradient
                colors={theme.primaryGradient}
                end={{ x: 1, y: 0.2 }}
                start={{ x: 0, y: 1 }}
                style={styles.createCtaGradient}
              >
                <Feather color={theme.colors.white} name="plus-circle" size={18} />
                <Text style={[styles.createCtaLabel, { color: theme.colors.white }]}>
                  {copy.home.createEvent}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.featureShell, getEntranceStyle(3, 28)]}>
            <Animated.View style={focusCardStyle}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    copy.home.eventAlertTitle,
                    `${copy.home.eventAlertBodyPrefix} ${selectedSport.label} ${copy.home.eventAlertBodySuffix}`,
                  )
                }
                style={({ pressed }) => [pressed ? styles.cardPressed : undefined]}
              >
                <ImageBackground
                  imageStyle={styles.featureImage}
                  source={{ uri: sportHeroImages[selectedSportId] ?? homeSpotlightImage }}
                  style={[styles.featureCard, { backgroundColor: theme.colors.primaryDeep }]}
                >
                  <LinearGradient
                    colors={featureGradient}
                    locations={[0, 0.62, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    style={[
                      styles.featureGlow,
                      { backgroundColor: withAlpha(theme.colors.white, theme.mode === 'dark' ? '08' : '10') },
                    ]}
                  />
                  <View style={styles.featureContent}>
                    <View
                      style={[
                        styles.featureIconWrap,
                        {
                          backgroundColor: withAlpha(theme.colors.white, '1F'),
                          borderColor: withAlpha(theme.colors.white, '20'),
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        color={theme.colors.white}
                        name={selectedSport.iconName as never}
                        size={30}
                      />
                    </View>
                    <Text style={[styles.featureLabel, { color: theme.colors.white }]}>
                      {selectedSport.label.toUpperCase()}
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.gridSection, getEntranceStyle(4, 36)]}>
            <View style={styles.grid}>
              {sportChoices.map((sport) => (
                <SportSelectorTile
                  key={sport.id}
                  isSelected={sport.id === selectedSport.id}
                  onPress={() => handleSportSelection(sport)}
                  sport={sport}
                />
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.activitySection, getEntranceStyle(5, 42)]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {copy.home.eventsSectionTitle}
              </Text>
            </View>

            <View style={[styles.searchShell, { backgroundColor: theme.colors.inputBackground }]}>
              <Feather color={theme.colors.textSoft} name="search" size={18} />
              <TextInput
                onChangeText={setSearchQuery}
                placeholder={copy.home.searchPlaceholder}
                placeholderTextColor={theme.colors.inputPlaceholder}
                selectionColor={theme.colors.primary}
                style={[styles.searchInput, { color: theme.colors.text }]}
                value={searchQuery}
              />
            </View>

            <View style={styles.cardsColumn}>
              {filteredEvents.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceStrong }]}>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    {copy.home.emptyEventsTitle}
                  </Text>
                  <Text style={[styles.emptyCopy, { color: theme.colors.textMuted }]}>
                    {copy.home.emptyEventsCopy}
                  </Text>
                </View>
              ) : (
                filteredEvents.map((event) => {
                  return (
                    <EventFeedCard
                      key={event.id}
                      actionLabel={copy.home.openAction}
                      event={event}
                      onActionPress={() => openEventDetail(event)}
                      onPress={() => openEventDetail(event)}
                    />
                  );
                })
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={getEntranceStyle(5, 48)}
        >
          <AppFooterTabs
            activeTab="home"
            bottomInset={insets.bottom}
            onTabPress={(nextTab: AppTab) =>
              handleAppTabPress('home', nextTab, copy, navigation)
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
  languageRow: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  languageToggle: {
    minWidth: 72,
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
    fontStyle: 'italic',
    letterSpacing: -0.9,
    color: colors.primaryDeep,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  heroSection: {
    gap: spacing.xs,
  },
  createCtaSection: {
    gap: spacing.md,
  },
  createCtaShell: {
    borderRadius: radii.pill,
  },
  createCtaGradient: {
    minHeight: 58,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  createCtaLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    letterSpacing: 0.4,
    color: colors.white,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -1.1,
    color: colors.text,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  featureShell: {
    gap: spacing.md,
  },
  featureCard: {
    minHeight: 160,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: 34,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  featureImage: {
    borderRadius: 34,
  },
  featureGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  featureLabel: {
    flexShrink: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 29,
    lineHeight: 30,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: colors.white,
  },
  gridSection: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activitySection: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    lineHeight: 21,
    color: colors.text,
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
    borderColor: 'rgba(255, 255, 255, 0.82)',
    backgroundColor: 'rgba(255, 244, 244, 0.78)',
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
    backgroundColor: colors.primaryDeep,
  },
  footerLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  footerLabelActive: {
    color: colors.primaryDeep,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
