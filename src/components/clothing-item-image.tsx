import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type ClothingItemImageProps = {
  imageUri: string;
  itemName: string;
  disabled?: boolean;
  hasError?: boolean;
  onPress?: () => void;
  showEditLabel?: boolean;
};

export function ClothingItemImage({
  imageUri,
  itemName,
  disabled = false,
  hasError = false,
  onPress,
  showEditLabel = false,
}: ClothingItemImageProps) {
  return (
    <Pressable
      accessibilityHint={onPress ? 'Opens your photo library' : undefined}
      accessibilityLabel={onPress ? 'Change item photo' : `${itemName} photo`}
      accessibilityRole={onPress ? 'button' : 'image'}
      disabled={!onPress || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.imageFrame,
        hasError && styles.imageFrameError,
        pressed && styles.imageFramePressed,
      ]}
    >
      {imageUri ? (
        <Image
          accessibilityLabel={`${itemName} photo`}
          resizeMode="cover"
          source={{ uri: imageUri }}
          style={styles.image}
        />
      ) : (
        <Text style={styles.placeholderLabel}>clothing cutout</Text>
      )}

      {showEditLabel ? (
        <View style={styles.editLabel}>
          <Text style={styles.editLabelText}>
            {imageUri ? 'Tap to change' : 'Tap to add photo'}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageFrame: {
    width: '100%',
    aspectRatio: 8 / 7,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
    overflow: 'hidden',
  },
  imageFrameError: {
    borderColor: '#8a1230',
  },
  imageFramePressed: {
    opacity: 0.82,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderLabel: {
    color: '#251313',
    opacity: 0.54,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    lineHeight: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  editLabel: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 252, 242, 0.92)',
  },
  editLabelText: {
    color: '#8a1230',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
});
