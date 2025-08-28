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
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Host,
  Button,
  ContextMenu,
  HStack,
  Text as SwiftUIText,
  Image as SwiftUIImage,
} from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";

import useColorScheme from "../hooks/useColorScheme";
import { View, Text } from "../components/Themed";
import { useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import AppIconImage from "../assets/images/icon.png";
import DarkAppIconImage from "../assets/images/icon-dark.png";
import { CancelIcon, XIcon, CheckIcon } from "../components/Icons";
import { Dictionary, databaseManager } from "../constants/database";
import { useDictionary } from "../contexts/DictionaryContext";
import { glassEffect, padding } from "@expo/ui/build/swift-ui/modifiers";

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
  const { currentDictionary, setDictionary } = useDictionary();
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
    const result = await databaseManager.lookUpWord(
      searchValue,
      currentDictionary
    );
    setResult(result ?? null);
  }

  function getDictionaryName() {
    if (currentDictionary === Dictionary.CSW24) return "Worldwide Dictionary";
    if (currentDictionary === Dictionary.NSWL2023) return "School Dictionary";
    return "US & Canada Dictionary";
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
        <Host matchContents>
          <Button
            modifiers={[
              padding({ all: 12 }),
              glassEffect({
                glass: {
                  variant: "clear",
                  interactive: true,
                },
                shape: "circle",
              }),
            ]}
            onPress={() => router.push("/about")}
          >
            <SwiftUIImage
              systemName="info.circle"
              size={20}
              color={textColor}
            />
          </Button>
        </Host>
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
          bottom: insets.bottom + 8,
        }}
      >
        <Host>
          <ContextMenu style={{ width: 150, height: 50 }}>
            <ContextMenu.Items>
              <Button onPress={() => setDictionary(Dictionary.NSWL2023)}>
                School Dictionary
              </Button>
              <Button onPress={() => setDictionary(Dictionary.CSW24)}>
                Worldwide Dictionary
              </Button>
              <Button onPress={() => setDictionary(Dictionary.NWL2023)}>
                US & Canada Dictionary
              </Button>
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <Button variant="bordered">
                <HStack spacing={8}>
                  <SwiftUIImage
                    systemName="chevron.down"
                    size={16}
                    color={textColor}
                  />
                  <SwiftUIText design="serif" style={{ color: textColor }}>
                    {getDictionaryName() ?? ""}
                  </SwiftUIText>
                </HStack>
              </Button>
            </ContextMenu.Trigger>
          </ContextMenu>
        </Host>
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
