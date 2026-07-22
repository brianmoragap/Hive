import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { useEvents } from '../providers/EventsProvider';
import { useSession } from '../providers/SessionProvider';
import type { EventMessage } from '../types/domain';

interface EventMessageRow {
  id: string;
  event_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

function localKey(eventId: string) {
  return `@hive/event-chat/${eventId}`;
}

function createLocalId() {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Loads and sends the group chat for a single event. Persists to Supabase when
 * configured (with live updates via Realtime), otherwise falls back to a local
 * AsyncStorage history so the demo mode still keeps the conversation.
 */
export function useEventChat(eventId: string) {
  const { user, profile } = useSession();
  const { hiveMembers } = useEvents();
  const isRemote = hasSupabaseConfig && Boolean(supabase);

  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAuthor = useCallback(
    (userId: string): { name: string; avatar: string | null } => {
      if (user && userId === user.id) {
        return { name: profile?.fullName?.trim() || 'Tú', avatar: profile?.avatarUrl ?? null };
      }
      const member = hiveMembers.find((candidate) => candidate.id === userId);
      return {
        name: member?.fullName?.trim() || 'Miembro Hive',
        avatar: member?.avatarUrl ?? null,
      };
    },
    [hiveMembers, profile?.avatarUrl, profile?.fullName, user],
  );

  const toMessage = useCallback(
    (row: EventMessageRow): EventMessage => {
      const author = resolveAuthor(row.user_id);
      return {
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        authorName: author.name,
        authorAvatarUrl: author.avatar,
        body: row.body,
        createdAt: row.created_at,
        isMine: Boolean(user && row.user_id === user.id),
      };
    },
    [resolveAuthor, user],
  );

  // Stable ref so the realtime handler always uses the latest mapper.
  const toMessageRef = useRef(toMessage);
  toMessageRef.current = toMessage;

  // Load the chat history.
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (isRemote && supabase) {
          const { data, error: fetchError } = await supabase
            .from('event_messages')
            .select('id, event_id, user_id, body, created_at')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });
          if (fetchError) {
            throw fetchError;
          }
          if (!active) {
            return;
          }
          setMessages((data ?? []).map((row) => toMessageRef.current(row as EventMessageRow)));
        } else {
          const stored = await AsyncStorage.getItem(localKey(eventId));
          if (!active) {
            return;
          }
          const rows = stored ? (JSON.parse(stored) as EventMessageRow[]) : [];
          setMessages(rows.map((row) => toMessageRef.current(row)));
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'No pudimos cargar el chat.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [eventId, isRemote]);

  // Live updates for remote mode.
  useEffect(() => {
    if (!isRemote || !supabase) {
      return;
    }

    const client = supabase;
    const channel = client
      .channel(`event-messages-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as EventMessageRow;
          setMessages((prev) => {
            if (prev.some((message) => message.id === row.id)) {
              return prev;
            }
            // Drop the optimistic copy of our own just-sent message, if present.
            const withoutPending = prev.filter(
              (message) => !(message.pending && message.userId === row.user_id && message.body === row.body),
            );
            return [...withoutPending, toMessageRef.current(row)];
          });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [eventId, isRemote]);

  const sendMessage = useCallback(
    async (rawBody: string) => {
      const body = rawBody.trim();
      if (!body || !user) {
        return;
      }

      setSending(true);
      setError(null);

      const optimisticId = createLocalId();
      const author = resolveAuthor(user.id);
      const optimistic: EventMessage = {
        id: optimisticId,
        eventId,
        userId: user.id,
        authorName: author.name,
        authorAvatarUrl: author.avatar,
        body,
        createdAt: new Date().toISOString(),
        isMine: true,
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        if (isRemote && supabase) {
          const { data, error: insertError } = await supabase
            .from('event_messages')
            .insert({ event_id: eventId, user_id: user.id, body })
            .select('id, event_id, user_id, body, created_at')
            .single();
          if (insertError) {
            throw insertError;
          }
          const saved = toMessageRef.current(data as EventMessageRow);
          setMessages((prev) =>
            prev.some((message) => message.id === saved.id)
              ? prev.filter((message) => message.id !== optimisticId)
              : prev.map((message) => (message.id === optimisticId ? saved : message)),
          );
        } else {
          setMessages((prev) => {
            const next = prev.map((message) =>
              message.id === optimisticId ? { ...message, pending: false } : message,
            );
            const rows: EventMessageRow[] = next.map((message) => ({
              id: message.id,
              event_id: message.eventId,
              user_id: message.userId,
              body: message.body,
              created_at: message.createdAt,
            }));
            void AsyncStorage.setItem(localKey(eventId), JSON.stringify(rows));
            return next;
          });
        }
      } catch (sendError) {
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        setError(sendError instanceof Error ? sendError.message : 'No pudimos enviar el mensaje.');
      } finally {
        setSending(false);
      }
    },
    [eventId, isRemote, resolveAuthor, user],
  );

  return { messages, loading, sending, error, sendMessage };
}
