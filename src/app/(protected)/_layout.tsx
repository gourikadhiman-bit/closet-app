import { Redirect, Stack, usePathname } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/profile-context';

export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    loadingError,
    refreshProfile,
  } = useProfile();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#8a1230" size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isProfileLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#8a1230" size="large" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (loadingError) {
    return (
      <View style={styles.loadingScreen}>
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {loadingError}
        </Text>
        <Pressable
          onPress={() => {
            void refreshProfile();
          }}
          style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const isProfileSetupRoute = pathname === '/profile-setup';

  if (!profile && !isProfileSetupRoute) {
    return <Redirect href="/profile-setup" />;
  }

  if (profile && isProfileSetupRoute) {
    return <Redirect href="/closet" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbf3e7',
  },
  loadingText: {
    marginTop: 12,
    color: '#251313',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    maxWidth: 300,
    color: '#8a1230',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
    borderRadius: 5,
    backgroundColor: '#8a1230',
  },
  retryButtonText: {
    color: '#fffcf2',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  buttonPressed: {
    opacity: 0.82,
  },
});
