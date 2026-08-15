import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'signup';

type AuthFormScreenProps = {
  mode: AuthMode;
};

type ValidationErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyAuthMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'The email or password is incorrect.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirm your email before logging in.';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  if (
    normalizedMessage.includes('password should be') ||
    normalizedMessage.includes('weak password')
  ) {
    return 'Choose a stronger password with at least 8 characters.';
  }

  if (
    normalizedMessage.includes('invalid email') ||
    normalizedMessage.includes('unable to validate email')
  ) {
    return 'Enter a valid email address.';
  }

  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
    return 'Too many attempts. Wait a moment and try again.';
  }

  if (normalizedMessage.includes('network request failed') || normalizedMessage.includes('fetch')) {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  return message;
}

export function AuthFormScreen({ mode }: AuthFormScreenProps) {
  const router = useRouter();
  const { session, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: keyof ValidationErrors) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
      form: undefined,
    }));
  }

  function validateForm(normalizedEmail: string) {
    const nextErrors: ValidationErrors = {};

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (mode === 'signup' && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    const normalizedEmail = email.trim().toLowerCase();

    setConfirmationMessage('');

    if (!validateForm(normalizedEmail)) {
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === 'signup') {
        const result = await signUp(normalizedEmail, password);

        if (result.session) {
          router.replace('/closet');
          return;
        }

        setConfirmationMessage(
          'Check your email to confirm your account. After confirming, return here and log in.'
        );
        setPassword('');
        setConfirmPassword('');
        return;
      }

      await signIn(normalizedEmail, password);
      router.replace('/closet');
    } catch (error) {
      setErrors({ form: getFriendlyAuthMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const isSignUp = mode === 'signup';

  if (session) {
    return <Redirect href="/closet" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.page}
      >
        <View style={styles.notebookPage}>
          <View style={styles.ruleLines}>
            {Array.from({ length: 25 }).map((_, index) => (
              <View key={index} style={styles.ruleLine} />
            ))}
          </View>

          <View style={[styles.backgroundPaper, styles.topPaper]} />
          <View style={[styles.backgroundPaper, styles.bottomPaper]} />

          <View style={styles.headerRow}>
            <Pressable disabled={isSubmitting} onPress={goBack} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.headerTag}>{isSignUp ? 'New account' : 'Welcome back'}</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.kicker}>Closet access</Text>
            <Text style={styles.title}>{isSignUp ? 'Start your closet.' : 'Open your closet.'}</Text>
            <Text style={styles.description}>
              {isSignUp
                ? 'Create an account to keep your pieces connected to you.'
                : 'Log in with the email and password you used to sign up.'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={[styles.tape, styles.formTape]} />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                editable={!isSubmitting}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  clearFieldError('email');
                }}
                placeholder="you@example.com"
                placeholderTextColor="rgba(37, 19, 19, 0.38)"
                returnKeyType="next"
                style={[styles.input, Boolean(errors.email) && styles.inputError]}
                textContentType="emailAddress"
                value={email}
              />
              {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                editable={!isSubmitting}
                onChangeText={(value) => {
                  setPassword(value);
                  clearFieldError('password');
                }}
                placeholder="At least 8 characters"
                placeholderTextColor="rgba(37, 19, 19, 0.38)"
                secureTextEntry
                style={[styles.input, Boolean(errors.password) && styles.inputError]}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                value={password}
              />
              {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
            </View>

            {isSignUp ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!isSubmitting}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    clearFieldError('confirmPassword');
                  }}
                  placeholder="Enter the same password"
                  placeholderTextColor="rgba(37, 19, 19, 0.38)"
                  returnKeyType="done"
                  secureTextEntry
                  style={[styles.input, Boolean(errors.confirmPassword) && styles.inputError]}
                  textContentType="newPassword"
                  value={confirmPassword}
                />
                {errors.confirmPassword ? (
                  <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                ) : null}
              </View>
            ) : null}

            {errors.form ? (
              <Text accessibilityLiveRegion="polite" style={styles.formError}>
                {errors.form}
              </Text>
            ) : null}

            {confirmationMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.confirmationMessage}>
                {confirmationMessage}
              </Text>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fffcf2" />
              ) : (
                <Text style={styles.submitButtonText}>{isSignUp ? 'Create Account' : 'Log In'}</Text>
              )}
            </Pressable>

            <Pressable
              disabled={isSubmitting}
              onPress={() => router.push(isSignUp ? '/login' : '/signup')}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#fbf3e7',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  notebookPage: {
    flex: 1,
    minHeight: 844,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 48,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  ruleLines: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    gap: 27,
  },
  ruleLine: {
    height: 1,
    backgroundColor: '#c1c9b6',
    opacity: 0.3,
  },
  backgroundPaper: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    opacity: 0.52,
  },
  topPaper: {
    top: 116,
    right: -96,
    width: 220,
    height: 144,
    transform: [{ rotate: '-7deg' }],
  },
  bottomPaper: {
    left: -112,
    bottom: 100,
    width: 260,
    height: 170,
    transform: [{ rotate: '8deg' }],
  },
  headerRow: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 16,
  },
  backText: {
    color: '#251313',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
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
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  hero: {
    zIndex: 2,
  },
  kicker: {
    marginBottom: 9,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 330,
    color: '#251313',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 45,
  },
  description: {
    maxWidth: 330,
    marginTop: 8,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '600',
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
    shadowColor: '#251313',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
  },
  tape: {
    position: 'absolute',
    width: 64,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.74,
  },
  formTape: {
    top: -8,
    left: 28,
    transform: [{ rotate: '-4deg' }],
  },
  fieldGroup: {
    marginTop: 18,
  },
  label: {
    marginBottom: 8,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
    color: '#251313',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  inputError: {
    borderColor: '#8a1230',
  },
  fieldError: {
    marginTop: 6,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  formError: {
    marginTop: 16,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8a1230',
    backgroundColor: '#fbf3e7',
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  confirmationMessage: {
    marginTop: 16,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#556b4f',
    backgroundColor: '#fbf3e7',
    color: '#251313',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  submitButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 6,
    backgroundColor: '#8a1230',
  },
  submitButtonText: {
    color: '#fffcf2',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  toggleButton: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 4,
  },
  toggleText: {
    color: '#8a1230',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  buttonPressed: {
    opacity: 0.82,
  },
});
