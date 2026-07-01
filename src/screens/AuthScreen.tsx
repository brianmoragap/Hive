import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { SocialProviderPreview } from '../components/SocialProviderPreview';
import { TextField } from '../components/TextField';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, spacing } from '../theme/tokens';

type AuthMode = 'signIn' | 'signUp';

export function AuthScreen() {
  const { copy } = useLocale();
  const { isMockMode, signIn, signUp } = useSession();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchWidth, setSwitchWidth] = useState(0);

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

  const indicatorWidth = switchWidth > 16 ? (switchWidth - 16) / 2 : 0;
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
  const contentScale = modeProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.992, 1],
  });

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (mode === 'signIn') {
        await signIn({ email, password });
      } else {
        await signUp({ email, password });
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : copy.auth.submitErrorFallback,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    setError(null);
    setMode(nextMode);
  };

  return (
    <ScreenFrame variant="photo">
      <StatusBar style="light" />

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
          <View style={styles.heroBlock}>
            <View style={styles.heroTopRow}>
              <Text style={styles.brand}>HIVE</Text>
            </View>
            <Text style={styles.heroTitle}>{copy.auth.heroTitle}</Text>
            <Text style={styles.heroCopy}>{copy.auth.heroCopy}</Text>
          </View>

          <GlassPanel style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>HIVE</Text>
              <Text style={styles.cardTitle}>
                {mode === 'signIn' ? copy.auth.cardTitleSignIn : copy.auth.cardTitleSignUp}
              </Text>
            </View>

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
              <Pressable
                onPress={() => handleModeChange('signIn')}
                style={styles.modePill}
              >
                <Text
                  style={[styles.modeLabel, mode === 'signIn' ? styles.modeLabelActive : undefined]}
                >
                  {copy.common.signIn}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleModeChange('signUp')}
                style={styles.modePill}
              >
                <Text
                  style={[styles.modeLabel, mode === 'signUp' ? styles.modeLabelActive : undefined]}
                >
                  {copy.common.createAccount}
                </Text>
              </Pressable>
            </View>

            <Animated.View
              style={[
                styles.animatedContent,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }, { scale: contentScale }],
                },
              ]}
            >
              <View style={styles.form}>
                <TextField
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label={copy.common.emailLabel}
                  onChangeText={setEmail}
                  placeholder={copy.common.emailPlaceholder}
                  value={email}
                />
                <TextField
                  autoCapitalize="none"
                  error={error}
                  label={copy.common.passwordLabel}
                  onChangeText={setPassword}
                  onRightActionPress={() =>
                    Alert.alert(copy.auth.resetPendingTitle, copy.auth.resetPendingBody)
                  }
                  placeholder={copy.common.passwordPlaceholder}
                  rightActionLabel={mode === 'signIn' ? copy.common.forgotPassword : undefined}
                  secureTextEntry
                  value={password}
                />
              </View>

              <PrimaryButton
                disabled={submitting}
                label={
                  submitting
                    ? copy.common.processing
                    : mode === 'signIn'
                      ? copy.common.signIn
                      : copy.common.createAccount
                }
                onPress={handleSubmit}
                style={styles.submitButton}
              />

              <View style={styles.safeTag}>
                <Feather color={colors.primaryDeep} name="shield" size={14} />
                <Text style={styles.safeTagText}>
                  {mode === 'signIn'
                    ? copy.auth.safeTagSignIn
                    : copy.auth.safeTagSignUp}
                </Text>
              </View>

              {mode === 'signUp' ? (
                <View style={styles.registrationHint}>
                  <Text style={styles.registrationHintTitle}>{copy.auth.registrationHintTitle}</Text>
                  {copy.auth.registrationSteps.map((step) => (
                    <Text key={step} style={styles.registrationHintCopy}>
                      {step}
                    </Text>
                  ))}
                </View>
              ) : null}
            </Animated.View>

            <SocialProviderPreview />

            {isMockMode ? (
              <Text style={styles.mockModeCopy}>{copy.auth.demoModeCopy}</Text>
            ) : null}
          </GlassPanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.xxl,
  },
  heroBlock: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brand: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 54,
    color: colors.white,
    letterSpacing: -2.4,
    transform: [{ skewX: '-8deg' }],
  },
  heroTitle: {
    maxWidth: 260,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
  },
  heroCopy: {
    maxWidth: 280,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    marginTop: 'auto',
  },
  cardHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  cardBrand: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 38,
    color: colors.primary,
    letterSpacing: -1.8,
    transform: [{ skewX: '-8deg' }],
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: colors.text,
  },
  modeSwitch: {
    position: 'relative',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 4,
    marginBottom: spacing.xl,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.54)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  modePill: {
    zIndex: 1,
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.textSoft,
  },
  modeLabelActive: {
    color: colors.text,
  },
  animatedContent: {
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  safeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.md,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 218, 218, 0.72)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  safeTagText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: colors.primaryDeep,
  },
  registrationHint: {
    gap: spacing.xxs,
    marginTop: spacing.lg,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.56)',
    padding: spacing.lg,
  },
  registrationHintTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  registrationHintCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  mockModeCopy: {
    marginTop: spacing.lg,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
