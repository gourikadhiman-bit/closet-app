import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ClothingItemImage } from '@/components/clothing-item-image';
import { ITEM_CATEGORIES } from '@/constants/categories';
import { useCloset } from '@/context/closet-context';

export default function ItemDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, isLoading, loadingError, refreshItems, deleteItem, updateItem } = useCloset();
  const item = items.find((closetItem) => closetItem.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftImageUri, setDraftImageUri] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftBrand, setDraftBrand] = useState('');
  const [draftCategory, setDraftCategory] = useState('Top');
  const [draftSize, setDraftSize] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  useEffect(() => {
    if (!item) {
      return;
    }

    setDraftImageUri(item.imageUri);
    setDraftName(item.name);
    setDraftBrand(item.brand);
    setDraftCategory(item.category);
    setDraftSize(item.size);
    setDraftNotes(item.notes);
  }, [item]);

  function resetDraft() {
    if (!item) {
      return;
    }

    setDraftImageUri(item.imageUri);
    setDraftName(item.name);
    setDraftBrand(item.brand);
    setDraftCategory(item.category);
    setDraftSize(item.size);
    setDraftNotes(item.notes);
    setErrorMessage('');
  }

  function beginEditing() {
    resetDraft();
    setIsEditing(true);
  }

  function cancelEditing() {
    resetDraft();
    setIsEditing(false);
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setDraftImageUri(result.assets[0].uri);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to open the photo library.');
    }
  }

  async function handleSave() {
    if (!item) {
      return;
    }

    if (!draftImageUri) {
      setErrorMessage('Please add a photo before saving.');
      return;
    }

    if (!ITEM_CATEGORIES.some((category) => category === draftCategory)) {
      setErrorMessage('Please choose a valid category.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const { cleanupWarning } = await updateItem(item.id, {
        imageUri: draftImageUri,
        name: draftName.trim() || 'Untitled item',
        brand: draftBrand.trim(),
        category: draftCategory,
        size: draftSize.trim(),
        notes: draftNotes.trim(),
      });
      router.replace('/closet');
      if (cleanupWarning) {
        Alert.alert('Item saved', cleanupWarning);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save this item.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (!item) {
      return;
    }

    Alert.alert(
      'Delete item?',
      `Remove ${item.name || 'this item'} from your closet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            setErrorMessage('');

            try {
              const { cleanupWarning } = await deleteItem(item.id);
              router.replace('/closet');
              if (cleanupWarning) {
                Alert.alert('Item deleted', cleanupWarning);
              }
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : 'Unable to delete this item.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={[styles.content, isEditing && styles.editingContent]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.page}
      >
        <View style={styles.notebookPage}>
        <View style={styles.ruleLines}>
          {Array.from({ length: 28 }).map((_, index) => (
            <View key={index} style={styles.ruleLine} />
          ))}
        </View>

        <View style={[styles.backgroundPaper, styles.topPaper]} />
        <View style={[styles.backgroundPaper, styles.bottomPaper]} />

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#8a1230" size="large" />
            <Text accessibilityLiveRegion="polite" style={styles.loadingText}>
              Loading item...
            </Text>
          </View>
        ) : loadingError ? (
          <View style={styles.emptyCard}>
            <Text accessibilityLiveRegion="polite" style={styles.errorMessage}>
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
        ) : item ? (
          <View style={styles.detailCard}>
            <View style={[styles.tape, styles.topTape]} />
            {isEditing ? (
              <ClothingItemImage
                disabled={isSaving}
                hasError={!draftImageUri && Boolean(errorMessage)}
                imageUri={draftImageUri}
                itemName={draftName || item.name}
                onPress={pickImage}
                showEditLabel
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                {item.imageUri ? (
                  <Image
                    accessibilityLabel={`${item.name} photo`}
                    source={{ uri: item.imageUri }}
                    resizeMode="cover"
                    style={styles.itemPhoto}
                  />
                ) : (
                  <Text style={styles.photoLabel}>clothing photo placeholder</Text>
                )}
              </View>
            )}

            {isEditing ? (
              <TextInput
                accessibilityLabel="Item name"
                editable={!isSaving}
                onChangeText={setDraftName}
                placeholder="Item name"
                placeholderTextColor="rgba(37, 19, 19, 0.38)"
                style={[styles.itemName, styles.itemNameInput]}
                value={draftName}
              />
            ) : (
              <Text style={styles.itemName}>{item.name}</Text>
            )}

            <View style={styles.infoGrid}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Brand</Text>
                {isEditing ? (
                  <TextInput
                    editable={!isSaving}
                    onChangeText={setDraftBrand}
                    placeholder="Not added"
                    placeholderTextColor="rgba(37, 19, 19, 0.38)"
                    style={styles.infoInput}
                    value={draftBrand}
                  />
                ) : (
                  <Text style={styles.infoValue}>{item.brand || 'Not added'}</Text>
                )}
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Size</Text>
                {isEditing ? (
                  <TextInput
                    editable={!isSaving}
                    onChangeText={setDraftSize}
                    placeholder="Not added"
                    placeholderTextColor="rgba(37, 19, 19, 0.38)"
                    style={styles.infoInput}
                    value={draftSize}
                  />
                ) : (
                  <Text style={styles.infoValue}>{item.size || 'Not added'}</Text>
                )}
              </View>
              <View style={[styles.infoBlock, isEditing && styles.categoryBlock]}>
                <Text style={styles.infoLabel}>Category</Text>
                {isEditing ? (
                  <View style={styles.categoryOptions}>
                    {ITEM_CATEGORIES.map((category) => {
                      const isSelected = category === draftCategory;

                      return (
                        <Pressable
                          disabled={isSaving}
                          key={category}
                          onPress={() => setDraftCategory(category)}
                          style={[
                            styles.categoryButton,
                            isSelected && styles.categoryButtonSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryButtonText,
                              isSelected && styles.categoryButtonTextSelected,
                            ]}
                          >
                            {category}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{item.category || 'Not added'}</Text>
                )}
              </View>
            </View>

            <View style={styles.notesBlock}>
              <Text style={styles.infoLabel}>Notes</Text>
              {isEditing ? (
                <TextInput
                  editable={!isSaving}
                  multiline
                  onChangeText={setDraftNotes}
                  placeholder="No notes yet."
                  placeholderTextColor="rgba(37, 19, 19, 0.38)"
                  style={styles.notesInput}
                  textAlignVertical="top"
                  value={draftNotes}
                />
              ) : (
                <Text style={styles.notesText}>{item.notes || 'No notes yet.'}</Text>
              )}
            </View>

            {errorMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorMessage}>
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <Pressable
                    disabled={isSaving}
                    onPress={handleSave}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      isSaving && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.deleteButtonText}>
                      {isSaving ? 'Saving...' : 'Save Item'}
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={cancelEditing}
                    style={({ pressed }) => [
                      styles.editButton,
                      isSaving && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    disabled={isDeleting}
                    onPress={beginEditing}
                    style={({ pressed }) => [
                      styles.editButton,
                      isDeleting && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.editButtonText}>Edit Item</Text>
                  </Pressable>
                  <Pressable
                    disabled={isDeleting}
                    onPress={handleDelete}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      isDeleting && styles.buttonDisabled,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.deleteButtonText}>
                      {isDeleting ? 'Deleting...' : 'Delete Item'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Item not found</Text>
            <Text style={styles.emptyText}>This piece is no longer in your closet.</Text>
          </View>
        )}
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
  },
  editingContent: {
    paddingBottom: 220,
  },
  notebookPage: {
    minHeight: 844,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 34,
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
    opacity: 0.5,
  },
  topPaper: {
    top: 124,
    right: -102,
    width: 230,
    height: 150,
    transform: [{ rotate: '-6deg' }],
  },
  bottomPaper: {
    left: -112,
    bottom: 116,
    width: 250,
    height: 168,
    transform: [{ rotate: '7deg' }],
  },
  backButton: {
    zIndex: 2,
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  backButtonText: {
    color: '#251313',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  detailCard: {
    zIndex: 2,
    padding: 14,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 7,
    backgroundColor: '#fffcf2',
    shadowColor: '#251313',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  tape: {
    position: 'absolute',
    height: 18,
    width: 66,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.76,
  },
  topTape: {
    top: -9,
    right: 34,
    transform: [{ rotate: '4deg' }],
  },
  photoPlaceholder: {
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  itemPhoto: {
    width: '100%',
    height: '100%',
  },
  photoLabel: {
    color: '#251313',
    opacity: 0.52,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  itemName: {
    marginTop: 18,
    color: '#251313',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 37,
  },
  itemNameInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  infoBlock: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
  },
  infoLabel: {
    color: '#8a1230',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  infoValue: {
    marginTop: 5,
    color: '#251313',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  infoInput: {
    minHeight: 34,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fffcf2',
    color: '#251313',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  categoryBlock: {
    width: '100%',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  categoryButtonSelected: {
    borderColor: '#8a1230',
    backgroundColor: '#8a1230',
  },
  categoryButtonText: {
    color: '#251313',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  categoryButtonTextSelected: {
    color: '#fffcf2',
  },
  notesBlock: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fbf3e7',
  },
  notesText: {
    marginTop: 6,
    color: '#251313',
    opacity: 0.72,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 92,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fffcf2',
    color: '#251313',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  errorMessage: {
    marginTop: 12,
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  editButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  editButtonText: {
    color: '#8a1230',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  deleteButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#8a1230',
  },
  deleteButtonText: {
    color: '#fffcf2',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  emptyCard: {
    zIndex: 2,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  emptyTitle: {
    color: '#251313',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  emptyText: {
    marginTop: 6,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
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
