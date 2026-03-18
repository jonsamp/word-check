import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { Link } from "expo-router";

const appIcon = require("../assets/images/icon.png");

const FEATURES = [
  {
    title: "Word Validation",
    description: "Instantly check if any word is valid in your chosen Scrabble dictionary.",
  },
  {
    title: "Definitions",
    description: "See the official definition for every valid word you look up.",
  },
  {
    title: "Practice Quizzes",
    description:
      "Test your word knowledge with fill-in-the-blank quizzes across curated word lists.",
  },
  {
    title: "Multiple Dictionaries",
    description: "Switch between NWL23, CSW24, and NSWL23 official Scrabble word lists.",
  },
  {
    title: "Difficulty Levels",
    description: "Customize quiz difficulty from beginner to expert to match your skill level.",
  },
  {
    title: "Dark Mode",
    description: "A beautiful dark interface designed for comfortable use anytime.",
  },
];

// TODO: Replace with actual App Store URL
const APP_STORE_URL = "https://apps.apple.com/app/word-check";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.jonsamp.wordcheck";

export default function Home() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image source={appIcon} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Word Check</Text>
          </View>
          <Link href="/privacy">
            <Text style={styles.headerLink}>Privacy</Text>
          </Link>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Image source={appIcon} style={styles.heroIcon} />
        <Text style={styles.heroTitle}>Check any word.</Text>
        <Text style={styles.heroDescription}>
          Word Check validates words against official Scrabble dictionaries, shows definitions, and
          helps you practice with customizable quizzes.
        </Text>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => Linking.openURL(APP_STORE_URL)}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          >
            <Text style={styles.linkButtonText}>App Store</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          >
            <Text style={styles.linkButtonText}>Google Play</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("/")}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          >
            <Text style={styles.linkButtonText}>Open Web App</Text>
          </Pressable>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Everything you need to play</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Image source={appIcon} style={styles.footerIcon} />
          <Text style={styles.footerTitle}>Word Check</Text>
        </View>
        <Text style={styles.footerText}>Made by Jon Samp</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#EAE6DB",
  },
  contentContainer: {
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  headerTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 18,
    color: "#3B352B",
  },
  headerLink: {
    fontFamily: "New York",
    fontSize: 16,
    color: "#71624B",
  },
  hero: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 80,
    paddingHorizontal: 24,
    maxWidth: 700,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  heroTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 48,
    color: "#3B352B",
    textAlign: "center",
    marginTop: 24,
  },
  heroDescription: {
    fontFamily: "New York",
    fontSize: 18,
    color: "#71624B",
    textAlign: "center",
    lineHeight: 28,
    marginTop: 16,
    maxWidth: 550,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  linkButton: {
    borderWidth: 1,
    borderColor: "#CBC0AA",
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#F2F0E7",
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkButtonText: {
    fontFamily: "New York",
    fontSize: 16,
    color: "#3B352B",
    fontWeight: "500",
  },
  section: {
    width: "100%",
    maxWidth: 1100,
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 32,
    color: "#3B352B",
    textAlign: "center",
    marginBottom: 32,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
  },
  featureCard: {
    backgroundColor: "#F2F0E7",
    borderRadius: 16,
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 340,
  },
  featureTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 18,
    color: "#3B352B",
    marginBottom: 8,
  },
  featureDescription: {
    fontFamily: "New York",
    fontSize: 15,
    color: "#71624B",
    lineHeight: 22,
  },
  divider: {
    width: "100%",
    maxWidth: 1100,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#CBC0AA",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  footerTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 16,
    color: "#3B352B",
  },
  footerText: {
    fontFamily: "New York",
    fontSize: 14,
    color: "#71624B",
  },
});
