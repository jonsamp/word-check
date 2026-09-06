import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Constants from "expo-constants";
import { useObserve } from "expo-observe";
import { logEvent } from "../../utils/analytics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { useDictionary } from "../../contexts/DictionaryContext";
import { Dictionary, DictionaryNames } from "../../constants/dictionary";
import { useDifficulty } from "../../contexts/DifficultyContext";
import { Difficulty, DifficultyNames, DifficultyDescriptions } from "../../constants/difficulty";
import { BlueCheckIcon, ChevronDownIcon } from "../../components/Icons";
import { Collapsible } from "../../components/collapsible";

const DICTIONARY_DESCRIPTIONS: Record<Dictionary, string> = {
  [Dictionary.NWL23]: "NASPA Word List (NWL) 2023 Edition",
  [Dictionary.CSW24]: "Collins SCRABBLE™ Words (CSW) 2024 Edition",
  [Dictionary.NSWL23]: "NASPA School Word List (NSWL) 2023 Edition",
};

const DICTIONARY_ORDER = [Dictionary.NWL23, Dictionary.CSW24, Dictionary.NSWL23];
const DIFFICULTY_ORDER = [Difficulty.Level1, Difficulty.Level2, Difficulty.Level3];

const CRASH_TAP_COUNT = 5;
const CRASH_TAP_WINDOW_MS = 1500;
const APP_VERSION = Constants.expoConfig?.version ?? "unknown";
const COLLAPSE_DURATION = 260;

const LEGAL_TEXT = [
  "NASPA Word List © North American Scrabble Players Association.",
  "Collins Scrabble Words © HarperCollins Publishers Ltd.",
  "SCRABBLE® is a trademark of Hasbro, Inc. (US/Canada) and Mattel, Inc. (elsewhere).",
].join("\n");

function throwTestCrash() {
  setTimeout(() => {
    throw new Error("Test crash");
  }, 0);
}

function confirmTestCrash() {
  if (Platform.OS === "web") {
    if (window.confirm("Trigger test crash? This will crash the app.")) {
      throwTestCrash();
    }
    return;
  }

  Alert.alert("Trigger test crash?", "This will crash the app.", [
    { text: "Cancel", style: "cancel" },
    { text: "Crash", style: "destructive", onPress: throwTestCrash },
  ]);
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary, setDictionary } = useDictionary();
  const { currentDifficulty, setDifficulty } = useDifficulty();
  const { markInteractive } = useObserve();
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const aboutProgress = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${aboutProgress.value * 180}deg` }],
  }));

  useEffect(() => {
    aboutProgress.value = withTiming(isAboutExpanded ? 1 : 0, {
      duration: COLLAPSE_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [isAboutExpanded, aboutProgress]);

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const versionTapCount = useRef(0);
  const versionTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (versionTapTimeout.current) {
        clearTimeout(versionTapTimeout.current);
      }
    };
  }, []);

  const handleVersionPress = () => {
    if (versionTapTimeout.current) {
      clearTimeout(versionTapTimeout.current);
      versionTapTimeout.current = null;
    }

    versionTapCount.current += 1;

    if (versionTapCount.current >= CRASH_TAP_COUNT) {
      versionTapCount.current = 0;
      confirmTestCrash();
      return;
    }

    versionTapTimeout.current = setTimeout(() => {
      versionTapCount.current = 0;
    }, CRASH_TAP_WINDOW_MS);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 8,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView style={{ marginBottom: 12, paddingHorizontal: 20 }}>
        <Text style={[styles.header, { color: textColor, top: 8 }]}>Settings</Text>
      </RNView>
      <RNView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionHeader, { color: textSecondaryColor }]}>Dictionary</Text>
          <RNView style={[styles.group, { backgroundColor }]}>
            {DICTIONARY_ORDER.map((dictionary, index) => {
              const isSelected = currentDictionary === dictionary;
              const isLast = index === DICTIONARY_ORDER.length - 1;

              return (
                <Pressable
                  key={dictionary}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={DictionaryNames[dictionary]}
                  accessibilityHint={DICTIONARY_DESCRIPTIONS[dictionary]}
                  onPress={() => {
                    if (dictionary !== currentDictionary) {
                      logEvent("dictionary.changed", {
                        attributes: { dictionary },
                      });
                    }
                    setDictionary(dictionary);
                  }}
                  style={[
                    styles.row,
                    {
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  <RNView style={styles.rowText}>
                    <Text style={{ ...type.body, fontWeight: "500" }}>
                      {DictionaryNames[dictionary]}
                    </Text>
                    <Text
                      style={{
                        ...type.footnote,
                        color: textSecondaryColor,
                        marginTop: 5,
                      }}
                    >
                      {DICTIONARY_DESCRIPTIONS[dictionary]}
                    </Text>
                  </RNView>
                  {isSelected && (
                    <RNView style={{ marginRight: 4 }}>
                      <BlueCheckIcon />
                    </RNView>
                  )}
                </Pressable>
              );
            })}
          </RNView>

          <Text style={[styles.sectionHeader, { color: textSecondaryColor, marginTop: 32 }]}>
            Quiz Difficulty
          </Text>
          <RNView style={[styles.group, { backgroundColor }]}>
            {DIFFICULTY_ORDER.map((difficulty, index) => {
              const isSelected = currentDifficulty === difficulty;
              const isLast = index === DIFFICULTY_ORDER.length - 1;

              return (
                <Pressable
                  key={difficulty}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={DifficultyNames[difficulty]}
                  accessibilityHint={DifficultyDescriptions[difficulty]}
                  onPress={() => {
                    if (difficulty !== currentDifficulty) {
                      logEvent("difficulty.changed", {
                        attributes: { difficulty },
                      });
                    }
                    setDifficulty(difficulty);
                  }}
                  style={[
                    styles.row,
                    {
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  <RNView style={styles.rowText}>
                    <Text style={{ ...type.body, fontWeight: "500" }}>
                      {DifficultyNames[difficulty]}
                    </Text>
                    <Text
                      style={{
                        ...type.footnote,
                        color: textSecondaryColor,
                        marginTop: 5,
                      }}
                    >
                      {DifficultyDescriptions[difficulty]}
                    </Text>
                  </RNView>
                  {isSelected && (
                    <RNView style={{ marginRight: 4 }}>
                      <BlueCheckIcon />
                    </RNView>
                  )}
                </Pressable>
              );
            })}
          </RNView>

          <Text style={[styles.sectionHeader, { color: textSecondaryColor, marginTop: 32 }]}>
            About
          </Text>
          <RNView style={[styles.group, { backgroundColor }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Legal and attribution"
              accessibilityState={{ expanded: isAboutExpanded }}
              onPress={() => setIsAboutExpanded(!isAboutExpanded)}
              style={styles.row}
            >
              <RNView style={styles.rowText}>
                <Text style={{ ...type.body, fontWeight: "500" }}>Legal and attribution</Text>
              </RNView>
              <Animated.View style={[{ marginRight: 4 }, chevronStyle]}>
                <ChevronDownIcon color={textSecondaryColor} size={18} />
              </Animated.View>
            </Pressable>
            <Collapsible expanded={isAboutExpanded} duration={COLLAPSE_DURATION}>
              <RNView
                style={[
                  styles.legalBlock,
                  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor },
                ]}
              >
                <Text
                  style={{
                    ...type.footnote,
                    color: textSecondaryColor,
                    lineHeight: 20,
                  }}
                >
                  {LEGAL_TEXT}
                </Text>
              </RNView>
            </Collapsible>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Version ${APP_VERSION}`}
              onPress={handleVersionPress}
              style={[
                styles.row,
                {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: borderColor,
                },
              ]}
            >
              <RNView style={styles.rowText}>
                <Text style={{ ...type.body, fontWeight: "500" }}>Version</Text>
              </RNView>
              <Text
                style={{
                  ...type.numeric,
                  color: textSecondaryColor,
                  marginRight: 4,
                }}
              >
                {APP_VERSION}
              </Text>
            </Pressable>
          </RNView>
        </ScrollView>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    marginBottom: 16,
    fontSize: 24,
  },
  sectionHeader: {
    ...type.sectionHeader,
    marginBottom: 10,
    marginLeft: 4,
  },
  group: {
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  legalBlock: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
});
