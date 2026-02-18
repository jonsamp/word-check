import React, { useEffect, useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import AppMetrics from "expo-eas-observe";

import useColorScheme from "../hooks/useColorScheme";
import { View, Text } from "../components/Themed";
import { useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import AppIconImage from "../assets/images/icon.png";
import DarkAppIconImage from "../assets/images/icon-dark.png";
import { CancelIcon, XIcon, CheckIcon } from "../components/Icons";
import { databaseManager } from "../constants/database";
import { useDictionary } from "../contexts/DictionaryContext";
import { InfoButton } from "../components/info-button";
import { DictionaryContextMenu } from "../components/dictionary-context-menu";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function Home() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary, setDictionary, isLoading } = useDictionary();
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    definition?: string | null;
    word: string;
  } | null>(null);
  const definition =
    result?.definition?.split("[")[0].split(", also")[0]?.trim() ?? "";

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async function handleSubmit() {
    if (!searchValue) return;

    // Wait for dictionary to finish loading if it's currently loading
    if (isLoading) {
      // Wait a bit and retry (max 10 seconds)
      const maxWaitTime = 10000;
      const startTime = Date.now();

      while (isLoading && Date.now() - startTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // If still loading after timeout, show error
      if (isLoading) {
        console.warn("Dictionary still loading after timeout");
        return;
      }
    }

    try {
      const result = await databaseManager.lookUpWord(
        searchValue,
        currentDictionary,
      );
      setResult(result ?? null);
    } catch (error) {
      console.error("Error looking up word:", error);
    }
  }

  function hideSplashScreen() {
    // Mark the TTFR metric – in the future we'll handle this in our root view wrapper
    // or on the native side somehow
    AppMetrics.markFirstRender();

    SplashScreen.hide();
  }

  useEffect(() => {
    // This needs to be called by the developer once the screen is ready to interact with
    AppMetrics.markInteractive();
  }, []);

  return (
    <View
      onLayout={hideSplashScreen}
      style={{
        paddingTop: insets.top + 8,
        flex: 1,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <RNView style={styles.displayHorizontal}>
          <RNView
            style={{ borderRadius: 8, overflow: "hidden", marginRight: 12 }}
          >
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
            <Text style={[{ ...styles.header, color: textColor }, { top: 8 }]}>
              Word Check
            </Text>
          </RNView>
        </RNView>
        <InfoButton onPress={() => router.push("/about")} color={textColor} />
      </RNView>
      <RNView
        style={{
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextInput
          style={{
            color: textColor,
            borderWidth: StyleSheet.hairlineWidth,
            backgroundColor,
            borderColor,
            paddingLeft: 20,
            paddingRight: 50,
            paddingVertical: 20,
            borderRadius: 10,
            overflow: "hidden",
            ...type.body,
            fontSize: 24,
            lineHeight: 28,
            flex: 1,
            opacity: isLoading ? 0.5 : 1,
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
          editable={!isLoading}
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
                marginHorizontal: 100,
                marginTop: 32,
                lineHeight: 26,
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
            style={{
              borderRadius: 16,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor,
              backgroundColor,
              shadowColor: "#000",
              marginHorizontal: 16,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <RNView
              style={{
                alignItems: "center",
                gap: 16,
                borderRadius: 12,
                paddingVertical: 48,
              }}
            >
              <RNView style={{ marginBottom: 8 }}>
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
      <RNView
        style={{
          position: "absolute",
          bottom: insets.bottom + 8,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <DictionaryContextMenu
          onSelectDictionary={setDictionary}
          value={currentDictionary}
          color={textColor}
          backgroundColor={backgroundColor}
          isLoading={isLoading}
        />
      </RNView>
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
