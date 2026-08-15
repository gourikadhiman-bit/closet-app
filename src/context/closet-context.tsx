import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const CLOTHING_IMAGES_BUCKET = 'clothing-images';
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60;

export type ClosetItem = {
  id: string;
  name: string;
  category: string;
  brand: string;
  size: string;
  notes: string;
  imagePath: string;
  imageUri: string;
  createdAt: string;
};

export type NewClosetItem = Omit<ClosetItem, 'id' | 'createdAt' | 'imagePath'>;

type ClothingItemRow = {
  id: string;
  name: string | null;
  category: string | null;
  brand: string | null;
  size: string | null;
  notes: string | null;
  image_url: string;
  created_at: string;
};

type MutationResult = {
  item: ClosetItem;
  cleanupWarning?: string;
};

type DeleteResult = {
  cleanupWarning?: string;
};

type ClosetContextValue = {
  items: ClosetItem[];
  isLoading: boolean;
  loadingError: string;
  refreshItems: () => Promise<void>;
  addItem: (item: NewClosetItem) => Promise<ClosetItem>;
  updateItem: (id: string, item: NewClosetItem) => Promise<MutationResult>;
  deleteItem: (id: string) => Promise<DeleteResult>;
};

type UploadedImage = {
  path: string;
  signedUrl: string;
};

const CLOTHING_ITEM_COLUMNS =
  'id, name, category, brand, size, notes, image_url, created_at';

const ClosetContext = createContext<ClosetContextValue | undefined>(undefined);

function toClosetItem(row: ClothingItemRow, signedImageUrl: string): ClosetItem {
  return {
    id: row.id,
    name: row.name?.trim() || 'Untitled item',
    category: row.category ?? 'Other',
    brand: row.brand ?? '',
    size: row.size ?? '',
    notes: row.notes ?? '',
    imagePath: row.image_url,
    imageUri: signedImageUrl,
    createdAt: row.created_at,
  };
}

function friendlyOperationError(operation: 'add' | 'update' | 'delete') {
  const labels = {
    add: 'save this item',
    update: 'update this item',
    delete: 'delete this item',
  };

  return `Unable to ${labels[operation]}. Check your connection and try again.`;
}

function isUserStoragePath(path: string, userId: string) {
  return path.startsWith(`${userId}/`) && !path.includes('://');
}

function inferImageType(uri: string, responseType: string | null) {
  if (responseType?.startsWith('image/')) {
    return responseType.split(';')[0].toLowerCase();
  }

  const cleanUri = uri.split('?')[0].toLowerCase();
  const extension = cleanUri.split('.').pop();
  const mimeTypes: Record<string, string> = {
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  return extension ? mimeTypes[extension] ?? 'image/jpeg' : 'image/jpeg';
}

function extensionForImageType(contentType: string) {
  const extensions: Record<string, string> = {
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return extensions[contentType] ?? 'jpg';
}

function createUniqueFileName(extension: string) {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${randomPart}.${extension}`;
}

async function removeStorageImage(path: string) {
  try {
    const { error } = await supabase.storage.from(CLOTHING_IMAGES_BUCKET).remove([path]);
    return error?.message ?? '';
  } catch (error) {
    return error instanceof Error ? error.message : 'Unknown cleanup error';
  }
}

async function createImageSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(CLOTHING_IMAGES_BUCKET)
    .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Unable to create a signed image URL.');
  }

  return data.signedUrl;
}

async function uploadStorageImage(userId: string, localImageUri: string): Promise<UploadedImage> {
  let uploadedPath = '';

  try {
    const response = await fetch(localImageUri);
    const imageBytes = await response.arrayBuffer();

    if (imageBytes.byteLength === 0) {
      throw new Error('The selected photo is empty.');
    }

    const contentType = inferImageType(localImageUri, response.headers.get('content-type'));
    const fileName = createUniqueFileName(extensionForImageType(contentType));
    const path = `${userId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(CLOTHING_IMAGES_BUCKET)
      .upload(path, imageBytes, {
        cacheControl: '3600',
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    uploadedPath = path;
    const signedUrl = await createImageSignedUrl(path);
    return { path, signedUrl };
  } catch (error) {
    console.error('Unable to upload clothing image:', error);

    if (uploadedPath) {
      const cleanupError = await removeStorageImage(uploadedPath);
      if (cleanupError) {
        console.error('Unable to clean up failed image upload:', cleanupError);
      }
    }

    throw new Error('Unable to upload this photo. Check your connection and try again.');
  }
}

export function ClosetProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const requestId = useRef(0);

  const fetchItems = useCallback(async (userId: string) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setLoadingError('');

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select(CLOTHING_ITEM_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as ClothingItemRow[];
      const closetItems = await Promise.all(
        rows.map(async (row) => {
          if (!isUserStoragePath(row.image_url, userId)) {
            // Legacy local URIs cannot be signed. Editing the item requires a new photo.
            return toClosetItem(row, '');
          }

          return toClosetItem(row, await createImageSignedUrl(row.image_url));
        })
      );

      if (currentRequestId !== requestId.current) {
        return;
      }

      setItems(closetItems);
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      console.error('Unable to fetch clothing items:', error);
      setItems([]);
      setLoadingError('Unable to load your closet images. Check your connection and try again.');
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      requestId.current += 1;
      setItems([]);
      setLoadingError('Sign in to load your closet.');
      setIsLoading(false);
      return;
    }

    void fetchItems(user.id);
  }, [fetchItems, isAuthLoading, user]);

  function requireUserId() {
    if (!user) {
      throw new Error('Your session has ended. Please sign in again.');
    }

    return user.id;
  }

  async function refreshItems() {
    await fetchItems(requireUserId());
  }

  async function addItem(item: NewClosetItem) {
    const userId = requireUserId();

    if (!item.imageUri) {
      throw new Error('Please add a photo before saving.');
    }

    const uploadedImage = await uploadStorageImage(userId, item.imageUri);

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .insert({
          user_id: userId,
          name: item.name.trim() || 'Untitled item',
          brand: item.brand.trim(),
          category: item.category,
          size: item.size.trim(),
          notes: item.notes.trim(),
          image_url: uploadedImage.path,
        })
        .select(CLOTHING_ITEM_COLUMNS)
        .single();

      if (error) {
        throw error;
      }

      const newItem = toClosetItem(data as ClothingItemRow, uploadedImage.signedUrl);
      setItems((currentItems) => [newItem, ...currentItems]);
      return newItem;
    } catch (error) {
      console.error('Unable to insert clothing item:', error);
      const cleanupError = await removeStorageImage(uploadedImage.path);

      if (cleanupError) {
        console.error('Unable to clean up image after failed item insert:', cleanupError);
        throw new Error(
          'The item was not saved, and its uploaded photo could not be cleaned up automatically.'
        );
      }

      throw new Error(friendlyOperationError('add'));
    }
  }

  async function updateItem(id: string, item: NewClosetItem): Promise<MutationResult> {
    const userId = requireUserId();
    const existingItem = items.find((currentItem) => currentItem.id === id);

    if (!existingItem) {
      throw new Error('This item was not found or you no longer have access to it.');
    }

    if (!item.imageUri) {
      throw new Error('Please add a photo before saving.');
    }

    const hasNewImage = item.imageUri !== existingItem.imageUri;
    const uploadedImage = hasNewImage
      ? await uploadStorageImage(userId, item.imageUri)
      : undefined;
    const nextImagePath = uploadedImage?.path ?? existingItem.imagePath;

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update({
          name: item.name.trim() || 'Untitled item',
          brand: item.brand.trim(),
          category: item.category,
          size: item.size.trim(),
          notes: item.notes.trim(),
          image_url: nextImagePath,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select(CLOTHING_ITEM_COLUMNS)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('This item was not found or you no longer have access to it.');
      }

      const updatedItem = toClosetItem(
        data as ClothingItemRow,
        uploadedImage?.signedUrl ?? existingItem.imageUri
      );
      setItems((currentItems) =>
        currentItems.map((currentItem) => (currentItem.id === id ? updatedItem : currentItem))
      );

      let cleanupWarning: string | undefined;
      if (
        uploadedImage &&
        existingItem.imagePath !== uploadedImage.path &&
        isUserStoragePath(existingItem.imagePath, userId)
      ) {
        const cleanupError = await removeStorageImage(existingItem.imagePath);
        if (cleanupError) {
          console.error('Unable to remove replaced clothing image:', cleanupError);
          cleanupWarning = 'The item was saved, but its previous photo could not be removed.';
        }
      }

      return { item: updatedItem, cleanupWarning };
    } catch (error) {
      console.error('Unable to update clothing item:', error);

      if (uploadedImage) {
        const cleanupError = await removeStorageImage(uploadedImage.path);
        if (cleanupError) {
          console.error('Unable to clean up image after failed item update:', cleanupError);
          throw new Error(
            'The item was not updated, and its newly uploaded photo could not be cleaned up automatically.'
          );
        }
      }

      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }

      throw new Error(friendlyOperationError('update'));
    }
  }

  async function deleteItem(id: string): Promise<DeleteResult> {
    const userId = requireUserId();
    const existingItem = items.find((item) => item.id === id);

    if (!existingItem) {
      throw new Error('This item was not found or you no longer have access to it.');
    }

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('This item was not found or you no longer have access to it.');
      }
    } catch (error) {
      console.error('Unable to delete clothing item:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(friendlyOperationError('delete'));
    }

    // Remove the row from the UI as soon as the authoritative database delete succeeds.
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    if (!isUserStoragePath(existingItem.imagePath, userId)) {
      return {};
    }

    const cleanupError = await removeStorageImage(existingItem.imagePath);
    if (cleanupError) {
      console.error('Unable to remove image after item deletion:', cleanupError);
      return {
        cleanupWarning: 'The item was deleted, but its photo could not be removed automatically.',
      };
    }

    return {};
  }

  return (
    <ClosetContext.Provider
      value={{
        items,
        isLoading,
        loadingError,
        refreshItems,
        addItem,
        updateItem,
        deleteItem,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
}

export function useCloset() {
  const context = useContext(ClosetContext);

  if (!context) {
    throw new Error('useCloset must be used inside ClosetProvider');
  }

  return context;
}
