import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
import { formatRut, isValidRut } from '../utils/rut';

type UploadTarget = 'front' | 'serial';
type FieldKey = 'fullName' | 'rut';

const logoImage = require('../../assets/images/hive-logo-black.png');
const logoAspectRatio = 880 / 268;
const logoWidth = 104;
const logoHeight = Math.round(logoWidth / logoAspectRatio);

export function VerificationScreen() {
  const { copy } = useLocale();
  const { isMockMode, profile, signOut, submitVerification } = useSession();

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [rut, setRut] = useState(profile?.rut ?? '');
  const [frontUri, setFrontUri] = useState<string | null>(profile?.idFrontUri ?? null);
  const [serialUri, setSerialUri] = useState<string | null>(profile?.idSerialUri ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFullName(profile.fullName ?? '');
    setRut(profile.rut ?? '');
    setFrontUri(profile.idFrontUri ?? null);
    setSerialUri(profile.idSerialUri ?? null);
  }, [profile]);

  const saveImageUri = (target: UploadTarget, uri: string) => {
    if (target === 'front') {
      setFrontUri(uri);
      return;
    }

    setSerialUri(uri);
  };

  const launchPicker = async (target: UploadTarget, source: 'camera' | 'library') => {
    const permissions =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissions.granted) {
      Alert.alert(copy.verification.permissionTitle, copy.verification.permissionBody);
      return;
    }

    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            mediaTypes: ['images'],
            presentationStyle:
              Platform.OS === 'ios'
                ? ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
                : undefined,
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: Platform.OS === 'ios',
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

    saveImageUri(target, pickerResult.assets[0]?.uri ?? '');
  };

  const selectDocument = (target: UploadTarget) => {
    Alert.alert(copy.verification.pickerTitle, copy.verification.pickerBody, [
      {
        text: copy.verification.cameraOption,
        onPress: () => void launchPicker(target, 'camera'),
      },
      {
        text: copy.verification.libraryOption,
        onPress: () => void launchPicker(target, 'library'),
      },
      {
        style: 'cancel',
        text: copy.common.cancel,
      },
    ]);
  };

  const rutError = rut.length > 0 && !isValidRut(rut) ? copy.verification.invalidRut : null;
  const submitDisabled = submitting || !fullName.trim() || !isValidRut(rut) || !frontUri || !serialUri;

  const handleSubmit = async () => {
    if (!frontUri || !serialUri) {
      setError(copy.verification.missingDocuments);
      return;
    }

    if (!fullName.trim()) {
      setError(copy.verification.missingFullName);
      return;
    }

    if (!isValidRut(rut)) {
      setError(copy.verification.invalidRut);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await submitVerification({
        fullName,
        rut,
        idFrontUri: frontUri,
        idSerialUri: serialUri,
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : copy.verification.reviewErrorFallback,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image resizeMode="contain" source={logoImage} style={styles.logo} />

          <View style={styles.hero}>
            <Text style={styles.kicker}>{copy.verification.kicker}</Text>
            <Text style={styles.title}>{copy.verification.title}</Text>
            <Text style={styles.copy}>{copy.verification.copy}</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepChip, styles.stepChipActive]}>
              <Text style={[styles.stepChipText, styles.stepChipTextActive]}>
                {copy.common.account}
              </Text>
            </View>
            <View style={[styles.stepChip, styles.stepChipActive]}>
              <Text style={[styles.stepChipText, styles.stepChipTextActive]}>
                {copy.common.identity}
              </Text>
            </View>
            <View style={styles.stepChip}>
              <Text style={styles.stepChipText}>{copy.common.review}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{copy.verification.panelTitle}</Text>
              <Text style={styles.panelCopy}>{copy.verification.panelCopy}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{copy.common.fullName}</Text>
                <View
                  style={[
                    styles.inputShell,
                    focusedField === 'fullName' ? styles.inputShellFocused : undefined,
                  ]}
                >
                  <TextInput
                    autoCapitalize="words"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    placeholder={copy.verification.secureProfile}
                    placeholderTextColor={hiveColors.grisMedio}
                    selectionColor={hiveColors.fucsia}
                    style={styles.input}
                    value={fullName}
                  />
                </View>
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{copy.verification.rutLabel}</Text>
                <View
                  style={[
                    styles.inputShell,
                    focusedField === 'rut' ? styles.inputShellFocused : undefined,
                    rutError ? styles.inputShellError : undefined,
                  ]}
                >
                  <TextInput
                    autoCapitalize="characters"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => setRut(formatRut(value))}
                    onFocus={() => setFocusedField('rut')}
                    placeholder="12.345.678-5"
                    placeholderTextColor={hiveColors.grisMedio}
                    selectionColor={hiveColors.fucsia}
                    style={styles.input}
                    value={rut}
                  />
                </View>
                {rutError ? <Text style={styles.errorText}>{rutError}</Text> : null}
              </View>
            </View>

            <View style={styles.uploadSection}>
              <Pressable
                onPress={() => selectDocument('front')}
                style={({ pressed }) => [styles.uploadCard, pressed ? styles.pressed : undefined]}
              >
                <View style={styles.uploadCopyColumn}>
                  <View style={styles.uploadIconBadge}>
                    <Feather
                      color={hiveColors.negro}
                      name={frontUri ? 'check' : 'camera'}
                      size={16}
                    />
                  </View>
                  <View style={styles.uploadTextColumn}>
                    <Text style={styles.uploadTitle}>{copy.verification.uploadFrontTitle}</Text>
                    <Text style={styles.uploadDescription}>
                      {copy.verification.uploadFrontDescription}
                    </Text>
                    <Text style={styles.uploadMeta}>
                      {frontUri ? copy.common.uploadReady : copy.common.uploadDocument}
                    </Text>
                  </View>
                </View>
                {frontUri ? (
                  <Image source={{ uri: frontUri }} style={styles.uploadPreview} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Feather color={hiveColors.grisMedio} name="upload-cloud" size={18} />
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => selectDocument('serial')}
                style={({ pressed }) => [styles.uploadCard, pressed ? styles.pressed : undefined]}
              >
                <View style={styles.uploadCopyColumn}>
                  <View style={styles.uploadIconBadge}>
                    <Feather
                      color={hiveColors.negro}
                      name={serialUri ? 'check' : 'camera'}
                      size={16}
                    />
                  </View>
                  <View style={styles.uploadTextColumn}>
                    <Text style={styles.uploadTitle}>{copy.verification.serialTitle}</Text>
                    <Text style={styles.uploadDescription}>
                      {copy.verification.serialDescription}
                    </Text>
                    <Text style={styles.uploadMeta}>
                      {serialUri ? copy.common.uploadReady : copy.common.uploadDocument}
                    </Text>
                  </View>
                </View>
                {serialUri ? (
                  <Image source={{ uri: serialUri }} style={styles.uploadPreview} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Feather color={hiveColors.grisMedio} name="upload-cloud" size={18} />
                  </View>
                )}
              </Pressable>
            </View>

            {error ? <Text style={styles.genericErrorCopy}>{error}</Text> : null}

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{copy.verification.noticeTitle}</Text>
              <Text style={styles.noticeCopy}>{copy.verification.noticeCopy}</Text>
            </View>

            <Pressable
              disabled={submitDisabled}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !submitDisabled ? styles.primaryButtonPressed : undefined,
                submitDisabled ? styles.buttonDisabled : undefined,
              ]}
            >
              <Text style={styles.primaryButtonLabel}>
                {submitting ? copy.verification.reviewSending : copy.verification.reviewCta}
              </Text>
            </Pressable>

            <Pressable onPress={() => void signOut()} style={styles.ghostButton}>
              <Text style={styles.ghostButtonLabel}>{copy.common.closeSession}</Text>
            </Pressable>

            <Text style={styles.helperCopy}>
              {isMockMode ? copy.verification.helperMock : copy.verification.helperLive}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  logo: {
    width: logoWidth,
    height: logoHeight,
  },
  hero: {
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: hiveColors.fucsia,
  },
  title: {
    maxWidth: 320,
    fontFamily: hiveFonts.heavy,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.5,
    color: hiveColors.negro,
  },
  copy: {
    maxWidth: 320,
    fontFamily: hiveFonts.normal,
    fontSize: 15,
    lineHeight: 23,
    color: hiveColors.grisMedio,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: hiveColors.grisClaro,
  },
  stepChipActive: {
    backgroundColor: hiveColors.lima,
  },
  stepChipText: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 12,
    color: hiveColors.grisMedio,
  },
  stepChipTextActive: {
    color: hiveColors.negro,
  },
  panel: {
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
    fontSize: 22,
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
  errorText: {
    paddingHorizontal: spacing.sm,
    fontFamily: hiveFonts.medium,
    fontSize: 12,
    color: hiveColors.fucsia,
  },
  uploadSection: {
    gap: spacing.md,
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
  genericErrorCopy: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    lineHeight: 19,
    color: hiveColors.fucsia,
  },
  noticeCard: {
    gap: spacing.xs,
    borderRadius: 24,
    backgroundColor: hiveColors.limaTints[100],
    padding: spacing.lg,
  },
  noticeTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 15,
    color: hiveColors.textLimaDark,
  },
  noticeCopy: {
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 20,
    color: hiveColors.negro,
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
  buttonDisabled: {
    opacity: 0.5,
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
  helperCopy: {
    textAlign: 'center',
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    lineHeight: 18,
    color: hiveColors.grisMedio,
  },
});
