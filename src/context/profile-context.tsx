import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { normalizeUsername, validateUsername } from '@/constants/profile';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileInput } from '@/types/profile';

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  loadingError: string;
  refreshProfile: () => Promise<void>;
  createProfile: (input: ProfileInput) => Promise<Profile>;
  updateProfile: (input: ProfileInput) => Promise<Profile>;
};

const PROFILE_COLUMNS =
  'id, username, display_name, bio, avatar_url, created_at, updated_at';

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function profileMutationError(error: { code?: string; message?: string }) {
  if (error.code === '23505') {
    return new Error('That username is already taken. Try another one.');
  }

  if (error.code === '23514') {
    return new Error('Use 3-30 lowercase letters, numbers, or underscores for your username.');
  }

  console.error('Unable to save profile:', error.message ?? error);
  return new Error('Unable to save your profile. Check your connection and try again.');
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetchProfile = useCallback(async (userId: string) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setLoadingError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (currentRequestId === requestId.current) {
        setProfile(data ? toProfile(data as ProfileRow) : null);
        setLoadedUserId(userId);
      }
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      console.error('Unable to fetch profile:', error);
      setProfile(null);
      setLoadedUserId(userId);
      setLoadingError('Unable to load your profile. Check your connection and try again.');
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      requestId.current += 1;
      setProfile(null);
      setLoadedUserId(null);
      setLoadingError('');
      setIsLoading(false);
      return;
    }

    void fetchProfile(user.id);
  }, [fetchProfile, isAuthLoading, user]);

  function requireUserId() {
    if (!user) {
      throw new Error('Your session has ended. Please sign in again.');
    }

    return user.id;
  }

  function prepareInput(input: ProfileInput) {
    const username = normalizeUsername(input.username);
    const validationError = validateUsername(username);

    if (validationError) {
      throw new Error(validationError);
    }

    return {
      username,
      displayName: input.displayName.trim(),
      bio: input.bio.trim(),
    };
  }

  async function refreshProfile() {
    await fetchProfile(requireUserId());
  }

  async function createProfile(input: ProfileInput) {
    const userId = requireUserId();
    const preparedInput = prepareInput(input);
    let response;

    try {
      response = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: preparedInput.username,
          display_name: preparedInput.displayName,
          bio: preparedInput.bio,
        })
        .select(PROFILE_COLUMNS)
        .single();
    } catch (error) {
      console.error('Unable to create profile:', error);
      throw new Error('Unable to save your profile. Check your connection and try again.');
    }

    const { data, error } = response;

    if (error) {
      throw profileMutationError(error);
    }

    const newProfile = toProfile(data as ProfileRow);
    setProfile(newProfile);
    setLoadedUserId(userId);
    return newProfile;
  }

  async function updateProfile(input: ProfileInput) {
    const userId = requireUserId();
    const preparedInput = prepareInput(input);
    let response;

    try {
      response = await supabase
        .from('profiles')
        .update({
          username: preparedInput.username,
          display_name: preparedInput.displayName,
          bio: preparedInput.bio,
        })
        .eq('id', userId)
        .select(PROFILE_COLUMNS)
        .maybeSingle();
    } catch (error) {
      console.error('Unable to update profile:', error);
      throw new Error('Unable to save your profile. Check your connection and try again.');
    }

    const { data, error } = response;

    if (error) {
      throw profileMutationError(error);
    }

    if (!data) {
      throw new Error('Your profile was not found. Please complete profile setup first.');
    }

    const updatedProfile = toProfile(data as ProfileRow);
    setProfile(updatedProfile);
    return updatedProfile;
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading: isLoading || Boolean(user && loadedUserId !== user.id),
        loadingError,
        refreshProfile,
        createProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used inside ProfileProvider.');
  }

  return context;
}
