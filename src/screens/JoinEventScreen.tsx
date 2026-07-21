import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { colors, spacing } from '../theme/tokens';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type JoinEventRoute = RouteProp<RootStackParamList, 'JoinEvent'>;

const RETRY_INTERVAL_MS = 350;
const MAX_ATTEMPTS = 14;

export function JoinEventScreen() {
  const { copy } = useLocale();
  const { getEventByShareToken } = useEvents();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<JoinEventRoute>();
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const attempt = () => {
      if (cancelled) {
        return;
      }

      const event = getEventByShareToken(route.params.token);

      if (event) {
        navigation.replace('EventDetail', { eventId: event.id });
        return;
      }

      attemptsRef.current += 1;

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        Alert.alert(copy.home.joinLinkNotFoundTitle, copy.home.joinLinkNotFoundBody, [
          {
            onPress: () => navigation.replace('Home'),
          },
        ]);
        return;
      }

      setTimeout(attempt, RETRY_INTERVAL_MS);
    };

    attempt();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.token]);

  return (
    <ScreenFrame>
      <View style={styles.container}>
        <ActivityIndicator color={colors.primaryDeep} size="large" />
        <Text style={styles.copy}>{copy.home.joinLinkSearching}</Text>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  copy: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.textMuted,
  },
});
