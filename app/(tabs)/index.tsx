import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { CancelIcon, XIcon, CheckIcon } from "../../components/Icons";
import { lookUpWord } from "../../constants/database";
import { useDictionary } from "../../contexts/DictionaryContext";
import { DictionaryNames } from "../../constants/dictionary";
import { SymbolView } from "expo-symbols";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");
  const { currentDictionary, isLoading } = useDictionary();
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    definition?: string | null;
    word: string;
  } | null>(null);
  const definition = result?.definition?.split("[")[0].split(", also")[0]?.trim() ?? "";

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async function handleSubmit() {
    Keyboard.dismiss();
    if (!searchValue) {
      return;
    }

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
      const result = await lookUpWord(searchValue, currentDictionary);
      setResult(result);
    } catch (error) {
      console.error("Error looking up word:", error);
    }
  }

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
          marginBottom: 12,
          paddingHorizontal: 20,
        }}
      >
        <Text style={[{ ...styles.header, color: textColor }, { top: 8 }]}>Word Check</Text>
        <Pressable
          onPress={() => router.navigate("/settings")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, top: 4 }}
        >
          <SymbolView
            name={{ ios: "book", android: "menu_book", web: "menu_book" }}
            tintColor={textSecondaryColor}
            size={22}
          />
          <Text style={{ ...type.callout, color: textSecondaryColor }}>
            {DictionaryNames[currentDictionary].replace(" Dictionary", "")}
          </Text>
        </Pressable>
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {result == null && (
          <RNView style={{ alignItems: "center", marginTop: 8 }}>
            {Boolean(searchValue) && Platform.OS === "android" && (
              <Animated.View
                key="search-button"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={{ width: "100%", paddingHorizontal: 16 }}
              >
                <TouchableOpacity
                  style={[
                    styles.searchButton,
                    {
                      width: "100%",
                      alignItems: "center",
                      backgroundColor: textColor,
                    },
                  ]}
                  onPress={handleSubmit}
                >
                  <Text style={[styles.searchButtonText, { color: backgroundColor }]}>Search</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </RNView>
        )}
        {result != null && (
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
              <Text style={{ ...type.largeTitle, fontWeight: "bold", padding: 0 }}>
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
            {Boolean(definition) && (
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  searchButtonText: {
    ...type.headline,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 16,
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
