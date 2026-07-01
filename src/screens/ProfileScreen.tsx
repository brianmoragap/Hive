import { Feather } from '@expo/vector-icons';
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuSheet } from '../components/AccountMenuSheet';
import { AppFooterTabs, APP_FOOTER_HEIGHT } from '../components/AppFooterTabs';
import { AppHeader } from '../components/AppHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import { StarRatingField } from '../components/StarRatingField';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { AppTab } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import { formatRatingValue } from '../utils/events';
import { formatNotificationLine } from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function fallbackName(email: string) {
  const base = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Hive';
  return base.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProfileScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const {
    getOrganizerReviewStats,
    markAllNotificationsRead,
    myEvents,
    notifications,
    unreadNotifications,
  } = useEvents();
  const { profile, signOut, user } = useSession();
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    Animated.stagger(
      75,
      entranceAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [entranceAnims]);

  const displayName = profile?.fullName?.trim() || (user ? fallbackName(user.email) : 'Hive');
  const privateEvents = myEvents.filter((event) => event.visibility === 'private').length;
  const activeEvents = myEvents.filter((event) => event.status === 'scheduled').length;
  const initials = useMemo(() => displayName.slice(0, 1).toUpperCase(), [displayName]);
  const organizerRating = user ? getOrganizerReviewStats(user.id) : { average: 0, count: 0 };

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
          <Animated.View
            style={[
              styles.profileHero,
              { backgroundColor: theme.colors.surfaceStrong },
              getEntranceStyle(1, 20),
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
              <Text style={[styles.avatarLabel, { color: theme.colors.primaryDeep }]}>{initials}</Text>
            </View>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{displayName}</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.mint }]}>
              <Feather color={theme.colors.success} name="check-circle" size={16} />
              <Text style={[styles.verifiedBadgeLabel, { color: theme.colors.success }]}>
                {copy.profile.verifiedBadge}
              </Text>
            </View>
            <View style={[styles.ratingBadge, { backgroundColor: theme.colors.primarySoft }]}>
              <Feather color={theme.colors.primaryDeep} name="star" size={16} />
              <Text style={[styles.ratingBadgeLabel, { color: theme.colors.primaryDeep }]}>
                {organizerRating.count > 0
                  ? `${formatRatingValue(organizerRating.average)} · ${organizerRating.count} ${copy.eventDetail.reviewsLabel}`
                  : copy.profile.organizerRatingEmpty}
              </Text>
            </View>
            <Text style={[styles.profileCopy, { color: theme.colors.textMuted }]}>
              {copy.profile.copy}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.statsRow, getEntranceStyle(2, 30)]}>
            <StatCard label={copy.profile.eventsCreatedStat} value={String(myEvents.length)} />
            <StatCard label={copy.profile.privateEventsStat} value={String(privateEvents)} />
            <StatCard label={copy.profile.upcomingStat} value={String(activeEvents)} />
          </Animated.View>

          <Animated.View
            style={[
              styles.detailsCard,
              { backgroundColor: theme.colors.surfaceStrong },
              getEntranceStyle(3, 34),
            ]}
          >
            <DetailRow iconName="mail" label={copy.profile.emailLabel} value={profile?.email || user?.email || '-'} />
            <DetailRow iconName="phone" label={copy.profile.phoneLabel} value={profile?.phoneNumber || '-'} />
            <DetailRow
              iconName="calendar"
              label={copy.profile.birthDateLabel}
              value={profile?.birthDate || '-'}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.actionsCard,
              { backgroundColor: theme.colors.surfaceStrong },
              getEntranceStyle(4, 40),
            ]}
          >
            <Text style={[styles.actionsTitle, { color: theme.colors.text }]}>{copy.profile.title}</Text>
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => navigation.navigate('MyEvents')}
                style={({ pressed }) => [
                  styles.primaryAction,
                  { backgroundColor: theme.colors.primaryDeep },
                  pressed ? styles.cardPressed : undefined,
                ]}
              >
                <Feather color={theme.colors.white} name="calendar" size={18} />
                <Text style={[styles.primaryActionLabel, { color: theme.colors.white }]}>
                  {copy.profile.myEventsAction}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('CreateEvent')}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  { backgroundColor: theme.colors.primarySoft },
                  pressed ? styles.cardPressed : undefined,
                ]}
              >
                <Feather color={theme.colors.primaryDeep} name="plus-circle" size={18} />
                <Text style={[styles.secondaryActionLabel, { color: theme.colors.primaryDeep }]}>
                  {copy.profile.createEventAction}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.safetyCard,
              { backgroundColor: theme.colors.surface },
              getEntranceStyle(4, 48),
            ]}
          >
            <StarRatingField
              helper={
                organizerRating.count > 0
                  ? `${formatRatingValue(organizerRating.average)} · ${organizerRating.count} ${copy.eventDetail.reviewsLabel}`
                  : copy.profile.organizerRatingEmpty
              }
              label={copy.profile.organizerRatingLabel}
              value={Math.round(organizerRating.average)}
            />
            <Text style={[styles.safetyTitle, { color: theme.colors.text }]}>
              {copy.profile.safetyCardTitle}
            </Text>
            <Text style={[styles.safetyCopy, { color: theme.colors.textMuted }]}>
              {copy.profile.safetyCardCopy}
            </Text>
          </Animated.View>
        </ScrollView>

        <AppFooterTabs
          activeTab="profile"
          bottomInset={insets.bottom}
          onTabPress={(nextTab: AppTab) =>
            handleAppTabPress('profile', nextTab, copy, navigation)
          }
        />

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

function StatCard({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSoft }]}>{label}</Text>
    </View>
  );
}

function DetailRow({
  iconName,
  label,
  value,
}: {
  iconName: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.detailRow, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.detailIcon, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather color={theme.colors.primaryDeep} name={iconName} size={16} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: theme.colors.textSoft }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
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
    gap: spacing.lg,
  },
  profileHero: {
    alignItems: 'center',
    borderRadius: 32,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    gap: spacing.sm,
    ...shadows.card,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 94, 94, 0.16)',
  },
  avatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: colors.primaryDeep,
  },
  profileName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    color: colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(188, 231, 222, 0.46)',
  },
  verifiedBadgeLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.success,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ratingBadgeLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  profileCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
  },
  statValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSoft,
  },
  detailsCard: {
    borderRadius: 30,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    gap: spacing.sm,
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 58,
    borderRadius: 22,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 244, 244, 0.76)',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 218, 0.78)',
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  actionsCard: {
    borderRadius: 30,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    gap: spacing.md,
  },
  actionsTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 19,
    color: colors.text,
  },
  actionsRow: {
    gap: spacing.sm,
  },
  primaryAction: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryActionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.white,
  },
  secondaryAction: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 242, 243, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryActionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.primaryDeep,
  },
  safetyCard: {
    borderRadius: 30,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 240, 236, 0.86)',
    gap: spacing.xs,
  },
  safetyTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.text,
  },
  safetyCopy: {
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
