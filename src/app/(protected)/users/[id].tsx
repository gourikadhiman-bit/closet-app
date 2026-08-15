import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/profile';

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): Profile {
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

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = useCallback(async () => {
    if (!id) {
      setProfile(null);
      setErrorMessage('This profile link is invalid.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setProfile(null);
        setErrorMessage('We could not find this profile.');
        return;
      }

      setProfile(mapProfile(data as ProfileRow));
    } catch (error) {
      setProfile(null);
      setErrorMessage(
        error instanceof Error
          ? `We couldn't load this profile. ${error.message}`
          : "We couldn't load this profile. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <View style={styles.ruleLines} pointerEvents="none">
        {Array.from({ length: 27 }).map((_, index) => (
          <View key={index} style={styles.ruleLine} />
        ))}
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back to Search</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#8a1230" size="large" />
          <Text style={styles.stateText}>Opening profile...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={() => {
              void loadProfile();
            }}
            style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : profile ? (
        <View style={styles.profileCard}>
          <View style={styles.tape} />
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>
              {(profile.displayName || profile.username).charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{profile.displayName || profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || 'No bio yet.'}</Text>

          <View style={styles.countCard}>
            <Text style={styles.countNumber}>—</Text>
            <Text style={styles.countLabel}>Closet pieces</Text>
            <Text style={styles.privateNote}>Private until closet sharing is enabled</Text>
          </View>

          <Pressable
            onPress={() =>
              router.push({ pathname: '/users/[id]/closet', params: { id: profile.id } })
            }
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>View Closet</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fbf3e7' },
  content: { flexGrow: 1, minHeight: 844, paddingTop: 58, paddingHorizontal: 22, paddingBottom: 80 },
  ruleLines: { position: 'absolute', top: 40, left: 0, right: 0, gap: 27 },
  ruleLine: { height: 1, backgroundColor: '#c1c9b6', opacity: 0.3 },
  backButton: {
    zIndex: 1,
    alignSelf: 'flex-start',
    marginBottom: 22,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  backText: { color: '#251313', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  profileCard: {
    zIndex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 7,
    backgroundColor: '#fffcf2',
  },
  tape: {
    position: 'absolute',
    top: -9,
    right: 32,
    width: 66,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.76,
    transform: [{ rotate: '4deg' }],
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#8a1230',
    borderRadius: 56,
    backgroundColor: '#fbf3e7',
  },
  avatarLetter: { color: '#8a1230', fontSize: 42, fontWeight: '900' },
  displayName: { marginTop: 18, color: '#251313', fontSize: 30, fontWeight: '900', lineHeight: 36, textAlign: 'center' },
  username: { marginTop: 4, color: '#8a1230', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  bio: { marginTop: 18, color: '#251313', fontSize: 14, fontWeight: '600', lineHeight: 21, opacity: 0.72, textAlign: 'center' },
  countCard: { alignItems: 'center', marginTop: 22, padding: 14, borderWidth: 1, borderColor: '#c1c9b6', borderRadius: 5, backgroundColor: '#fbf3e7' },
  countNumber: { color: '#251313', fontSize: 26, fontWeight: '900' },
  countLabel: { marginTop: 2, color: '#8a1230', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  privateNote: { marginTop: 6, color: '#251313', fontSize: 11, fontWeight: '600', opacity: 0.58, textAlign: 'center' },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 22, borderRadius: 5, backgroundColor: '#8a1230' },
  primaryButtonText: { color: '#fffcf2', fontSize: 13, fontWeight: '900' },
  stateCard: { zIndex: 1, alignItems: 'center', padding: 28, borderWidth: 1, borderColor: '#c1c9b6', borderRadius: 6, backgroundColor: '#fffcf2' },
  stateText: { marginTop: 10, color: '#251313', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#8a1230', fontSize: 13, fontWeight: '800', lineHeight: 19, textAlign: 'center' },
  retryButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingHorizontal: 18, borderRadius: 5, backgroundColor: '#8a1230' },
  retryButtonText: { color: '#fffcf2', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  buttonPressed: { opacity: 0.82 },
});
