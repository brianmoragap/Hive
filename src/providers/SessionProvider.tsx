import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { hasSupabaseConfig, supabase } from '../lib/supabase';
import type {
  AuthCredentials,
  SessionUser,
  UserProfile,
  VerificationPayload,
} from '../types/domain';
import { normalizeRut } from '../utils/rut';

const MOCK_SESSION_KEY = '@hive/mock-session';
const MOCK_PROFILE_KEY = '@hive/mock-profile';

interface SessionContextValue {
  initializing: boolean;
  isMockMode: boolean;
  profile: UserProfile | null;
  user: SessionUser | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  submitVerification: (payload: VerificationPayload) => Promise<void>;
  debugApproveProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function createLocalId() {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildBaseProfile(user: SessionUser, seed?: Partial<UserProfile>): UserProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: '',
    rut: '',
    avatarUrl: null,
    isVerified: false,
    verificationStatus: 'unsubmitted',
    eventsAttended: 0,
    favoriteSports: [],
    idFrontUri: null,
    idSerialUri: null,
    createdAt: user.createdAt,
    ...seed,
  };
}

function mapSupabaseUser(input: { id: string; email?: string | null; created_at?: string }) {
  return {
    id: input.id,
    email: input.email ?? '',
    createdAt: input.created_at ?? new Date().toISOString(),
  } satisfies SessionUser;
}

function mapProfileRow(row: any, fallbackUser: SessionUser): UserProfile {
  return {
    id: row?.id ?? fallbackUser.id,
    email: row?.email ?? fallbackUser.email,
    fullName: row?.full_name ?? '',
    rut: row?.rut ?? '',
    avatarUrl: row?.avatar_url ?? null,
    isVerified: Boolean(row?.is_verified),
    verificationStatus: row?.verification_status ?? 'unsubmitted',
    eventsAttended: row?.events_attended_count ?? 0,
    favoriteSports: row?.favorite_sports ?? [],
    idFrontUri: null,
    idSerialUri: null,
    createdAt: row?.created_at ?? fallbackUser.createdAt,
  };
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no esta configurado.');
  }

  return supabase;
}

async function uploadVerificationAsset(userId: string, uri: string, kind: 'front' | 'serial') {
  const client = getSupabaseClient();

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const contentType =
    extension === 'png'
      ? 'image/png'
      : extension === 'heic' || extension === 'heif'
        ? 'image/heic'
        : 'image/jpeg';
  const path = `${userId}/${kind}-${Date.now()}.${extension}`;

  const { error } = await client.storage
    .from('verification-docs')
    .upload(path, decode(base64), {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return path;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const isMockMode = !hasSupabaseConfig || !supabase;

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    if (isMockMode) {
      const storedProfile = await AsyncStorage.getItem(MOCK_PROFILE_KEY);

      if (!storedProfile) {
        const nextProfile = buildBaseProfile(user);
        setProfile(nextProfile);
        await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
        return;
      }

      setProfile(JSON.parse(storedProfile) as UserProfile);
      return;
    }

    const client = getSupabaseClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (error) {
      throw error;
    }

    setProfile(data ? mapProfileRow(data, user) : buildBaseProfile(user));
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (isMockMode) {
        const storedSession = await AsyncStorage.getItem(MOCK_SESSION_KEY);
        const storedProfile = await AsyncStorage.getItem(MOCK_PROFILE_KEY);

        if (!active) {
          return;
        }

        const nextUser = storedSession ? (JSON.parse(storedSession) as SessionUser) : null;
        const nextProfile = storedProfile ? (JSON.parse(storedProfile) as UserProfile) : null;

        setUser(nextUser);
        setProfile(nextProfile);
        setInitializing(false);
        return;
      }

      const client = getSupabaseClient();
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!active) {
        return;
      }

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        const { data } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (active) {
          setProfile(data ? mapProfileRow(data, mappedUser) : buildBaseProfile(mappedUser));
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      if (active) {
        setInitializing(false);
      }
    }

    void bootstrap();

    if (isMockMode) {
      return () => {
        active = false;
      };
    }

    const client = getSupabaseClient();
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      const mappedUser = mapSupabaseUser(session.user);
      setUser(mappedUser);

      void client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!active) {
            return;
          }

          setProfile(data ? mapProfileRow(data, mappedUser) : buildBaseProfile(mappedUser));
          setInitializing(false);
        });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [isMockMode]);

  const signIn = async ({ email, password }: AuthCredentials) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      throw new Error('Ingresa tu email y password.');
    }

    if (isMockMode) {
      const nextUser: SessionUser = {
        id: createLocalId(),
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      };
      const nextProfile = buildBaseProfile(
        nextUser,
        profile?.email === trimmedEmail ? profile : undefined,
      );

      setUser(nextUser);
      setProfile(nextProfile);
      await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(nextUser));
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
      return;
    }

    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No se pudo iniciar sesion.');
    }

    const mappedUser = mapSupabaseUser(data.user);
    setUser(mappedUser);
    const { data: profileRow, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    setProfile(profileRow ? mapProfileRow(profileRow, mappedUser) : buildBaseProfile(mappedUser));
  };

  const signUp = async ({ email, password }: AuthCredentials) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || password.length < 6) {
      throw new Error('Usa un email valido y una password de al menos 6 caracteres.');
    }

    if (isMockMode) {
      const nextUser: SessionUser = {
        id: createLocalId(),
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      };
      const nextProfile = buildBaseProfile(nextUser);

      setUser(nextUser);
      setProfile(nextProfile);
      await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(nextUser));
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
      return;
    }

    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session || !data.user) {
      throw new Error(
        'La cuenta fue creada, pero tu proyecto de Supabase exige confirmacion de email antes de entrar.',
      );
    }

    const mappedUser = mapSupabaseUser(data.user);
    setUser(mappedUser);
    setProfile(buildBaseProfile(mappedUser));
  };

  const signOut = async () => {
    if (isMockMode) {
      await AsyncStorage.multiRemove([MOCK_SESSION_KEY, MOCK_PROFILE_KEY]);
      setUser(null);
      setProfile(null);
      return;
    }

    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
  };

  const submitVerification = async (payload: VerificationPayload) => {
    if (!user) {
      throw new Error('No hay una sesion activa.');
    }

    const nextProfile = buildBaseProfile(user, {
      ...profile,
      fullName: payload.fullName.trim(),
      rut: normalizeRut(payload.rut),
      isVerified: false,
      verificationStatus: 'pending',
      idFrontUri: payload.idFrontUri,
      idSerialUri: payload.idSerialUri,
    });

    if (isMockMode) {
      setProfile(nextProfile);
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
      return;
    }

    const frontPath = await uploadVerificationAsset(user.id, payload.idFrontUri, 'front');
    const serialPath = await uploadVerificationAsset(user.id, payload.idSerialUri, 'serial');

    const client = getSupabaseClient();
    const { error: profileError } = await client.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: payload.fullName.trim(),
      rut: normalizeRut(payload.rut),
      is_verified: false,
      verification_status: 'pending',
    });

    if (profileError) {
      throw profileError;
    }

    const { error: verificationError } = await client.from('verification_submissions').insert({
      user_id: user.id,
      full_name: payload.fullName.trim(),
      rut: normalizeRut(payload.rut),
      front_document_path: frontPath,
      serial_document_path: serialPath,
      status: 'pending',
    });

    if (verificationError) {
      throw verificationError;
    }

    await refreshProfile();
  };

  const debugApproveProfile = async () => {
    if (!profile) {
      return;
    }

    if (isMockMode) {
      const nextProfile: UserProfile = {
        ...profile,
        isVerified: true,
        verificationStatus: 'approved',
      };

      setProfile(nextProfile);
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
      return;
    }

    throw new Error('La aprobacion debe ocurrir desde el panel de revision.');
  };

  const value = useMemo(
    () => ({
      initializing,
      isMockMode,
      profile,
      user,
      signIn,
      signOut,
      signUp,
      submitVerification,
      debugApproveProfile,
      refreshProfile,
    }),
    [initializing, isMockMode, profile, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider.');
  }

  return context;
}
