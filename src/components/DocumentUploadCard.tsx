import { Feather } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

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
  const { copy } = useLocale();
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surfaceStrong },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.copyColumn}>
        <View style={[styles.iconBadge, { backgroundColor: theme.colors.primarySoft }]}>
          <Feather
            color={theme.colors.primaryDeep}
            name={imageUri ? 'check' : 'camera'}
            size={16}
          />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
          <Text style={[styles.meta, { color: theme.colors.primaryDeep }]}>
            {imageUri ? copy.common.uploadReady : copy.common.uploadDocument}
          </Text>
        </View>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Feather color={theme.colors.textSoft} name="upload-cloud" size={18} />
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
  },
  textColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  description: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  meta: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
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
  },
});
