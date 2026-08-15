import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type ProfileHeading = {
  username: string;
  display_name: string;
};

export default function PublicClosetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileHeading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfileHeading = useCallback(async () => {
    if (!id) {
      setErrorMessage('This closet link is invalid.');
      setIsLoading(false);
      return;
    }

    if (id === user?.id) {
      router.replace('/closet');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setErrorMessage('We could not find the owner of this closet.');
        return;
      }

      setProfile(data as ProfileHeading);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `We couldn't load this closet. ${error.message}`
          : "We couldn't load this closet. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, router, user?.id]);

  useEffect(() => {
    void loadProfileHeading();
  }, [loadProfileHeading]);

  return (
    <View style={styles.page}>
      <View style={styles.ruleLines} pointerEvents="none">
        {Array.from({ length: 28 }).map((_, index) => (
          <View key={index} style={styles.ruleLine} />
        ))}
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back to Profile</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#8a1230" size="large" />
          <Text style={styles.stateText}>Opening closet...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={() => {
              void loadProfileHeading();
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : profile ? (
        <>
          <Text style={styles.title}>{profile.display_name || `@${profile.username}`}&apos;s Closet</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Closet sharing isn&apos;t enabled yet</Text>
            <Text style={styles.stateText}>
              Clothing is still protected by its owner-only database and image policies. This
              screen will stay read-only and private until an explicit sharing rule is added.
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingTop: 58, paddingHorizontal: 22, backgroundColor: '#fbf3e7' },
  ruleLines: { position: 'absolute', top: 40, left: 0, right: 0, gap: 27 },
  ruleLine: { height: 1, backgroundColor: '#c1c9b6', opacity: 0.3 },
  backButton: { zIndex: 1, alignSelf: 'flex-start', marginBottom: 24, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#c1c9b6', borderRadius: 5, backgroundColor: '#fffcf2' },
  backText: { color: '#251313', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { zIndex: 1, color: '#251313', fontSize: 32, fontWeight: '900', lineHeight: 38 },
  username: { zIndex: 1, marginTop: 4, marginBottom: 22, color: '#8a1230', fontSize: 14, fontWeight: '900' },
  stateCard: { zIndex: 1, alignItems: 'center', padding: 28, borderWidth: 1, borderColor: '#c1c9b6', borderRadius: 6, backgroundColor: '#fffcf2' },
  stateTitle: { color: '#251313', fontSize: 19, fontWeight: '900', lineHeight: 25, textAlign: 'center' },
  stateText: { marginTop: 10, color: '#251313', fontSize: 13, fontWeight: '600', lineHeight: 20, opacity: 0.7, textAlign: 'center' },
  errorText: { color: '#8a1230', fontSize: 13, fontWeight: '800', lineHeight: 19, textAlign: 'center' },
  primaryButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingHorizontal: 18, borderRadius: 5, backgroundColor: '#8a1230' },
  primaryButtonText: { color: '#fffcf2', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  buttonPressed: { opacity: 0.82 },
});
