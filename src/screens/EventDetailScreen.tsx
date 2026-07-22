import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenFrame } from '../components/ScreenFrame';
import { StarRatingField } from '../components/StarRatingField';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import {
  colors,
  createEventHeroImage,
  createEventMapImage,
  heroBackgroundImage,
  homeSpotlightImage,
  onboardingHeroImage,
  radii,
  shadows,
  spacing,
} from '../theme/tokens';
import type { EventRecord } from '../types/domain';
import {
  formatEventSchedule,
  formatRatingValue,
  getEventDistanceKm,
  getEventParticipantCount,
  getEventSpotsLeft,
} from '../utils/events';
import {
  buildEventPassPayload,
  formatManualPassCode,
  serializeEventPassPayload,
} from '../utils/eventPasses';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type EventDetailRoute = RouteProp<RootStackParamList, 'EventDetail'>;

const imageBySport: Record<EventRecord['sport'], string> = {
  mtb: heroBackgroundImage,
  road_cycling: createEventHeroImage,
  running: homeSpotlightImage,
  trail_running: onboardingHeroImage,
  trekking: heroBackgroundImage,
};

const gradientBySport: Record<EventRecord['sport'], [string, string, string]> = {
  mtb: ['rgba(10, 58, 67, 0.08)', 'rgba(9, 79, 95, 0.34)', 'rgba(8, 66, 82, 0.92)'],
  road_cycling: ['rgba(24, 22, 32, 0.08)', 'rgba(89, 50, 80, 0.28)', 'rgba(71, 41, 60, 0.92)'],
  running: ['rgba(194, 80, 62, 0.08)', 'rgba(193, 66, 72, 0.24)', 'rgba(126, 36, 47, 0.9)'],
  trail_running: ['rgba(12, 31, 52, 0.12)', 'rgba(36, 53, 83, 0.32)', 'rgba(25, 41, 66, 0.9)'],
  trekking: ['rgba(40, 43, 48, 0.08)', 'rgba(62, 71, 75, 0.26)', 'rgba(45, 52, 59, 0.9)'],
};

export function EventDetailScreen() {
  const { copy } = useLocale();
  const {
    hiveMembers,
    buildShareLink,
    completeEvent,
    getAttendancePass,
    getEventById,
    getEventReviewByUser,
    getEventReviewStats,
    getOrganizerReviewStats,
    joinEvent,
    leaveEvent,
    submitEventReview,
  } = useEvents();
  const { user } = useSession();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<EventDetailRoute>();
  const insets = useSafeAreaInsets();
  const event = getEventById(route.params.eventId);
  const [eventRating, setEventRating] = useState(0);
  const [organizerRating, setOrganizerRating] = useState(0);

  const members = useMemo(() => {
    if (!event) {
      return [];
    }

    const ids = [event.creatorId, ...event.attendeeIds];
    return ids
      .map((memberId) => hiveMembers.find((member) => member.id === memberId))
      .filter((member): member is NonNullable<typeof member> => Boolean(member))
      .slice(0, 8);
  }, [event, hiveMembers]);

  if (!event) {
    return null;
  }

  const distanceKm = getEventDistanceKm(event.id);
  const sportMeta =
    copy.home.sportOptions.find((sport) => sport.id === event.sport) ?? copy.home.sportOptions[0];
  const isHost = user?.id === event.creatorId;
  const isJoined = isHost || Boolean(user?.id && event.attendeeIds.includes(user.id));
  const isCompleted = event.status === 'completed';
  const spotsLeft = getEventSpotsLeft(event);
  const participants = getEventParticipantCount(event);
  const attendancePass = user ? getAttendancePass(event.id, user.id) : null;
  const qrPayload = attendancePass
    ? serializeEventPassPayload(buildEventPassPayload(event.id, attendancePass))
    : null;
  const checkedInCount = event.attendancePasses.filter(
    (pass) => !pass.revokedAt && pass.checkedInAt,
  ).length;
  const skillLabel =
    event.skillLevel === 'advanced'
      ? copy.createEvent.skillAdvanced
      : event.skillLevel === 'intermediate'
        ? copy.createEvent.skillIntermediate
        : copy.createEvent.skillBeginner;
  const organizer = hiveMembers.find((member) => member.id === event.creatorId);
  const existingReview = user ? getEventReviewByUser(event.id, user.id) : null;
  const eventReviewStats = getEventReviewStats(event.id);
  const organizerReviewStats = getOrganizerReviewStats(event.creatorId);
  const canReview = isCompleted && !isHost && isJoined;

  const handlePrimaryAction = async () => {
    if (isCompleted && isHost) {
      navigation.navigate('MyEvents', { focusEventId: event.id, freshAction: 'completed' });
      return;
    }

    if (isCompleted && canReview) {
      if (existingReview) {
        return;
      }

      if (eventRating < 1 || organizerRating < 1) {
        Alert.alert(copy.eventDetail.ratingMissingTitle, copy.eventDetail.ratingMissingBody);
        return;
      }

      const result = await submitEventReview(event.id, {
        eventRating,
        organizerRating,
      });

      if (result.status === 'submitted') {
        Alert.alert(copy.eventDetail.ratingSuccessTitle, copy.eventDetail.ratingSuccessBody);
      }

      return;
    }

    if (isHost) {
      navigation.navigate('EventCheckIn', { eventId: event.id });
      return;
    }

    if (isJoined) {
      Alert.alert(copy.eventDetail.leaveConfirmTitle, copy.eventDetail.leaveConfirmBody, [
        {
          text: copy.common.cancel,
          style: 'cancel',
        },
        {
          text: copy.eventDetail.leaveAction,
          style: 'destructive',
          onPress: () => {
            void leaveEvent(event.id).then((result) => {
              if (result.status === 'left') {
                Alert.alert(
                  copy.eventDetail.confirmedLeaveTitle,
                  copy.eventDetail.confirmedLeaveBody,
                );
              }
            });
          },
        },
      ]);
      return;
    }

    const result = await joinEvent(event.id);

    if (result.status === 'joined') {
      Alert.alert(copy.home.joinSuccessTitle, copy.home.joinSuccessBody);
      return;
    }

    if (result.status === 'full') {
      Alert.alert(copy.home.eventAlertTitle, copy.home.joinFull);
      return;
    }

    if (result.status === 'cancelled') {
      Alert.alert(copy.home.eventAlertTitle, copy.home.joinCancelled);
      return;
    }

    if (result.status === 'completed') {
      Alert.alert(copy.home.eventAlertTitle, copy.home.joinCompleted);
      return;
    }

    if (result.status === 'host') {
      navigation.navigate('MyEvents', { focusEventId: event.id });
      return;
    }

    Alert.alert(copy.home.eventAlertTitle, copy.home.joinJoined);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.title}\n${buildShareLink(event)}`,
        title: event.title,
      });
    } catch {
      Alert.alert(copy.home.notificationsTitle, copy.myEvents.shareFailed);
    }
  };

  const handleCompleteEvent = () => {
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
      <StatusBar style="light" />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 108 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            imageStyle={styles.heroImage}
            source={{ uri: imageBySport[event.sport] }}
            style={styles.hero}
          >
            <LinearGradient
              colors={gradientBySport[event.sport]}
              locations={[0, 0.38, 1]}
              style={StyleSheet.absoluteFill}
            />

            <View style={[styles.topControls, { paddingTop: spacing.md + insets.top }]}>
              <TopControlButton iconName="arrow-left" onPress={() => navigation.goBack()} />
              <Text style={styles.wordmark}>HIVE</Text>
              <View style={styles.topRightActions}>
                <TopControlButton iconName="share-2" onPress={() => void handleShare()} />
                <View style={styles.organizerMiniAvatar}>
                  <Text style={styles.organizerMiniAvatarLabel}>
                    {(organizer?.fullName || event.creatorName).slice(0, 1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.heroCopyBlock}>
              <View style={styles.heroKicker}>
                <Text style={styles.heroKickerLabel}>{sportMeta.label}</Text>
              </View>
              <Text style={styles.heroTitle}>{event.title}</Text>
              <Text style={styles.heroSubtitle}>{formatEventSchedule(event)}</Text>
              <Text style={styles.heroLocation}>{event.meetingPoint}</Text>
            </View>
          </ImageBackground>

          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarLabel}>
                {(organizer?.fullName || event.creatorName).slice(0, 1)}
              </Text>
            </View>
            <View style={styles.organizerCopy}>
              <Text style={styles.organizerLabel}>{copy.home.eventOrganizerPrefix}</Text>
              <Text style={styles.organizerName}>{organizer?.fullName || event.creatorName}</Text>
              <Text style={styles.organizerMeta}>
                {formatRatingValue(organizerReviewStats.average)} · {organizerReviewStats.count}{' '}
                {copy.eventDetail.reviewsLabel}
              </Text>
            </View>
            <View style={styles.organizerBadge}>
              <Feather color={colors.primary} name="shield" size={14} />
            </View>
          </View>

          <View style={styles.metricHero}>
            <Text style={styles.metricHeroValue}>{distanceKm} km</Text>
            <Text style={styles.metricHeroLabel}>{copy.eventDetail.routeMetric}</Text>
          </View>

          <View style={styles.ratingSummaryCard}>
            <Text style={styles.ratingSummaryTitle}>{copy.eventDetail.ratingSummaryTitle}</Text>
            <Text style={styles.ratingSummaryCopy}>{copy.eventDetail.ratingSummaryCopy}</Text>

            <View style={styles.ratingSummaryGrid}>
              <StarRatingField
                helper={`${formatRatingValue(eventReviewStats.average)} · ${eventReviewStats.count} ${copy.eventDetail.reviewsLabel}`}
                label={copy.eventDetail.ratingEventTitle}
                value={Math.round(eventReviewStats.average)}
              />
              <StarRatingField
                helper={`${formatRatingValue(organizerReviewStats.average)} · ${organizerReviewStats.count} ${copy.eventDetail.reviewsLabel}`}
                label={copy.eventDetail.ratingOrganizerTitle}
                value={Math.round(organizerReviewStats.average)}
              />
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <InfoTile
              iconName="speedometer"
              subtitle={copy.eventDetail.routeNote}
              title={skillLabel}
            />
            <InfoTile
              iconName="shield-check"
              subtitle={
                event.visibility === 'private'
                  ? copy.eventDetail.accessPrivate
                  : copy.eventDetail.accessPublic
              }
              title={copy.eventDetail.visibilityLabel}
            />
          </View>

          <View style={styles.metricsGrid}>
            <InfoTile
              iconName="map-marker-radius"
              subtitle={event.meetingPoint}
              title={copy.eventDetail.mapTitle}
            />
            <InfoTile
              iconName="account-group"
              subtitle={`${spotsLeft} ${copy.eventDetail.spotsLabel}`}
              title={`${participants}/${event.participantLimit}`}
            />
          </View>

          <View style={styles.routeCard}>
            <ImageBackground
              imageStyle={styles.routeImage}
              source={{ uri: createEventMapImage }}
              style={styles.routeImageWrap}
            >
              <View style={styles.mapPin}>
                <Feather color={colors.white} name="map-pin" size={18} />
              </View>
            </ImageBackground>
            <Pressable
              onPress={() => Alert.alert(copy.eventDetail.mapTitle, event.meetingPoint)}
              style={({ pressed }) => [styles.routeCta, pressed ? styles.pressed : undefined]}
            >
              <Feather color={colors.primary} name="navigation" size={16} />
              <Text style={styles.routeCtaLabel}>{copy.eventDetail.mapAction}</Text>
            </Pressable>
          </View>

          {isHost && !isCompleted ? (
            <View style={styles.checkInCard}>
              <Text style={styles.checkInTitle}>{copy.eventDetail.attendanceCardTitle}</Text>
              <Text style={styles.checkInBody}>{copy.eventDetail.attendanceCardCopy}</Text>

              <View style={styles.checkInMetricsRow}>
                <CompactMetric
                  label={copy.eventDetail.checkedInLabel}
                  value={`${checkedInCount}`}
                />
                <CompactMetric
                  label={copy.eventDetail.pendingLabel}
                  value={`${Math.max(event.attendeeIds.length - checkedInCount, 0)}`}
                />
              </View>

              <View style={styles.checkInActionsRow}>
                <Pressable
                  onPress={() => navigation.navigate('EventCheckIn', { eventId: event.id })}
                  style={({ pressed }) => [
                    styles.checkInPrimaryButton,
                    pressed ? styles.pressed : undefined,
                  ]}
                >
                  <Feather color={colors.white} name="camera" size={18} />
                  <Text style={styles.checkInPrimaryLabel}>{copy.eventDetail.hostAction}</Text>
                </Pressable>

                <Pressable
                  onPress={handleCompleteEvent}
                  style={({ pressed }) => [
                    styles.checkInSecondaryButton,
                    pressed ? styles.pressed : undefined,
                  ]}
                >
                  <Text style={styles.checkInSecondaryLabel}>{copy.myEvents.completeAction}</Text>
                </Pressable>
              </View>
            </View>
          ) : isJoined && attendancePass && qrPayload ? (
            <View style={styles.qrCard}>
              <Text style={styles.qrCardTitle}>{copy.eventDetail.qrCardTitle}</Text>
              <Text style={styles.qrCardBody}>{copy.eventDetail.qrCardCopy}</Text>

              <View style={styles.qrCodeWrap}>
                <QRCode
                  backgroundColor={colors.white}
                  color={colors.primaryDeep}
                  size={188}
                  value={qrPayload}
                />
              </View>

              <View style={styles.qrMetaRow}>
                <View
                  style={[
                    styles.qrStatusPill,
                    attendancePass.checkedInAt
                      ? styles.qrStatusPillSuccess
                      : styles.qrStatusPillReady,
                  ]}
                >
                  <MaterialCommunityIcons
                    color={attendancePass.checkedInAt ? colors.success : colors.primaryDeep}
                    name={attendancePass.checkedInAt ? 'check-circle' : 'qrcode'}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.qrStatusLabel,
                      attendancePass.checkedInAt
                        ? styles.qrStatusLabelSuccess
                        : styles.qrStatusLabelReady,
                    ]}
                  >
                    {attendancePass.checkedInAt
                      ? copy.eventDetail.qrCheckedInLabel
                      : copy.eventDetail.qrReadyLabel}
                  </Text>
                </View>

                <View style={styles.qrManualWrap}>
                  <Text style={styles.qrManualLabel}>{copy.eventDetail.qrManualCodeLabel}</Text>
                  <Text style={styles.qrManualValue}>
                    {formatManualPassCode(attendancePass.manualCode)}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {canReview ? (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>
                {existingReview
                  ? copy.eventDetail.ratingSubmittedTitle
                  : copy.eventDetail.ratingPromptTitle}
              </Text>
              <Text style={styles.reviewCardCopy}>
                {existingReview
                  ? copy.eventDetail.ratingSubmittedCopy
                  : copy.eventDetail.ratingPromptCopy}
              </Text>

              <View style={styles.reviewFields}>
                <StarRatingField
                  helper={copy.eventDetail.ratingSummaryCopy}
                  label={copy.eventDetail.ratingEventTitle}
                  onChange={existingReview ? undefined : setEventRating}
                  value={existingReview?.eventRating ?? eventRating}
                />
                <StarRatingField
                  helper={copy.eventDetail.ratingSummaryCopy}
                  label={copy.eventDetail.ratingOrganizerTitle}
                  onChange={existingReview ? undefined : setOrganizerRating}
                  value={existingReview?.organizerRating ?? organizerRating}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.membersSection}>
            <View style={styles.membersHeader}>
              <Text style={styles.membersTitle}>
                {copy.eventDetail.membersTitle} ({members.length})
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.membersRow}>
                {members.map((member) => (
                  <MemberChip
                    key={member.id}
                    checkedIn={Boolean(
                      event.attendancePasses.find(
                        (pass) => pass.userId === member.id && !pass.revokedAt && pass.checkedInAt,
                      ),
                    )}
                    memberName={member.fullName}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {isJoined ? (
            <Pressable
              onPress={() => navigation.navigate('EventChat', { eventId: event.id })}
              style={({ pressed }) => [styles.chatEntryCard, pressed ? styles.pressed : undefined]}
            >
              <View style={styles.chatEntryIcon}>
                <Feather color={colors.primary} name="message-circle" size={18} />
              </View>
              <Text style={styles.chatEntryLabel}>{copy.eventDetail.chatOpenTitle}</Text>
              <Feather color={colors.textMuted} name="chevron-right" size={20} />
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.bottomMeta}>
            <Text style={styles.bottomMetaLabel}>
              {isCompleted && canReview
                ? copy.eventDetail.ratingPromptTitle
                : isCompleted && isHost
                  ? copy.eventDetail.ratingSummaryTitle
                  : copy.eventDetail.startLabel}
            </Text>
            <Text style={styles.bottomMetaValue}>
              {isCompleted
                ? copy.myEvents.completedBadge
                : event.time}
            </Text>
          </View>

          <Pressable
            disabled={Boolean((isCompleted && canReview && existingReview) || (isCompleted && !isHost && !canReview))}
            onPress={() => void handlePrimaryAction()}
            style={({ pressed }) => [
              styles.primaryButton,
              (isCompleted && canReview && existingReview) || (isCompleted && !isHost && !canReview)
                ? styles.primaryButtonDisabled
                : undefined,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#FF7A73', colors.primaryDeep]}
              end={{ x: 1, y: 0.2 }}
              start={{ x: 0, y: 1 }}
              style={styles.primaryGradient}
            >
              <Feather
                color={colors.white}
                name={
                  isCompleted
                    ? isHost
                      ? 'calendar'
                      : canReview
                        ? 'star'
                        : 'clock'
                    : isHost
                      ? 'camera'
                      : isJoined
                        ? 'log-out'
                        : 'users'
                }
                size={18}
              />
              <Text style={styles.primaryButtonLabel}>
                {isCompleted
                  ? isHost
                    ? copy.eventDetail.manageAction
                    : canReview
                      ? existingReview
                        ? copy.eventDetail.ratingSubmittedTitle
                        : copy.eventDetail.ratingSubmitAction
                      : copy.myEvents.completedBadge
                  : isHost
                    ? copy.eventDetail.hostAction
                    : isJoined
                      ? copy.eventDetail.leaveAction
                      : copy.home.joinAction}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScreenFrame>
  );
}

function TopControlButton({
  iconName,
  onPress,
}: {
  iconName: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.topControlButton, pressed ? styles.pressed : undefined]}>
      <Feather color={colors.primaryDeep} name={iconName} size={18} />
    </Pressable>
  );
}

function InfoTile({
  iconName,
  subtitle,
  title,
}: {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.infoTile}>
      <View style={styles.infoIconWrap}>
        <MaterialCommunityIcons color={colors.primaryDeep} name={iconName as never} size={18} />
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
    </View>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compactMetric}>
      <Text style={styles.compactMetricValue}>{value}</Text>
      <Text style={styles.compactMetricLabel}>{label}</Text>
    </View>
  );
}

function MemberChip({
  checkedIn,
  memberName,
}: {
  checkedIn: boolean;
  memberName: string;
}) {
  return (
    <View style={styles.memberChip}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarLabel}>{memberName.slice(0, 1)}</Text>
        {checkedIn ? (
          <View style={styles.memberCheckBadge}>
            <MaterialCommunityIcons color={colors.white} name="check" size={12} />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.memberName}>
        {memberName.split(' ')[0]}
      </Text>
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
    gap: spacing.md,
  },
  hero: {
    minHeight: 336,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  heroImage: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topControlButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 250, 0.92)',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.9,
    color: colors.white,
    transform: [{ skewX: '-8deg' }],
  },
  organizerMiniAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 250, 0.92)',
  },
  organizerMiniAvatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.primaryDeep,
  },
  heroCopyBlock: {
    gap: spacing.xs,
  },
  heroKicker: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 94, 94, 0.86)',
  },
  heroKickerLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.white,
  },
  heroTitle: {
    maxWidth: 280,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1.4,
    color: colors.white,
  },
  heroSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255, 247, 247, 0.92)',
  },
  heroLocation: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 247, 247, 0.82)',
  },
  organizerCard: {
    marginHorizontal: spacing.lg,
    marginTop: -30,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  organizerAvatar: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 94, 94, 0.16)',
  },
  organizerAvatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 24,
    color: colors.primaryDeep,
  },
  organizerCopy: {
    flex: 1,
    gap: 2,
  },
  organizerLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  organizerName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    lineHeight: 20,
    color: colors.text,
  },
  organizerMeta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.textSoft,
  },
  organizerBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 94, 94, 0.12)',
  },
  metricHero: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  metricHeroValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 34,
    lineHeight: 38,
    color: colors.white,
  },
  metricHeroLabel: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(255, 247, 247, 0.9)',
  },
  ratingSummaryCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  ratingSummaryTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  ratingSummaryCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  ratingSummaryGrid: {
    gap: spacing.md,
  },
  metricsGrid: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoTile: {
    flex: 1,
    minHeight: 124,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 218, 0.62)',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    lineHeight: 19,
    color: colors.text,
  },
  infoSubtitle: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSoft,
  },
  routeCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    gap: spacing.md,
    ...shadows.card,
  },
  routeImageWrap: {
    minHeight: 180,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeImage: {
    borderRadius: 22,
  },
  mapPin: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  routeCta: {
    alignSelf: 'center',
    minHeight: 44,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.card,
  },
  routeCtaLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.text,
  },
  checkInCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  checkInTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  checkInBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  checkInMetricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compactMetric: {
    flex: 1,
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.9)',
  },
  compactMetricValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    color: colors.primaryDeep,
  },
  compactMetricLabel: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  checkInActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkInPrimaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.primaryDeep,
    ...shadows.button,
  },
  checkInPrimaryLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 14,
    color: colors.white,
  },
  checkInSecondaryButton: {
    minWidth: 122,
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
  },
  checkInSecondaryLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.primaryDeep,
  },
  qrCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  qrCardTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  qrCardBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  qrCodeWrap: {
    alignSelf: 'center',
    marginVertical: spacing.xs,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  qrMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  qrStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  qrStatusPillReady: {
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
  },
  qrStatusPillSuccess: {
    backgroundColor: 'rgba(188, 231, 222, 0.92)',
  },
  qrStatusLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  qrStatusLabelReady: {
    color: colors.primaryDeep,
  },
  qrStatusLabelSuccess: {
    color: colors.success,
  },
  qrManualWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  qrManualLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  qrManualValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.text,
  },
  membersSection: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  membersTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  membersRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  memberChip: {
    width: 66,
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberAvatar: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 218, 0.62)',
    position: 'relative',
  },
  memberAvatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: colors.primaryDeep,
  },
  memberCheckBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  memberName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    textAlign: 'center',
    color: colors.text,
  },
  chatEntryCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  chatEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 244, 244, 0.9)',
  },
  chatEntryLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  reviewCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    gap: spacing.md,
    ...shadows.card,
  },
  reviewCardTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  reviewCardCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  reviewFields: {
    gap: spacing.md,
  },
  bottomBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  bottomMeta: {
    minWidth: 92,
  },
  bottomMetaLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  bottomMetaValue: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 24,
    color: colors.text,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radii.pill,
  },
  primaryButtonDisabled: {
    opacity: 0.72,
  },
  primaryGradient: {
    minHeight: 56,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  primaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.white,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
