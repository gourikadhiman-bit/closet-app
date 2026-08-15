import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const steps = [
  {
    number: '01',
    title: 'Upload your pieces',
    detail: 'Add clothes from photos.',
  },
  {
    number: '02',
    title: 'Build your closet',
    detail: 'Sort everything your way.',
  },
  {
    number: '03',
    title: 'Borrow with friends',
    detail: 'Share and request pieces.',
  },
];

export default function OnboardingScreen() {
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

        <View style={[styles.backgroundPaper, styles.upperPaper]} />
        <View style={[styles.backgroundPaper, styles.lowerPaper]} />

        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTag}>Onboarding</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Closet notes</Text>
          <Text style={styles.title}>Start with three simple moves.</Text>
          <Text style={styles.description}>
            Build a closet you can organize, style, and share with the friends you borrow from most.
          </Text>
        </View>

        <View style={styles.previewCard}>
          <View style={[styles.tape, styles.previewTape]} />
          <View style={styles.previewPhoto}>
            <Text style={styles.previewLabel}>closet setup preview</Text>
          </View>
          <View style={styles.previewNote}>
            <Text style={styles.previewNoteText}>saved fits</Text>
          </View>
        </View>

        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <View key={step.number} style={styles.stepCard}>
              {index === 1 && <View style={[styles.tape, styles.stepTape]} />}
              <Text style={styles.stepNumber}>{step.number}</Text>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/signup')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>
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
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    opacity: 0.58,
  },
  upperPaper: {
    top: 126,
    right: -92,
    width: 228,
    height: 148,
    transform: [{ rotate: '-8deg' }],
  },
  lowerPaper: {
    left: -118,
    bottom: 132,
    width: 260,
    height: 170,
    transform: [{ rotate: '8deg' }],
  },
  headerRow: {
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
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 43,
  },
  description: {
    marginTop: 12,
    color: '#251313',
    opacity: 0.74,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  previewCard: {
    zIndex: 2,
    height: 150,
    marginTop: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 6,
    backgroundColor: '#fffcf2',
    shadowColor: '#251313',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
    transform: [{ rotate: '-0.7deg' }],
  },
  tape: {
    position: 'absolute',
    height: 18,
    width: 64,
    borderRadius: 2,
    backgroundColor: '#c1c9b6',
    opacity: 0.74,
  },
  previewTape: {
    top: -8,
    left: 28,
    transform: [{ rotate: '-4deg' }],
  },
  previewPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fbf3e7',
  },
  previewLabel: {
    color: '#251313',
    opacity: 0.7,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  previewNote: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c1c9b6',
    borderRadius: 4,
    backgroundColor: '#fffcf2',
    transform: [{ rotate: '2deg' }],
  },
  previewNoteText: {
    color: '#8a1230',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  stepList: {
    zIndex: 2,
    gap: 10,
    marginTop: 24,
  },
  stepCard: {
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
  stepTape: {
    top: -7,
    right: 18,
    width: 52,
    backgroundColor: '#89a480',
    transform: [{ rotate: '4deg' }],
  },
  stepNumber: {
    width: 34,
    color: '#8a1230',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 15,
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: '#251313',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
  },
  stepDetail: {
    marginTop: 4,
    color: '#251313',
    opacity: 0.7,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  primaryButton: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 24,
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
  buttonPressed: {
    opacity: 0.82,
  },
});
