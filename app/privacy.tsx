import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native";

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SubTitle({ children }: { children: string }) {
  return <Text style={styles.subTitle}>{children}</Text>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>{"\u2022"}</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function Privacy() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: March 18, 2026</Text>

        <Paragraph>
          Jon Samp ("we," "us," or "our") operates the Word Check mobile application (the "App").
          This Privacy Policy explains what information we collect, how we use it, and your choices.
        </Paragraph>

        <SectionTitle>Information We Collect</SectionTitle>

        <SubTitle>Information You Provide</SubTitle>
        <Paragraph>
          All data you create in the App — including dictionary preferences, quiz difficulty
          settings, and quiz scores — is stored locally on your device. This data is not transmitted
          to us or any third party.
        </Paragraph>

        <SubTitle>Automatically Collected Information</SubTitle>
        <Paragraph>
          The App collects anonymous performance and usage metrics to help us improve the experience.
          This includes app startup times, screen render performance, and general usage patterns. No
          personal information, device identifiers, or advertising IDs are included in these metrics.
        </Paragraph>

        <SectionTitle>Third-Party Services</SectionTitle>
        <Paragraph>
          The App uses the following third-party services that may process limited data:
        </Paragraph>
        <View style={styles.bulletList}>
          <BulletItem>
            Expo — Provides over-the-air app updates. Expo may process limited technical information
            (such as app version and platform) to deliver updates. No personal information is
            collected.
          </BulletItem>
          <BulletItem>
            EAS Observe — Collects anonymous app performance metrics such as startup times, screen
            render durations, and frame rate data. No personal information is collected.
          </BulletItem>
          <BulletItem>
            Expo Insights — Collects anonymous usage analytics such as session counts and screen
            views. No personal information is collected.
          </BulletItem>
        </View>

        <SectionTitle>What We Do Not Collect</SectionTitle>
        <Paragraph>We do not collect, store, or transmit:</Paragraph>
        <View style={styles.bulletList}>
          <BulletItem>Names, email addresses, or phone numbers</BulletItem>
          <BulletItem>Location data</BulletItem>
          <BulletItem>Device identifiers or advertising IDs</BulletItem>
          <BulletItem>Photos, contacts, or calendar data</BulletItem>
          <BulletItem>Health or fitness data</BulletItem>
          <BulletItem>Browsing history</BulletItem>
          <BulletItem>Word lookup history or quiz results</BulletItem>
        </View>
        <Paragraph>
          The App does not require an account or login. There is no user tracking across devices.
        </Paragraph>

        <SectionTitle>Data Storage and Security</SectionTitle>
        <Paragraph>
          Your dictionary preferences, quiz scores, and settings are stored locally on your device.
          The word database used for validation is bundled with the App and does not require network
          access. No data is transmitted to external servers during normal use.
        </Paragraph>

        <SectionTitle>Data Retention</SectionTitle>
        <Paragraph>
          Locally stored data (preferences, scores) remains on your device until you clear the App's
          data or uninstall the App.
        </Paragraph>

        <SectionTitle>Your Rights and Choices</SectionTitle>
        <View style={styles.bulletList}>
          <BulletItem>Local data: Uninstalling the App removes all locally stored data.</BulletItem>
          <BulletItem>
            Data access and deletion: To request information about your data or its deletion,
            contact us at sampjon@gmail.com.
          </BulletItem>
        </View>

        <SectionTitle>Children's Privacy</SectionTitle>
        <Paragraph>
          The App is not directed at children under 16. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal
          information, please contact us and we will delete it.
        </Paragraph>

        <SectionTitle>International Users</SectionTitle>
        <Paragraph>
          European Economic Area (GDPR): Since we do not collect or process personal information,
          GDPR obligations are minimal. You have the right to contact us with any data-related
          requests.
        </Paragraph>
        <Paragraph>
          California (CCPA): We do not sell personal information. We do not share personal
          information for cross-context behavioral advertising.
        </Paragraph>

        <SectionTitle>Changes to This Policy</SectionTitle>
        <Paragraph>
          We may update this Privacy Policy from time to time. Changes will be reflected by updating
          the "Last Updated" date above. Continued use of the App after changes constitutes
          acceptance of the updated policy.
        </Paragraph>

        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          If you have questions about this Privacy Policy, contact us at: sampjon@gmail.com
        </Paragraph>
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
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 800,
  },
  pageTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 36,
    color: "#3B352B",
  },
  lastUpdated: {
    fontFamily: "New York",
    fontSize: 14,
    color: "#71624B",
    marginBottom: 24,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 24,
    color: "#3B352B",
    marginTop: 32,
    marginBottom: 12,
  },
  subTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 16,
    color: "#3B352B",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: "New York",
    fontSize: 16,
    color: "#71624B",
    lineHeight: 26,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: "row",
    paddingLeft: 16,
    marginBottom: 10,
  },
  bullet: {
    fontFamily: "New York",
    fontSize: 16,
    color: "#71624B",
    lineHeight: 26,
    marginRight: 12,
  },
  bulletText: {
    fontFamily: "New York",
    fontSize: 16,
    color: "#71624B",
    lineHeight: 26,
    flex: 1,
  },
});
