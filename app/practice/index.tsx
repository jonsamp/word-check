import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { View, Text, useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { WORD_PACKS, SECTIONS, WordPack } from "../../constants/packs";
import { ProgressBar } from "../../components/practice/ProgressBar";
import { PracticeHeader } from "../../components/practice/PracticeHeader";

interface PackScore {
  score: number;
  total: number;
  percentage: number;
}

function getStoredScore(packId: string): PackScore | null {
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(`practice_quiz_best_${packId}`);
      return raw ? JSON.parse(raw) : null;
    } else {
      const Storage = require("expo-sqlite/kv-store").default;
      const raw = Storage.getItemSync(`practice_quiz_best_${packId}`);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    return null;
  }
}

interface SectionData {
  title: string;
  data: WordPack[];
}

function buildSections(): SectionData[] {
  const sections: SectionData[] = [];
  for (const sectionName of SECTIONS) {
    const packs = WORD_PACKS.filter((p) => p.section === sectionName);
    if (packs.length > 0) {
      sections.push({ title: sectionName, data: packs });
    }
  }
  return sections;
}

function PackIcon({ icon, textColor, bgColor }: { icon: string; textColor: string; bgColor: string }) {
  return (
    <RNView
      style={[
        styles.packIcon,
        { backgroundColor: bgColor },
      ]}
    >
      <Text
        style={[
          styles.packIconText,
          { color: textColor },
        ]}
      >
        {icon}
      </Text>
    </RNView>
  );
}

export default function PracticePacksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const backgroundSecondary = useThemeColor("backgroundSecondary");
  const successColor = useThemeColor("success");

  const [scores, setScores] = useState<Record<string, PackScore>>({});
  const sections = buildSections();

  const loadScores = useCallback(() => {
    const newScores: Record<string, PackScore> = {};
    for (const pack of WORD_PACKS) {
      const score = getStoredScore(pack.id);
      if (score) {
        newScores[pack.id] = score;
      }
    }
    setScores(newScores);
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  function renderPackCard({ item }: { item: WordPack }) {
    const score = scores[item.id];
    const progress = score ? score.percentage / 100 : 0;
    const hasProgress = progress > 0;

    return (
      <TouchableOpacity
        style={[
          styles.packCard,
          {
            borderColor,
            backgroundColor,
            borderWidth: StyleSheet.hairlineWidth,
            opacity: hasProgress ? 1 : 0.85,
          },
        ]}
        onPress={() => router.push(`/practice/${item.id}`)}
        activeOpacity={0.7}
      >
        <RNView style={styles.packCardContent}>
          <PackIcon
            icon={item.icon}
            textColor={textColor}
            bgColor={backgroundSecondary}
          />
          <RNView style={styles.packCardInfo}>
            <RNView style={styles.packCardTopRow}>
              <Text style={[styles.packName, { color: textColor }]}>
                {item.name}
              </Text>
              <RNView style={styles.packCardRight}>
                <Text style={[styles.wordCount, { color: textSecondaryColor }]}>
                  {item.words.length} words
                </Text>
                {hasProgress && (
                  <Text style={[styles.percentage, { color: textSecondaryColor }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                )}
              </RNView>
            </RNView>
            <RNView style={styles.progressContainer}>
              <ProgressBar progress={progress} color={successColor} height={4} />
            </RNView>
          </RNView>
        </RNView>
      </TouchableOpacity>
    );
  }

  function renderSectionHeader({ section }: { section: SectionData }) {
    return (
      <RNView style={[styles.sectionHeader, { backgroundColor: backgroundSecondary }]}>
        <Text
          style={[
            styles.sectionHeaderText,
            { color: textSecondaryColor },
          ]}
        >
          {section.title}
        </Text>
      </RNView>
    );
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <PracticeHeader title="Practice" onBack={() => router.back()} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderPackCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeaderText: {
    ...type.label,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  packCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  packCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  packIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  packIconText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "New York",
  },
  packCardInfo: {
    flex: 1,
  },
  packCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  packName: {
    ...type.headline,
    flex: 1,
  },
  packCardRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  wordCount: {
    ...type.caption,
  },
  percentage: {
    ...type.caption,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 2,
  },
});
