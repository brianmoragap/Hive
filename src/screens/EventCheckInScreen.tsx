import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import { formatManualPassCode } from '../utils/eventPasses';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type EventCheckInRoute = RouteProp<RootStackParamList, 'EventCheckIn'>;

type BannerTone = 'danger' | 'neutral' | 'success';

interface StatusBannerContent {
  body: string;
  title: string;
  tone: BannerTone;
}

export function EventCheckInScreen() {
  const { copy } = useLocale();
  const { getEventById, hiveMembers, scanAttendanceCode } = useEvents();
  const { user } = useSession();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<EventCheckInRoute>();
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [manualEntry, setManualEntry] = useState('');
  const [scanLocked, setScanLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<StatusBannerContent | null>(null);
  const event = getEventById(route.params.eventId);

  const attendeeRows = useMemo(() => {
    if (!event) {
      return [];
    }

    return event.attendeeIds
      .map((attendeeId) => {
        const pass =
          event.attendancePasses.find((item) => item.userId === attendeeId && !item.revokedAt) ??
          null;
        const member = hiveMembers.find((item) => item.id === attendeeId) ?? null;

        if (!member || !pass) {
          return null;
        }

        return {
          member,
          pass,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [event, hiveMembers]);

  if (!event) {
    return null;
  }

  const isHost = user?.id === event.creatorId;
  const checkedInCount = attendeeRows.filter((row) => row.pass.checkedInAt).length;
  const pendingCount = Math.max(attendeeRows.length - checkedInCount, 0);

  const resolveBanner = (
    status:
      | 'already_checked_in'
      | 'cancelled'
      | 'checked_in'
      | 'event_mismatch'
      | 'invalid'
      | 'not_found'
      | 'not_host',
    attendeeName?: string,
  ): StatusBannerContent => {
    if (status === 'checked_in') {
      return {
        body: attendeeName
          ? `${attendeeName} ${copy.eventDetail.scanResultCheckedInBody}`
          : copy.eventDetail.scanResultCheckedInBody,
        title: copy.eventDetail.scanResultCheckedInTitle,
        tone: 'success',
      };
    }

    if (status === 'already_checked_in') {
      return {
        body: attendeeName
          ? `${attendeeName} ${copy.eventDetail.scanResultAlreadyBody}`
          : copy.eventDetail.scanResultAlreadyBody,
        title: copy.eventDetail.scanResultAlreadyTitle,
        tone: 'neutral',
      };
    }

    if (status === 'event_mismatch') {
      return {
        body: copy.eventDetail.scanResultMismatchBody,
        title: copy.eventDetail.scanResultMismatchTitle,
        tone: 'danger',
      };
    }

    if (status === 'cancelled') {
      return {
        body: copy.eventDetail.scanResultCancelledBody,
        title: copy.eventDetail.scanResultCancelledTitle,
        tone: 'danger',
      };
    }

    if (status === 'not_host') {
      return {
        body: copy.eventDetail.scanResultHostBody,
        title: copy.eventDetail.scanResultHostTitle,
        tone: 'danger',
      };
    }

    if (status === 'not_found') {
      return {
        body: copy.eventDetail.scanResultMissingBody,
        title: copy.eventDetail.scanResultMissingTitle,
        tone: 'danger',
      };
    }

    return {
      body: copy.eventDetail.scanResultInvalidBody,
      title: copy.eventDetail.scanResultInvalidTitle,
      tone: 'danger',
    };
  };

  const handleCode = async (rawValue: string) => {
    const trimmedValue = rawValue.trim();

    if (!trimmedValue || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await scanAttendanceCode(event.id, trimmedValue);
      const attendeeName =
        result.attendeeId &&
        hiveMembers.find((member) => member.id === result.attendeeId)?.fullName;

      setStatusBanner(resolveBanner(result.status, attendeeName || undefined));
      setScanLocked(true);

      if (result.status === 'checked_in') {
        setManualEntry('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHost) {
    return (
      <ScreenFrame contentStyle={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={[styles.guardContainer, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={styles.guardTitle}>{copy.eventDetail.scanResultHostTitle}</Text>
          <Text style={styles.guardCopy}>{copy.eventDetail.scanResultHostBody}</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.guardButton,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={styles.guardButtonLabel}>{copy.eventDetail.backToEvents}</Text>
          </Pressable>
        </View>
      </ScreenFrame>
    );
  }

  if (event.status === 'completed') {
    return (
      <ScreenFrame contentStyle={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={[styles.guardContainer, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={styles.guardTitle}>{copy.myEvents.completedBadge}</Text>
          <Text style={styles.guardCopy}>{copy.myEvents.completeSuccessBody}</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.guardButton,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={styles.guardButtonLabel}>{copy.eventDetail.backToEvents}</Text>
          </Pressable>
        </View>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame contentStyle={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxxl + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : undefined]}
            >
              <Feather color={colors.primaryDeep} name="arrow-left" size={18} />
            </Pressable>

            <Text style={styles.wordmark}>HIVE</Text>

            <View style={styles.iconButtonGhost} />
          </View>

          <View style={styles.heroBlock}>
            <Text style={styles.heroTitle}>{copy.eventDetail.scanTitle}</Text>
            <Text style={styles.heroCopy}>{copy.eventDetail.scanCopy}</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricCard label={copy.eventDetail.checkedInLabel} value={String(checkedInCount)} />
            <MetricCard label={copy.eventDetail.pendingLabel} value={String(pendingCount)} />
          </View>

          {statusBanner ? (
            <StatusBanner
              body={statusBanner.body}
              onReset={() => {
                setScanLocked(false);
                setStatusBanner(null);
              }}
              resetLabel={copy.eventDetail.scanResetAction}
              title={statusBanner.title}
              tone={statusBanner.tone}
            />
          ) : null}

          <View style={styles.cameraCard}>
            <Text style={styles.sectionTitle}>{copy.eventDetail.hostAction}</Text>
            <Text style={styles.sectionCopy}>{copy.eventDetail.scanInstruction}</Text>

            {Platform.OS === 'web' ? (
              <FallbackCard label={copy.eventDetail.scannerFallback} />
            ) : !cameraPermission?.granted ? (
              <View style={styles.permissionCard}>
                <Text style={styles.permissionTitle}>{copy.eventDetail.scanPermissionTitle}</Text>
                <Text style={styles.permissionCopy}>{copy.eventDetail.scanPermissionCopy}</Text>
                <Pressable
                  onPress={() => {
                    void requestCameraPermission();
                  }}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed ? styles.pressed : undefined,
                  ]}
                >
                  <Feather color={colors.primaryDeep} name="camera" size={18} />
                  <Text style={styles.secondaryButtonLabel}>
                    {copy.eventDetail.scanPermissionAction}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.cameraShell}>
                <CameraView
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={
                    scanLocked || isSubmitting
                      ? undefined
                      : ({ data }) => {
                          void handleCode(data);
                        }
                  }
                  style={styles.cameraView}
                />
                <View pointerEvents="none" style={styles.cameraOverlay}>
                  <View style={styles.cameraFrame} />
                </View>
              </View>
            )}
          </View>

          <View style={styles.manualCard}>
            <Text style={styles.sectionTitle}>{copy.eventDetail.scanInputLabel}</Text>
            <Text style={styles.sectionCopy}>{copy.eventDetail.scanManualHint}</Text>

            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setManualEntry}
              placeholder={copy.eventDetail.scanInputPlaceholder}
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              value={manualEntry}
            />

            <Pressable
              onPress={() => {
                void handleCode(manualEntry);
              }}
              style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : undefined]}
            >
              <LinearGradient
                colors={[colors.primary, '#FF7A73', colors.primaryDeep]}
                end={{ x: 1, y: 0.2 }}
                start={{ x: 0, y: 1 }}
                style={styles.primaryGradient}
              >
                <Feather color={colors.white} name="check-circle" size={18} />
                <Text style={styles.primaryButtonLabel}>
                  {isSubmitting
                    ? copy.common.processing
                    : copy.eventDetail.scanValidateAction}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {__DEV__ && attendeeRows.length > 0 ? (
            <View style={styles.devCard}>
              <Text style={styles.sectionTitle}>{copy.eventDetail.devHelperTitle}</Text>
              <Text style={styles.sectionCopy}>{copy.eventDetail.devHelperCopy}</Text>

              <View style={styles.devChips}>
                {attendeeRows.map((row) => (
                  <Pressable
                    key={row.member.id}
                    onPress={() => {
                      setManualEntry(row.pass.manualCode);
                      void handleCode(row.pass.manualCode);
                    }}
                    style={({ pressed }) => [
                      styles.devChip,
                      pressed ? styles.pressed : undefined,
                    ]}
                  >
                    <Text style={styles.devChipLabel}>
                      {row.member.fullName.split(' ')[0]} · {formatManualPassCode(row.pass.manualCode)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.attendeesCard}>
            <Text style={styles.sectionTitle}>
              {copy.eventDetail.membersTitle} ({attendeeRows.length})
            </Text>

            <View style={styles.attendeesColumn}>
              {attendeeRows.map((row) => {
                const isCheckedIn = Boolean(row.pass.checkedInAt);

                return (
                  <View key={row.member.id} style={styles.attendeeRow}>
                    <View style={styles.attendeeAvatar}>
                      <Text style={styles.attendeeAvatarLabel}>
                        {row.member.fullName.slice(0, 1)}
                      </Text>
                    </View>

                    <View style={styles.attendeeCopy}>
                      <Text style={styles.attendeeName}>{row.member.fullName}</Text>
                      <Text style={styles.attendeeMeta}>
                        {isCheckedIn
                          ? copy.eventDetail.memberCheckedIn
                          : `${copy.eventDetail.memberPending} · ${formatManualPassCode(row.pass.manualCode)}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.attendeeStatusPill,
                        isCheckedIn
                          ? styles.attendeeStatusPillSuccess
                          : styles.attendeeStatusPillNeutral,
                      ]}
                    >
                      <MaterialCommunityIcons
                        color={isCheckedIn ? colors.success : colors.textSoft}
                        name={isCheckedIn ? 'check-circle' : 'clock-outline'}
                        size={16}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenFrame>
  );
}

function FallbackCard({ label }: { label: string }) {
  return (
    <View style={styles.fallbackCard}>
      <MaterialCommunityIcons color={colors.primaryDeep} name="qrcode-scan" size={30} />
      <Text style={styles.fallbackLabel}>{label}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusBanner({
  body,
  onReset,
  resetLabel,
  title,
  tone,
}: {
  body: string;
  onReset: () => void;
  resetLabel: string;
  title: string;
  tone: BannerTone;
}) {
  return (
    <View
      style={[
        styles.banner,
        tone === 'success'
          ? styles.bannerSuccess
          : tone === 'danger'
            ? styles.bannerDanger
            : styles.bannerNeutral,
      ]}
    >
      <View style={styles.bannerCopy}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerBody}>{body}</Text>
      </View>

      <Pressable onPress={onReset} style={({ pressed }) => [styles.bannerAction, pressed ? styles.pressed : undefined]}>
        <Text style={styles.bannerActionLabel}>{resetLabel}</Text>
      </Pressable>
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
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    ...shadows.card,
  },
  iconButtonGhost: {
    width: 42,
    height: 42,
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.primaryDeep,
    transform: [{ skewX: '-8deg' }],
  },
  heroBlock: {
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: colors.text,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  metricValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 34,
    lineHeight: 38,
    color: colors.primaryDeep,
  },
  metricLabel: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  banner: {
    borderRadius: 24,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerSuccess: {
    backgroundColor: 'rgba(188, 231, 222, 0.9)',
  },
  bannerDanger: {
    backgroundColor: 'rgba(255, 218, 218, 0.92)',
  },
  bannerNeutral: {
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
  },
  bannerCopy: {
    gap: 4,
  },
  bannerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    color: colors.text,
  },
  bannerBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  bannerAction: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  bannerActionLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.primaryDeep,
  },
  cameraCard: {
    borderRadius: 28,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 19,
    color: colors.text,
  },
  sectionCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  cameraShell: {
    height: 288,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#281A1E',
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 12, 14, 0.18)',
  },
  cameraFrame: {
    width: '72%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.86)',
  },
  permissionCard: {
    minHeight: 180,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 245, 245, 0.96)',
  },
  permissionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  permissionCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.card,
  },
  secondaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.primaryDeep,
  },
  fallbackCard: {
    minHeight: 180,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 245, 245, 0.96)',
  },
  fallbackLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.textMuted,
  },
  manualCard: {
    borderRadius: 28,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  input: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  primaryButton: {
    borderRadius: radii.pill,
  },
  primaryGradient: {
    minHeight: 54,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.button,
  },
  primaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 14,
    color: colors.white,
  },
  devCard: {
    borderRadius: 28,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  devChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  devChip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
  },
  devChipLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.primaryDeep,
  },
  attendeesCard: {
    borderRadius: 28,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...shadows.card,
  },
  attendeesColumn: {
    gap: spacing.sm,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attendeeAvatar: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 218, 0.62)',
  },
  attendeeAvatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.primaryDeep,
  },
  attendeeCopy: {
    flex: 1,
    gap: 2,
  },
  attendeeName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  attendeeMeta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  attendeeStatusPill: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeStatusPillSuccess: {
    backgroundColor: 'rgba(188, 231, 222, 0.92)',
  },
  attendeeStatusPillNeutral: {
    backgroundColor: 'rgba(255, 244, 244, 0.96)',
  },
  guardContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  guardTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.text,
  },
  guardCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textMuted,
  },
  guardButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDeep,
  },
  guardButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 14,
    color: colors.white,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
