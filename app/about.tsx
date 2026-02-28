import { useRouter } from "expo-router";
import { Linking, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import AppMetrics from "expo-eas-observe";

import { View, Text, useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import { XButton } from "../components/x-button";
import { useEffect } from "react";

export default function AboutScreen() {
  const router = useRouter();
  const borderColor = useThemeColor("border");
  const textColor = useThemeColor("text");
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    // This needs to be called by the developer once the screen is ready to interact with
    AppMetrics.markInteractive();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: isWeb ? 16 : 0,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
      >
        {Platform.OS === "android" ? (
          <Text style={{ fontSize: 32 }}>About</Text>
        ) : (
          <View>
            <Text style={[{ ...styles.header, color: textColor }, { top: 8 }]}>About</Text>
          </View>
        )}
        <XButton onPress={() => router.back()} color={textColor} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ ...type.body, lineHeight: 28 }}>
          Word Check determines the validity of words in the game of SCRABBLE™. It uses the official
          SCRABBLE™ dictionary to determine if a word is valid. The dictionaries are as follows:
        </Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>
          US & Canada Dictionary
        </Text>
        <Text style={{ ...type.body, marginTop: 8 }}>NASPA Word List (NWL) 2023 Edition</Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>
          Worldwide Dictionary
        </Text>
        <Text style={{ ...type.body, marginTop: 8 }}>
          Collins SCRABBLE™ Words (CSW) 2024 Edition
        </Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>School Dictionary</Text>
        <Text style={{ ...type.body, marginTop: 8 }}>
          NASPA School Word List (NSWL) 2023 Edition
        </Text>
        <Text
          style={{
            ...type.body,
            marginTop: 40,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            paddingTop: 24,
            lineHeight: 28,
          }}
        >
          If you got value from this app, you can support me by buying me a coffee. This is an
          optional tip and does not unlock any features:
        </Text>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Pressable
            onPress={() => Linking.openURL("https://buymeacoffee.com/jonsamp")}
            style={{
              marginTop: 24,
              paddingVertical: 16,
              paddingHorizontal: 24,
              backgroundColor: "#FFDD04",
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                ...type.body,
                fontWeight: "bold",
                color: "black",
              }}
            >
              ☕ Buy Me a Coffee
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 40,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            paddingTop: 24,
          }}
        >
          <Text style={{ ...type.body, lineHeight: 28 }}>
            Word Check does not collect any personal data. For more information, please refer to
            the{" "}
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL("https://gist.github.com/jonsamp/9c0342948416bd810c3a0a508e242a45")
            }
          >
            <Text
              style={{
                ...type.body,
                lineHeight: 28,
                textDecorationLine: "underline",
              }}
            >
              Privacy Policy
            </Text>
          </Pressable>
          <Text style={{ ...type.body, lineHeight: 28 }}>.</Text>
        </View>
        <Text
          style={{
            ...type.body,
            marginTop: 40,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            paddingTop: 24,
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
