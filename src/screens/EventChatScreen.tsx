import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenFrame } from '../components/ScreenFrame';
import { useEventChat } from '../hooks/useEventChat';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useEvents } from '../providers/EventsProvider';
import { useLocale } from '../providers/LocaleProvider';
import { useAppTheme } from '../providers/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

type ChatRoute = RouteProp<RootStackParamList, 'EventChat'>;
type ChatNavigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Tap-to-insert emojis. The iOS Simulator cannot receive emojis from the Mac
 * emoji picker over the hardware keyboard, so without this there is no way to
 * put one in a message while testing there.
 */
const QUICK_EMOJIS = [
  '🔥', '💪', '🏃‍♀️', '🚴‍♀️', '🥾', '🏋️‍♀️', '🎉', '👏', '💜', '😀',
  '😅', '🙌', '☀️', '🌧️', '📍', '⏰', '✅', '❌', '😍', '🤙',
];

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function EventChatScreen() {
  const route = useRoute<ChatRoute>();
  const navigation = useNavigation<ChatNavigation>();
  const { theme } = useAppTheme();
  const { copy } = useLocale();
  const { getEventById } = useEvents();

  const event = getEventById(route.params.eventId);
  const { messages, loading, sending, error, sendMessage } = useEventChat(route.params.eventId);
  const [draft, setDraft] = useState('');
  const [emojiBarVisible, setEmojiBarVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timeout = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timeout);
  }, [messages.length]);

  const canSend = Boolean(draft.trim()) && !sending;

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) {
      return;
    }
    setDraft('');
    await sendMessage(body);
  };

  return (
    <ScreenFrame contentStyle={styles.frame}>
      <StatusBar style={theme.statusBarStyle} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.panelBorder }]}>
          <Pressable hitSlop={12} onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather color={theme.colors.text} name="arrow-left" size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.colors.text }]}>
              {copy.eventChat.title}
            </Text>
            {event?.title ? (
              <Text numberOfLines={1} style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
                {event.title}
              </Text>
            ) : null}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.empty}>
                <Feather color={theme.colors.textMuted} name="message-circle" size={30} />
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  {copy.eventChat.empty}
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message.id}
                  style={[styles.row, message.isMine ? styles.rowMine : styles.rowOther]}
                >
                  <View
                    style={[
                      styles.bubble,
                      message.isMine
                        ? [styles.bubbleMine, { backgroundColor: theme.colors.primary }]
                        : [styles.bubbleOther, { backgroundColor: theme.colors.surfaceStrong }],
                      message.pending ? styles.bubblePending : null,
                    ]}
                  >
                    {!message.isMine ? (
                      <Text style={[styles.author, { color: theme.colors.primary }]}>
                        {message.authorName}
                      </Text>
                    ) : null}
                    <Text
                      style={[
                        styles.body,
                        { color: message.isMine ? theme.colors.white : theme.colors.text },
                      ]}
                    >
                      {message.body}
                    </Text>
                    <Text
                      style={[
                        styles.time,
                        {
                          color: message.isMine
                            ? 'rgba(255, 255, 255, 0.78)'
                            : theme.colors.textMuted,
                        },
                      ]}
                    >
                      {message.pending ? copy.eventChat.sending : formatTime(message.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}

        {emojiBarVisible ? (
          <View
            style={[
              styles.emojiBar,
              { borderTopColor: theme.colors.panelBorder, backgroundColor: theme.colors.surface },
            ]}
          >
            <ScrollView
              horizontal
              contentContainerStyle={styles.emojiBarContent}
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  hitSlop={6}
                  onPress={() => setDraft((current) => current + emoji)}
                  style={({ pressed }) => [
                    styles.emojiButton,
                    { backgroundColor: theme.colors.surfaceStrong },
                    pressed ? styles.emojiButtonPressed : undefined,
                  ]}
                >
                  <Text style={styles.emojiGlyph}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View
          style={[
            styles.inputRow,
            { borderTopColor: theme.colors.panelBorder, backgroundColor: theme.colors.surface },
          ]}
        >
          <Pressable
            onPress={() => setEmojiBarVisible((current) => !current)}
            style={[
              styles.emojiToggle,
              {
                backgroundColor: emojiBarVisible
                  ? theme.colors.primarySoft
                  : theme.colors.inputBackground,
              },
            ]}
          >
            <Feather
              color={emojiBarVisible ? theme.colors.primaryDeep : theme.colors.textSoft}
              name="smile"
              size={20}
            />
          </Pressable>

          <TextInput
            multiline
            onChangeText={setDraft}
            placeholder={copy.eventChat.placeholder}
            placeholderTextColor={theme.colors.inputPlaceholder}
            selectionColor={theme.colors.primary}
            style={[
              styles.input,
              { backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
            ]}
            value={draft}
          />
          <Pressable
            disabled={!canSend}
            onPress={handleSend}
            style={[styles.send, { backgroundColor: theme.colors.primary, opacity: canSend ? 1 : 0.5 }]}
          >
            <Feather color={theme.colors.white} name="send" size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    maxWidth: 260,
    textAlign: 'center',
    // System font (no custom fontFamily) so emojis render on iOS instead of ".notdef" (?).
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    gap: 2,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    borderBottomLeftRadius: 6,
  },
  bubblePending: {
    opacity: 0.7,
  },
  author: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  body: {
    // System font so message text renders emojis (and every unicode char) on iOS.
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    alignSelf: 'flex-end',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    marginTop: 2,
  },
  error: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
  emojiBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emojiBarContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  emojiGlyph: {
    // System font: the custom family has no emoji glyphs and iOS would draw
    // ".notdef" boxes instead of falling back like the browser does.
    fontSize: 22,
    lineHeight: 28,
  },
  emojiToggle: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    // System font so what the user types (emojis included) renders correctly.
    fontWeight: '500',
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
