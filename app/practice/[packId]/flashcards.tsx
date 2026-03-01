import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";

import { View, Text, useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { getPackById } from "../../../constants/packs";
import { PracticeHeader } from "../../../components/practice/PracticeHeader";
import { ProgressBar } from "../../../components/practice/ProgressBar";
import { ModeCompletionCard } from "../../../components/practice/ModeCompletionCard";
import { databaseManager } from "../../../constants/database";
import { useDictionary } from "../../../contexts/DictionaryContext";

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightNavIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const { currentDictionary } = useDictionary();
  const { width: screenWidth } = useWindowDimensions();

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("background");

  const pack = getPackById(packId);
  const [words, setWords] = useState<string[]>(pack?.words ?? []);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);

  const cardWidth = screenWidth - 48;

  // Pre-fetch definitions using a ref to avoid re-render loops
  const definitionsRef = useRef<Record<string, string>>({});

  const fetchDefinition = useCallback(
    async (word: string) => {
      if (definitionsRef.current[word] !== undefined) return;
      // Mark as loading to prevent duplicate fetches
      definitionsRef.current[word] = "";
      try {
        const result = await databaseManager.lookUpWord(
          word,
          currentDictionary,
        );
        if (result?.definition) {
          const def =
            result.definition.split("[")[0].split(", also")[0]?.trim() ?? "";
          definitionsRef.current[word] = def;
          setDefinitions((prev) => ({ ...prev, [word]: def }));
        } else {
          setDefinitions((prev) => ({ ...prev, [word]: "" }));
        }
      } catch {
        setDefinitions((prev) => ({ ...prev, [word]: "" }));
      }
    },
    [currentDictionary],
  );

  useEffect(() => {
    // Pre-fetch current and next few definitions
    const toFetch = words.slice(currentIndex, currentIndex + 3);
    toFetch.forEach(fetchDefinition);
  }, [currentIndex, words, fetchDefinition]);

  if (!pack) return null;

  function handleShuffle() {
    if (isShuffled) {
      setWords([...pack!.words]);
      setIsShuffled(false);
    } else {
      setWords(shuffleArray(pack!.words));
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsComplete(false);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  }

  function handlePrev() {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  }

  function handleNext() {
    if (currentIndex < words.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    } else {
      setIsComplete(true);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setIsComplete(false);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  }

  function getFontSize(word: string): number {
    if (word.length === 2) return 56;
    if (word.length === 3) return 48;
    if (word.length <= 5) return 36;
    if (word.length <= 7) return 28;
    return 22;
  }

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  const progress = words.length > 0 ? (currentIndex + 1) / words.length : 0;

  function renderCard({ item }: { item: string }) {
    const fontSize = getFontSize(item);
    const def = definitions[item] ?? "";

    return (
      <RNView
        style={[
          styles.cardContainer,
          { width: cardWidth },
        ]}
      >
        <RNView
          style={[
            styles.card,
            {
              backgroundColor,
              borderColor,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Text
            style={[
              styles.wordText,
              {
                fontSize,
                color: textColor,
              },
            ]}
          >
            {item}
          </Text>
          {!!def && (
            <Text
              style={[
                styles.definitionText,
                { color: textSecondaryColor },
              ]}
              numberOfLines={4}
            >
              {capitalizeFirstLetter(def)}.
            </Text>
          )}
        </RNView>
      </RNView>
    );
  }

  if (isComplete) {
    return (
      <View style={{ flex: 1 }} colorKey="backgroundSecondary">
        <PracticeHeader title={pack.name} onBack={() => router.back()} />
        <ProgressBar progress={1} />
        <RNView style={styles.completionContainer}>
          <ModeCompletionCard
            totalWords={words.length}
            mode="flashcard"
            onRestart={handleRestart}
            onBack={() => router.back()}
          />
        </RNView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <PracticeHeader
        title={pack.name}
        onBack={() => router.back()}
        rightAction={{
          icon: isShuffled ? "shuffle-active" : "shuffle",
          onPress: handleShuffle,
        }}
      />
      <ProgressBar progress={progress} />

      <Animated.View
        key={isShuffled ? "shuffled" : "ordered"}
        entering={FadeIn.duration(300)}
        style={styles.cardListContainer}
      >
        <FlatList
          ref={flatListRef}
          data={words}
          renderItem={renderCard}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 16}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: 24,
          }}
          ItemSeparatorComponent={() => <RNView style={{ width: 16 }} />}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(
              e.nativeEvent.contentOffset.x / (cardWidth + 16),
            );
            setCurrentIndex(Math.max(0, Math.min(newIndex, words.length - 1)));
          }}
          getItemLayout={(_, index) => ({
            length: cardWidth + 16,
            offset: (cardWidth + 16) * index,
            index,
          })}
        />
      </Animated.View>

      <RNView
        style={[
          styles.navigation,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.navButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <ChevronLeftIcon color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.counter, { color: textSecondaryColor }]}>
          {currentIndex + 1} of {words.length}
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <ChevronRightNavIcon color={textColor} />
        </TouchableOpacity>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    minHeight: 300,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  wordText: {
    fontFamily: "New York",
    fontWeight: "bold",
    textAlign: "center",
  },
  definitionText: {
    ...type.body,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  navButton: {
    padding: 8,
  },
  counter: {
    ...type.callout,
    marginHorizontal: 24,
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
