import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/profile-context';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { createProfile } = useProfile();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      await createProfile({
        username: normalizedUsername,
        displayName,
        bio,
      });
      router.replace('/closet');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage('');

    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log out.');
    }
  }

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

          <View style={[styles.backgroundPaper, styles.topPaper]} />
          <View style={[styles.backgroundPaper, styles.bottomPaper]} />

          <View style={styles.topRow}>
            <Text style={styles.headerTag}>One last step</Text>
            <Pressable
              disabled={isSaving}
              onPress={() => {
                void handleSignOut();
              }}
              style={({ pressed }) => [styles.signOutButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.signOutText}>Log Out</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Choose the name people will use to find you later.
          </Text>

          <View style={styles.formCard}>
            <View style={styles.tape} />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSaving}
                maxLength={30}
                onBlur={() => setUsername(normalizeUsername(username))}
                onChangeText={setUsername}
                placeholder="closet_friend"
                placeholderTextColor="rgba(37, 19, 19, 0.38)"
                style={styles.input}
                value={username}
              />
              <Text style={styles.helperText}>3-30 lowercase letters, numbers, or underscores.</Text>
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
              <Text style={styles.label}>Short bio</Text>
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
          </View>

          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            disabled={isSaving}
            onPress={() => {
              void handleSave();
            }}
            style={({ pressed }) => [
              styles.saveButton,
              isSaving && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Creating Profile...' : 'Create Profile'}
            </Text>
          </Pressable>
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
    paddingBottom: 60,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  ruleLines: { position: 'absolute', top: 40, left: 0, right: 0, gap: 27 },
  ruleLine: { height: 1, backgroundColor: '#c1c9b6', opacity: 0.3 },
  backgroundPaper: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    opacity: 0.52,
  },
  topPaper: {
    top: 128,
    right: -96,
    width: 220,
    height: 144,
    transform: [{ rotate: '-7deg' }],
  },
  bottomPaper: {
    left: -112,
    bottom: 110,
    width: 260,
    height: 170,
    transform: [{ rotate: '8deg' }],
  },
  topRow: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
    color: '#8a1230',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  signOutButton: { paddingHorizontal: 10, paddingVertical: 7 },
  signOutText: { color: '#8a1230', fontSize: 12, fontWeight: '900' },
  title: { zIndex: 2, color: '#251313', fontSize: 38, fontWeight: '900', lineHeight: 44 },
  subtitle: {
    zIndex: 2,
    marginTop: 7,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  formCard: {
    zIndex: 2,
    marginTop: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  tape: {
    position: 'absolute',
    top: -8,
    left: 30,
    width: 64,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.74,
    transform: [{ rotate: '-4deg' }],
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
  helperText: {
    marginTop: 6,
    color: '#251313',
    opacity: 0.58,
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    zIndex: 2,
    marginTop: 16,
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
  },
  saveButton: {
    zIndex: 2,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 7,
    backgroundColor: '#8a1230',
  },
  saveButtonText: { color: '#fffcf2', fontSize: 15, fontWeight: '900' },
  buttonDisabled: { opacity: 0.58 },
  buttonPressed: { opacity: 0.82 },
});
