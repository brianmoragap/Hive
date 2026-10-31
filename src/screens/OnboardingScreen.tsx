import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { hiveColors, hiveFonts } from '../theme/hiveBrand';
import { radii, spacing } from '../theme/tokens';
import {
  birthDateInputToIso,
  detectPhoneCountry,
  formatBirthDateInput,
  getPhoneCountryByIso,
  getPhonePlaceholder,
  isoBirthDateToInput,
  normalizePhoneNumber,
  parsePhoneEntry,
  phoneCountries,
  splitPhoneNumber,
  type PhoneCountry,
} from '../utils/onboarding';

type SelfieSource = 'camera' | 'library';
type FieldKey = 'phone' | 'birthDate' | 'code';
const defaultPhoneCountry = getPhoneCountryByIso('CL')!;

const heroImage = require('../../assets/images/auth-hero.jpg');
const logoImage = require('../../assets/images/hive-logo-white.png');
const logoAspectRatio = 880 / 268;
const logoWidth = 120;
const logoHeight = Math.round(logoWidth / logoAspectRatio);

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
  const { copy, language } = useLocale();
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
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

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

  const filteredCountries = useMemo(() => {
    const normalizedQuery = countrySearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return phoneCountries;
    }

    return phoneCountries.filter((country) => {
      const localizedName = country.name[language].toLowerCase();
      return (
        localizedName.includes(normalizedQuery) ||
        country.isoCode.toLowerCase().includes(normalizedQuery) ||
        country.dialCode.includes(normalizedQuery)
      );
    });
  }, [language, countrySearch]);

  const closeCountryPicker = () => {
    setCountryPickerOpen(false);
    setCountrySearch('');
  };

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

  const busy = submittingCode || verifyingCode;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <ImageBackground resizeMode="cover" source={heroImage} style={styles.heroImage}>
              <LinearGradient
                colors={['rgba(13,13,13,0.3)', 'rgba(13,13,13,0.5)', hiveColors.offwhite]}
                locations={[0, 0.55, 1]}
                style={styles.heroGradient}
              />
              <View style={styles.heroTopRow}>
                <Image resizeMode="contain" source={logoImage} style={styles.heroLogo} />
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
                      color={hiveColors.negro}
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
                    color={hiveColors.fucsia}
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

            <View style={styles.profilePanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{copy.onboarding.detailsTitle}</Text>
                <Text style={styles.panelCopy}>{copy.onboarding.detailsCopy}</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{copy.onboarding.phoneLabel}</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryColumn}>
                      <Text style={styles.inlineLabel}>{copy.onboarding.phoneCountryLabel}</Text>
                      <Pressable
                        onPress={() => setCountryPickerOpen(true)}
                        style={[styles.countryButton, phoneFieldError ? styles.inputShellError : undefined]}
                      >
                        <View>
                          <Text style={styles.countryDialCode}>{selectedCountry.dialCode}</Text>
                          <Text numberOfLines={1} style={styles.countryName}>
                            {selectedCountry.name[language]}
                          </Text>
                        </View>
                        <Feather color={hiveColors.grisMedio} name="chevron-down" size={16} />
                      </Pressable>
                    </View>

                    <View style={styles.numberColumn}>
                      <Text style={styles.inlineLabel}>{copy.onboarding.phoneLocalLabel}</Text>
                      <View
                        style={[
                          styles.inputShell,
                          focusedField === 'phone' ? styles.inputShellFocused : undefined,
                          phoneFieldError ? styles.inputShellError : undefined,
                        ]}
                      >
                        <TextInput
                          keyboardType="phone-pad"
                          maxLength={22}
                          onBlur={() => setFocusedField(null)}
                          onChangeText={(value) => {
                            setError(null);
                            const nextPhoneEntry = parsePhoneEntry(value, selectedCountry);
                            setSelectedCountry(nextPhoneEntry.country);
                            setPhoneNumber(nextPhoneEntry.localNumber);
                          }}
                          onFocus={() => setFocusedField('phone')}
                          placeholder={getPhonePlaceholder(selectedCountry)}
                          placeholderTextColor={hiveColors.grisMedio}
                          selectionColor={hiveColors.fucsia}
                          style={styles.input}
                          value={phoneNumber}
                        />
                      </View>
                    </View>
                  </View>
                  {phoneFieldError ? (
                    <Text style={styles.errorText}>{phoneFieldError}</Text>
                  ) : (
                    <Text style={styles.helperText}>{copy.onboarding.phoneHelper}</Text>
                  )}
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{copy.onboarding.birthDateLabel}</Text>
                  <View
                    style={[
                      styles.inputShell,
                      focusedField === 'birthDate' ? styles.inputShellFocused : undefined,
                      birthDateFieldError ? styles.inputShellError : undefined,
                    ]}
                  >
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={10}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={(value) => {
                        setError(null);
                        setBirthDate(formatBirthDateInput(value));
                      }}
                      onFocus={() => setFocusedField('birthDate')}
                      placeholder={copy.onboarding.birthDatePlaceholder}
                      placeholderTextColor={hiveColors.grisMedio}
                      selectionColor={hiveColors.fucsia}
                      style={styles.input}
                      value={birthDate}
                    />
                  </View>
                  {birthDateFieldError ? (
                    <Text style={styles.errorText}>{birthDateFieldError}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.selfieBlock}>
                <Pressable
                  onPress={selectSelfie}
                  style={({ pressed }) => [styles.uploadCard, pressed ? styles.pressed : undefined]}
                >
                  <View style={styles.uploadCopyColumn}>
                    <View style={styles.uploadIconBadge}>
                      <Feather
                        color={hiveColors.negro}
                        name={selfieUri ? 'check' : 'camera'}
                        size={16}
                      />
                    </View>
                    <View style={styles.uploadTextColumn}>
                      <Text style={styles.uploadTitle}>{copy.onboarding.selfieTitle}</Text>
                      <Text style={styles.uploadDescription}>
                        {copy.onboarding.selfieDescription}
                      </Text>
                      <Text style={styles.uploadMeta}>
                        {selfieUri ? copy.common.uploadReady : copy.common.uploadDocument}
                      </Text>
                    </View>
                  </View>

                  {selfieUri ? (
                    <Image source={{ uri: selfieUri }} style={styles.uploadPreview} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Feather color={hiveColors.grisMedio} name="upload-cloud" size={18} />
                    </View>
                  )}
                </Pressable>
              </View>

              {codeSent ? (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeTitle}>{copy.onboarding.smsCodeTitle}</Text>
                  <Text style={styles.codeCopy}>
                    {copy.onboarding.smsCodeCopy}
                    {maskedDestination ? `\n${maskedDestination}` : ''}
                  </Text>
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>{copy.onboarding.smsCodeLabel}</Text>
                    <View
                      style={[
                        styles.inputShell,
                        focusedField === 'code' ? styles.inputShellFocused : undefined,
                        smsCodeFieldError ? styles.inputShellError : undefined,
                      ]}
                    >
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={6}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={(value) => {
                          setError(null);
                          setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
                        }}
                        onFocus={() => setFocusedField('code')}
                        placeholder={copy.onboarding.smsCodePlaceholder}
                        placeholderTextColor={hiveColors.grisMedio}
                        selectionColor={hiveColors.fucsia}
                        style={styles.input}
                        value={verificationCode}
                      />
                    </View>
                    {smsCodeFieldError ? (
                      <Text style={styles.errorText}>{smsCodeFieldError}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {error && !phoneFieldError && !birthDateFieldError && !smsCodeFieldError ? (
                <Text style={styles.genericErrorCopy}>{error}</Text>
              ) : null}

              <View style={styles.identityNextCard}>
                <View style={styles.identityNextIcon}>
                  <MaterialCommunityIcons
                    color={hiveColors.negro}
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
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              disabled={busy}
              onPress={codeSent ? handleCompleteOnboarding : handleRequestCode}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !busy ? styles.primaryButtonPressed : undefined,
                busy ? styles.buttonDisabled : undefined,
              ]}
            >
              <Text style={styles.primaryButtonLabel}>
                {busy
                  ? copy.common.processing
                  : codeSent
                    ? copy.onboarding.verifyCodeCta
                    : copy.onboarding.primaryCta}
              </Text>
            </Pressable>

            {codeSent ? (
              <Pressable
                disabled={busy}
                onPress={handleRequestCode}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && !busy ? styles.secondaryButtonPressed : undefined,
                  busy ? styles.buttonDisabled : undefined,
                ]}
              >
                <Text style={styles.secondaryButtonLabel}>{copy.onboarding.resendCodeCta}</Text>
              </Pressable>
            ) : null}

            <Text style={styles.trustedCopy}>{copy.onboarding.footerNote}</Text>

            <Pressable onPress={() => void signOut()} style={styles.ghostButton}>
              <Text style={styles.ghostButtonLabel}>{copy.common.closeSession}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal animationType="fade" onRequestClose={closeCountryPicker} transparent visible={countryPickerOpen}>
        <View style={styles.modalRoot}>
          <Pressable onPress={closeCountryPicker} style={styles.modalBackdrop} />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{copy.onboarding.countryPickerTitle}</Text>
              <Pressable onPress={closeCountryPicker} style={styles.closeButton}>
                <Feather color={hiveColors.negro} name="x" size={18} />
              </Pressable>
            </View>

            <View style={styles.searchShell}>
              <Feather color={hiveColors.grisMedio} name="search" size={16} />
              <TextInput
                onChangeText={setCountrySearch}
                placeholder={copy.onboarding.countrySearchPlaceholder}
                placeholderTextColor={hiveColors.grisMedio}
                selectionColor={hiveColors.fucsia}
                style={styles.searchInput}
                value={countrySearch}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.isoCode}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active =
                  item.isoCode === selectedCountry.isoCode && item.dialCode === selectedCountry.dialCode;

                return (
                  <Pressable
                    onPress={() => {
                      setSelectedCountry(item);
                      setPhoneNumber(parsePhoneEntry(phoneNumber, item).localNumber);
                      closeCountryPicker();
                    }}
                    style={[styles.countryRow, active ? styles.countryRowActive : undefined]}
                  >
                    <View style={styles.countryRowCopy}>
                      <Text style={styles.countryRowTitle}>{item.name[language]}</Text>
                      <Text style={styles.countryRowMeta}>
                        {item.isoCode} · {item.dialCode}
                      </Text>
                    </View>
                    {active ? <Feather color={hiveColors.negro} name="check" size={16} /> : null}
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
            />

            <Pressable onPress={closeCountryPicker} style={styles.dismissButton}>
              <Text style={styles.dismissButtonLabel}>{copy.common.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: hiveColors.offwhite,
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
    height: 320,
    justifyContent: 'flex-start',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroLogo: {
    width: logoWidth,
    height: logoHeight,
  },
  contentBlock: {
    marginTop: -40,
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    maxWidth: 320,
    fontFamily: hiveFonts.heavy,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.6,
    color: hiveColors.negro,
  },
  copy: {
    maxWidth: 320,
    fontFamily: hiveFonts.normal,
    fontSize: 15,
    lineHeight: 23,
    color: hiveColors.grisMedio,
  },
  compactGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  miniCard: {
    flex: 1,
    minHeight: 168,
    justifyContent: 'space-between',
    borderRadius: 28,
    backgroundColor: hiveColors.limaTints[100],
    padding: spacing.lg,
  },
  miniIconBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: hiveColors.lima,
  },
  miniLabel: {
    marginTop: spacing.md,
    fontFamily: hiveFonts.bold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: hiveColors.textLimaDark,
  },
  miniTitle: {
    marginTop: spacing.xs,
    fontFamily: hiveFonts.bold,
    fontSize: 16,
    lineHeight: 21,
    color: hiveColors.negro,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: 28,
    backgroundColor: hiveColors.fucsia,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  sosBadge: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  sosBadgeText: {
    fontFamily: hiveFonts.heavy,
    fontSize: 18,
    letterSpacing: 1.2,
    color: hiveColors.blanco,
  },
  sosCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sosTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 17,
    color: hiveColors.blanco,
  },
  sosDescription: {
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.88)',
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
    fontFamily: hiveFonts.bold,
    fontSize: 16,
    color: hiveColors.negro,
  },
  detailDescription: {
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 19,
    color: hiveColors.grisMedio,
  },
  profilePanel: {
    marginTop: spacing.sm,
    borderRadius: 32,
    backgroundColor: hiveColors.blanco,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: hiveColors.negro,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  panelHeader: {
    gap: spacing.xs,
  },
  panelTitle: {
    fontFamily: hiveFonts.heavy,
    fontSize: 21,
    color: hiveColors.negro,
  },
  panelCopy: {
    fontFamily: hiveFonts.normal,
    fontSize: 14,
    lineHeight: 21,
    color: hiveColors.grisMedio,
  },
  form: {
    gap: spacing.md,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    paddingHorizontal: spacing.sm,
    fontFamily: hiveFonts.demiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: hiveColors.grisMedio,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  countryColumn: {
    width: 118,
    gap: 6,
  },
  numberColumn: {
    flex: 1,
    gap: 6,
  },
  inlineLabel: {
    paddingHorizontal: spacing.sm,
    fontFamily: hiveFonts.demiBold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: hiveColors.grisMedio,
  },
  countryButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: hiveColors.offwhite,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryDialCode: {
    fontFamily: hiveFonts.bold,
    fontSize: 15,
    color: hiveColors.negro,
  },
  countryName: {
    marginTop: 1,
    fontFamily: hiveFonts.normal,
    fontSize: 11,
    color: hiveColors.grisMedio,
  },
  inputShell: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: hiveColors.offwhite,
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  inputShellFocused: {
    borderColor: hiveColors.negro,
    backgroundColor: hiveColors.blanco,
  },
  inputShellError: {
    borderColor: hiveColors.fucsia,
  },
  input: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 15,
    color: hiveColors.negro,
  },
  helperText: {
    paddingHorizontal: spacing.sm,
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    lineHeight: 18,
    color: hiveColors.grisMedio,
  },
  errorText: {
    paddingHorizontal: spacing.sm,
    fontFamily: hiveFonts.medium,
    fontSize: 12,
    color: hiveColors.fucsia,
  },
  selfieBlock: {
    marginTop: spacing.xs,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: hiveColors.offwhite,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  uploadCopyColumn: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  uploadIconBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: hiveColors.lima,
  },
  uploadTextColumn: {
    flex: 1,
    gap: 2,
  },
  uploadTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.negro,
  },
  uploadDescription: {
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    lineHeight: 18,
    color: hiveColors.grisMedio,
  },
  uploadMeta: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: hiveColors.textLimaDark,
  },
  uploadPreview: {
    width: 68,
    height: 68,
    borderRadius: 20,
  },
  uploadPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.grisClaro,
  },
  codeBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: hiveColors.offwhite,
    padding: spacing.lg,
  },
  codeTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 15,
    color: hiveColors.negro,
  },
  codeCopy: {
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 19,
    color: hiveColors.grisMedio,
  },
  genericErrorCopy: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    lineHeight: 19,
    color: hiveColors.fucsia,
  },
  identityNextCard: {
    marginTop: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: hiveColors.offwhite,
    padding: spacing.lg,
  },
  identityNextIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.lima,
    marginBottom: spacing.sm,
  },
  identityNextTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 16,
    color: hiveColors.negro,
  },
  identityNextCopy: {
    marginTop: spacing.xs,
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 19,
    color: hiveColors.grisMedio,
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
    backgroundColor: hiveColors.fucsia,
  },
  identityChecklistLabel: {
    flex: 1,
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    color: hiveColors.negro,
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.fucsia,
    shadowColor: hiveColors.fucsia,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: hiveColors.blanco,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.blanco,
    borderWidth: 1.5,
    borderColor: hiveColors.negro,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.negro,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  trustedCopy: {
    textAlign: 'center',
    fontFamily: hiveFonts.demiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: hiveColors.grisMedio,
  },
  ghostButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    color: hiveColors.fucsia,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.4)',
  },
  modalSheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: hiveColors.blanco,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: hiveFonts.heavy,
    fontSize: 18,
    color: hiveColors.negro,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.offwhite,
  },
  searchShell: {
    minHeight: 50,
    borderRadius: radii.pill,
    backgroundColor: hiveColors.offwhite,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: hiveFonts.normal,
    fontSize: 14,
    color: hiveColors.negro,
  },
  countryRow: {
    minHeight: 60,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countryRowActive: {
    backgroundColor: hiveColors.limaTints[100],
  },
  countryRowCopy: {
    flex: 1,
    gap: 2,
  },
  countryRowTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.negro,
  },
  countryRowMeta: {
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    color: hiveColors.grisMedio,
  },
  dismissButton: {
    minHeight: 50,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.offwhite,
    marginTop: spacing.md,
  },
  dismissButtonLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.negro,
  },
});
