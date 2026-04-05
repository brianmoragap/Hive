import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DocumentUploadCard } from '../components/DocumentUploadCard';
import { GlassPanel } from '../components/GlassPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { TextField } from '../components/TextField';
import { useSession } from '../providers/SessionProvider';
import { colors, spacing } from '../theme/tokens';
import { formatRut, isValidRut } from '../utils/rut';

type UploadTarget = 'front' | 'serial';

export function VerificationScreen() {
  const { isMockMode, profile, signOut, submitVerification } = useSession();

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [rut, setRut] = useState(profile?.rut ?? '');
  const [frontUri, setFrontUri] = useState<string | null>(profile?.idFrontUri ?? null);
  const [serialUri, setSerialUri] = useState<string | null>(profile?.idSerialUri ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      Alert.alert('Permiso requerido', 'Necesitamos acceso para capturar o seleccionar la imagen.');
      return;
    }

    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          });

    if (pickerResult.canceled) {
      return;
    }

    saveImageUri(target, pickerResult.assets[0]?.uri ?? '');
  };

  const selectDocument = (target: UploadTarget) => {
    Alert.alert('Documento de identidad', 'Elige como quieres cargar la imagen.', [
      {
        text: 'Camara',
        onPress: () => void launchPicker(target, 'camera'),
      },
      {
        text: 'Biblioteca',
        onPress: () => void launchPicker(target, 'library'),
      },
      {
        style: 'cancel',
        text: 'Cancelar',
      },
    ]);
  };

  const rutError = rut.length > 0 && !isValidRut(rut) ? 'Revisa el digito verificador.' : null;

  const handleSubmit = async () => {
    if (!frontUri || !serialUri) {
      setError('Debes subir ambas imagenes de la cedula.');
      return;
    }

    if (!fullName.trim()) {
      setError('Ingresa tu nombre completo.');
      return;
    }

    if (!isValidRut(rut)) {
      setError('Ingresa un RUT chileno valido.');
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
          : 'No fue posible enviar la verificacion.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenFrame>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>Paso 2 · Verificacion</Text>
          <Text style={styles.title}>La seguridad de Hive parte por validar identidad real.</Text>
          <Text style={styles.copy}>
            Antes de ver salidas y grupos, necesitamos confirmar tu perfil con nombre, RUT y
            fotos claras de tu cedula chilena.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={[styles.stepChip, styles.stepChipActive]}>
            <Text style={[styles.stepChipText, styles.stepChipTextActive]}>Cuenta</Text>
          </View>
          <View style={[styles.stepChip, styles.stepChipActive]}>
            <Text style={[styles.stepChipText, styles.stepChipTextActive]}>Identidad</Text>
          </View>
          <View style={styles.stepChip}>
            <Text style={styles.stepChipText}>Revision</Text>
          </View>
        </View>

        <GlassPanel>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Perfil seguro</Text>
            <Text style={styles.panelCopy}>
              Este perfil se marca en revision hasta que una moderadora lo apruebe.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              autoCapitalize="words"
              label="Nombre completo"
              onChangeText={setFullName}
              placeholder="Como aparece en tu cedula"
              value={fullName}
            />
            <TextField
              autoCapitalize="characters"
              error={rutError}
              keyboardType="default"
              label="RUT chileno"
              onChangeText={(value) => setRut(formatRut(value))}
              placeholder="12.345.678-5"
              value={rut}
            />
          </View>

          <View style={styles.uploadSection}>
            <DocumentUploadCard
              description="Captura el frente de tu documento con todos los datos visibles."
              imageUri={frontUri}
              onPress={() => selectDocument('front')}
              title="Foto frontal de cedula"
            />
            <DocumentUploadCard
              description="Sube la cara posterior o encuadre donde se lea el numero de serie."
              imageUri={serialUri}
              onPress={() => selectDocument('serial')}
              title="Numero de serie"
            />
          </View>

          {error ? <Text style={styles.errorCopy}>{error}</Text> : null}

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Como funciona la revision</Text>
            <Text style={styles.noticeCopy}>
              Guardamos las imagenes en Supabase Storage y tu perfil queda con `verificado =
              false` hasta la aprobacion manual.
            </Text>
          </View>

          <PrimaryButton
            disabled={
              submitting || !fullName.trim() || !isValidRut(rut) || !frontUri || !serialUri
            }
            label={submitting ? 'Enviando' : 'Enviar a revision'}
            onPress={handleSubmit}
            style={styles.cta}
          />

          <PrimaryButton label="Cerrar sesion" onPress={() => void signOut()} variant="ghost" />

          <Text style={styles.helperCopy}>
            {isMockMode
              ? 'Estas viendo el flujo en modo demo. Cuando agregues las llaves de Supabase, las imagenes subiran al bucket privado.'
              : 'Con las llaves de Supabase activas, este flujo ya queda listo para autenticar y enviar documentos a revision.'}
          </Text>
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
    paddingTop: spacing.xs,
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
  stepRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  stepChipActive: {
    backgroundColor: colors.primarySoft,
  },
  stepChipText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: colors.textSoft,
  },
  stepChipTextActive: {
    color: colors.primaryDeep,
  },
  panelHeader: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  panelTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 24,
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
  uploadSection: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  errorCopy: {
    marginTop: spacing.md,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.danger,
  },
  noticeCard: {
    marginTop: spacing.xl,
    gap: spacing.xs,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 218, 218, 0.72)',
    padding: spacing.lg,
  },
  noticeTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: colors.primaryDeep,
  },
  noticeCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },
  cta: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  helperCopy: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
