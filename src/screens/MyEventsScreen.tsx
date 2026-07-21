import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuSheet } from '../components/AccountMenuSheet';
import { AppFooterTabs, APP_FOOTER_HEIGHT } from '../components/AppFooterTabs';
import { AppHeader } from '../components/AppHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { AppTab, EventActivityType, EventRecord } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import {
  formatActivityLogLine,
  formatAttendanceSummary,
  formatEventSchedule,
  formatNotificationLine,
  formatRatingValue,
} from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type MyEventsRoute = RouteProp<RootStackParamList, 'MyEvents'>;

export function MyEventsScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const { signOut } = useSession();
  const {
    buildShareLink,
    cancelEvent,
    completeEvent,
    markAllNotificationsRead,
    myEvents,
    notifications,
    unreadNotifications,
  } = useEvents();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<MyEventsRoute>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;
  const [menuVisible, setMenuVisible] = useState(false);

  const freshMessage = useMemo(() => {
    const action = route.params?.freshAction;

    if (action === 'cancelled') {
      return copy.myEvents.freshCancelled;
    }

    if (action === 'completed') {
      return copy.myEvents.freshCompleted;
    }

    if (action === 'invited') {
      return copy.myEvents.freshInvited;
    }

    if (action === 'updated') {
      return copy.myEvents.freshUpdated;
    }

    if (action === 'created') {
      return copy.myEvents.freshCreated;
    }

    return null;
  }, [
    copy.myEvents.freshCancelled,
    copy.myEvents.freshCompleted,
    copy.myEvents.freshCreated,
    copy.myEvents.freshInvited,
    copy.myEvents.freshUpdated,
    route.params?.freshAction,
  ]);

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

  const activeEvents = myEvents.filter((event) => event.status === 'scheduled');
  const privateEvents = myEvents.filter((event) => event.visibility === 'private');

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

  const handleShare = async (event: EventRecord) => {
    try {
      await Share.share({
        message: `${copy.inviteMembers.shareBody}\n${buildShareLink(event)}`,
        title: event.title,
      });
    } catch {
      Alert.alert(copy.myEvents.title, copy.myEvents.shareFailed);
    }
  };

  const handleCancel = (event: EventRecord) => {
    Alert.alert(copy.myEvents.cancelConfirmTitle, copy.myEvents.cancelConfirmBody, [
      {
        style: 'cancel',
        text: copy.common.cancel,
      },
      {
        style: 'destructive',
        text: copy.myEvents.cancelAction,
        onPress: () => {
          void cancelEvent(event.id).then((result) => {
            Alert.alert(
              copy.myEvents.cancelSuccessTitle,
              result.attendeeCount > 0
                ? copy.myEvents.cancelSuccessBody
                : copy.myEvents.cancelSuccessNoAudience,
            );
          });
        },
      },
    ]);
  };

  const handleComplete = (event: EventRecord) => {
    Alert.alert(copy.myEvents.completeConfirmTitle, copy.myEvents.completeConfirmBody, [
      {
        style: 'cancel',
        text: copy.common.cancel,
      },
      {
        text: copy.myEvents.completeAction,
        onPress: () => {
          void completeEvent(event.id).then(() => {
            Alert.alert(copy.myEvents.completeSuccessTitle, copy.myEvents.completeSuccessBody);
          });
        },
      },
    ]);
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
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{copy.myEvents.title}</Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>{copy.myEvents.copy}</Text>
          </Animated.View>

          {freshMessage ? (
            <Animated.View
              style={[
                styles.freshBanner,
                { backgroundColor: theme.colors.mint },
                getEntranceStyle(2, 24),
              ]}
            >
              <Feather color={theme.colors.success} name="check-circle" size={18} />
              <Text style={[styles.freshBannerLabel, { color: theme.colors.success }]}>
                {freshMessage}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View style={[styles.metricsRow, getEntranceStyle(2, 30)]}>
            <MetricCard value={String(myEvents.length)} label={copy.profile.eventsCreatedStat} />
            <MetricCard value={String(privateEvents.length)} label={copy.profile.privateEventsStat} />
            <MetricCard value={String(activeEvents.length)} label={copy.profile.upcomingStat} />
          </Animated.View>

          {myEvents.length === 0 ? (
            <Animated.View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.colors.surfaceStrong },
                getEntranceStyle(3, 34),
              ]}
            >
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                {copy.myEvents.emptyTitle}
              </Text>
              <Text style={[styles.emptyCopy, { color: theme.colors.textMuted }]}>
                {copy.myEvents.emptyCopy}
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateEvent')}
                style={({ pressed }) => [
                  styles.emptyAction,
                  { backgroundColor: theme.colors.primaryDeep },
                  pressed ? styles.cardPressed : undefined,
                ]}
              >
                <Feather color={theme.colors.white} name="plus-circle" size={18} />
                <Text style={[styles.emptyActionLabel, { color: theme.colors.white }]}>
                  {copy.home.createEvent}
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.cardsColumn, getEntranceStyle(3, 38)]}>
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onCancel={() => handleCancel(event)}
                  onComplete={() => handleComplete(event)}
                  onEdit={() => navigation.navigate('CreateEvent', { eventId: event.id })}
                  onInvite={() => navigation.navigate('InviteMembers', { eventId: event.id })}
                  onShare={() => void handleShare(event)}
                />
              ))}
            </Animated.View>
          )}
        </ScrollView>

        <Animated.View style={getEntranceStyle(4, 48)}>
          <AppFooterTabs
            activeTab={null}
            bottomInset={insets.bottom}
            onTabPress={(nextTab: AppTab) =>
              handleAppTabPress(null, nextTab, copy, navigation)
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

function MetricCard({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.panelBorder }]}>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textSoft }]}>{label}</Text>
    </View>
  );
}

function EventCard({
  event,
  onCancel,
  onComplete,
  onEdit,
  onInvite,
  onShare,
}: {
  event: EventRecord;
  onCancel: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onInvite: () => void;
  onShare: () => void;
}) {
  const { theme } = useAppTheme();
  const { copy } = useLocale();
  const latestActivity = event.activityLog.find((activity) => activity.type !== 'created') ?? null;
  const totalParticipantsLabel = `${formatAttendanceSummary(event)} ${copy.myEvents.participantsMetric}`;
  const eventAverage =
    event.reviews.length > 0
      ? event.reviews.reduce((total, review) => total + review.eventRating, 0) / event.reviews.length
      : 0;
  const organizerAverage =
    event.reviews.length > 0
      ? event.reviews.reduce((total, review) => total + review.organizerRating, 0) / event.reviews.length
      : 0;

  return (
    <View style={[styles.eventCard, { backgroundColor: theme.colors.surfaceStrong }]}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleBlock}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{event.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.colors.textSoft }]}>
            {formatEventSchedule(event)} · {event.meetingPoint}
          </Text>
        </View>

        <View style={styles.badgesColumn}>
          <Badge
            label={
              event.visibility === 'private'
                ? copy.myEvents.privateBadge
                : copy.myEvents.publicBadge
            }
            tone={event.visibility === 'private' ? 'coral' : 'mint'}
          />
          <Badge
            label={
              event.status === 'cancelled'
                ? copy.myEvents.cancelledBadge
                : event.status === 'completed'
                  ? copy.myEvents.completedBadge
                  : copy.myEvents.activeBadge
            }
            tone={event.status === 'cancelled' ? 'danger' : event.status === 'completed' ? 'coral' : 'neutral'}
          />
        </View>
      </View>

      <View style={styles.inlineFacts}>
        <FactChip
          iconName="users"
          label={`${copy.myEvents.attendeesLabel}: ${event.attendeeIds.length}`}
        />
        <FactChip
          iconName="hash"
          label={totalParticipantsLabel}
        />
      </View>

      {latestActivity ? (
        <View style={[styles.latestUpdateCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.latestUpdateTitle, { color: theme.colors.textSoft }]}>
            {copy.myEvents.lastUpdateLabel}
          </Text>
          <Text style={[styles.latestUpdateCopy, { color: theme.colors.text }]}>
            {formatActivityLogLine(copy, latestActivity)}
          </Text>
        </View>
      ) : null}

      {event.status === 'completed' ? (
        <View style={[styles.latestUpdateCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.latestUpdateTitle, { color: theme.colors.textSoft }]}>
            {copy.eventDetail.ratingSummaryTitle}
          </Text>
          <Text style={[styles.latestUpdateCopy, { color: theme.colors.text }]}>
            {copy.eventDetail.ratingEventTitle}: {formatRatingValue(eventAverage)} · {copy.eventDetail.ratingOrganizerTitle}:{' '}
            {formatRatingValue(organizerAverage)}
          </Text>
        </View>
      ) : null}

      {event.status === 'scheduled' ? (
        <View style={styles.actionsWrap}>
          <ActionButton
            iconName="edit-3"
            label={copy.myEvents.editAction}
            onPress={onEdit}
          />
          {event.visibility === 'private' ? (
            <>
              <ActionButton
                iconName="share-2"
                label={copy.myEvents.shareAction}
                onPress={onShare}
              />
              <ActionButton
                iconName="user-plus"
                label={copy.myEvents.inviteAction}
                onPress={onInvite}
              />
            </>
          ) : null}
          <ActionButton
            iconName="check-circle"
            label={copy.myEvents.completeAction}
            onPress={onComplete}
          />
          <ActionButton
            destructive
            iconName="x-circle"
            label={copy.myEvents.cancelAction}
            onPress={onCancel}
          />
        </View>
      ) : null}
    </View>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: 'coral' | 'danger' | 'mint' | 'neutral';
}) {
  const { theme } = useAppTheme();

  const toneStyles =
    tone === 'coral'
      ? { backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDeep }
      : tone === 'mint'
        ? { backgroundColor: theme.colors.mint, color: theme.colors.success }
        : tone === 'danger'
          ? { backgroundColor: `${theme.colors.danger}18`, color: theme.colors.danger }
          : { backgroundColor: theme.colors.surface, color: theme.colors.textSoft };

  return (
    <View style={[styles.badge, { backgroundColor: toneStyles.backgroundColor }]}>
      <Text style={[styles.badgeLabel, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
}

function FactChip({
  iconName,
  label,
  muted = false,
}: {
  iconName: React.ComponentProps<typeof Feather>['name'];
  label: string;
  muted?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.factChip,
        { backgroundColor: muted ? theme.colors.surfaceMuted : theme.colors.surface },
      ]}
    >
      <Feather
        color={muted ? theme.colors.textSoft : theme.colors.primaryDeep}
        name={iconName}
        size={14}
      />
      <Text
        style={[
          styles.factChipLabel,
          { color: muted ? theme.colors.textSoft : theme.colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ActionButton({
  destructive = false,
  iconName,
  label,
  onPress,
}: {
  destructive?: boolean;
  iconName: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: destructive ? `${theme.colors.danger}18` : theme.colors.primarySoft,
        },
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      <Feather
        color={destructive ? theme.colors.danger : theme.colors.primaryDeep}
        name={iconName}
        size={16}
      />
      <Text
        style={[
          styles.actionButtonLabel,
          { color: destructive ? theme.colors.danger : theme.colors.primaryDeep },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  heroSection: {
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -1.1,
    color: colors.text,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  freshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(188, 231, 222, 0.44)',
  },
  freshBannerLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.success,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 94,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
  },
  metricValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSoft,
  },
  emptyCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: spacing.xl,
    gap: spacing.md,
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
  emptyAction: {
    marginTop: spacing.sm,
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyActionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.white,
  },
  cardsColumn: {
    gap: spacing.md,
  },
  eventCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    lineHeight: 25,
    color: colors.text,
  },
  cardMeta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
  badgesColumn: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inlineFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  factChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 244, 244, 0.86)',
  },
  factChipMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
  },
  factChipLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.textSoft,
  },
  factChipLabelMuted: {
    color: colors.textSoft,
  },
  latestUpdateCard: {
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 245, 245, 0.88)',
    gap: 4,
  },
  latestUpdateTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  latestUpdateCopy: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 42,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 242, 243, 0.92)',
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(192, 57, 90, 0.1)',
  },
  actionButtonLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.primaryDeep,
  },
  actionButtonLabelDanger: {
    color: colors.danger,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
