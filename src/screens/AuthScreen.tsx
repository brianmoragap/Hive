import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
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

type AuthMode = 'signIn' | 'signUp';
type FieldKey = 'email' | 'password';

const socialProviders = [
  { iconName: 'google', id: 'google', label: 'Google' },
  { iconName: 'apple', id: 'apple', label: 'Apple' },
] as const;

const heroImage = require('../../assets/images/auth-hero.jpg');
const logoImage = require('../../assets/images/hive-logo-white.png');
const logoAspectRatio = 880 / 268;
const logoWidth = Math.round(Dimensions.get('window').width * 0.44);
const logoHeight = Math.round(logoWidth / logoAspectRatio);

export function AuthScreen() {
  const { copy } = useLocale();
  const { isMockMode, signIn, signUp } = useSession();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [switchWidth, setSwitchWidth] = useState(0);
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);

  const modeProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(modeProgress, {
      toValue: mode === 'signIn' ? 0 : 1,
      useNativeDriver: true,
      damping: 18,
      mass: 0.9,
      stiffness: 170,
    }).start();
  }, [mode, modeProgress]);

  const indicatorWidth = switchWidth > 8 ? (switchWidth - 8) / 2 : 0;
  const indicatorTranslateX = modeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, switchWidth / 2],
  });

  const contentOpacity = modeProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.82, 1],
  });
  const contentTranslateY = modeProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 6, 0],
  });

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setConfirmationNotice(null);

      if (mode === 'signIn') {
        await signIn({ email, password });
      } else {
        await signUp({ email, password });
      }
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : copy.auth.submitErrorFallback;

      if (message === copy.session.accountCreatedNeedsConfirmation) {
        setConfirmationNotice(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    setError(null);
    setConfirmationNotice(null);
    setMode(nextMode);
  };

  return (
    <ImageBackground resizeMode="cover" source={heroImage} style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['rgba(13,13,13,0.45)', 'rgba(13,13,13,0.55)', 'rgba(13,13,13,0.78)']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeContent}>
            <View style={styles.heroLogoBlock}>
              <Image resizeMode="contain" source={logoImage} style={styles.heroLogo} />
            </View>

            <View style={styles.cardShell}>
              <BlurView
                experimentalBlurMethod="dimezisBlurView"
                intensity={36}
                style={StyleSheet.absoluteFill}
                tint="dark"
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.05)']}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {mode === 'signIn' ? copy.auth.cardTitleSignIn : copy.auth.cardTitleSignUp}
                </Text>

                <View
                  onLayout={(event) => setSwitchWidth(event.nativeEvent.layout.width)}
                  style={styles.modeSwitch}
                >
                  {indicatorWidth > 0 ? (
                    <Animated.View
                      style={[
                        styles.modeIndicator,
                        {
                          transform: [{ translateX: indicatorTranslateX }],
                          width: indicatorWidth,
                        },
                      ]}
                    />
                  ) : null}
                  <Pressable onPress={() => handleModeChange('signIn')} style={styles.modePill}>
                    <Text
                      style={[
                        styles.modeLabel,
                        mode === 'signIn' ? styles.modeLabelActive : undefined,
                      ]}
                    >
                      {copy.common.signIn}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => handleModeChange('signUp')} style={styles.modePill}>
                    <Text
                      style={[
                        styles.modeLabel,
                        mode === 'signUp' ? styles.modeLabelActive : undefined,
                      ]}
                    >
                      {copy.common.createAccount}
                    </Text>
                  </Pressable>
                </View>

                <Animated.View
                  style={[
                    styles.animatedContent,
                    { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
                  ]}
                >
                  <View style={styles.form}>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>{copy.common.emailLabel}</Text>
                      <View
                        style={[
                          styles.inputShell,
                          focusedField === 'email' ? styles.inputShellFocused : undefined,
                        ]}
                      >
                        <TextInput
                          autoCapitalize="none"
                          keyboardType="email-address"
                          onBlur={() => setFocusedField(null)}
                          onChangeText={setEmail}
                          onFocus={() => setFocusedField('email')}
                          placeholder={copy.common.emailPlaceholder}
                          placeholderTextColor={hiveColors.grisMedio}
                          selectionColor={hiveColors.fucsia}
                          style={styles.input}
                          value={email}
                        />
                      </View>
                    </View>

                    <View style={styles.fieldWrapper}>
                      <View style={styles.labelRow}>
                        <Text style={styles.fieldLabel}>{copy.common.passwordLabel}</Text>
                        {mode === 'signIn' ? (
                          <Pressable
                            onPress={() =>
                              Alert.alert(copy.auth.resetPendingTitle, copy.auth.resetPendingBody)
                            }
                          >
                            <Text style={styles.fieldAction}>{copy.common.forgotPassword}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.inputShell,
                          focusedField === 'password' ? styles.inputShellFocused : undefined,
                          error ? styles.inputShellError : undefined,
                        ]}
                      >
                        <TextInput
                          autoCapitalize="none"
                          onBlur={() => setFocusedField(null)}
                          onChangeText={setPassword}
                          onFocus={() => setFocusedField('password')}
                          placeholder={copy.common.passwordPlaceholder}
                          placeholderTextColor={hiveColors.grisMedio}
                          secureTextEntry
                          selectionColor={hiveColors.fucsia}
                          style={styles.input}
                          value={password}
                        />
                      </View>
                      {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>
                  </View>

                  {confirmationNotice ? (
                    <View style={styles.confirmationNotice}>
                      <Feather color={hiveColors.lima} name="mail" size={16} />
                      <Text style={styles.confirmationNoticeText}>{confirmationNotice}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    disabled={submitting}
                    onPress={handleSubmit}
                    style={({ pressed }) => [
                      styles.submitButton,
                      pressed && !submitting ? styles.submitButtonPressed : undefined,
                      submitting ? styles.submitButtonDisabled : undefined,
                    ]}
                  >
                    <Text style={styles.submitLabel}>
                      {submitting
                        ? copy.common.processing
                        : mode === 'signIn'
                          ? copy.common.signIn
                          : copy.common.createAccount}
                    </Text>
                  </Pressable>

                  <View style={styles.safeTag}>
                    <Feather color={hiveColors.lima} name="shield" size={14} />
                    <Text style={styles.safeTagText}>
                      {mode === 'signIn' ? copy.auth.safeTagSignIn : copy.auth.safeTagSignUp}
                    </Text>
                  </View>

                  {mode === 'signUp' ? (
                    <View style={styles.registrationHint}>
                      <Text style={styles.registrationHintTitle}>
                        {copy.auth.registrationHintTitle}
                      </Text>
                      {copy.auth.registrationSteps.map((step) => (
                        <Text key={step} style={styles.registrationHintCopy}>
                          {step}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </Animated.View>

                <View style={styles.socialWrapper}>
                  <Text style={styles.socialTitle}>{copy.socialPreview.title}</Text>
                  <View style={styles.socialRow}>
                    {socialProviders.map((provider) => (
                      <View key={provider.id} style={styles.socialButton}>
                        <MaterialCommunityIcons
                          color={hiveColors.blanco}
                          name={provider.iconName}
                          size={17}
                        />
                        <Text style={styles.socialLabel}>{provider.label}</Text>
                        <View style={styles.socialBadge}>
                          <Text style={styles.socialBadgeText}>{copy.common.soon}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.socialHelper}>{copy.socialPreview.helperText}</Text>
                </View>

                {isMockMode ? (
                  <Text style={styles.mockModeCopy}>{copy.auth.demoModeCopy}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.footerLockup}>
              <Text style={styles.footerSmall}>join the</Text>
              <Text style={styles.footerBrand}>hive</Text>
              <Text style={styles.footerHashtag}>#jointhehive</Text>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: hiveColors.negro,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  heroLogoBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: logoWidth,
    height: logoHeight,
  },
  cardShell: {
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: hiveColors.negro,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  card: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 20,
    color: hiveColors.blanco,
  },
  modeSwitch: {
    position: 'relative',
    flexDirection: 'row',
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radii.pill,
    backgroundColor: hiveColors.lima,
  },
  modePill: {
    zIndex: 1,
    flex: 1,
    minHeight: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  modeLabelActive: {
    color: hiveColors.negro,
  },
  animatedContent: {
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  fieldWrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  fieldAction: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: hiveColors.fucsiaTints[400],
  },
  inputShell: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  inputShellFocused: {
    borderColor: hiveColors.lima,
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
    color: hiveColors.fucsiaTints[400],
  },
  confirmationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(204,255,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(204,255,0,0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  confirmationNoticeText: {
    flex: 1,
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    lineHeight: 18,
    color: hiveColors.lima,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.fucsia,
    marginTop: spacing.xs,
    shadowColor: hiveColors.fucsia,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  submitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: hiveColors.blanco,
  },
  safeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(204,255,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(204,255,0,0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  safeTagText: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 12,
    color: hiveColors.lima,
  },
  registrationHint: {
    gap: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
  },
  registrationHintTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.blanco,
  },
  registrationHintCopy: {
    fontFamily: hiveFonts.normal,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.75)',
  },
  socialWrapper: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  socialTitle: {
    textAlign: 'center',
    fontFamily: hiveFonts.demiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.65)',
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialButton: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  socialLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    color: hiveColors.blanco,
  },
  socialBadge: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(204,255,0,0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  socialBadgeText: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: hiveColors.lima,
  },
  socialHelper: {
    textAlign: 'center',
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  mockModeCopy: {
    textAlign: 'center',
    fontFamily: hiveFonts.normal,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  footerLockup: {
    alignItems: 'center',
    gap: 2,
    borderRadius: 24,
    backgroundColor: hiveColors.negro,
    paddingVertical: spacing.lg,
  },
  footerSmall: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 11,
    color: hiveColors.blanco,
    opacity: 0.7,
  },
  footerBrand: {
    fontFamily: hiveFonts.heavy,
    fontSize: 30,
    color: hiveColors.lima,
    letterSpacing: -0.5,
  },
  footerHashtag: {
    fontFamily: hiveFonts.medium,
    fontSize: 11,
    color: hiveColors.blanco,
    opacity: 0.55,
    marginTop: 4,
  },
});
