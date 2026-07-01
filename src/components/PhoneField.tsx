import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useLocale } from '../providers/LocaleProvider';
import { colors, radii, spacing } from '../theme/tokens';
import {
  getPhonePlaceholder,
  phoneCountries,
  type PhoneCountry,
} from '../utils/onboarding';

interface PhoneFieldProps {
  countryLabel: string;
  error?: string | null;
  helperText: string;
  label: string;
  localLabel: string;
  onChangeText: (value: string) => void;
  onSelectCountry: (country: PhoneCountry) => void;
  searchPlaceholder: string;
  selectedCountry: PhoneCountry;
  selectorTitle: string;
  value: string;
}

export function PhoneField({
  countryLabel,
  error,
  helperText,
  label,
  localLabel,
  onChangeText,
  onSelectCountry,
  searchPlaceholder,
  selectedCountry,
  selectorTitle,
  value,
}: PhoneFieldProps) {
  const { copy, language } = useLocale();
  const [searchValue, setSearchValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const filteredCountries = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return phoneCountries;
    }

    return phoneCountries.filter((country) => {
      const localizedName = country.name[language].toLowerCase();
      return (
        localizedName.includes(normalizedQuery) ||
        country.isoCode.toLowerCase().includes(normalizedQuery) ||
        country.dialCode.includes(normalizedQuery)
      );
    });
  }, [language, searchValue]);

  const closePicker = () => {
    setPickerOpen(false);
    setSearchValue('');
  };

  const handleCountrySelection = (country: PhoneCountry) => {
    onSelectCountry(country);
    closePicker();
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>{label}</Text>

      <View style={styles.row}>
        <View style={styles.countryColumn}>
          <Text style={styles.inlineLabel}>{countryLabel}</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [
              styles.countryButton,
              error ? styles.inputShellError : undefined,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <View>
              <Text style={styles.countryDialCode}>{selectedCountry.dialCode}</Text>
              <Text numberOfLines={1} style={styles.countryName}>
                {selectedCountry.name[language]}
              </Text>
            </View>
            <Feather color={colors.textMuted} name="chevron-down" size={16} />
          </Pressable>
        </View>

        <View style={styles.numberColumn}>
          <Text style={styles.inlineLabel}>{localLabel}</Text>
          <View style={[styles.inputShell, error ? styles.inputShellError : undefined]}>
            <TextInput
              keyboardType="phone-pad"
              maxLength={22}
              onChangeText={onChangeText}
              placeholder={getPhonePlaceholder(selectedCountry)}
              placeholderTextColor="rgba(125, 90, 98, 0.55)"
              selectionColor={colors.primary}
              style={styles.input}
              value={value}
            />
          </View>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.helperText}>{helperText}</Text>}

      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        transparent
        visible={pickerOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable onPress={closePicker} style={styles.modalBackdrop} />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectorTitle}</Text>
              <Pressable
                onPress={closePicker}
                style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : undefined]}
              >
                <Feather color={colors.text} name="x" size={18} />
              </Pressable>
            </View>

            <View style={styles.searchShell}>
              <Feather color={colors.textSoft} name="search" size={16} />
              <TextInput
                onChangeText={setSearchValue}
                placeholder={searchPlaceholder}
                placeholderTextColor="rgba(125, 90, 98, 0.55)"
                selectionColor={colors.primary}
                style={styles.searchInput}
                value={searchValue}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.isoCode}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active =
                  item.isoCode === selectedCountry.isoCode &&
                  item.dialCode === selectedCountry.dialCode;

                return (
                  <Pressable
                    onPress={() => handleCountrySelection(item)}
                    style={({ pressed }) => [
                      styles.countryRow,
                      active ? styles.countryRowActive : undefined,
                      pressed ? styles.pressed : undefined,
                    ]}
                  >
                    <View style={styles.countryRowCopy}>
                      <Text style={styles.countryRowTitle}>{item.name[language]}</Text>
                      <Text style={styles.countryRowMeta}>
                        {item.isoCode} · {item.dialCode}
                      </Text>
                    </View>
                    {active ? (
                      <Feather color={colors.primaryDeep} name="check" size={16} />
                    ) : null}
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
            />

            <Pressable
              onPress={closePicker}
              style={({ pressed }) => [styles.dismissButton, pressed ? styles.pressed : undefined]}
            >
              <Text style={styles.dismissButtonLabel}>{copy.common.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  sectionLabel: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 2.1,
    color: 'rgba(77, 33, 42, 0.62)',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  countryColumn: {
    width: 124,
    gap: spacing.xs,
  },
  numberColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  inlineLabel: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  countryButton: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryDialCode: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  countryName: {
    marginTop: 2,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.textSoft,
  },
  inputShell: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  inputShellError: {
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 90, 0.28)',
  },
  input: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  helperText: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  errorText: {
    paddingHorizontal: spacing.sm,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.danger,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(56, 24, 32, 0.28)',
  },
  modalSheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.text,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 242, 243, 0.92)',
  },
  searchShell: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 244, 244, 0.82)',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  countryRow: {
    minHeight: 62,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countryRowActive: {
    backgroundColor: 'rgba(255, 218, 218, 0.72)',
  },
  countryRowCopy: {
    flex: 1,
    gap: 2,
  },
  countryRowTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  countryRowMeta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.textSoft,
  },
  dismissButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 244, 244, 0.9)',
    marginTop: spacing.md,
  },
  dismissButtonLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: colors.primaryDeep,
  },
  pressed: {
    opacity: 0.92,
  },
});
