import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocumentUploadCard } from '../components/DocumentUploadCard';
import { GlassPanel } from '../components/GlassPanel';
import { PhoneField } from '../components/PhoneField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, onboardingHeroImage, radii, spacing } from '../theme/tokens';
import {
  birthDateInputToIso,
  detectPhoneCountry,
  formatBirthDateInput,
  getPhoneCountryByIso,
  isoBirthDateToInput,
  normalizePhoneNumber,
  parsePhoneEntry,
  splitPhoneNumber,
  type PhoneCountry,
} from '../utils/onboarding';

type SelfieSource = 'camera' | 'library';
const defaultPhoneCountry = getPhoneCountryByIso('CL')!;

function getPhoneFieldState(phoneNumber: string) {
  const fallbackCountry = detectPhoneCountry(phoneNumber) ?? defaultPhoneCountry;
  return splitPhoneNumber(phoneNumber, fallbackCountry);
}

function maskEmail(email: string) {
  const [localPart, domain = ''] = email.trim().split('@');

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}*@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

export function OnboardingScreen() {
  const { copy } = useLocale();
  const { completeOnboarding, profile, requestPhoneVerification, signOut, user } = useSession();
  const initialPhoneField = getPhoneFieldState(profile?.phoneNumber ?? '');

  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(initialPhoneField.country);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneField.localNumber);
  const [birthDate, setBirthDate] = useState(isoBirthDateToInput(profile?.birthDate ?? ''));
  const [selfieUri, setSelfieUri] = useState<string | null>(profile?.avatarUrl ?? null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [maskedDestination, setMaskedDestination] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneFieldError =
    error === copy.onboarding.phoneRequired || error === copy.onboarding.invalidPhone
      ? error
      : null;
  const birthDateFieldError =
    error === copy.onboarding.birthDateRequired || error === copy.onboarding.invalidBirthDate
      ? error
      : null;
  const smsCodeFieldError =
    error === copy.onboarding.codeRequired || error === copy.onboarding.invalidCode
      ? error
      : null;

  useEffect(() => {
    const phoneField = getPhoneFieldState(profile?.phoneNumber ?? '');
    setSelectedCountry(phoneField.country);
    setPhoneNumber(phoneField.localNumber);
    setBirthDate(isoBirthDateToInput(profile?.birthDate ?? ''));
    setSelfieUri(profile?.avatarUrl ?? null);
  }, [profile]);

  const identityChecklist = [
    copy.common.fullName,
    copy.verification.rutLabel,
    copy.verification.uploadFrontTitle,
    copy.verification.serialTitle,
  ];

  const launchSelfiePicker = async (source: SelfieSource) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(copy.verification.permissionTitle, copy.verification.permissionBody);
      return;
    }

    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            cameraType: ImagePicker.CameraType.front,
            mediaTypes: ['images'],
            presentationStyle:
              Platform.OS === 'ios'
                ? ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
                : undefined,
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            mediaTypes: ['images'],
            preferredAssetRepresentationMode:
              Platform.OS === 'ios'
                ? ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current
                : undefined,
            presentationStyle:
              Platform.OS === 'ios'
                ? ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
                : undefined,
            quality: 0.9,
          });

    if (pickerResult.canceled) {
      return;
    }

    setError(null);
    setSelfieUri(pickerResult.assets[0]?.uri ?? null);
  };

  const selectSelfie = () => {
    Alert.alert(copy.onboarding.selfiePickerTitle, copy.onboarding.selfiePickerBody, [
      {
        text: copy.onboarding.selfieCameraOption,
        onPress: () => void launchSelfiePicker('camera'),
      },
      {
        text: copy.onboarding.selfieLibraryOption,
        onPress: () => void launchSelfiePicker('library'),
      },
      {
        style: 'cancel',
        text: copy.common.cancel,
      },
    ]);
  };

  const getValidatedDraft = () => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber, selectedCountry);

    if (!phoneNumber.trim()) {
      return { error: copy.onboarding.phoneRequired };
    }

    if (!normalizedPhone) {
      return { error: copy.onboarding.invalidPhone };
    }

    if (!birthDate.trim()) {
      return { error: copy.onboarding.birthDateRequired };
    }

    const birthDateIso = birthDateInputToIso(birthDate);

    if (!birthDateIso) {
      return { error: copy.onboarding.invalidBirthDate };
    }

    if (!selfieUri) {
      return { error: copy.onboarding.selfieRequired };
    }

    return {
      birthDate: birthDateIso,
      phoneNumber: normalizedPhone,
      selfieUri,
    };
  };

  const handleRequestCode = async () => {
    const draft = getValidatedDraft();

    if ('error' in draft) {
      setError(draft.error ?? copy.onboarding.continueErrorBody);
      return;
    }

    try {
      setSubmittingCode(true);
      setError(null);

      const { debugCode } = await requestPhoneVerification(draft);

      setCodeSent(true);
      setMaskedDestination(maskEmail(user?.email ?? profile?.email ?? ''));

      const message = debugCode
        ? `${copy.onboarding.sendCodeSuccessBody}\n\n${debugCode}\n${copy.onboarding.debugCodeSuffix}`
        : copy.onboarding.sendCodeSuccessBody;

      Alert.alert(copy.onboarding.sendCodeSuccessTitle, message);
    } catch (requestError) {
      setError(getErrorMessage(requestError, copy.onboarding.continueErrorBody));
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    const draft = getValidatedDraft();

    if ('error' in draft) {
      setError(draft.error ?? copy.onboarding.continueErrorBody);
      return;
    }

    if (!verificationCode.trim()) {
      setError(copy.onboarding.codeRequired);
      return;
    }

    try {
      setVerifyingCode(true);
      setError(null);

      await completeOnboarding({
        ...draft,
        verificationCode: verificationCode.trim(),
      });
    } catch (completionError) {
      setError(getErrorMessage(completionError, copy.onboarding.continueErrorBody));
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <ImageBackground source={{ uri: onboardingHeroImage }} style={styles.heroImage}>
              <LinearGradient
                colors={['rgba(10, 10, 18, 0.24)', 'rgba(255, 244, 244, 0.96)']}
                locations={[0.22, 0.94]}
                style={styles.heroGradient}
              />

              <View style={styles.heroTopRow}>
                <Text style={styles.heroBrand}>HIVE</Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.contentBlock}>
            <Text style={styles.title}>{copy.onboarding.title}</Text>
            <Text style={styles.copy}>{copy.onboarding.copy}</Text>

            <View style={styles.compactGrid}>
              {copy.onboarding.compactFeatures.map((feature) => (
                <View key={feature.title} style={styles.miniCard}>
                  <View style={styles.miniIconBadge}>
                    <MaterialCommunityIcons
                      color={colors.primaryDeep}
                      name={feature.iconName}
                      size={18}
                    />
                  </View>
                  <Text style={styles.miniLabel}>{feature.label}</Text>
                  <Text style={styles.miniTitle}>{feature.title}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sosCard}>
              <View style={styles.sosBadge}>
                <Text style={styles.sosBadgeText}>SOS</Text>
              </View>
              <View style={styles.sosCopy}>
                <Text style={styles.sosTitle}>{copy.onboarding.sosTitle}</Text>
                <Text style={styles.sosDescription}>{copy.onboarding.sosDescription}</Text>
              </View>
            </View>

            <View style={styles.detailList}>
              {copy.onboarding.detailFeatures.map((feature) => (
                <View key={feature.title} style={styles.detailRow}>
                  <MaterialCommunityIcons
                    color={colors.textSoft}
                    name={feature.iconName}
                    size={20}
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailCopy}>
                    <Text style={styles.detailTitle}>{feature.title}</Text>
                    <Text style={styles.detailDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <GlassPanel style={styles.profilePanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{copy.onboarding.detailsTitle}</Text>
                <Text style={styles.panelCopy}>{copy.onboarding.detailsCopy}</Text>
              </View>

              <View style={styles.form}>
                <PhoneField
                  countryLabel={copy.onboarding.phoneCountryLabel}
                  error={phoneFieldError}
                  helperText={copy.onboarding.phoneHelper}
                  label={copy.onboarding.phoneLabel}
                  localLabel={copy.onboarding.phoneLocalLabel}
                  onChangeText={(value) => {
                    setError(null);
                    const nextPhoneEntry = parsePhoneEntry(value, selectedCountry);
                    setSelectedCountry(nextPhoneEntry.country);
                    setPhoneNumber(nextPhoneEntry.localNumber);
                  }}
                  onSelectCountry={(country) => {
                    setError(null);
                    setSelectedCountry(country);
                    setPhoneNumber(parsePhoneEntry(phoneNumber, country).localNumber);
                  }}
                  searchPlaceholder={copy.onboarding.countrySearchPlaceholder}
                  selectedCountry={selectedCountry}
                  selectorTitle={copy.onboarding.countryPickerTitle}
                  value={phoneNumber}
                />
                <TextField
                  error={birthDateFieldError}
                  keyboardType="number-pad"
                  label={copy.onboarding.birthDateLabel}
                  maxLength={10}
                  onChangeText={(value) => {
                    setError(null);
                    setBirthDate(formatBirthDateInput(value));
                  }}
                  placeholder={copy.onboarding.birthDatePlaceholder}
                  value={birthDate}
                />
              </View>

              <View style={styles.selfieBlock}>
                <DocumentUploadCard
                  description={copy.onboarding.selfieDescription}
                  imageUri={selfieUri}
                  onPress={selectSelfie}
                  title={copy.onboarding.selfieTitle}
                />
              </View>

              {codeSent ? (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeTitle}>{copy.onboarding.smsCodeTitle}</Text>
                  <Text style={styles.codeCopy}>
                    {copy.onboarding.smsCodeCopy}
                    {maskedDestination ? `\n${maskedDestination}` : ''}
                  </Text>
                  <TextField
                    error={smsCodeFieldError}
                    keyboardType="number-pad"
                    label={copy.onboarding.smsCodeLabel}
                    maxLength={6}
                    onChangeText={(value) => {
                      setError(null);
                      setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
                    }}
                    placeholder={copy.onboarding.smsCodePlaceholder}
                    value={verificationCode}
                  />
                </View>
              ) : null}

              {error ? <Text style={styles.errorCopy}>{error}</Text> : null}

              <View style={styles.identityNextCard}>
                <View style={styles.identityNextIcon}>
                  <MaterialCommunityIcons
                    color={colors.primaryDeep}
                    name="card-account-details-outline"
                    size={18}
                  />
                </View>
                <Text style={styles.identityNextTitle}>{copy.onboarding.identityNextTitle}</Text>
                <Text style={styles.identityNextCopy}>{copy.onboarding.identityNextCopy}</Text>
                <View style={styles.identityChecklist}>
                  {identityChecklist.map((item) => (
                    <View key={item} style={styles.identityChecklistItem}>
                      <View style={styles.identityChecklistDot} />
                      <Text style={styles.identityChecklistLabel}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassPanel>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              disabled={submittingCode || verifyingCode}
              label={
                submittingCode || verifyingCode
                  ? copy.common.processing
                  : codeSent
                    ? copy.onboarding.verifyCodeCta
                    : copy.onboarding.primaryCta
              }
              onPress={codeSent ? handleCompleteOnboarding : handleRequestCode}
            />

            {codeSent ? (
              <PrimaryButton
                disabled={submittingCode || verifyingCode}
                label={copy.onboarding.resendCodeCta}
                onPress={handleRequestCode}
                variant="secondary"
              />
            ) : null}

            <Text style={styles.trustedCopy}>{copy.onboarding.footerNote}</Text>
            <PrimaryButton
              label={copy.common.closeSession}
              onPress={() => void signOut()}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  heroWrap: {
    overflow: 'hidden',
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
  },
  heroImage: {
    height: 398,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBrand: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 44,
    letterSpacing: -2,
    color: colors.primaryDeep,
    transform: [{ skewX: '-8deg' }],
  },
  contentBlock: {
    marginTop: -54,
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    maxWidth: 320,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -1.4,
    color: colors.text,
  },
  copy: {
    maxWidth: 320,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 24,
    color: '#59627D',
  },
  compactGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  miniCard: {
    flex: 1,
    minHeight: 176,
    justifyContent: 'space-between',
    borderRadius: 34,
    backgroundColor: 'rgba(255, 233, 236, 0.74)',
    padding: spacing.lg,
  },
  miniIconBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 94, 94, 0.14)',
  },
  miniLabel: {
    marginTop: spacing.md,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.primaryDeep,
  },
  miniTitle: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    lineHeight: 21,
    color: colors.text,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: 34,
    backgroundColor: '#FFD0D8',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  sosBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  sosBadgeText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    letterSpacing: 1.8,
    color: colors.primary,
  },
  sosCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sosTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  sosDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  detailList: {
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailIcon: {
    marginTop: 3,
  },
  detailCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  detailTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  detailDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: '#59627D',
  },
  profilePanel: {
    marginTop: spacing.sm,
  },
  panelHeader: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  panelTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: colors.text,
  },
  panelCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.md,
  },
  selfieBlock: {
    marginTop: spacing.lg,
  },
  codeBlock: {
    gap: spacing.md,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.62)',
    padding: spacing.lg,
  },
  codeTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  codeCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  errorCopy: {
    marginTop: spacing.lg,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    lineHeight: 20,
    color: colors.danger,
  },
  identityNextCard: {
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 244, 244, 0.76)',
    padding: spacing.lg,
  },
  identityNextIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 94, 94, 0.14)',
    marginBottom: spacing.sm,
  },
  identityNextTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  identityNextCopy: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  identityChecklist: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  identityChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityChecklistDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  identityChecklistLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  trustedCopy: {
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
});
