import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ClothingItemImage } from '@/components/clothing-item-image';
import { CLOSET_FILTERS } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import { useCloset } from '@/context/closet-context';

const categoryFilters: Record<string, string | null> = {
  All: null,
  Tops: 'Top',
  Bottoms: 'Bottom',
  Dresses: 'Dress',
  Shoes: 'Shoes',
  Accessories: 'Accessory',
  Other: 'Other',
};

export default function ClosetScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { items, isLoading, loadingError, refreshItems } = useCloset();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const selectedFilter = categoryFilters[selectedCategory];
  const filteredItems = selectedFilter
    ? items.filter((item) => item.category === selectedFilter)
    : items;

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError('');

    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setSignOutError('Unable to log out. Check your connection and try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  function confirmSignOut() {
    Alert.alert('Log out?', 'You will need to log in again to open your closet.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void handleSignOut();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.notebookPage}>
        <View style={styles.ruleLines}>
          {Array.from({ length: 27 }).map((_, index) => (
            <View key={index} style={styles.ruleLine} />
          ))}
        </View>

        <View style={[styles.backgroundPaper, styles.topPaper]} />
        <View style={[styles.backgroundPaper, styles.bottomPaper]} />

        <View style={styles.topActions}>
          <Pressable onPress={() => router.dismissTo('/onboarding')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <View style={styles.accountActions}>
            <Pressable
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [styles.profileButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.profileButtonText}>My Profile</Text>
            </Pressable>
            <Pressable
              disabled={isSigningOut}
              onPress={confirmSignOut}
              style={({ pressed }) => [
                styles.logOutButton,
                isSigningOut && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.logOutButtonText}>
                {isSigningOut ? 'Logging Out...' : 'Log Out'}
              </Text>
            </Pressable>
          </View>
        </View>

        {signOutError ? (
          <Text accessibilityLiveRegion="polite" style={styles.signOutError}>
            {signOutError}
          </Text>
        ) : null}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Closet</Text>
            <Text style={styles.subtitle}>{items.length} pieces saved</Text>
          </View>
          <Pressable
            onPress={() => router.push('/add-item')}
            style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.addButtonText}>Add Item</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CLOSET_FILTERS.map((category) => {
            const isSelected = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryTab, isSelected && styles.activeCategoryTab]}
              >
                <Text style={[styles.categoryText, isSelected && styles.activeCategoryText]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.statusCard}>
            <ActivityIndicator color="#8a1230" size="large" />
            <Text accessibilityLiveRegion="polite" style={styles.statusText}>
              Loading your closet...
            </Text>
          </View>
        ) : loadingError ? (
          <View style={styles.statusCard}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {loadingError}
            </Text>
            <Pressable
              onPress={() => {
                void refreshItems();
              }}
              style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/item-details/${item.id}`)}
                style={({ pressed }) => [styles.itemCard, pressed && styles.cardPressed]}
              >
                {index === 1 && <View style={[styles.tape, styles.itemTape]} />}
                <ClothingItemImage imageUri={item.imageUri} itemName={item.name} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>
                  {item.brand ? `${item.brand} / ` : ''}
                  {item.category}
                  {item.size ? ` / ${item.size}` : ''}
                </Text>
                {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
              </Pressable>
            ))}
          </View>
        )}
        {!isLoading && !loadingError && filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pieces here yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fbf3e7',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  notebookPage: {
    minHeight: 844,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 30,
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
  header: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  topActions: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  profileButtonText: {
    color: '#251313',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  backButtonText: {
    color: '#251313',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  logOutButton: {
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  logOutButtonText: {
    color: '#8a1230',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  signOutError: {
    zIndex: 2,
    marginBottom: 10,
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  title: {
    color: '#251313',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 45,
  },
  subtitle: {
    marginTop: 5,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  addButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#8a1230',
    shadowColor: '#8a1230',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  addButtonText: {
    color: '#fffcf2',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 17,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  categoryRow: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
    paddingBottom: 20,
  },
  categoryTab: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  activeCategoryTab: {
    borderColor: '#8a1230',
    backgroundColor: '#8a1230',
  },
  categoryText: {
    color: '#251313',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
  activeCategoryText: {
    color: '#fffcf2',
  },
  grid: {
    zIndex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  itemCard: {
    width: '47.5%',
    alignSelf: 'flex-start',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 10,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    shadowColor: '#251313',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.86,
  },
  tape: {
    position: 'absolute',
    height: 16,
    width: 48,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.74,
  },
  itemTape: {
    top: -7,
    right: 14,
    transform: [{ rotate: '5deg' }],
  },
  itemName: {
    marginTop: 10,
    color: '#251313',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  itemType: {
    marginTop: 2,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  itemNotes: {
    marginTop: 6,
    color: '#251313',
    opacity: 0.62,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  emptyState: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 132,
    padding: 18,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  emptyStateText: {
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  statusCard: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    padding: 22,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  statusText: {
    marginTop: 12,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  errorText: {
    color: '#8a1230',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: '#8a1230',
  },
  retryButtonText: {
    color: '#fffcf2',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
