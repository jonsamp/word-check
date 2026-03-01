import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";

import { View, Text, useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { getPackById, getMaxBlanks } from "../../../constants/packs";
import { PracticeHeader } from "../../../components/practice/PracticeHeader";
import { useDictionary } from "../../../contexts/DictionaryContext";

function CardsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h12v12H4zM8 8h12v12H8z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GridIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function KeyboardIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM6 10h0M10 10h0M14 10h0M18 10h0M8 14h8"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MinusIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function PackDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const { currentDictionary } = useDictionary();

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const primaryColor = useThemeColor("primary");
  const backgroundSecondary = useThemeColor("backgroundSecondary");

  const pack = getPackById(packId);
  const maxBlanks = pack ? getMaxBlanks(pack) : 1;
  const [blanks, setBlanks] = useState(1);

  if (!pack) {
    return (
      <View style={{ flex: 1 }} colorKey="backgroundSecondary">
        <PracticeHeader title="Not Found" onBack={() => router.back()} />
        <RNView style={styles.centered}>
          <Text style={[type.body, { color: textSecondaryColor }]}>
            Pack not found.
          </Text>
        </RNView>
      </View>
    );
  }

  const dictionaryLabel =
    currentDictionary === "NWL23"
      ? "NWL23"
      : currentDictionary === "CSW24"
        ? "CSW24"
        : "NSWL23";

  function handleModePress(mode: "flashcards" | "quiz" | "free-type") {
    router.push(`/practice/${packId}/${mode}?blanks=${blanks}`);
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <PracticeHeader title={pack.name} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
          {pack.words.length} words  ·  {dictionaryLabel}
        </Text>

        <TouchableOpacity
          style={[
            styles.modeCard,
            {
              borderColor,
              backgroundColor,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
          onPress={() => handleModePress("flashcards")}
          activeOpacity={0.7}
        >
          <RNView style={styles.modeCardIcon}>
            <CardsIcon color={textColor} />
          </RNView>
          <RNView style={styles.modeCardText}>
            <Text style={[styles.modeName, { color: textColor }]}>
              Flashcards
            </Text>
            <Text style={[styles.modeDescription, { color: textSecondaryColor }]}>
              Read through all words
            </Text>
          </RNView>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeCard,
            {
              borderColor,
              backgroundColor,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
          onPress={() => handleModePress("quiz")}
          activeOpacity={0.7}
        >
          <RNView style={styles.modeCardIcon}>
            <GridIcon color={textColor} />
          </RNView>
          <RNView style={styles.modeCardText}>
            <Text style={[styles.modeName, { color: textColor }]}>Quiz</Text>
            <Text style={[styles.modeDescription, { color: textSecondaryColor }]}>
              Fill in the blank
            </Text>
          </RNView>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeCard,
            {
              borderColor,
              backgroundColor,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
          onPress={() => handleModePress("free-type")}
          activeOpacity={0.7}
        >
          <RNView style={styles.modeCardIcon}>
            <KeyboardIcon color={textColor} />
          </RNView>
          <RNView style={styles.modeCardText}>
            <Text style={[styles.modeName, { color: textColor }]}>
              Free Type
            </Text>
            <Text style={[styles.modeDescription, { color: textSecondaryColor }]}>
              Type the missing letters
            </Text>
          </RNView>
        </TouchableOpacity>

        <RNView style={styles.sliderSection}>
          <Text style={[styles.sliderLabel, { color: textSecondaryColor }]}>
            Blanks per word
          </Text>
          <RNView style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setBlanks((b) => Math.max(1, b - 1))}
              style={[
                styles.stepperButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth: StyleSheet.hairlineWidth,
                  opacity: blanks <= 1 ? 0.3 : 1,
                },
              ]}
              disabled={blanks <= 1}
              activeOpacity={0.7}
            >
              <MinusIcon color={textColor} />
            </TouchableOpacity>

            <RNView style={styles.stepperValueContainer}>
              <RNView style={styles.stepperTrack}>
                {Array.from({ length: maxBlanks }, (_, i) => (
                  <RNView
                    key={i}
                    style={[
                      styles.stepperDot,
                      {
                        backgroundColor:
                          i < blanks ? primaryColor : backgroundSecondary,
                      },
                    ]}
                  />
                ))}
              </RNView>
              <Text style={[styles.stepperValue, { color: textColor }]}>
                {blanks} / {maxBlanks}
              </Text>
            </RNView>

            <TouchableOpacity
              onPress={() => setBlanks((b) => Math.min(maxBlanks, b + 1))}
              style={[
                styles.stepperButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth: StyleSheet.hairlineWidth,
                  opacity: blanks >= maxBlanks ? 0.3 : 1,
                },
              ]}
              disabled={blanks >= maxBlanks}
              activeOpacity={0.7}
            >
              <PlusIcon color={textColor} />
            </TouchableOpacity>
          </RNView>
        </RNView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    ...type.callout,
    textAlign: "center",
    marginBottom: 32,
  },
  modeCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  modeCardIcon: {
    marginRight: 16,
  },
  modeCardText: {
    flex: 1,
  },
  modeName: {
    ...type.headline,
  },
  modeDescription: {
    ...type.caption,
    marginTop: 2,
  },
  sliderSection: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    ...type.caption,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValueContainer: {
    alignItems: "center",
    flex: 1,
  },
  stepperTrack: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  stepperDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepperValue: {
    ...type.callout,
  },
});
