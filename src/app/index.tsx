import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

const features = [
  {
    title: 'Upload pieces',
    detail: 'Add clothes from photos.',
  },
  {
    title: 'Sticker-style closet',
    detail: 'Organize your wardrobe.',
  },
  {
    title: 'Borrow with friends',
    detail: 'Share and request pieces.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/closet" />;
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.notebookPage}>
        <View style={styles.ruleLines}>
          {Array.from({ length: 25 }).map((_, index) => (
            <View key={index} style={styles.ruleLine} />
          ))}
        </View>

        <View style={[styles.backgroundPaper, styles.lowerBackgroundPaper]} />

        <View style={styles.headerRow}>
          <Text style={styles.brand}>Closet App</Text>
          <Text style={styles.headerTag}>Social closet</Text>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.kicker}>College closets, shared well</Text>
          <Text style={styles.title}>Your closet, cut out and shared.</Text>
          <Text style={styles.description}>
            Upload your pieces, organize your wardrobe, and borrow with friends.
          </Text>
        </View>

        <View style={styles.collage}>
          <View style={[styles.paperCard, styles.mainPhotoCard]}>
            <View style={[styles.tape, styles.mainTape]} />
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderLabel}>closet photo</Text>
            </View>
            <View style={styles.paperNote}>
              <Text style={styles.noteText}>paper note image</Text>
            </View>
            <Text style={styles.collageCaption}>Friday rotation</Text>
          </View>

          <View style={[styles.paperCard, styles.objectCard]}>
            <View style={[styles.tape, styles.objectTape]} />
            <View style={styles.objectSlotLarge}>
              <Text style={styles.objectLabel}>sunglasses cutout</Text>
            </View>
            <View style={styles.objectSlotSmall}>
              <Text style={styles.objectLabel}>matcha sticker</Text>
            </View>
          </View>

          <View style={[styles.paperCard, styles.textureCard]}>
            <View style={styles.tapeSample}>
              <Text style={styles.textureLabel}>tape texture</Text>
            </View>
            <View style={styles.texturePhoto}>
              <Text style={styles.textureLabel}>lifestyle photo</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/onboarding')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Start Your Closet</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </Pressable>
        </View>

        <View style={styles.featureGrid}>
          {features.map((feature, index) => (
            <View key={feature.title} style={styles.featureCard}>
              <Text style={styles.featureNumber}>0{index + 1}</Text>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDetail}>{feature.detail}</Text>
              </View>
            </View>
          ))}
        </View>
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
  },
  notebookPage: {
    flex: 1,
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
    width: 260,
    height: 170,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    opacity: 0.58,
  },
  lowerBackgroundPaper: {
    left: -118,
    bottom: 156,
    transform: [{ rotate: '8deg' }],
  },
  headerRow: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brand: {
    color: '#251313',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 24,
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
  heroText: {
    zIndex: 2,
    maxWidth: 345,
  },
  kicker: {
    marginBottom: 10,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  title: {
    color: '#251313',
    fontSize: 39,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 44,
  },
  description: {
    marginTop: 12,
    maxWidth: 318,
    color: '#251313',
    opacity: 0.74,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  collage: {
    zIndex: 2,
    height: 316,
    marginTop: 28,
  },
  paperCard: {
    position: 'absolute',
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
  mainPhotoCard: {
    top: 18,
    left: 0,
    width: 216,
    height: 246,
    padding: 12,
    transform: [{ rotate: '-0.8deg' }],
  },
  mainTape: {
    top: -8,
    left: 28,
    transform: [{ rotate: '-4deg' }],
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
  },
  placeholderLabel: {
    color: '#251313',
    opacity: 0.72,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  paperNote: {
    position: 'absolute',
    right: -18,
    top: 68,
    width: 104,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fffcf2',
    transform: [{ rotate: '2.5deg' }],
  },
  noteText: {
    color: '#8a1230',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    lineHeight: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  collageCaption: {
    marginTop: 10,
    color: '#251313',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 13,
    opacity: 0.76,
    textTransform: 'uppercase',
  },
  objectCard: {
    top: 4,
    right: 0,
    width: 118,
    height: 158,
    padding: 10,
    transform: [{ rotate: '1.6deg' }],
  },
  objectTape: {
    top: -7,
    right: 16,
    width: 48,
    backgroundColor: '#89a480',
    transform: [{ rotate: '6deg' }],
  },
  objectSlotLarge: {
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#251313',
    borderRadius: 4,
    backgroundColor: '#fffcf2',
  },
  objectSlotSmall: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#89a480',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
  },
  objectLabel: {
    color: '#251313',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  textureCard: {
    right: 18,
    bottom: 16,
    width: 142,
    height: 104,
    padding: 10,
    transform: [{ rotate: '-1.4deg' }],
  },
  tapeSample: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    backgroundColor: '#c1c9b6',
  },
  texturePhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
  },
  textureLabel: {
    color: '#251313',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  actions: {
    zIndex: 2,
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 7,
    backgroundColor: '#8a1230',
    shadowColor: '#8a1230',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fffcf2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#8a1230',
    borderRadius: 7,
    backgroundColor: '#fffcf2',
  },
  secondaryButtonText: {
    color: '#251313',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  featureGrid: {
    zIndex: 2,
    gap: 10,
    marginTop: 24,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#c1c9b6',
    borderLeftColor: '#8a1230',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
  },
  featureNumber: {
    width: 34,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: '#251313',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
  },
  featureDetail: {
    marginTop: 5,
    color: '#251313',
    opacity: 0.74,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
