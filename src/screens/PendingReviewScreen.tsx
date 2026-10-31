import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { hiveColors, hiveFonts } from '../theme/hiveBrand';
import { radii, spacing } from '../theme/tokens';

const POLL_INTERVAL_MS = 20000;

const logoImage = require('../../assets/images/hive-logo-black.png');
const logoAspectRatio = 880 / 268;
const logoWidth = 104;
const logoHeight = Math.round(logoWidth / logoAspectRatio);

export function PendingReviewScreen() {
  const { copy } = useLocale();
  const {
    debugApproveProfile,
    isMockMode,
    profile,
    refreshProfile,
    returnToVerificationEdit,
    signOut,
  } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const refreshProfileRef = useRef(refreshProfile);
  refreshProfileRef.current = refreshProfile;

  useEffect(() => {
    let cancelled = false;

    const safeRefresh = async () => {
      try {
        await refreshProfileRef.current();
      } catch (error) {
        if (!cancelled) {
          console.warn('Hive pending review refresh failed.', error);
        }
      }
    };

    void safeRefresh();

    const intervalId = setInterval(() => {
      void safeRefresh();
    }, POLL_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void safeRefresh();
      }
    });

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);

    try {
      await refreshProfile();
    } catch (error) {
      console.warn('Hive pending review manual refresh failed.', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditPress = () => {
    Alert.alert(copy.pending.editConfirmTitle, copy.pending.editConfirmBody, [
      { style: 'cancel', text: copy.common.cancel },
      {
        onPress: () => {
          void (async () => {
            try {
              setEditing(true);
              await returnToVerificationEdit();
            } catch (error) {
              console.warn('Hive return to verification edit failed.', error);
            } finally {
              setEditing(false);
            }
          })();
        },
        text: copy.pending.editCta,
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              colors={[hiveColors.fucsia]}
              onRefresh={() => void handleManualRefresh()}
              refreshing={isRefreshing}
              tintColor={hiveColors.fucsia}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Image resizeMode="contain" source={logoImage} style={styles.logo} />

          <View style={styles.hero}>
            <Text style={styles.kicker}>{copy.pending.kicker}</Text>
            <Text style={styles.title}>{copy.pending.title}</Text>
            <Text style={styles.copy}>{copy.pending.copy}</Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.statusBadge}>
              <View style={styles.statusIcon}>
                <Feather color={hiveColors.textLimaDark} name="shield" size={22} />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>{copy.pending.status}</Text>
                <Text style={styles.statusText}>{copy.pending.reviewOnly}</Text>
              </View>
            </View>

            <View style={styles.identityCard}>
              <Text style={styles.identityLabel}>{copy.pending.identityTitle}</Text>
              <Text style={styles.identityValue}>{profile?.fullName || copy.common.pending}</Text>
              <Text style={styles.identityLabel}>RUT</Text>
              <Text style={styles.identityValue}>{profile?.rut || copy.common.pending}</Text>
            </View>

            <View style={styles.timeline}>
              <Text style={styles.timelineTitle}>{copy.pending.timelineTitle}</Text>
              {copy.pending.timeline.map((step) => (
                <Text key={step} style={styles.timelineText}>
                  {step}
                </Text>
              ))}
            </View>

            <Pressable
              disabled={editing}
              onPress={handleEditPress}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !editing ? styles.secondaryButtonPressed : undefined,
                editing ? styles.buttonDisabled : undefined,
              ]}
            >
              <Feather color={hiveColors.negro} name="arrow-left" size={15} />
              <Text style={styles.secondaryButtonLabel}>{copy.pending.editCta}</Text>
            </Pressable>

            <Pressable onPress={() => void signOut()} style={styles.ghostButton}>
              <Text style={styles.ghostButtonLabel}>{copy.common.closeSession}</Text>
            </Pressable>

            {isMockMode ? (
              <Pressable
                onPress={() => void debugApproveProfile()}
                style={({ pressed }) => [
                  styles.demoButton,
                  pressed ? styles.demoButtonPressed : undefined,
                ]}
              >
                <Text style={styles.demoButtonLabel}>{copy.pending.demoApprove}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.panel}>
            <Text style={styles.tipTitle}>{copy.pending.safetyTipsTitle}</Text>
            <View style={styles.tipList}>
              {copy.pending.safetyTips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: hiveColors.offwhite,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  logo: {
    width: logoWidth,
    height: logoHeight,
  },
  hero: {
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: hiveColors.fucsia,
  },
  title: {
    maxWidth: 320,
    fontFamily: hiveFonts.heavy,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.5,
    color: hiveColors.negro,
  },
  copy: {
    maxWidth: 320,
    fontFamily: hiveFonts.normal,
    fontSize: 15,
    lineHeight: 23,
    color: hiveColors.grisMedio,
  },
  panel: {
    borderRadius: 32,
    backgroundColor: hiveColors.blanco,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: hiveColors.negro,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.limaTints[100],
  },
  statusCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  statusTitle: {
    fontFamily: hiveFonts.heavy,
    fontSize: 20,
    color: hiveColors.negro,
  },
  statusText: {
    fontFamily: hiveFonts.normal,
    fontSize: 14,
    lineHeight: 21,
    color: hiveColors.grisMedio,
  },
  identityCard: {
    gap: spacing.xs,
    borderRadius: 24,
    backgroundColor: hiveColors.offwhite,
    padding: spacing.lg,
  },
  identityLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: hiveColors.grisMedio,
  },
  identityValue: {
    fontFamily: hiveFonts.bold,
    fontSize: 16,
    color: hiveColors.negro,
  },
  timeline: {
    gap: spacing.xs,
  },
  timelineTitle: {
    fontFamily: hiveFonts.bold,
    fontSize: 15,
    color: hiveColors.negro,
  },
  timelineText: {
    fontFamily: hiveFonts.normal,
    fontSize: 14,
    lineHeight: 22,
    color: hiveColors.grisMedio,
  },
  secondaryButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.blanco,
    borderWidth: 1.5,
    borderColor: hiveColors.negro,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    color: hiveColors.negro,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  ghostButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonLabel: {
    fontFamily: hiveFonts.demiBold,
    fontSize: 13,
    color: hiveColors.fucsia,
  },
  demoButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hiveColors.fucsia,
    marginTop: spacing.xs,
  },
  demoButtonPressed: {
    opacity: 0.92,
  },
  demoButtonLabel: {
    fontFamily: hiveFonts.bold,
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: hiveColors.blanco,
  },
  tipTitle: {
    fontFamily: hiveFonts.heavy,
    fontSize: 20,
    color: hiveColors.negro,
  },
  tipList: {
    gap: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    marginTop: 7,
    backgroundColor: hiveColors.lima,
  },
  tipText: {
    flex: 1,
    fontFamily: hiveFonts.normal,
    fontSize: 14,
    lineHeight: 22,
    color: hiveColors.grisMedio,
  },
});
