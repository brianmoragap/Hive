import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { buildAppTheme, themePaletteIds, type ThemePaletteId } from '../theme/appTheme';
import { radii, shadows, spacing } from '../theme/tokens';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const { copy, language, setLanguage } = useLocale();
  const { mode, palette, setMode, setPalette, theme } = useAppTheme();

  const paletteContent: Record<
    ThemePaletteId,
    { description: string; title: string }
  > = {
    coral: {
      description: copy.settings.paletteCoralCopy,
      title: copy.settings.paletteCoral,
    },
    forest: {
      description: copy.settings.paletteForestCopy,
      title: copy.settings.paletteForest,
    },
    neutral: {
      description: copy.settings.paletteNeutralCopy,
      title: copy.settings.paletteNeutral,
    },
    ocean: {
      description: copy.settings.paletteOceanCopy,
      title: copy.settings.paletteOcean,
    },
    sunset: {
      description: copy.settings.paletteSunsetCopy,
      title: copy.settings.paletteSunset,
    },
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
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{copy.settings.title}</Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>{copy.settings.copy}</Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {copy.settings.languageTitle}
            </Text>
            <Text style={[styles.sectionCopy, { color: theme.colors.textMuted }]}>
              {copy.settings.languageCopy}
            </Text>

            <View style={styles.segmentRow}>
              <SegmentOption
                active={language === 'es'}
                label={copy.settings.languageSpanish}
                onPress={() => void setLanguage('es')}
              />
              <SegmentOption
                active={language === 'en'}
                label={copy.settings.languageEnglish}
                onPress={() => void setLanguage('en')}
              />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {copy.settings.darkMode}
            </Text>
            <Text style={[styles.sectionCopy, { color: theme.colors.textMuted }]}>
              {copy.settings.darkModeCopy}
            </Text>

            <View style={styles.segmentRow}>
              <SegmentOption
                active={mode === 'light'}
                label={copy.settings.themeModeLight}
                onPress={() => void setMode('light')}
              />
              <SegmentOption
                active={mode === 'dark'}
                label={copy.settings.themeModeDark}
                onPress={() => void setMode('dark')}
              />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {copy.settings.paletteTitle}
            </Text>
            <Text style={[styles.sectionCopy, { color: theme.colors.textMuted }]}>
              {copy.settings.previewCopy}
            </Text>

            <View style={styles.paletteColumn}>
              {themePaletteIds.map((paletteId) => {
                const previewTheme = buildAppTheme(paletteId, mode);
                const paletteItem = paletteContent[paletteId];

                return (
                  <Pressable
                    key={paletteId}
                    onPress={() => void setPalette(paletteId)}
                    style={({ pressed }) => [
                      styles.paletteCard,
                      {
                        backgroundColor:
                          palette === paletteId
                            ? previewTheme.colors.primarySoft
                            : theme.colors.surface,
                        borderColor:
                          palette === paletteId
                            ? previewTheme.colors.primary
                            : theme.colors.ghostBorder,
                      },
                      pressed ? styles.pressed : undefined,
                    ]}
                  >
                    <View style={styles.palettePreviewRow}>
                      <View
                        style={[
                          styles.paletteSwatchLarge,
                          { backgroundColor: previewTheme.colors.primary },
                        ]}
                      />
                      <View
                        style={[
                          styles.paletteSwatchSmall,
                          { backgroundColor: previewTheme.colors.mint },
                        ]}
                      />
                      <View
                        style={[
                          styles.paletteSwatchSmall,
                          { backgroundColor: previewTheme.colors.peach },
                        ]}
                      />
                    </View>

                    <View style={styles.paletteCopy}>
                      <Text style={[styles.paletteTitle, { color: theme.colors.text }]}>
                        {paletteItem.title}
                      </Text>
                      <Text style={[styles.paletteDescription, { color: theme.colors.textMuted }]}>
                        {paletteItem.description}
                      </Text>
                    </View>

                    {palette === paletteId ? (
                      <View
                        style={[
                          styles.activePill,
                          { backgroundColor: previewTheme.colors.primaryDeep },
                        ]}
                      >
                        <Feather color={previewTheme.colors.white} name="check" size={14} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceStrong }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {copy.settings.previewTitle}
            </Text>

            <View style={styles.previewCard}>
              <LinearGradient
                colors={theme.primaryGradient}
                end={{ x: 1, y: 0.2 }}
                start={{ x: 0, y: 1 }}
                style={styles.previewGradient}
              >
                <Text style={[styles.previewButtonLabel, { color: theme.colors.white }]}>
                  {copy.home.createEvent}
                </Text>
              </LinearGradient>

              <View style={styles.previewMetaRow}>
                <View
                  style={[
                    styles.previewChip,
                    { backgroundColor: theme.colors.primarySoft },
                  ]}
                >
                  <Feather color={theme.colors.primaryDeep} name="globe" size={14} />
                  <Text style={[styles.previewChipLabel, { color: theme.colors.primaryDeep }]}>
                    {language.toUpperCase()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.previewChip,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Feather color={theme.colors.textMuted} name="moon" size={14} />
                  <Text style={[styles.previewChipLabel, { color: theme.colors.textMuted }]}>
                    {mode === 'dark' ? copy.settings.themeModeDark : copy.settings.themeModeLight}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenFrame>
  );
}

function SegmentOption({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentOption,
        {
          backgroundColor: active ? theme.colors.primaryDeep : theme.colors.surface,
          borderColor: active ? theme.colors.primaryDeep : theme.colors.ghostBorder,
        },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={[
          styles.segmentLabel,
          { color: active ? theme.colors.white : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
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
    fontSize: 20,
  },
  sectionCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  segmentLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  paletteColumn: {
    gap: spacing.sm,
  },
  paletteCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  palettePreviewRow: {
    width: 58,
    gap: spacing.xs,
    alignItems: 'center',
  },
  paletteSwatchLarge: {
    width: 44,
    height: 26,
    borderRadius: 999,
  },
  paletteSwatchSmall: {
    width: 32,
    height: 10,
    borderRadius: 999,
  },
  paletteCopy: {
    flex: 1,
    gap: 2,
  },
  paletteTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
  },
  paletteDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  activePill: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    gap: spacing.md,
  },
  previewGradient: {
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  previewButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    letterSpacing: 1,
  },
  previewMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  previewChipLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
