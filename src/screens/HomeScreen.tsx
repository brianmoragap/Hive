import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { SportTile } from '../components/SportTile';
import { useSession } from '../providers/SessionProvider';
import { colors, sampleEvents, spacing, sportOptions } from '../theme/tokens';

export function HomeScreen() {
  const { profile, signOut } = useSession();
  const firstName = profile?.fullName.split(' ')[0] || 'Hive';

  return (
    <ScreenFrame>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Cuenta verificada</Text>
            <Text style={styles.title}>Hola, {firstName}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Feather color={colors.success} name="check-circle" size={16} />
            <Text style={styles.verifiedLabel}>Verificada</Text>
          </View>
        </View>

        <GlassPanel>
          <Text style={styles.heroTitle}>Tu siguiente salida empieza por el deporte.</Text>
          <Text style={styles.heroCopy}>
            Esta primera version deja listo el home para abrir el listado de eventos por
            disciplina en la siguiente iteracion.
          </Text>
          <PrimaryButton
            label="Crear salida"
            onPress={() => Alert.alert('Proximo paso', 'La creacion de eventos sigue en la fase 2.')}
            style={styles.heroButton}
          />
        </GlassPanel>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona deporte</Text>
          <View style={styles.sportsList}>
            {sportOptions.map((sport) => (
              <SportTile
                key={sport.id}
                onPress={() =>
                  Alert.alert(
                    'Listado de eventos',
                    `La vista de ${sport.label} queda definida para la fase siguiente.`,
                  )
                }
                sport={sport}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview de eventos</Text>
          <View style={styles.eventsList}>
            {sampleEvents.map((event) => (
              <GlassPanel key={event.id}>
                <View style={styles.eventMetaRow}>
                  <Text style={styles.eventSport}>{event.sport}</Text>
                  <Text style={styles.eventSchedule}>{event.schedule}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventOrganizer}>Organiza: {event.organizer}</Text>
                <Text style={styles.eventParticipants}>{event.participants} participantes</Text>
              </GlassPanel>
            ))}
          </View>
        </View>

        <PrimaryButton label="Cerrar sesion" onPress={() => void signOut()} variant="ghost" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  kicker: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.primaryDeep,
  },
  title: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 30,
    color: colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(188, 231, 222, 0.54)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verifiedLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: colors.success,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
  heroCopy: {
    marginTop: spacing.sm,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  heroButton: {
    marginTop: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: colors.text,
  },
  sportsList: {
    gap: spacing.md,
  },
  eventsList: {
    gap: spacing.md,
  },
  eventMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eventSport: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.primaryDeep,
  },
  eventSchedule: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: colors.textSoft,
  },
  eventTitle: {
    marginTop: spacing.sm,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: colors.text,
  },
  eventLocation: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: colors.textMuted,
  },
  eventOrganizer: {
    marginTop: spacing.md,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
  eventParticipants: {
    marginTop: spacing.xs,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: colors.textSoft,
  },
});
