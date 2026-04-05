import { Feather } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';

interface DocumentUploadCardProps {
  title: string;
  description: string;
  imageUri?: string | null;
  onPress: () => void;
}

export function DocumentUploadCard({
  title,
  description,
  imageUri,
  onPress,
}: DocumentUploadCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.copyColumn}>
        <View style={styles.iconBadge}>
          <Feather color={colors.primaryDeep} name={imageUri ? 'check' : 'camera'} size={16} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.meta}>{imageUri ? 'Documento listo para revision' : 'Subir archivo'}</Text>
        </View>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Feather color={colors.textSoft} name="upload-cloud" size={18} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  copyColumn: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  textColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  description: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  meta: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  preview: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
  },
});
