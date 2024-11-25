import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View as RNView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { View, Text, useThemeColor } from "../components/Themed";
import { type } from "../constants/Type";
import { BlueCheckIcon, BookIcon } from "../components/Icons";
import { Dictionary } from "../constants/database";
import { useDictionary } from "../contexts/DictionaryContext";

function AnimatedDictionaryButton({
  title,
  description,
  isSelected,
  onPress,
  borderColor,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  borderColor: string;
}) {
  const backgroundColor = useThemeColor("background");
  const textSecondaryColor = useThemeColor("textSecondary");
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.975, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ marginBottom: 16 }}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          {
            padding: 24,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor,
            backgroundColor,
          },
          animatedStyle,
        ]}
      >
        <RNView style={{ flex: 1 }}>
          <Text style={[type.title, { marginBottom: 4 }]}>{title}</Text>
          <Text style={{ ...type.body, color: textSecondaryColor }}>
            {description}
          </Text>
        </RNView>
        <RNView
          style={{
            opacity: isSelected ? 1 : 0,
            marginLeft: 16,
          }}
        >
          <BlueCheckIcon />
        </RNView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          paddingTop: 24,
          paddingBottom: 16,
          paddingHorizontal: 24,
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
          paddingTop: 8,
          paddingBottom: 60,
          flex: 1,
        }}
      >
        <AnimatedDictionaryButton
          title="NASPA Word List (NWL) 2023 Edition"
          description="Contains 196,601 words. The sixth edition of NWL. This list is for use in the United States and Canada."
          isSelected={currentDictionary === Dictionary.NWL2023}
          onPress={() => setDictionary(Dictionary.NWL2023)}
          borderColor={borderColor}
        />

        <AnimatedDictionaryButton
          title="Collins Scrabble Words (CSW) 2024 Edition"
          description="Contains 280,887 words. This list is for use outside of the United States and Canada."
          isSelected={currentDictionary === Dictionary.CSW24}
          onPress={() => setDictionary(Dictionary.CSW24)}
          borderColor={borderColor}
        />

        <AnimatedDictionaryButton
          title="NASPA School Word List (NSWL) 2023 Edition"
          description="Contains 195,747 words. This list is for use in the United States, Canada, and Thailand, with words appropriate for school use."
          isSelected={currentDictionary === Dictionary.NSWL2023}
          onPress={() => setDictionary(Dictionary.NSWL2023)}
          borderColor={borderColor}
        />
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
