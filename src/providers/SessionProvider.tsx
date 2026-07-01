import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { useLocale } from './LocaleProvider';
import type {
  AuthCredentials,
  CompleteOnboardingPayload,
  OnboardingDraftPayload,
  SessionUser,
  UserProfile,
  VerificationPayload,
} from '../types/domain';
import { generateVerificationCode } from '../utils/onboarding';
import { normalizeRut } from '../utils/rut';

const MOCK_SESSION_KEY = '@hive/mock-session';
const MOCK_PROFILE_KEY = '@hive/mock-profile';

interface PendingOnboardingVerification extends OnboardingDraftPayload {
  createdAt: string;
  localCode?: string;
}

interface SessionContextValue {
  initializing: boolean;
  isMockMode: boolean;
  profile: UserProfile | null;
  user: SessionUser | null;
  completeOnboarding: (payload: CompleteOnboardingPayload) => Promise<void>;
  requestPhoneVerification: (
    payload: OnboardingDraftPayload,
  ) => Promise<{ debugCode?: string }>;
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
    birthDate: '',
    fullName: '',
    rut: '',
    avatarUrl: null,
    onboardingCompleted: false,
    isVerified: false,
    phoneNumber: '',
    phoneVerified: false,
    phoneVerifiedAt: null,
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
    birthDate: row?.birth_date ?? '',
    fullName: row?.full_name ?? '',
    rut: row?.rut ?? '',
    avatarUrl: row?.avatar_url ?? null,
    onboardingCompleted: Boolean(row?.onboarding_completed),
    isVerified: Boolean(row?.is_verified),
    phoneNumber: row?.phone_number ?? '',
    phoneVerified: Boolean(row?.phone_verified),
    phoneVerifiedAt: row?.phone_verified_at ?? null,
    verificationStatus: row?.verification_status ?? 'unsubmitted',
    eventsAttended: row?.events_attended_count ?? 0,
    favoriteSports: row?.favorite_sports ?? [],
    idFrontUri: null,
    idSerialUri: null,
    createdAt: row?.created_at ?? fallbackUser.createdAt,
  };
}

function getSupabaseClient(configureSupabaseMessage: string) {
  if (!supabase) {
    throw new Error(configureSupabaseMessage);
  }

  return supabase;
}

async function uploadVerificationAsset(
  userId: string,
  uri: string,
  kind: 'front' | 'serial' | 'selfie',
  configureSupabaseMessage: string,
) {
  const client = getSupabaseClient(configureSupabaseMessage);

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
  const { copy } = useLocale();
  const [initializing, setInitializing] = useState(true);
  const [pendingOnboardingVerification, setPendingOnboardingVerification] =
    useState<PendingOnboardingVerification | null>(null);
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

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (error) {
      throw error;
    }

    setProfile(data ? mapProfileRow(data, user) : buildBaseProfile(user));
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
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

        const client = getSupabaseClient(copy.session.configureSupabase);
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!active) {
          return;
        }

        if (session?.user) {
          const mappedUser = mapSupabaseUser(session.user);
          setUser(mappedUser);

          const { data } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
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
      } catch (error) {
        console.warn('Hive Supabase bootstrap failed.', error);

        if (!active) {
          return;
        }

        setUser(null);
        setProfile(null);
        setInitializing(false);
      }
    }

    void bootstrap();

    if (isMockMode) {
      return () => {
        active = false;
      };
    }

    const client = getSupabaseClient(copy.session.configureSupabase);
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
      throw new Error(copy.session.invalidCredentials);
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

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(copy.session.signInFailed);
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
      throw new Error(copy.session.invalidRegistration);
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

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { data, error } = await client.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session || !data.user) {
      throw new Error(copy.session.accountCreatedNeedsConfirmation);
    }

    const mappedUser = mapSupabaseUser(data.user);
    setUser(mappedUser);
    setProfile(buildBaseProfile(mappedUser));
  };

  const signOut = async () => {
    if (isMockMode) {
      await AsyncStorage.multiRemove([MOCK_SESSION_KEY, MOCK_PROFILE_KEY]);
      setPendingOnboardingVerification(null);
      setUser(null);
      setProfile(null);
      return;
    }

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { error } = await client.auth.signOut();

    if (error) {
      throw error;
    }

    setPendingOnboardingVerification(null);
    setUser(null);
    setProfile(null);
  };

  const requestPhoneVerification = async (payload: OnboardingDraftPayload) => {
    if (!user || !profile) {
      throw new Error(copy.session.activeSessionRequired);
    }

    const nextPendingVerification: PendingOnboardingVerification = {
      ...payload,
      createdAt: new Date().toISOString(),
    };

    if (isMockMode) {
      const localCode = generateVerificationCode();
      setPendingOnboardingVerification({
        ...nextPendingVerification,
        localCode,
      });

      return {
        debugCode: __DEV__ ? localCode : undefined,
      };
    }

    if (!user.email) {
      throw new Error(copy.session.invalidCredentials);
    }

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { error } = await client.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw error;
    }

    setPendingOnboardingVerification(nextPendingVerification);
    return {};
  };

  const completeOnboarding = async (payload: CompleteOnboardingPayload) => {
    if (!user || !profile) {
      throw new Error(copy.session.activeSessionRequired);
    }

    if (!pendingOnboardingVerification) {
      throw new Error(copy.onboarding.codeRequestMissing);
    }

    const verifiedAt = new Date().toISOString();
    const nextProfile: UserProfile = {
      ...profile,
      avatarUrl: pendingOnboardingVerification.selfieUri,
      birthDate: pendingOnboardingVerification.birthDate,
      onboardingCompleted: true,
      phoneNumber: pendingOnboardingVerification.phoneNumber,
      phoneVerified: true,
      phoneVerifiedAt: verifiedAt,
    };

    if (isMockMode) {
      if (payload.verificationCode.trim() !== pendingOnboardingVerification.localCode) {
        throw new Error(copy.onboarding.invalidCode);
      }

      setPendingOnboardingVerification(null);
      setProfile(nextProfile);
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(nextProfile));
      return;
    }

    const client = getSupabaseClient(copy.session.configureSupabase);
    const { error: otpError } = await client.auth.verifyOtp({
      email: user.email,
      token: payload.verificationCode.trim(),
      type: 'email',
    });

    if (otpError) {
      throw new Error(copy.onboarding.invalidCode);
    }

    const selfiePath = await uploadVerificationAsset(
      user.id,
      pendingOnboardingVerification.selfieUri,
      'selfie',
      copy.session.configureSupabase,
    );

    const { error } = await client.from('profiles').upsert({
      id: user.id,
      email: user.email,
      avatar_url: selfiePath,
      birth_date: pendingOnboardingVerification.birthDate,
      onboarding_completed: true,
      phone_number: pendingOnboardingVerification.phoneNumber,
      phone_verified: true,
      phone_verified_at: verifiedAt,
    });

    if (error) {
      throw error;
    }

    setPendingOnboardingVerification(null);
    setProfile({
      ...nextProfile,
      avatarUrl: selfiePath,
    });
  };

  const submitVerification = async (payload: VerificationPayload) => {
    if (!user) {
      throw new Error(copy.session.activeSessionRequired);
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

    const frontPath = await uploadVerificationAsset(
      user.id,
      payload.idFrontUri,
      'front',
      copy.session.configureSupabase,
    );
    const serialPath = await uploadVerificationAsset(
      user.id,
      payload.idSerialUri,
      'serial',
      copy.session.configureSupabase,
    );

    const client = getSupabaseClient(copy.session.configureSupabase);
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

    throw new Error(copy.session.noReviewApprovalHere);
  };

  const value = useMemo(
    () => ({
      initializing,
      isMockMode,
      profile,
      user,
      requestPhoneVerification,
      signIn,
      signOut,
      signUp,
      completeOnboarding,
      submitVerification,
      debugApproveProfile,
      refreshProfile,
    }),
    [copy, initializing, isMockMode, pendingOnboardingVerification, profile, user],
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
