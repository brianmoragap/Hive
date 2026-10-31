import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { TextField } from '../components/TextField';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { radii, shadows, spacing } from '../theme/tokens';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const MAX_CONTACTS = 5;

export function EmergencyContactsScreen() {
  const { copy } = useLocale();
  const { theme } = useAppTheme();
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const { addEmergencyContact, emergencyContacts, removeEmergencyContact } = useEvents();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const atLimit = emergencyContacts.length >= MAX_CONTACTS;

  const handleAdd = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError(copy.emergencyContacts.missingFieldsBody);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await addEmergencyContact(fullName, phoneNumber);
      setFullName('');
      setPhoneNumber('');
    } catch {
      Alert.alert(copy.emergencyContacts.addFailedTitle, copy.emergencyContacts.addFailedBody);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contactId: string) => {
    Alert.alert(
      copy.emergencyContacts.deleteConfirmTitle,
      copy.emergencyContacts.deleteConfirmBody,
      [
        { style: 'cancel', text: copy.common.cancel },
        {
          style: 'destructive',
          text: copy.emergencyContacts.deleteAction,
          onPress: () => void removeEmergencyContact(contactId),
        },
      ],
    );
  };

  return (
    <ScreenFrame contentStyle={styles.safeArea}>
      <StatusBar style={theme.statusBarStyle} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxxl + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.headerButton, pressed ? styles.pressed : undefined]}
            >
              <Feather color={theme.colors.iconOnBackground} name="arrow-left" size={18} />
            </Pressable>

            <Text style={[styles.wordmark, { color: theme.colors.iconOnBackground }]}>HIVE</Text>

            <View style={styles.headerGhost} />
          </View>

          <View style={styles.heroBlock}>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
              {copy.emergencyContacts.title}
            </Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>
              {copy.emergencyContacts.copy}
            </Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
            {atLimit ? (
              <Text style={[styles.maxReached, { color: theme.colors.textMuted }]}>
                {copy.emergencyContacts.maxReachedCopy}
              </Text>
            ) : (
              <>
                <TextField
                  autoCapitalize="words"
                  label={copy.emergencyContacts.nameLabel}
                  onChangeText={(value) => {
                    setError(null);
                    setFullName(value);
                  }}
                  placeholder={copy.emergencyContacts.namePlaceholder}
                  value={fullName}
                />
                <TextField
                  keyboardType="phone-pad"
                  label={copy.emergencyContacts.phoneLabel}
                  onChangeText={(value) => {
                    setError(null);
                    setPhoneNumber(value);
                  }}
                  placeholder={copy.emergencyContacts.phonePlaceholder}
                  value={phoneNumber}
                />
                {error ? (
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                ) : null}
                <PrimaryButton
                  disabled={saving}
                  label={copy.emergencyContacts.addAction}
                  onPress={() => void handleAdd()}
                />
              </>
            )}
          </View>

          {emergencyContacts.length === 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {copy.emergencyContacts.emptyTitle}
              </Text>
              <Text style={[styles.sectionCopy, { color: theme.colors.textMuted }]}>
                {copy.emergencyContacts.emptyCopy}
              </Text>
            </View>
          ) : (
            <View style={styles.contactColumn}>
              {emergencyContacts.map((contact) => (
                <View
                  key={contact.id}
                  style={[styles.contactCard, { backgroundColor: theme.colors.surfaceStrong }]}
                >
                  <View style={styles.contactCopy}>
                    <Text style={[styles.contactName, { color: theme.colors.text }]}>
                      {contact.fullName}
                    </Text>
                    <Text style={[styles.contactPhone, { color: theme.colors.textMuted }]}>
                      {contact.phoneNumber}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={copy.emergencyContacts.deleteAction}
                    onPress={() => handleDelete(contact.id)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      { backgroundColor: theme.colors.primarySoft },
                      pressed ? styles.pressed : undefined,
                    ]}
                  >
                    <Feather color={theme.colors.danger} name="trash-2" size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGhost: {
    width: 42,
    height: 42,
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.9,
    transform: [{ skewX: '-8deg' }],
  },
  heroBlock: {
    gap: spacing.xs,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -1.1,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    borderRadius: 30,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
  },
  sectionCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  maxReached: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    paddingHorizontal: spacing.sm,
  },
  contactColumn: {
    gap: spacing.sm,
  },
  contactCard: {
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    ...shadows.card,
  },
  contactCopy: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
  },
  contactPhone: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
