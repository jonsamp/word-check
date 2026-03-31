import { useEffect } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import AppMetrics from "expo-app-metrics";
import { Path, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { useDictionary } from "../../contexts/DictionaryContext";
import { Dictionary, DictionaryNames } from "../../constants/dictionary";
import { useDifficulty } from "../../contexts/DifficultyContext";
import { Difficulty, DifficultyNames, DifficultyDescriptions } from "../../constants/difficulty";
import { BlueCheckIcon } from "../../components/Icons";

const DICTIONARY_DESCRIPTIONS: Record<Dictionary, string> = {
  [Dictionary.NWL23]: "NASPA Word List (NWL) 2023 Edition",
  [Dictionary.CSW24]: "Collins SCRABBLE™ Words (CSW) 2024 Edition",
  [Dictionary.NSWL23]: "NASPA School Word List (NSWL) 2023 Edition",
};

const DICTIONARY_ORDER = [Dictionary.NWL23, Dictionary.CSW24, Dictionary.NSWL23];
const DIFFICULTY_ORDER = [Difficulty.Level1, Difficulty.Level2, Difficulty.Level3];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary, setDictionary } = useDictionary();
  const { currentDifficulty, setDifficulty } = useDifficulty();

  useEffect(() => {
    AppMetrics.markInteractive();
  }, []);

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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80 }}
      >
        <Text
          style={{
            ...type.footnote,
            color: textSecondaryColor,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Dictionary
        </Text>
        <RNView
          style={{
            borderRadius: 16,
            backgroundColor,
            overflow: "hidden",
          }}
        >
          {DICTIONARY_ORDER.map((dict, index) => {
            const isSelected = currentDictionary === dict;
            const isLast = index === DICTIONARY_ORDER.length - 1;

            return (
              <Pressable
                key={dict}
                onPress={() => setDictionary(dict)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }}
              >
                <RNView style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ ...type.body, fontWeight: "500" }}>{DictionaryNames[dict]}</Text>
                  <Text style={{ ...type.footnote, color: textSecondaryColor, marginTop: 6 }}>
                    {DICTIONARY_DESCRIPTIONS[dict]}
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
        <Text
          style={{
            ...type.footnote,
            color: textSecondaryColor,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
            marginTop: 32,
            marginLeft: 4,
          }}
        >
          Quiz Difficulty
        </Text>
        <RNView
          style={{
            borderRadius: 16,
            backgroundColor,
            overflow: "hidden",
          }}
        >
          {DIFFICULTY_ORDER.map((diff, index) => {
            const isSelected = currentDifficulty === diff;
            const isLast = index === DIFFICULTY_ORDER.length - 1;

            return (
              <Pressable
                key={diff}
                onPress={() => setDifficulty(diff)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }}
              >
                <RNView style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ ...type.body, fontWeight: "500" }}>{DifficultyNames[diff]}</Text>
                  <Text style={{ ...type.footnote, color: textSecondaryColor, marginTop: 6 }}>
                    {DifficultyDescriptions[diff]}
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
        <RNView
          style={{
            borderRadius: 16,
            backgroundColor,
            overflow: "hidden",
            marginTop: 32,
          }}
        >
          <Pressable
            onPress={() => Linking.openURL("https://buymeacoffee.com/jonsamp")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 18,
              paddingHorizontal: 16,
            }}
          >
            <RNView style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ ...type.body, fontWeight: "500" }}>Buy Me a Coffee</Text>
              <Text style={{ ...type.footnote, color: textSecondaryColor, marginTop: 6 }}>
                An optional donation that does not unlock any features
              </Text>
            </RNView>
            <ExternalLinkIcon color={textSecondaryColor} />
          </Pressable>
        </RNView>
        <Text
          style={{
            ...type.body,
            marginTop: 32,
            fontSize: 13,
            lineHeight: 22,
            opacity: 0.6,
          }}
        >
          NASPA Word List © North American Scrabble Players Association.{"\n"}
          Collins Scrabble Words © HarperCollins Publishers Ltd.{"\n"}
          SCRABBLE® is a trademark of Hasbro, Inc. (US/Canada) and Mattel, Inc. (elsewhere).
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    fontFamily: "New York",
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
});

function ExternalLinkIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
