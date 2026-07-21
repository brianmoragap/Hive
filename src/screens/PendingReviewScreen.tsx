import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  AppState,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, spacing } from '../theme/tokens';

const POLL_INTERVAL_MS = 20000;

export function PendingReviewScreen() {
  const { copy } = useLocale();
  const { debugApproveProfile, isMockMode, profile, refreshProfile, signOut } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  return (
    <ScreenFrame>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.primaryDeep]}
            onRefresh={() => void handleManualRefresh()}
            refreshing={isRefreshing}
            tintColor={colors.primaryDeep}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopyBlock}>
              <Text style={styles.kicker}>{copy.pending.kicker}</Text>
              <Text style={styles.title}>{copy.pending.title}</Text>
            </View>
          </View>
          <Text style={styles.copy}>{copy.pending.copy}</Text>
        </View>

        <GlassPanel>
          <View style={styles.statusBadge}>
            <View style={styles.statusIcon}>
              <Feather color={colors.primaryDeep} name="shield" size={22} />
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

          <PrimaryButton
            label={copy.common.closeSession}
            onPress={() => void signOut()}
            variant="secondary"
          />

          {isMockMode ? (
            <PrimaryButton
              label={copy.pending.demoApprove}
              onPress={() => void debugApproveProfile()}
              style={styles.demoButton}
            />
          ) : null}
        </GlassPanel>

        <GlassPanel>
          <Text style={styles.tipTitle}>{copy.pending.safetyTipsTitle}</Text>
          <View style={styles.tipList}>
            {copy.pending.safetyTips.map((tip) => (
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
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroCopyBlock: {
    flex: 1,
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
