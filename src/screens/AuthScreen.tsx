import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
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
import { TextField } from '../components/TextField';
import { useSession } from '../providers/SessionProvider';
import { colors, spacing } from '../theme/tokens';

type AuthMode = 'signIn' | 'signUp';

export function AuthScreen() {
  const { isMockMode, signIn, signUp } = useSession();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          : 'No se pudo completar la autenticacion.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openSocialPlaceholder = (provider: string) => {
    Alert.alert(
      'Social connect',
      `${provider} quedo reservado para la siguiente iteracion de Supabase Auth.`,
    );
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
            <Text style={styles.brand}>HIVE</Text>
            <Text style={styles.heroTitle}>Una comunidad deportiva que primero protege.</Text>
            <Text style={styles.heroCopy}>
              Mujeres verificadas, eventos claros y una identidad comun respaldada desde el
              primer acceso.
            </Text>
          </View>

          <GlassPanel style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>HIVE</Text>
              <Text style={styles.cardTitle}>
                {mode === 'signIn' ? 'Welcome back' : 'Join the hive'}
              </Text>
            </View>

            <View style={styles.modeSwitch}>
              <Pressable
                onPress={() => setMode('signIn')}
                style={[styles.modePill, mode === 'signIn' ? styles.modePillActive : undefined]}
              >
                <Text
                  style={[styles.modeLabel, mode === 'signIn' ? styles.modeLabelActive : undefined]}
                >
                  Entrar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('signUp')}
                style={[styles.modePill, mode === 'signUp' ? styles.modePillActive : undefined]}
              >
                <Text
                  style={[styles.modeLabel, mode === 'signUp' ? styles.modeLabelActive : undefined]}
                >
                  Crear cuenta
                </Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              <TextField
                autoCapitalize="none"
                keyboardType="email-address"
                label="Email address"
                onChangeText={setEmail}
                placeholder="jane.doe@hive.cl"
                value={email}
              />
              <TextField
                autoCapitalize="none"
                error={error}
                label="Password"
                onChangeText={setPassword}
                onRightActionPress={() =>
                  Alert.alert('Reset pendiente', 'Se conectara con recovery via Supabase.')
                }
                placeholder="Minimo 6 caracteres"
                rightActionLabel={mode === 'signIn' ? 'Forgot?' : undefined}
                secureTextEntry
                value={password}
              />
            </View>

            <PrimaryButton
              disabled={submitting}
              label={submitting ? 'Procesando' : mode === 'signIn' ? 'Sign In' : 'Crear cuenta'}
              onPress={handleSubmit}
              style={styles.submitButton}
            />

            <View style={styles.safeTag}>
              <Feather color={colors.primaryDeep} name="shield" size={14} />
              <Text style={styles.safeTagText}>Solo mujeres verificadas entran al ecosistema.</Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Social connect</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable onPress={() => openSocialPlaceholder('Google')} style={styles.socialButton}>
                <Feather color={colors.text} name="globe" size={16} />
                <Text style={styles.socialLabel}>Google</Text>
              </Pressable>
              <Pressable onPress={() => openSocialPlaceholder('Apple')} style={styles.socialButton}>
                <Feather color={colors.text} name="smartphone" size={16} />
                <Text style={styles.socialLabel}>Apple</Text>
              </Pressable>
            </View>

            <Text style={styles.footerCopy}>
              {mode === 'signIn' ? 'Nueva en Hive?' : 'Ya tienes cuenta?'}{' '}
              <Text
                onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                style={styles.footerAccent}
              >
                {mode === 'signIn' ? 'Unete hoy' : 'Inicia sesion'}
              </Text>
            </Text>

            {isMockMode ? (
              <Text style={styles.mockModeCopy}>
                Modo demo activo: si aun no defines las llaves de Supabase, cualquier email y
                password te dejaran avanzar al flujo.
              </Text>
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
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 4,
    marginBottom: spacing.xl,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.54)',
  },
  modePill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: colors.white,
  },
  modeLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.textSoft,
  },
  modeLabelActive: {
    color: colors.text,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(77, 33, 42, 0.08)',
  },
  dividerText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2.1,
    color: colors.textSoft,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.44)',
  },
  socialLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.text,
  },
  footerCopy: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
  },
  footerAccent: {
    color: colors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  mockModeCopy: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
