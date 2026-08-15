import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

import { ITEM_CATEGORIES } from '@/constants/categories';
import { useCloset } from '@/context/closet-context';

const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Other'];

export default function AddItemScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { items, addItem, updateItem } = useCloset();
  const itemToEdit = items.find((item) => item.id === editId);
  const isEditing = Boolean(itemToEdit);
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Top');
  const [size, setSize] = useState('M');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageError, setImageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!itemToEdit) {
      return;
    }

    setItemName(itemToEdit.name);
    setBrand(itemToEdit.brand);
    setCategory(itemToEdit.category);
    setSize(itemToEdit.size);
    setNotes(itemToEdit.notes);
    setImageUri(itemToEdit.imageUri);
  }, [itemToEdit]);

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setImageError('');
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Unable to open the photo library.');
    }
  }

  async function saveItem() {
    if (!imageUri) {
      setImageError('Please add a photo before saving.');
      return;
    }

    const savedItem = {
      name: itemName.trim() || 'Untitled item',
      category,
      brand: brand.trim(),
      size,
      notes: notes.trim(),
      imageUri,
    };

    setIsSaving(true);
    setSaveError('');

    try {
      if (itemToEdit) {
        const { cleanupWarning } = await updateItem(itemToEdit.id, savedItem);
        router.replace(`/item-details/${itemToEdit.id}`);
        if (cleanupWarning) {
          Alert.alert('Item saved', cleanupWarning);
        }
        return;
      }

      await addItem(savedItem);
      router.replace('/closet');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this item.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTag}>{isEditing ? 'Edit piece' : 'New piece'}</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Update this piece in your closet.' : 'Save a piece to your closet.'}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={[styles.tape, styles.formTape]} />

          <Pressable
            accessibilityHint="Opens your photo library"
            accessibilityLabel={imageUri ? 'Change item photo' : 'Add item photo'}
            accessibilityRole="button"
            disabled={isSaving}
            onPress={pickImage}
            style={({ pressed }) => [
              styles.photoSlot,
              Boolean(imageError) && styles.photoSlotError,
              pressed && styles.photoSlotPressed,
            ]}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.selectedPhoto} />
                <View style={styles.changePhotoTag}>
                  <Text style={styles.changePhotoText}>Tap to change</Text>
                </View>
              </>
            ) : (
              <Text style={styles.photoLabel}>Tap to add photo</Text>
            )}
          </Pressable>
          {imageError ? (
            <Text accessibilityLiveRegion="polite" style={styles.validationMessage}>
              {imageError}
            </Text>
          ) : null}
          <Text style={styles.helperNote}>
            No pressure to fill everything out - you can always add details later!
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Item name</Text>
            <TextInput
              value={itemName}
              onChangeText={setItemName}
              placeholder="Black mini dress"
              placeholderTextColor="rgba(37, 19, 19, 0.38)"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              value={brand}
              onChangeText={setBrand}
              placeholder="Garage"
              placeholderTextColor="rgba(37, 19, 19, 0.38)"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryWrap}>
              {ITEM_CATEGORIES.map((option) => {
                const isSelected = option === category;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setCategory(option)}
                    style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                  >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Size</Text>
            <View style={styles.categoryWrap}>
              {sizes.map((option) => {
                const isSelected = option === size;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setSize(option)}
                    style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                  >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Where it is from, fit notes, or who can borrow it."
              placeholderTextColor="rgba(37, 19, 19, 0.38)"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.notesInput]}
            />
          </View>
        </View>

        {saveError ? (
          <Text accessibilityLiveRegion="polite" style={styles.saveError}>
            {saveError}
          </Text>
        ) : null}

        <Pressable
          disabled={isSaving}
          onPress={() => {
            void saveItem();
          }}
          style={({ pressed }) => [
            styles.saveButton,
            isSaving && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Item' : 'Save Item'}
          </Text>
        </Pressable>
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
    paddingBottom: 140,
  },
  notebookPage: {
    flex: 1,
    minHeight: 844,
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 70,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 16,
  },
  backText: {
    color: '#251313',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
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
  title: {
    color: '#251313',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 45,
  },
  subtitle: {
    marginTop: 6,
    color: '#251313',
    opacity: 0.68,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  formCard: {
    zIndex: 2,
    marginTop: 26,
    padding: 14,
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
    height: 18,
    width: 64,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.74,
  },
  formTape: {
    top: -8,
    left: 28,
    transform: [{ rotate: '-4deg' }],
  },
  photoSlot: {
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  photoSlotPressed: {
    opacity: 0.82,
  },
  photoSlotError: {
    borderColor: '#8a1230',
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
  },
  changePhotoTag: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 252, 242, 0.9)',
  },
  changePhotoText: {
    color: '#8a1230',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  photoLabel: {
    color: '#251313',
    opacity: 0.6,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  validationMessage: {
    marginTop: 7,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  helperNote: {
    marginTop: 12,
    color: '#251313',
    opacity: 0.68,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
    color: '#251313',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 96,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 5,
    backgroundColor: '#fffcf2',
  },
  categoryButtonSelected: {
    borderColor: '#8a1230',
    backgroundColor: '#8a1230',
  },
  categoryText: {
    color: '#251313',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
  categoryTextSelected: {
    color: '#fffcf2',
  },
  saveButton: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 22,
    paddingHorizontal: 16,
    borderRadius: 7,
    backgroundColor: '#8a1230',
    shadowColor: '#8a1230',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fffcf2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  saveError: {
    zIndex: 2,
    marginTop: 18,
    color: '#8a1230',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
  },
});
