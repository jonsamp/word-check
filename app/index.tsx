import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import useColorScheme from "../hooks/useColorScheme";
import { View, Text } from "../components/Themed";
import { useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import AppIconImage from "../assets/images/icon.png";
import DarkAppIconImage from "../assets/images/icon-dark.png";
import { CancelIcon, XIcon, BookIcon, CheckIcon } from "../components/Icons";
import { Dictionary, lookUpWord } from "../constants/database";
import { Link } from "expo-router";
import { useDictionary } from "../contexts/DictionaryContext";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function Home() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundButtonColor = useThemeColor("backgroundButton");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary } = useDictionary();
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    definition?: string | null;
    word: string;
  } | null>(null);
  const definition = result?.definition?.split("[")[0].split(", also")[0] ?? "";

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async function handleSubmit() {
    if (!searchValue) return;
    const result = lookUpWord(searchValue);
    setResult(result ?? null);
  }

  return (
    <View
      onLayout={SplashScreen.hide}
      style={{
        paddingTop: insets.top + 8,
        flex: 1,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView className="flex-row items-center justify-between mb-6 px-4">
        <RNView style={styles.displayHorizontal}>
          <RNView className="rounded-lg overflow-hidden mr-3">
            <Image
              source={isDark ? DarkAppIconImage : AppIconImage}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                overflow: "hidden",
              }}
            />
          </RNView>
          <RNView>
            <Text
              style={{ ...styles.header, color: textColor }}
              className="top-2"
            >
              Word Check
            </Text>
          </RNView>
        </RNView>
        <Link href="/settings">
          <RNView
            className="p-2 rounded-lg"
            style={{ backgroundColor: backgroundButtonColor }}
          >
            <BookIcon />
          </RNView>
        </Link>
      </RNView>
      <RNView className="px-4 flex-row items-center">
        <TextInput
          style={{
            color: textColor,
            borderWidth: StyleSheet.hairlineWidth,
            backgroundColor,
            borderColor,
            paddingLeft: 20,
            paddingRight: 50,
            paddingVertical: 20,
            borderRadius: 12,
            overflow: "hidden",
            ...type.body,
            fontSize: 24,
            lineHeight: 24,
            flex: 1,
          }}
          placeholderTextColor={textSecondaryColor}
          autoCorrect={false}
          onSubmitEditing={() => handleSubmit()}
          onChangeText={(text) => {
            setResult(null);
            setSearchValue(text.trim());
          }}
          value={searchValue}
          placeholder="Search"
          returnKeyType="search"
        />
        {Boolean(searchValue) && (
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 24,
            }}
            onPress={() => {
              setResult(null);
              setSearchValue("");
            }}
          >
            <CancelIcon />
          </TouchableOpacity>
        )}
      </RNView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!result && !searchValue && (
          <Text
            style={[
              type.body,
              {
                textAlign: "center",
                marginHorizontal: 60,
                marginTop: 32,
                color: textSecondaryColor,
              },
            ]}
          >
            Tap "Search" to check if a word is playable.
          </Text>
        )}
        {result && (
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="rounded-2xl"
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor,
              backgroundColor,
              shadowColor: "#000",
              marginHorizontal: 16,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <RNView className="items-center gap-4 rounded-xl py-12">
              <RNView className="mb-2">
                {result.isValid ? <CheckIcon /> : <XIcon />}
              </RNView>
              <Text style={{ ...type.largeTitle, padding: 0 }}>
                {capitalizeFirstLetter(result.word.toLowerCase())}
              </Text>
              <Text
                style={{
                  ...type.body,
                  marginTop: -12,
                  color: textSecondaryColor,
                }}
              >
                is {result.isValid ? "a playable word" : "not a playable word"}
              </Text>
            </RNView>
            {definition && (
              <RNView
                style={{
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: borderColor,
                  width: "100%",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <RNView style={styles.definitionContainer}>
                  <RNView>
                    <Text style={type.headline}>Definition</Text>
                  </RNView>
                  <RNView>
                    <Text style={{ ...type.body, color: textSecondaryColor }}>
                      {capitalizeFirstLetter(definition)}.
                    </Text>
                  </RNView>
                </RNView>
              </RNView>
            )}
          </Animated.View>
        )}
      </ScrollView>
      <Text
        className="text-center text-sm bottom-5"
        style={{
          ...type.footnote,
          bottom: insets.bottom,
          color: textSecondaryColor,
        }}
      >
        {!currentDictionary && "NASPA Word List (NWL) 2023 Edition"}
        {currentDictionary === Dictionary.NWL2023 &&
          "NASPA Word List (NWL) 2023 Edition"}
        {currentDictionary === Dictionary.CSW24 &&
          "Collins Scrabble Words (CSW) 2024 Edition"}
        {currentDictionary === Dictionary.NSWL2023 &&
          "NASPA School Word List (NSWL) 2023 Edition"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    fontFamily: "sentinel-semibold",
    marginBottom: 16,
    fontSize: 24,
  },
  displayHorizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
    marginLeft: 8,
    height: 40,
  },
  searchButtonText: {
    ...type.headline,
    color: "#FFF",
  },
  scrollContainer: {
    flex: 1,
    marginTop: 24,
  },
  validationContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  definitionContainer: {
    padding: 16,
    borderRadius: 8,
  },
  wordSeparator: {
    marginHorizontal: 8,
  },
  validationText: {
    ...type.body,
    marginLeft: 12,
    top: 1,
  },
  def: {
    marginBottom: 4,
  },
});
