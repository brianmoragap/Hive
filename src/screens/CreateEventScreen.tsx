import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
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
import { LocationPicker } from '../components/LocationPicker';
import { DEFAULT_LOCATION, type LatLng } from '../components/locationPickerHtml';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { useSession } from '../providers/SessionProvider';
import {
  colors,
  createEventHeroImage,
  radii,
  shadows,
  spacing,
} from '../theme/tokens';
import type { AppTab, EventDraftPayload, EventVisibility, SkillLevel, SportType } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import { formatNotificationLine } from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type CreateEventRoute = RouteProp<RootStackParamList, 'CreateEvent'>;

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function CreateEventScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const { signOut } = useSession();
  const {
    createEvent,
    getEventById,
    markAllNotificationsRead,
    notifications,
    unreadNotifications,
    updateEvent,
  } = useEvents();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<CreateEventRoute>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedSportId, setSelectedSportId] = useState<SportType>('running');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [participantLimit, setParticipantLimit] = useState(12);
  const [visibility, setVisibility] = useState<EventVisibility>('public');
  const [error, setError] = useState<string | null>(null);

  const existingEvent = route.params?.eventId ? getEventById(route.params.eventId) : null;
  const isEditing = Boolean(existingEvent);

  // Spots can be raised freely, but never below the women already joined plus
  // the organizer herself. The database enforces the same floor.
  const minParticipantLimit = existingEvent
    ? Math.max(existingEvent.attendeeIds.length + 1, 2)
    : 2;

  // Lock the map's initial center on first render so moving the pin never reloads the map.
  const initialCenterRef = useRef<LatLng | null>(null);
  if (!initialCenterRef.current) {
    initialCenterRef.current =
      existingEvent?.lat != null && existingEvent?.lng != null
        ? { latitude: existingEvent.lat, longitude: existingEvent.lng }
        : DEFAULT_LOCATION;
  }
  const initialCenter = initialCenterRef.current;
  const [coords, setCoords] = useState<LatLng>(initialCenter);

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

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setSelectedSportId(existingEvent.sport);
      setSkillLevel(existingEvent.skillLevel);
      setDate(existingEvent.date);
      setTime(existingEvent.time);
      setMeetingPoint(existingEvent.meetingPoint);
      if (existingEvent.lat != null && existingEvent.lng != null) {
        setCoords({ latitude: existingEvent.lat, longitude: existingEvent.lng });
      }
      setParticipantLimit(existingEvent.participantLimit);
      setVisibility(existingEvent.visibility);
      return;
    }

    if (route.params?.prefillSport) {
      setSelectedSportId(route.params.prefillSport);
    }
  }, [existingEvent, route.params?.prefillSport]);

  const selectedSport =
    copy.home.sportOptions.find((sport) => sport.id === selectedSportId) ??
    copy.home.sportOptions[0];

  const skillOptions = useMemo(
    () => [
      { id: 'beginner' as const, label: copy.createEvent.skillBeginner },
      { id: 'intermediate' as const, label: copy.createEvent.skillIntermediate },
      { id: 'advanced' as const, label: copy.createEvent.skillAdvanced },
    ],
    [
      copy.createEvent.skillAdvanced,
      copy.createEvent.skillBeginner,
      copy.createEvent.skillIntermediate,
    ],
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

  const openActivitySelector = () => {
    Alert.alert(copy.createEvent.activityPickerTitle, undefined, [
      ...copy.home.sportOptions.map((sport) => ({
        text: sport.label,
        onPress: () => {
          setError(null);
          setSelectedSportId(sport.id);
        },
      })),
      {
        style: 'cancel' as const,
        text: copy.common.cancel,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !date.trim() || !time.trim() || !meetingPoint.trim()) {
      setError(copy.createEvent.missingFields);
      return;
    }

    const payload: EventDraftPayload = {
      title: title.trim(),
      sport: selectedSportId,
      skillLevel,
      date,
      time,
      meetingPoint: meetingPoint.trim(),
      lat: coords.latitude,
      lng: coords.longitude,
      participantLimit,
      visibility,
    };

    setError(null);

    try {
      if (existingEvent) {
        await updateEvent(existingEvent.id, payload);
        Alert.alert(copy.createEvent.updateSuccessTitle, copy.createEvent.updateSuccessBody, [
          {
            text: copy.myEvents.title,
            onPress: () =>
              navigation.replace('MyEvents', {
                focusEventId: existingEvent.id,
                freshAction: 'updated',
              }),
          },
        ]);
        return;
      }

      const newEvent = await createEvent(payload);
      Alert.alert(copy.createEvent.successTitle, copy.createEvent.successBody, [
        {
          text: copy.myEvents.title,
          onPress: () =>
            navigation.replace('MyEvents', {
              focusEventId: newEvent.id,
              freshAction: 'created',
            }),
        },
      ]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '';
      // The database refuses a limit below the women already joined and reports
      // the floor it will accept, e.g. "CAPACITY_BELOW_JOINED:4".
      const floor = /CAPACITY_BELOW_JOINED:(\d+)/.exec(message)?.[1];

      setError(
        floor
          ? copy.createEvent.limitBelowJoinedError.replace('{min}', floor)
          : message || copy.createEvent.missingFields,
      );
    }
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
          <Animated.View style={getEntranceStyle(1, 18)}>
            <ImageBackground
              imageStyle={styles.heroImage}
              source={{ uri: createEventHeroImage }}
              style={styles.heroCard}
            >
              <LinearGradient
                colors={['rgba(255, 188, 109, 0.12)', theme.colors.overlayDark]}
                locations={[0.12, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroCopyBlock}>
                <Text style={[styles.heroTitle, { color: theme.colors.white }]}>
                  {isEditing ? copy.createEvent.editHeroTitle : copy.createEvent.heroTitle}
                </Text>
                <Text style={[styles.heroCopy, { color: theme.colors.white }]}>
                  {isEditing ? copy.createEvent.editHeroCopy : copy.createEvent.heroCopy}
                </Text>
              </View>
            </ImageBackground>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheetCard,
              { backgroundColor: theme.colors.surfaceStrong },
              getEntranceStyle(2, 26),
            ]}
          >
            <FieldLabel label={copy.createEvent.titleLabel} />
            <TextInput
              onChangeText={(value) => {
                setError(null);
                setTitle(value);
              }}
              placeholder={copy.createEvent.titlePlaceholder}
              placeholderTextColor={theme.colors.inputPlaceholder}
              selectionColor={theme.colors.primary}
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
              ]}
              value={title}
            />

            <View style={styles.cardGroup}>
              <FieldLabel label={copy.createEvent.typeLabel} />
              <Pressable
                onPress={openActivitySelector}
                style={({ pressed }) => [
                  styles.selectorShell,
                  pressed ? styles.cardPressed : undefined,
                ]}
              >
                <Text style={[styles.selectorValue, { color: theme.colors.text }]}>
                  {selectedSport.label}
                </Text>
                <Feather color={theme.colors.textSoft} name="chevron-down" size={18} />
              </Pressable>
            </View>

            <View style={styles.cardGroup}>
              <FieldLabel label={copy.createEvent.skillLevelLabel} />
              <View style={styles.skillRow}>
                {skillOptions.map((skill) => {
                  const active = skill.id === skillLevel;

                  return (
                    <Pressable
                      key={skill.id}
                      onPress={() => setSkillLevel(skill.id)}
                      style={({ pressed }) => [
                        styles.skillPill,
                        {
                          backgroundColor: active
                            ? theme.colors.primary
                            : theme.colors.inputBackground,
                        },
                        pressed ? styles.cardPressed : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.skillLabel,
                          { color: active ? theme.colors.white : theme.colors.textSoft },
                        ]}
                      >
                        {skill.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.cardGroup}>
              <FieldLabel label={copy.createEvent.visibilityLabel} />
              <View style={styles.visibilityRow}>
                <VisibilityPill
                  active={visibility === 'public'}
                  label={copy.createEvent.visibilityPublic}
                  onPress={() => setVisibility('public')}
                />
                <VisibilityPill
                  active={visibility === 'private'}
                  label={copy.createEvent.visibilityPrivate}
                  onPress={() => setVisibility('private')}
                />
              </View>
              <Text style={[styles.visibilityCopy, { color: theme.colors.textMuted }]}>
                {visibility === 'private'
                  ? copy.createEvent.privateVisibilityCopy
                  : copy.createEvent.publicVisibilityCopy}
              </Text>
              {visibility === 'private' && !isEditing ? (
                <Text style={[styles.privateHint, { color: theme.colors.primaryDeep }]}>
                  {copy.createEvent.privateAfterCreate}
                </Text>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheetCard,
              { backgroundColor: theme.colors.surfaceStrong },
              getEntranceStyle(3, 32),
            ]}
          >
            <FieldLabel label={copy.createEvent.dateLabel} />
            <View style={styles.dateTimeRow}>
              <InlineInput
                iconName="calendar"
                onChangeText={(value) => {
                  setError(null);
                  setDate(formatDateInput(value));
                }}
                placeholder={copy.createEvent.datePlaceholder}
                value={date}
              />
              <InlineInput
                iconName="clock"
                onChangeText={(value) => {
                  setError(null);
                  setTime(formatTimeInput(value));
                }}
                placeholder={copy.createEvent.timePlaceholder}
                value={time}
              />
            </View>

            <View style={styles.cardGroup}>
              <FieldLabel label={copy.createEvent.meetingPointLabel} />
              <View style={[styles.locationShell, { backgroundColor: theme.colors.inputBackground }]}>
                <Feather color={theme.colors.primary} name="map-pin" size={16} />
                <TextInput
                  onChangeText={(value) => {
                    setError(null);
                    setMeetingPoint(value);
                  }}
                  placeholder={copy.createEvent.meetingPointPlaceholder}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  selectionColor={theme.colors.primary}
                  style={[styles.locationInput, { color: theme.colors.text }]}
                  value={meetingPoint}
                />
              </View>
            </View>

            <View style={styles.mapCard}>
              <LocationPicker
                initialLatitude={initialCenter.latitude}
                initialLongitude={initialCenter.longitude}
                onChange={setCoords}
                height={200}
                borderRadius={28}
                backgroundColor={theme.colors.inputBackground}
              />
              {meetingPoint.trim() ? (
                <View
                  pointerEvents="none"
                  style={[styles.mapLabel, { backgroundColor: theme.colors.surfaceStrong }]}
                >
                  <Text numberOfLines={1} style={[styles.mapLabelText, { color: theme.colors.text }]}>
                    {meetingPoint}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.mapHint, { color: theme.colors.textMuted }]}>
              {copy.createEvent.mapPickerHint}
            </Text>

            <View style={styles.participantsRow}>
              <View style={styles.participantsCopy}>
                <Text style={styles.participantsTitle}>
                  {copy.createEvent.limitParticipantsTitle}
                </Text>
                <Text style={[styles.participantsDescription, { color: theme.colors.textMuted }]}>
                  {isEditing && minParticipantLimit > 2
                    ? copy.createEvent.limitParticipantsFloor
                        .replace('{joined}', String(existingEvent?.attendeeIds.length ?? 0))
                        .replace('{min}', String(minParticipantLimit))
                    : copy.createEvent.limitParticipantsCopy}
                </Text>
              </View>

              <View style={[styles.stepper, { backgroundColor: theme.colors.surface }]}>
                <StepperButton
                  disabled={participantLimit <= minParticipantLimit}
                  iconName="minus"
                  onPress={() =>
                    setParticipantLimit((current) =>
                      Math.max(current - 1, minParticipantLimit),
                    )
                  }
                />
                <Text style={[styles.stepperValue, { color: theme.colors.text }]}>
                  {participantLimit}
                </Text>
                <StepperButton
                  iconName="plus"
                  onPress={() => setParticipantLimit((current) => Math.min(current + 1, 50))}
                />
              </View>
            </View>
          </Animated.View>

          {error ? (
            <Animated.Text
              style={[
                styles.errorCopy,
                { color: theme.colors.danger },
                getEntranceStyle(4, 16),
              ]}
            >
              {error}
            </Animated.Text>
          ) : null}

          <Animated.View style={[styles.ctaSection, getEntranceStyle(5, 42)]}>
            <Pressable
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [styles.ctaShell, pressed ? styles.cardPressed : undefined]}
            >
              <LinearGradient
                colors={theme.primaryGradient}
                end={{ x: 1, y: 0.2 }}
                start={{ x: 0, y: 1 }}
                style={styles.ctaGradient}
              >
                <Feather color={theme.colors.white} name="plus-circle" size={18} />
                <Text style={[styles.ctaLabel, { color: theme.colors.white }]}>
                  {isEditing ? copy.createEvent.saveChanges : copy.createEvent.submit}
                </Text>
              </LinearGradient>
            </Pressable>
            <Text style={[styles.safetyNote, { color: theme.colors.textSoft }]}>
              {copy.createEvent.safetyNote}
            </Text>
          </Animated.View>
        </ScrollView>

        <Animated.View style={getEntranceStyle(5, 48)}>
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

function FieldLabel({ label }: { label: string }) {
  const { theme } = useAppTheme();

  return <Text style={[styles.fieldLabel, { color: theme.colors.textSoft }]}>{label}</Text>;
}

function InlineInput({
  iconName,
  onChangeText,
  placeholder,
  value,
}: {
  iconName: React.ComponentProps<typeof Feather>['name'];
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.inlineInputShell, { backgroundColor: theme.colors.inputBackground }]}>
      <TextInput
        keyboardType="number-pad"
        maxLength={iconName === 'calendar' ? 10 : 5}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inputPlaceholder}
        selectionColor={theme.colors.primary}
        style={[styles.inlineInput, { color: theme.colors.text }]}
        value={value}
      />
      <Feather color={theme.colors.textSoft} name={iconName} size={16} />
    </View>
  );
}

function VisibilityPill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.visibilityPill,
        {
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.inputBackground,
          borderColor: active ? theme.colors.primary : 'transparent',
        },
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      <Text
        style={[
          styles.visibilityPillLabel,
          { color: active ? theme.colors.primaryDeep : theme.colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepperButton({
  disabled = false,
  iconName,
  onPress,
}: {
  disabled?: boolean;
  iconName: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        disabled ? styles.stepperButtonDisabled : undefined,
        pressed && !disabled ? styles.cardPressed : undefined,
      ]}
    >
      <Feather
        color={disabled ? theme.colors.textSoft : theme.colors.primaryDeep}
        name={iconName}
        size={16}
      />
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
  heroCard: {
    minHeight: 184,
    borderRadius: 34,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: colors.primaryDeep,
    ...shadows.card,
  },
  heroImage: {
    borderRadius: 34,
  },
  heroCopyBlock: {
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -1.1,
    color: colors.white,
  },
  heroCopy: {
    maxWidth: 260,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255, 245, 245, 0.92)',
  },
  sheetCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  textInput: {
    minHeight: 56,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.92)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  cardGroup: {
    gap: spacing.sm,
  },
  selectorShell: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  skillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  skillPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 244, 244, 0.88)',
  },
  skillPillActive: {
    backgroundColor: colors.primary,
  },
  skillLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.textSoft,
  },
  skillLabelActive: {
    color: colors.white,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  visibilityPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 244, 244, 0.88)',
  },
  visibilityPillActive: {
    backgroundColor: 'rgba(255, 94, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(175, 35, 43, 0.18)',
  },
  visibilityPillLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.textSoft,
  },
  visibilityPillLabelActive: {
    color: colors.primaryDeep,
  },
  visibilityCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  privateHint: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: colors.primaryDeep,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineInputShell: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  locationShell: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  mapCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  mapHint: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  mapPin: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  mapLabel: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  mapLabelText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.text,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  participantsCopy: {
    flex: 1,
    gap: 4,
  },
  participantsTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    color: colors.text,
  },
  participantsDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 244, 244, 0.92)',
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.38,
  },
  stepperValue: {
    minWidth: 32,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  errorCopy: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    lineHeight: 19,
    color: colors.danger,
  },
  ctaSection: {
    gap: spacing.sm,
  },
  ctaShell: {
    borderRadius: radii.pill,
  },
  ctaGradient: {
    minHeight: 58,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  ctaLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    letterSpacing: 0.4,
    color: colors.white,
  },
  safetyNote: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textSoft,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
