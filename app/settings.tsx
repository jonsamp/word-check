import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View as RNView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { View, Text, useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import { BlueCheckIcon, BookIcon } from "../components/Icons";
import { Dictionary } from "../constants/database";
import { useDictionary } from "../contexts/DictionaryContext";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const { currentDictionary, setDictionary } = useDictionary();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.select({ ios: 0, android: insets.top }),
        },
      ]}
      colorKey="backgroundSecondary"
    >
      <View
        colorKey="backgroundSecondary"
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <RNView
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <RNView style={{ top: -1 }}>
            <BookIcon />
          </RNView>
          <Text style={[type.titleTwo, { marginLeft: 8 }]}>Dictionaries</Text>
        </RNView>
        <TouchableOpacity onPress={router.back}>
          <Text style={type.title}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 60,
          flex: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => setDictionary(Dictionary.NWL2023)}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          <View
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor,
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                NASPA Word List (NWL) 2023 Edition
              </Text>
              <Text style={{ ...type.body, color: textSecondaryColor }}>
                Contains 196,601 words. The sixth edition of NWL. This list is
                for use in the United States and Canada.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === Dictionary.NWL2023 ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDictionary(Dictionary.CSW24)}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor,
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                Collins Scrabble Words (CSW) 2024 Edition
              </Text>
              <Text style={{ ...type.body, color: textSecondaryColor }}>
                Contains 280,887 words. This list is for use outside of the
                United States and Canada.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === Dictionary.CSW24 ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDictionary(Dictionary.NSWL2023)}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor,
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                NASPA School Word List (NSWL) 2023 Edition
              </Text>
              <Text style={{ ...type.body, color: textSecondaryColor }}>
                Contains 195,747 words. This list is for use in the United
                States, Canada, and Thailand, with words appropriate for school
                use.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === Dictionary.NSWL2023 ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  versionContainer: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
