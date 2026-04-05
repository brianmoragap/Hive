import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { useSession } from '../providers/SessionProvider';
import { colors, safetyTips, spacing } from '../theme/tokens';

export function PendingReviewScreen() {
  const { debugApproveProfile, isMockMode, profile, signOut } = useSession();

  return (
    <ScreenFrame>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Estado de cuenta</Text>
          <Text style={styles.title}>Tu identidad ya entro a revision.</Text>
          <Text style={styles.copy}>
            Mientras se valida tu informacion, Hive mantiene bloqueadas las funciones sociales y
            de eventos.
          </Text>
        </View>

        <GlassPanel>
          <View style={styles.statusBadge}>
            <View style={styles.statusIcon}>
              <Feather color={colors.primaryDeep} name="shield" size={22} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>En revision</Text>
              <Text style={styles.statusText}>Perfil visible solo para el equipo de validacion.</Text>
            </View>
          </View>

          <View style={styles.identityCard}>
            <Text style={styles.identityLabel}>Nombre</Text>
            <Text style={styles.identityValue}>{profile?.fullName || 'Pendiente'}</Text>
            <Text style={styles.identityLabel}>RUT</Text>
            <Text style={styles.identityValue}>{profile?.rut || 'Pendiente'}</Text>
          </View>

          <View style={styles.timeline}>
            <Text style={styles.timelineTitle}>Que sigue ahora</Text>
            <Text style={styles.timelineText}>1. Revisa tu documentacion el equipo de Hive.</Text>
            <Text style={styles.timelineText}>2. Si todo coincide, activamos `verificado = true`.</Text>
            <Text style={styles.timelineText}>3. Se desbloquean home, eventos, grupos y notificaciones.</Text>
          </View>

          <PrimaryButton label="Cerrar sesion" onPress={() => void signOut()} variant="secondary" />

          {isMockMode ? (
            <PrimaryButton
              label="Aprobar en demo"
              onPress={() => void debugApproveProfile()}
              style={styles.demoButton}
            />
          ) : null}
        </GlassPanel>

        <GlassPanel>
          <Text style={styles.tipTitle}>Tips de seguridad</Text>
          <View style={styles.tipList}>
            {safetyTips.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </GlassPanel>
      </ScrollView>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.primaryDeep,
  },
  title: {
    maxWidth: 320,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
  },
  copy: {
    maxWidth: 320,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  statusCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  statusTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: colors.text,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  identityCard: {
    gap: spacing.xs,
    marginTop: spacing.xl,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.64)',
    padding: spacing.lg,
  },
  identityLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  identityValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  timeline: {
    gap: spacing.xs,
    marginVertical: spacing.xl,
  },
  timelineTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  timelineText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  demoButton: {
    marginTop: spacing.sm,
  },
  tipTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: colors.text,
  },
  tipList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: colors.mint,
  },
  tipText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
