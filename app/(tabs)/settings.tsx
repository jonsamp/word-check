import { useEffect } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import { Path, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { useDictionary } from "../../contexts/DictionaryContext";
import { Dictionary, DictionaryNames } from "../../constants/dictionary";
import { BlueCheckIcon } from "../../components/Icons";

const DICTIONARY_DESCRIPTIONS: Record<Dictionary, string> = {
  [Dictionary.NWL23]: "NASPA Word List (NWL) 2023 Edition",
  [Dictionary.CSW24]: "Collins SCRABBLE™ Words (CSW) 2024 Edition",
  [Dictionary.NSWL23]: "NASPA School Word List (NSWL) 2023 Edition",
};

const DICTIONARY_ORDER = [Dictionary.NWL23, Dictionary.CSW24, Dictionary.NSWL23];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary, setDictionary } = useDictionary();

  function markFirstRender() {
    if (!isWeb) {
      (async () => {
        const module = await import("expo-eas-observe");
        const AppMetrics = module.default;
        AppMetrics.markFirstRender();
      })();
    }
  }

  useEffect(() => {
    if (!isWeb) {
      (async () => {
        const module = await import("expo-eas-observe");
        const AppMetrics = module.default;
        AppMetrics.markInteractive();
      })();
    }
  }, [isWeb]);

  return (
    <View
      onLayout={markFirstRender}
      style={{
        flex: 1,
        paddingTop: insets.top + 8,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView style={{ marginBottom: 24, paddingHorizontal: 20 }}>
        <Text style={[styles.header, { color: textColor, top: 8 }]}>Settings</Text>
      </RNView>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={{ ...type.headline, fontWeight: "bold", marginBottom: 12 }}>Dictionary</Text>
        <RNView
          style={{
            borderRadius: 12,
            backgroundColor,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor,
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
                  paddingVertical: 14,
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
                {isSelected && <BlueCheckIcon />}
              </Pressable>
            );
          })}
        </RNView>
        <RNView
          style={{
            borderRadius: 12,
            backgroundColor,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor,
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
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
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
          <Pressable
            onPress={() =>
              Linking.openURL("https://gist.github.com/jonsamp/9c0342948416bd810c3a0a508e242a45")
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <RNView style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ ...type.body, fontWeight: "500" }}>Privacy Policy</Text>
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

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    fontFamily: "New York",
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
});
