import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pressable, SectionList, StyleSheet, TextInput, View as RNView } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useObserve } from "expo-observe";
import { View, Text } from "../../../components/Themed";
import { useThemeColor } from "../../../components/Themed";
import { type, sansSerifType } from "../../../constants/Type";
import { PracticeWord } from "../../../constants/PracticeLists";
import { usePracticeList } from "../../../hooks/usePracticeList";
import { useStarredWords } from "../../../contexts/StarredWordsContext";
import { CancelIcon, SearchIcon, StarIcon } from "../../../components/Icons";

const ROW_HEIGHT = 82;
const SECTION_HEADER_HEIGHT = 38;
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

function createGetItemLayout(sections: WordSection[]) {
  return (_data: unknown, index: number) => {
    let offset = 0;
    let remaining = index;

    for (const section of sections) {
      if (remaining === 0) {
        return { length: SECTION_HEADER_HEIGHT, offset, index };
      }
      offset += SECTION_HEADER_HEIGHT;
      remaining -= 1;

      if (remaining < section.data.length) {
        offset += remaining * ROW_HEIGHT;
        return { length: ROW_HEIGHT, offset, index };
      }
      offset += section.data.length * ROW_HEIGHT;
      remaining -= section.data.length;

      if (remaining === 0) {
        return { length: 0, offset, index };
      }
      remaining -= 1;
    }

    return { length: 0, offset, index };
  };
}

export default function WordList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { markInteractive } = useObserve();
  const list = usePracticeList(id);
  const sectionListRef = useRef<SectionList<PracticeWord, WordSection>>(null);
  const [query, setQuery] = useState("");

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const backgroundSecondaryColor = useThemeColor("backgroundSecondary");
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");

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
  const availableLetters = new Set(sections.map((section) => section.title));

  function scrollToLetter(letter: string) {
    const sectionIndex = sections.findIndex((section) => section.title === letter);
    if (sectionIndex === -1) {
      return;
    }
    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      viewOffset: SECTION_HEADER_HEIGHT,
      animated: true,
    });
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <RNView style={styles.searchRow}>
        <RNView style={[styles.searchField, { backgroundColor }]}>
          <SearchIcon color={textSecondaryColor} />
          <TextInput
            style={{ ...sansSerifType.body, color: textColor, flex: 1, paddingVertical: 0 }}
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
              ...sansSerifType.subhead,
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
            getItemLayout={createGetItemLayout(sections)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <RNView style={[styles.sectionHeader, { backgroundColor: backgroundSecondaryColor }]}>
                <Text style={{ ...sansSerifType.sectionHeader, color: textSecondaryColor }}>
                  {section.title}
                </Text>
              </RNView>
            )}
            renderItem={({ item }) => (
              <WordRow entry={item} backgroundColor={backgroundColor} borderColor={borderColor} />
            )}
          />
          <RNView style={styles.rail} pointerEvents="box-none">
            {ALPHABET.map((letter) => {
              const enabled = availableLetters.has(letter);
              return (
                <Pressable
                  key={letter}
                  accessibilityRole="button"
                  accessibilityLabel={`Jump to ${letter}`}
                  disabled={!enabled}
                  onPress={() => scrollToLetter(letter)}
                  hitSlop={{ left: 10, right: 6, top: 1, bottom: 1 }}
                >
                  <Text
                    style={{
                      ...sansSerifType.caption,
                      fontSize: 10,
                      fontWeight: "600",
                      lineHeight: 13,
                      color: enabled ? tintColor : textSecondaryColor,
                      opacity: enabled ? 1 : 0.3,
                    }}
                  >
                    {letter}
                  </Text>
                </Pressable>
              );
            })}
          </RNView>
        </RNView>
      )}
    </View>
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
        <Text style={styles.word}>{entry.word}</Text>
        <Text
          numberOfLines={2}
          style={{ ...sansSerifType.footnote, color: textSecondaryColor, marginTop: 4 }}
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
    paddingRight: 40,
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
  word: {
    ...type.title,
    fontWeight: "bold",
  },
  starButton: {
    padding: 4,
  },
  rail: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
});
