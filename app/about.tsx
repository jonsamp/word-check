import { useRouter } from "expo-router";
import { Linking, Platform, Pressable, StyleSheet } from "react-native";
import AppMetrics from "expo-eas-observe";

import { View, Text, useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import { XButton } from "../components/x-button";
import { useEffect } from "react";

export default function AboutScreen() {
  const router = useRouter();
  const borderColor = useThemeColor("border");
  const textColor = useThemeColor("text");

  useEffect(() => {
    // This needs to be called by the developer once the screen is ready to interact with
    AppMetrics.markInteractive();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
      >
        {Platform.OS === "ios" ? (
          <View>
            <Text style={[{ ...styles.header, color: textColor }, { top: 8 }]}>
              About
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 32 }}>About</Text>
        )}
        <XButton onPress={() => router.back()} color={textColor} />
      </View>
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ ...type.body, lineHeight: 24 }}>
          Word Check determines the validity of words in the game of SCRABBLE™️.
          It uses the official SCRABBLE™️ dictionary to determine if a word is
          valid. The dictionaries are as follows:
        </Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>
          US & Canada Dictionary
        </Text>
        <Text style={{ ...type.body, marginTop: 8 }}>
          NASPA Word List (NWL) 2023 Edition
        </Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>
          Worldwide Dictionary
        </Text>
        <Text style={{ ...type.body, marginTop: 8 }}>
          Collins SCRABBLE™️ Words (CSW) 2024 Edition
        </Text>
        <Text style={{ ...type.body, fontWeight: "bold", marginTop: 24 }}>
          School Dictionary
        </Text>
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
          }}
        >
          If you got value from this app, you can support me by buying me a
          coffee:
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
              ☕ Buy me a coffee
            </Text>
          </Pressable>
        </View>
      </View>
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
