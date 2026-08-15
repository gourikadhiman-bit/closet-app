import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ProfileSearchResult } from '@/types/profile';

type ProfileSearchRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export default function SearchUsersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSearch() {
    const normalizedSearch = searchText.trim().toLowerCase();
    setSearchText(normalizedSearch);
    setErrorMessage('');

    if (!user) {
      setResults([]);
      setHasSearched(true);
      setErrorMessage('Please sign in again to search for people.');
      return;
    }

    if (!normalizedSearch) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${normalizedSearch}%`)
        .neq('id', user.id)
        .order('username', { ascending: true })
        .limit(20);

      if (error) {
        throw error;
      }

      setResults(
        ((data ?? []) as ProfileSearchRow[]).map((row) => ({
          id: row.id,
          username: row.username,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
        })),
      );
      setHasSearched(true);
    } catch (error) {
      setResults([]);
      setHasSearched(true);
      setErrorMessage(
        error instanceof Error
          ? `We couldn't search profiles. ${error.message}`
          : "We couldn't search profiles. Check your connection and try again.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.ruleLines} pointerEvents="none">
        {Array.from({ length: 28 }).map((_, index) => (
          <View key={index} style={styles.ruleLine} />
        ))}
      </View>

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Find People</Text>
        <Text style={styles.subtitle}>Search the notebook by username.</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSearching}
          onChangeText={setSearchText}
          onSubmitEditing={() => {
            void handleSearch();
          }}
          placeholder="username"
          placeholderTextColor="rgba(37, 19, 19, 0.42)"
          returnKeyType="search"
          style={styles.input}
          value={searchText}
        />
        <Pressable
          disabled={isSearching}
          onPress={() => {
            void handleSearch();
          }}
          style={({ pressed }) => [
            styles.searchButton,
            isSearching && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {isSearching ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#8a1230" />
          <Text style={styles.stateText}>Searching profiles...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.results}
          data={results}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                {hasSearched ? 'No profiles found' : 'Who are you looking for?'}
              </Text>
              <Text style={styles.stateText}>
                {hasSearched
                  ? 'Try another username or a shorter search.'
                  : 'Enter all or part of a username, then tap Search.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const avatarLetter = (item.displayName || item.username).charAt(0).toUpperCase();

            return (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/users/[id]', params: { id: item.id } })
                }
                style={({ pressed }) => [styles.resultCard, pressed && styles.buttonPressed]}
              >
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.username}>@{item.username}</Text>
                  {item.displayName ? (
                    <Text numberOfLines={1} style={styles.displayName}>
                      {item.displayName}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingTop: 58, paddingHorizontal: 22, backgroundColor: '#fbf3e7' },
  ruleLines: { position: 'absolute', top: 40, left: 0, right: 0, gap: 27 },
  ruleLine: { height: 1, backgroundColor: '#c1c9b6', opacity: 0.3 },
  header: { zIndex: 1 },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  backText: { color: '#251313', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { marginTop: 22, color: '#251313', fontSize: 34, fontWeight: '900' },
  subtitle: { marginTop: 4, color: '#251313', fontSize: 14, fontWeight: '600', opacity: 0.68 },
  searchRow: { zIndex: 1, flexDirection: 'row', gap: 9, marginTop: 22 },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
    color: '#251313',
    fontSize: 15,
    fontWeight: '700',
  },
  searchButton: {
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#8a1230',
  },
  searchButtonText: { color: '#fffcf2', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  results: { flexGrow: 1, gap: 11, paddingTop: 20, paddingBottom: 80 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 78,
    padding: 13,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 25,
    backgroundColor: '#fbf3e7',
  },
  avatarLetter: { color: '#8a1230', fontSize: 19, fontWeight: '900' },
  resultCopy: { flex: 1, marginLeft: 13 },
  username: { color: '#8a1230', fontSize: 15, fontWeight: '900' },
  displayName: { marginTop: 3, color: '#251313', fontSize: 13, fontWeight: '600', opacity: 0.72 },
  chevron: { color: '#8a1230', fontSize: 28, fontWeight: '700' },
  stateCard: {
    zIndex: 1,
    alignItems: 'center',
    marginTop: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  stateTitle: { color: '#251313', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  stateText: { marginTop: 8, color: '#251313', fontSize: 13, fontWeight: '600', lineHeight: 19, opacity: 0.68, textAlign: 'center' },
  errorText: { color: '#8a1230', fontSize: 13, fontWeight: '800', lineHeight: 19, textAlign: 'center' },
  buttonDisabled: { opacity: 0.58 },
  buttonPressed: { opacity: 0.82 },
});
