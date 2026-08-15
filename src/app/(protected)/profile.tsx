import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { normalizeUsername, validateUsername } from '@/constants/profile';
import { useCloset } from '@/context/closet-context';
import { useProfile } from '@/context/profile-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { items } = useCloset();
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!profile) {
      return;
    }

    setUsername(profile.username);
    setDisplayName(profile.displayName);
    setBio(profile.bio);
  }, [profile]);

  function cancelEditing() {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.displayName);
      setBio(profile.bio);
    }
    setErrorMessage('');
    setIsEditing(false);
  }

  async function handleSave() {
    const normalizedUsername = normalizeUsername(username);
    const validationError = validateUsername(normalizedUsername);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await updateProfile({ username: normalizedUsername, displayName, bio });
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!profile) {
    return null;
  }

  const avatarLetter = (profile.displayName || profile.username).charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.page}
      >
        <View style={styles.notebookPage}>
          <View style={styles.ruleLines}>
            {Array.from({ length: 27 }).map((_, index) => (
              <View key={index} style={styles.ruleLine} />
            ))}
          </View>

          <Pressable onPress={() => router.replace('/closet')} style={styles.backButton}>
            <Text style={styles.backText}>Back to Closet</Text>
          </Pressable>

          <View style={styles.profileCard}>
            <View style={styles.tape} />
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>

            {isEditing ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSaving}
                    maxLength={30}
                    onBlur={() => setUsername(normalizeUsername(username))}
                    onChangeText={setUsername}
                    style={styles.input}
                    value={username}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Display name</Text>
                  <TextInput
                    editable={!isSaving}
                    maxLength={80}
                    onChangeText={setDisplayName}
                    placeholder="Your name"
                    placeholderTextColor="rgba(37, 19, 19, 0.38)"
                    style={styles.input}
                    value={displayName}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    editable={!isSaving}
                    maxLength={240}
                    multiline
                    onChangeText={setBio}
                    placeholder="A little about your style..."
                    placeholderTextColor="rgba(37, 19, 19, 0.38)"
                    style={[styles.input, styles.bioInput]}
                    textAlignVertical="top"
                    value={bio}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.displayName}>{profile.displayName || profile.username}</Text>
                <Text style={styles.username}>@{profile.username}</Text>
                <Text style={styles.bio}>{profile.bio || 'No bio yet.'}</Text>
                <View style={styles.countCard}>
                  <Text style={styles.countNumber}>{items.length}</Text>
                  <Text style={styles.countLabel}>Closet pieces</Text>
                </View>
              </>
            )}

            {errorMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => {
                      void handleSave();
                    }}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      isSaving && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={cancelEditing}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => router.push('/search-users')}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.secondaryButtonText}>Find People</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIsEditing(true)}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.primaryButtonText}>Edit Profile</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  page: { flex: 1, backgroundColor: '#fbf3e7' },
  content: { flexGrow: 1, paddingBottom: 120 },
  notebookPage: {
    flex: 1,
    minHeight: 844,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 50,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  ruleLines: { position: 'absolute', top: 40, left: 0, right: 0, gap: 27 },
  ruleLine: { height: 1, backgroundColor: '#c1c9b6', opacity: 0.3 },
  backButton: {
    zIndex: 2,
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
    zIndex: 2,
    padding: 18,
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
  displayName: {
    marginTop: 18,
    color: '#251313',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  username: {
    marginTop: 4,
    color: '#8a1230',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  bio: {
    marginTop: 18,
    color: '#251313',
    opacity: 0.72,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
  },
  countCard: {
    alignItems: 'center',
    marginTop: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
  },
  countNumber: { color: '#251313', fontSize: 26, fontWeight: '900' },
  countLabel: {
    marginTop: 2,
    color: '#8a1230',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldGroup: { marginTop: 18 },
  label: {
    marginBottom: 8,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
    color: '#251313',
    fontSize: 15,
    fontWeight: '600',
  },
  bioInput: { minHeight: 100 },
  errorText: {
    marginTop: 14,
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#8a1230',
  },
  primaryButtonText: { color: '#fffcf2', fontSize: 13, fontWeight: '900' },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  secondaryButtonText: { color: '#8a1230', fontSize: 13, fontWeight: '900' },
  buttonDisabled: { opacity: 0.58 },
  buttonPressed: { opacity: 0.82 },
});
