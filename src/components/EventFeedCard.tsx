import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import {
  createEventHeroImage,
  heroBackgroundImage,
  homeSpotlightImage,
  onboardingHeroImage,
  radii,
  shadows,
  spacing,
  sportHeroImages,
} from '../theme/tokens';
import type { EventRecord } from '../types/domain';
import {
  formatEventSchedule,
  getEventDistanceKm,
  getEventParticipantCount,
  getEventSpotsLeft,
} from '../utils/events';

const imageBySport: Record<EventRecord['sport'], string> = {
  gym: sportHeroImages.gym,
  mtb: heroBackgroundImage,
  road_cycling: createEventHeroImage,
  running: homeSpotlightImage,
  trail_running: onboardingHeroImage,
  trekking: heroBackgroundImage,
};

const gradientBySport: Record<EventRecord['sport'], [string, string, string]> = {
  gym: ['rgba(14, 32, 52, 0.12)', 'rgba(24, 60, 96, 0.40)', 'rgba(16, 44, 74, 0.9)'],
  mtb: ['rgba(10, 58, 67, 0.1)', 'rgba(9, 79, 95, 0.38)', 'rgba(8, 66, 82, 0.92)'],
  road_cycling: ['rgba(24, 22, 32, 0.08)', 'rgba(89, 50, 80, 0.32)', 'rgba(71, 41, 60, 0.9)'],
  running: ['rgba(194, 80, 62, 0.12)', 'rgba(193, 66, 72, 0.36)', 'rgba(126, 36, 47, 0.88)'],
  trail_running: ['rgba(12, 31, 52, 0.12)', 'rgba(36, 53, 83, 0.42)', 'rgba(25, 41, 66, 0.9)'],
  trekking: ['rgba(40, 43, 48, 0.08)', 'rgba(62, 71, 75, 0.38)', 'rgba(45, 52, 59, 0.9)'],
};

interface EventFeedCardProps {
  actionLabel: string;
  event: EventRecord;
  onActionPress: () => void;
  onPress?: () => void;
  /** Marks the card as hosted by the current user or simply joined by her. */
  role?: 'host' | 'attendee';
}

export function EventFeedCard({
  actionLabel,
  event,
  onActionPress,
  onPress,
  role,
}: EventFeedCardProps) {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const sportMeta =
    copy.home.sportOptions.find((sport) => sport.id === event.sport) ?? copy.home.sportOptions[0];
  const participants = getEventParticipantCount(event);
  const spotsLeft = getEventSpotsLeft(event);
  const distanceKm = getEventDistanceKm(event.id);

  return (
    <Pressable
      onPress={onPress ?? onActionPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surfaceStrong },
        pressed ? styles.pressed : undefined,
      ]}
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
        <View style={styles.heroBadges}>
          <HeroTag iconName="map-pin" label={`${distanceKm}km`} />
          <HeroTag label={`${spotsLeft} ${copy.activity.spotsLeftLabel}`} />
        </View>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons
            color={theme.colors.white}
            name={sportMeta.iconName as never}
            size={28}
          />
        </View>
      </ImageBackground>

      <View style={styles.body}>
        {role ? (
          <View
            style={[
              styles.roleBadge,
              role === 'host'
                ? { backgroundColor: theme.colors.primarySoft }
                : { backgroundColor: theme.colors.mint },
            ]}
          >
            <MaterialCommunityIcons
              color={role === 'host' ? theme.colors.primaryDeep : theme.colors.success}
              name={role === 'host' ? 'star-four-points' : 'ticket-confirmation'}
              size={13}
            />
            <Text
              style={[
                styles.roleBadgeLabel,
                { color: role === 'host' ? theme.colors.primaryDeep : theme.colors.success },
              ]}
            >
              {role === 'host' ? copy.activity.roleHost : copy.activity.roleAttendee}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.title, { color: theme.colors.text }]}>{event.title}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSoft }]}>
          {formatEventSchedule(event)} · {event.meetingPoint}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.hostRow}>
            <View style={styles.avatars}>
              <AvatarBubble label={event.creatorName.slice(0, 1)} />
              <AvatarBubble label={String(Math.min(participants, 9))} shifted />
            </View>
            <Text style={[styles.hostText, { color: theme.colors.textSoft }]}>
              {participants} · {copy.activity.hostVerified}
            </Text>
          </View>

          <Pressable
            onPress={onActionPress}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.colors.primaryDeep },
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.actionLabel, { color: theme.colors.white }]}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function HeroTag({
  iconName,
  label,
}: {
  iconName?: React.ComponentProps<typeof Feather>['name'];
  label: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.heroTag, { backgroundColor: theme.colors.surfaceStrong }]}>
      {iconName ? <Feather color={theme.colors.primaryDeep} name={iconName} size={11} /> : null}
      <Text style={[styles.heroTagLabel, { color: theme.colors.primaryDeep }]}>{label}</Text>
    </View>
  );
}

function AvatarBubble({ label, shifted = false }: { label: string; shifted?: boolean }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.avatarBubble,
        {
          backgroundColor: shifted ? theme.colors.peach : theme.colors.primarySoft,
          borderColor: theme.colors.white,
        },
        shifted ? styles.avatarBubbleShifted : undefined,
      ]}
    >
      <Text style={[styles.avatarBubbleLabel, { color: theme.colors.primaryDeep }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.card,
  },
  hero: {
    minHeight: 182,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  heroImage: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heroBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  heroTagLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  roleBadgeLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 19,
    lineHeight: 24,
  },
  meta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBubble: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarBubbleShifted: {
    marginLeft: -8,
  },
  avatarBubbleLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
  },
  hostText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
  actionButton: {
    minWidth: 76,
    minHeight: 38,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
