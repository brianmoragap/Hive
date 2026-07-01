import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuSheet } from '../components/AccountMenuSheet';
import { AppFooterTabs, APP_FOOTER_HEIGHT } from '../components/AppFooterTabs';
import { AppHeader } from '../components/AppHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { AppTab, HiveMember } from '../types/domain';
import { handleAppTabPress } from '../utils/appNavigation';
import { formatNotificationLine } from '../utils/events';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type InviteMembersRoute = RouteProp<RootStackParamList, 'InviteMembers'>;

export function InviteMembersScreen() {
  const { copy } = useLocale();
  const { signOut } = useSession();
  const {
    buildShareLink,
    getEventById,
    hiveMembers,
    inviteMembers,
    markAllNotificationsRead,
    notifications,
    unreadNotifications,
  } = useEvents();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<InviteMembersRoute>();
  const insets = useSafeAreaInsets();
  const entranceAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const event = getEventById(route.params.eventId);

  useEffect(() => {
    Animated.stagger(
      70,
      entranceAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [entranceAnims]);

  const getEntranceStyle = (index: number, offsetY: number) => ({
    opacity: entranceAnims[index],
    transform: [
      {
        translateY: entranceAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  });

  const availableMembers = useMemo(() => {
    if (!event) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return hiveMembers.filter((member) => {
      if (member.id === event.creatorId || event.attendeeIds.includes(member.id)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${member.fullName} ${member.handle} ${member.city}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [event, hiveMembers, query]);

  const remainingSlots = event ? Math.max(event.participantLimit - 1 - event.attendeeIds.length, 0) : 0;

  const openNotifications = () => {
    markAllNotificationsRead();
    const body = notifications.length
      ? notifications
          .slice(0, 4)
          .map((notification) => `• ${formatNotificationLine(copy, notification)}`)
          .join('\n')
      : copy.home.notificationsEmpty;

    Alert.alert(copy.home.notificationsTitle, body);
  };

  const toggleSelection = (member: HiveMember) => {
    setSelectedMemberIds((current) => {
      if (current.includes(member.id)) {
        return current.filter((currentId) => currentId !== member.id);
      }

      if (current.length >= remainingSlots) {
        Alert.alert(copy.inviteMembers.title, copy.inviteMembers.fullEvent);
        return current;
      }

      return [...current, member.id];
    });
  };

  const handleShareLink = async () => {
    if (!event) {
      return;
    }

    try {
      await Share.share({
        message: `${copy.inviteMembers.shareBody}\n${buildShareLink(event)}`,
        title: copy.inviteMembers.shareTitle,
      });
    } catch {
      Alert.alert(copy.myEvents.title, copy.myEvents.shareFailed);
    }
  };

  const handleInvite = async () => {
    if (!event || selectedMemberIds.length === 0) {
      return;
    }

    const result = await inviteMembers(event.id, selectedMemberIds);

    if (result.addedCount === 0) {
      Alert.alert(copy.inviteMembers.title, copy.inviteMembers.fullEvent);
      return;
    }

    Alert.alert(copy.inviteMembers.inviteSuccessTitle, copy.inviteMembers.inviteSuccessBody, [
      {
        text: copy.myEvents.title,
        onPress: () =>
          navigation.replace('MyEvents', {
            focusEventId: event.id,
            freshAction: 'invited',
          }),
      },
    ]);
  };

  if (!event) {
    return null;
  }

  return (
    <ScreenFrame contentStyle={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <Animated.View style={getEntranceStyle(0, -18)}>
          <AppHeader
            notificationCount={unreadNotifications}
            onMenuPress={() => setMenuVisible(true)}
            onNotificationsPress={openNotifications}
          />
        </Animated.View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: APP_FOOTER_HEIGHT + insets.bottom + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.heroCard, getEntranceStyle(1, 20)]}>
            <Text style={styles.heroTitle}>{copy.inviteMembers.title}</Text>
            <Text style={styles.heroCopy}>{copy.inviteMembers.copy}</Text>
            <View style={styles.heroMetaRow}>
              <HeroFact label={event.title} />
              <HeroFact label={`${event.attendeeIds.length + 1}/${event.participantLimit}`} />
              <HeroFact
                label={
                  event.visibility === 'private'
                    ? copy.myEvents.privateBadge
                    : copy.myEvents.publicBadge
                }
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.shareCard, getEntranceStyle(2, 28)]}>
            <Text style={styles.shareTitle}>{copy.inviteMembers.shareTitle}</Text>
            <Text style={styles.shareCopy}>{copy.inviteMembers.shareBody}</Text>
            <Pressable
              onPress={handleShareLink}
              style={({ pressed }) => [styles.shareButton, pressed ? styles.cardPressed : undefined]}
            >
              <Feather color={colors.white} name="share-2" size={18} />
              <Text style={styles.shareButtonLabel}>{copy.myEvents.shareAction}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.listCard, getEntranceStyle(3, 34)]}>
            <View style={styles.searchShell}>
              <Feather color={colors.textSoft} name="search" size={16} />
              <TextInput
                onChangeText={setQuery}
                placeholder={copy.inviteMembers.searchPlaceholder}
                placeholderTextColor="rgba(125, 90, 98, 0.55)"
                selectionColor={colors.primary}
                style={styles.searchInput}
                value={query}
              />
            </View>

            <Text style={styles.selectedLabel}>
              {selectedMemberIds.length} {copy.inviteMembers.selectedCounter}
            </Text>

            <View style={styles.memberList}>
              {availableMembers.length === 0 ? (
                <Text style={styles.emptyLabel}>{copy.inviteMembers.empty}</Text>
              ) : (
                availableMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    selected={selectedMemberIds.includes(member.id)}
                    onPress={() => toggleSelection(member)}
                  />
                ))
              )}
            </View>

            <Pressable
              disabled={selectedMemberIds.length === 0}
              onPress={() => void handleInvite()}
              style={({ pressed }) => [
                styles.inviteButton,
                selectedMemberIds.length === 0 ? styles.inviteButtonDisabled : undefined,
                pressed && selectedMemberIds.length > 0 ? styles.cardPressed : undefined,
              ]}
            >
              <Feather color={colors.white} name="user-plus" size={18} />
              <Text style={styles.inviteButtonLabel}>{copy.inviteMembers.inviteCta}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <AppFooterTabs
          activeTab="activity"
          bottomInset={insets.bottom}
          onTabPress={(nextTab: AppTab) =>
            handleAppTabPress('activity', nextTab, copy, navigation)
          }
        />

        <AccountMenuSheet
          onClose={() => setMenuVisible(false)}
          onOpenMyEvents={() => navigation.navigate('MyEvents')}
          onOpenProfile={() => navigation.navigate('Profile')}
          onOpenSettings={() => navigation.navigate('Settings')}
          onSignOut={() => {
            void signOut();
          }}
          visible={menuVisible}
        />
      </View>
    </ScreenFrame>
  );
}

function HeroFact({ label }: { label: string }) {
  return (
    <View style={styles.heroFact}>
      <Text style={styles.heroFactLabel}>{label}</Text>
    </View>
  );
}

function MemberRow({
  member,
  onPress,
  selected,
}: {
  member: HiveMember;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.memberRow,
        selected ? styles.memberRowSelected : undefined,
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarLabel}>{member.fullName.slice(0, 1)}</Text>
      </View>
      <View style={styles.memberCopyBlock}>
        <Text style={styles.memberName}>{member.fullName}</Text>
        <Text style={styles.memberMeta}>
          {member.handle} · {member.city}
        </Text>
      </View>
      <View style={[styles.memberCheck, selected ? styles.memberCheckSelected : undefined]}>
        {selected ? <Feather color={colors.white} name="check" size={14} /> : null}
      </View>
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
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  heroCard: {
    borderRadius: 30,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    gap: spacing.md,
    ...shadows.card,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
  },
  heroCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  heroFact: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 244, 244, 0.9)',
  },
  heroFactLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: colors.primaryDeep,
  },
  shareCard: {
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 240, 236, 0.86)',
    gap: spacing.sm,
  },
  shareTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.text,
  },
  shareCopy: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  shareButton: {
    marginTop: spacing.xs,
    minHeight: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  shareButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.white,
  },
  listCard: {
    borderRadius: 30,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    gap: spacing.md,
    ...shadows.card,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 244, 244, 0.88)',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  selectedLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  memberList: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 72,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 247, 245, 0.92)',
  },
  memberRowSelected: {
    backgroundColor: 'rgba(255, 222, 222, 0.88)',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 94, 94, 0.14)',
  },
  memberAvatarLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: colors.primaryDeep,
  },
  memberCopyBlock: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  memberMeta: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: colors.textSoft,
  },
  memberCheck: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(155, 122, 129, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCheckSelected: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  emptyLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.textSoft,
  },
  inviteButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  inviteButtonDisabled: {
    opacity: 0.45,
  },
  inviteButtonLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: colors.white,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
