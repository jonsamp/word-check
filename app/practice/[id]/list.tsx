import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from "react-native";
import { SectionList, type SectionListRef } from "@legendapp/list/section-list";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useObserve } from "expo-observe";
import * as Haptics from "expo-haptics";
import { View, Text } from "../../../components/Themed";
import { useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { PracticeWord } from "../../../constants/PracticeLists";
import { usePracticeList } from "../../../hooks/usePracticeList";
import { useStarredWords } from "../../../contexts/StarredWordsContext";
import { CancelIcon, SearchIcon, StarIcon } from "../../../components/Icons";

const ROW_HEIGHT = 82;
const SECTION_HEADER_HEIGHT = 38;
const RAIL_LETTER_MAX_HEIGHT = 21;
const RAIL_LETTER_MIN_HEIGHT = 13;
const RAIL_VERTICAL_MARGIN = 12;
const RAIL_WIDTH = 28;
const RAIL_BUBBLE_SIZE = 48;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type WordSection = {
  title: string;
  data: PracticeWord[];
};

function groupByFirstLetter(words: PracticeWord[]): WordSection[] {
  const buckets = new Map<string, PracticeWord[]>();

  for (const entry of words) {
    const letter = entry.word.charAt(0).toUpperCase();
    const bucket = buckets.get(letter);
    if (bucket) {
      bucket.push(entry);
    } else {
      buckets.set(letter, [entry]);
    }
  }

  return [...buckets.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([letter, entries]) => ({
      title: letter,
      data: [...entries].sort((first, second) => first.word.localeCompare(second.word)),
    }));
}

export default function WordList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { markInteractive } = useObserve();
  const list = usePracticeList(id);
  const sectionListRef = useRef<SectionListRef>(null);
  const [query, setQuery] = useState("");

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const backgroundSecondaryColor = useThemeColor("backgroundSecondary");
  const borderColor = useThemeColor("border");

  useLayoutEffect(() => {
    // Navigate up through Slot layers to reach the root Stack
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ headerShown: true, title: list?.title ?? "Words" });
  }, [navigation, list?.title]);

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const words = list?.words ?? [];
  const normalizedQuery = query.trim().toUpperCase();
  const filtered = normalizedQuery
    ? words.filter(
        (entry) =>
          entry.word.toUpperCase().includes(normalizedQuery) ||
          entry.definition.toUpperCase().includes(normalizedQuery)
      )
    : words;

  const sections = groupByFirstLetter(filtered);

  function scrollToLetter(letter: string) {
    // Fall back to the closest preceding section so dragging never stalls on a
    // letter the list does not contain.
    let sectionIndex = -1;
    for (let index = 0; index < sections.length; index++) {
      if (sections[index].title <= letter) {
        sectionIndex = index;
      }
    }
    if (sectionIndex === -1) {
      sectionIndex = sections.length > 0 ? 0 : -1;
    }
    if (sectionIndex === -1) {
      return;
    }

    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      viewOffset: SECTION_HEADER_HEIGHT,
      animated: false,
    });
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <RNView style={styles.searchRow}>
        <RNView style={[styles.searchField, { backgroundColor }]}>
          <SearchIcon color={textSecondaryColor} />
          <TextInput
            style={{ ...type.body, color: textColor, flex: 1, paddingVertical: 0 }}
            placeholder="Search words"
            placeholderTextColor={textSecondaryColor}
            autoCorrect={false}
            autoCapitalize="characters"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {Boolean(query) && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              hitSlop={8}
            >
              <CancelIcon />
            </Pressable>
          )}
        </RNView>
      </RNView>

      {sections.length === 0 ? (
        <RNView style={styles.emptyState}>
          <Text style={{ ...type.title, color: textColor, textAlign: "center" }}>
            {words.length === 0 ? "No starred words yet" : "No matching words"}
          </Text>
          <Text
            style={{
              ...type.subhead,
              color: textSecondaryColor,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {words.length === 0
              ? "Tap the star on any word to add it here."
              : "Try a different search."}
          </Text>
        </RNView>
      ) : (
        <RNView style={styles.listArea}>
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={(item) => item.word}
            stickySectionHeadersEnabled
            estimatedItemSize={ROW_HEIGHT}
            getFixedItemSize={(info) => {
              if (info.type === "header") {
                return SECTION_HEADER_HEIGHT;
              }
              return info.type === "item" ? ROW_HEIGHT : 0;
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <RNView style={[styles.sectionHeader, { backgroundColor: backgroundSecondaryColor }]}>
                <Text style={{ ...type.sectionHeader, color: textSecondaryColor }}>
                  {section.title}
                </Text>
              </RNView>
            )}
            renderItem={({ item }) => (
              <WordRow entry={item} backgroundColor={backgroundColor} borderColor={borderColor} />
            )}
          />
          <AlphabetRail
            availableLetters={new Set(sections.map((section) => section.title))}
            onSelectLetter={scrollToLetter}
          />
        </RNView>
      )}
    </View>
  );
}

function AlphabetRail({
  availableLetters,
  onSelectLetter,
}: {
  availableLetters: Set<string>;
  onSelectLetter: (letter: string) => void;
}) {
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const tintColor = useThemeColor("tint");

  const [areaHeight, setAreaHeight] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const letterHeight = Math.max(
    RAIL_LETTER_MIN_HEIGHT,
    Math.min(RAIL_LETTER_MAX_HEIGHT, (areaHeight - RAIL_VERTICAL_MARGIN * 2) / ALPHABET.length)
  );
  const railHeight = letterHeight * ALPHABET.length;
  const railTop = (areaHeight - railHeight) / 2;
  const bubbleTop =
    railTop + selectedIndex * letterHeight + letterHeight / 2 - RAIL_BUBBLE_SIZE / 2;

  function selectIndex(index: number, force: boolean) {
    const clamped = Math.min(ALPHABET.length - 1, Math.max(0, index));
    if (!force && clamped === selectedIndex) {
      return;
    }
    setSelectedIndex(clamped);
    Haptics.selectionAsync();
    onSelectLetter(ALPHABET[clamped]);
  }

  function indexFromEvent(event: GestureResponderEvent) {
    return Math.floor(event.nativeEvent.locationY / letterHeight);
  }

  return (
    <RNView
      style={styles.railArea}
      pointerEvents="box-none"
      onLayout={(event) => setAreaHeight(event.nativeEvent.layout.height)}
    >
      {isDragging && (
        <RNView
          style={[styles.railBubble, { backgroundColor, top: bubbleTop }]}
          pointerEvents="none"
        >
          <Text style={{ ...type.titleOne, color: tintColor }}>{ALPHABET[selectedIndex]}</Text>
        </RNView>
      )}
      <RNView
        accessibilityRole="adjustable"
        accessibilityLabel="Jump to letter"
        accessibilityValue={{ text: ALPHABET[selectedIndex] }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") {
            selectIndex(selectedIndex + 1, false);
          } else if (event.nativeEvent.actionName === "decrement") {
            selectIndex(selectedIndex - 1, false);
          }
        }}
        style={[styles.rail, { height: railHeight }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          setIsDragging(true);
          selectIndex(indexFromEvent(event), true);
        }}
        onResponderMove={(event) => selectIndex(indexFromEvent(event), false)}
        onResponderRelease={() => setIsDragging(false)}
        onResponderTerminate={() => setIsDragging(false)}
      >
        <RNView pointerEvents="none">
          {ALPHABET.map((letter, index) => {
            const enabled = availableLetters.has(letter);
            const isActive = isDragging && index === selectedIndex;
            return (
              <Text
                key={letter}
                style={{
                  ...type.caption,
                  fontSize: 13,
                  fontWeight: isActive ? "600" : "400",
                  height: letterHeight,
                  lineHeight: letterHeight,
                  textAlign: "center",
                  width: RAIL_WIDTH,
                  color: isActive ? tintColor : textSecondaryColor,
                  opacity: enabled || isActive ? 1 : 0.35,
                }}
              >
                {letter}
              </Text>
            );
          })}
        </RNView>
      </RNView>
    </RNView>
  );
}

function WordRow({
  entry,
  backgroundColor,
  borderColor,
}: {
  entry: PracticeWord;
  backgroundColor: string;
  borderColor: string;
}) {
  const { isStarred, toggleStar } = useStarredWords();
  const textSecondaryColor = useThemeColor("textSecondary");
  const tintColor = useThemeColor("tint");
  const starred = isStarred(entry.word);

  return (
    <RNView style={[styles.card, { backgroundColor }]}>
      <RNView style={styles.cardText}>
        <Text style={type.wordTitle}>{entry.word}</Text>
        <Text
          numberOfLines={2}
          style={{ ...type.footnote, color: textSecondaryColor, marginTop: 4 }}
        >
          {entry.definition}
        </Text>
      </RNView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={starred ? `Unstar ${entry.word}` : `Star ${entry.word}`}
        accessibilityState={{ selected: starred }}
        onPress={() => toggleStar(entry)}
        hitSlop={10}
        style={styles.starButton}
      >
        <StarIcon filled={starred} color={starred ? tintColor : borderColor} />
      </Pressable>
    </RNView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingRight: 48,
    paddingBottom: 40,
  },
  sectionHeader: {
    height: SECTION_HEADER_HEIGHT,
    justifyContent: "center",
    paddingLeft: 4,
  },
  card: {
    height: ROW_HEIGHT - 10,
    marginBottom: 10,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardText: {
    flex: 1,
  },
  starButton: {
    padding: 4,
  },
  railArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 110,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  rail: {
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  railBubble: {
    position: "absolute",
    right: 44,
    width: RAIL_BUBBLE_SIZE,
    height: RAIL_BUBBLE_SIZE,
    borderRadius: RAIL_BUBBLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
});
