# Practice Mode -- Design Document

## Overview

Practice is a new top-level feature for Word Check that helps Scrabble players systematically memorize words through three escalating difficulty modes: Flashcards (read), Quiz (fill-the-blank), and Free Type (recall). Words are organized into packs derived from the NWL23 Cheat Sheet -- starting with 2-letter words and expanding to bingo stems and vowel dumps.

The core learning loop is: **familiarize (flashcards) --> recognize (quiz) --> recall (free type)**. This mirrors how competitive Scrabble players actually study -- you look at word lists, then test yourself with increasing difficulty until the words are committed to memory.

---

## 1. Information Architecture & Navigation

### Entry Point

Add a "Practice" button to the Home screen, positioned below the search input area and above the result card. It sits in the helper text area -- when there is no search result displayed, the user sees both the "Validate if a word is playable" text and a Practice entry point below it.

The entry point is a single tappable row:

```
[Book icon]  Practice    [chevron right]
```

It is styled as a bordered, rounded container (same radius and border treatment as the result card) sitting at `marginHorizontal: 16`. Tapping it pushes to the Packs screen. This row is always visible when there is no active search result. When a result is showing, it is hidden -- the user is in "lookup mode" and we don't want to clutter the result.

### Navigation Hierarchy

```
Home (index)
  |
  +--> Practice Packs List (/practice)
         |
         +--> Pack Detail (/practice/[packId])
                |
                +--> Flashcard Mode (/practice/[packId]/flashcards)
                +--> Quiz Mode (/practice/[packId]/quiz)
                +--> Free Type Mode (/practice/[packId]/free-type)
```

### Expo Router File Structure

```
app/
  _layout.tsx          (existing -- add new Stack.Screen entries)
  index.tsx            (existing -- add Practice entry point)
  about.tsx            (existing)
  practice/
    _layout.tsx        (Stack layout for the practice flow)
    index.tsx          (Packs list screen)
    [packId]/
      _layout.tsx      (Stack layout for pack detail + modes)
      index.tsx        (Pack detail: mode picker)
      flashcards.tsx   (Flashcard mode)
      quiz.tsx         (Quiz mode)
      free-type.tsx    (Free Type mode)
```

All practice screens use standard Stack push navigation (not modals, not tabs). The user drills forward and taps Back to return. This keeps the mental model simple: you are going deeper into a topic.

### Stack Screen Configuration

In `app/_layout.tsx`, add:
```tsx
<Stack.Screen
  name="practice"
  options={{ headerShown: false }}
/>
```

In `app/practice/_layout.tsx`:
```tsx
<Stack>
  <Stack.Screen name="index" options={{ title: "Practice", headerShown: false }} />
  <Stack.Screen name="[packId]" options={{ headerShown: false }} />
</Stack>
```

In `app/practice/[packId]/_layout.tsx`:
```tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="flashcards" options={{ headerShown: false }} />
  <Stack.Screen name="quiz" options={{ headerShown: false }} />
  <Stack.Screen name="free-type" options={{ headerShown: false }} />
</Stack>
```

All screens build their own headers using the existing pattern from `index.tsx` and `about.tsx` -- a manually positioned top bar with `useSafeAreaInsets().top` padding. This keeps the warm, custom look. No native header bars.

---

## 2. Packs Screen (`/practice`)

### Layout

The screen has a top bar (back arrow + "Practice" title in the largeTitle New York style) and a scrollable list of packs below.

Packs are displayed as a **vertical list of cards**, each card being a full-width row. No grid -- the list is long and a single-column layout lets each card breathe and show progress information clearly.

### Pack Card Design

Each pack card is a rounded rectangle (`borderRadius: 12`, `borderWidth: StyleSheet.hairlineWidth`, `borderColor: border`, `backgroundColor: background`) with horizontal padding of 16 and vertical padding of 16. Cards are spaced 10px apart with `marginHorizontal: 16`.

Card contents, left to right:

```
+--------------------------------------------------+
|  [Emoji]                                         |
|  Pack Name                           [107 words] |
|  [progress bar ====------]               63%     |
+--------------------------------------------------+
```

- **Left column**: Pack emoji (large, 28pt) on its own line above the pack name. The emoji gives instant visual identity:
  - 2-Letter Words: `Aa` (rendered as styled text, not emoji -- two letters in a small rounded square with `backgroundSecondary` fill, using a bold 14pt font. This mirrors how the cheat sheet titles look.)
  - 3-Letter Words: `Abc` (same treatment, three letters)
  - Short J Words: **J** (single bold letter in an accent-colored square)
  - Short Q Words: **Q**
  - Short X Words: **X**
  - Short Z Words: **Z**
  - TISANE + ?: The text "TISANE" in small tile-style letters
  - SATIRE + ?: The text "SATIRE" in small tile-style letters
  - RETINA + ?: The text "RETINA" in small tile-style letters
  - Hi Prob 7s: **7** in accent square
  - Hi Prob 8s: **8** in accent square
  - I Dumps: **II** (two I tiles)
  - U Dumps: **UU** (two U tiles)
  - Vowel Dumps: **AEIOU** in tiny tile-style letters

  Actually -- **simplify this**. Use a single small icon-sized tile (24x24, rounded 4px corners, `backgroundSecondary` background) containing a bold letter or two that represents the pack. This gives a Scrabble-tile flavor without being heavy.

- **Pack name**: `type.headline` (New York, 17pt). Example: "2-Letter Words"
- **Word count**: `type.caption` in `textSecondary`. Example: "107 words". Right-aligned.
- **Progress bar**: A thin (4px tall) rounded bar spanning the full width of the card, placed at the bottom inside the card. Fill color is `success` (green). Track color is `backgroundSecondary`. The progress represents the **best quiz completion** for this pack (not flashcard views -- quiz is the real measure of learning).
- **Percentage**: `type.caption` in `textSecondary`, right-aligned next to word count. Only shows if progress > 0%.

### Section Headers

Group packs into logical sections with small sticky headers (`type.label`, `textSecondary`, uppercase, `marginBottom: 8, marginTop: 24`):

- **ESSENTIALS** -- 2-Letter Words, 3-Letter Words
- **TRICKY LETTERS** -- Short J, Short Q, Short X, Short Z
- **BINGO STEMS** -- TISANE + ?, SATIRE + ?, RETINA + ?
- **HIGH PROBABILITY** -- Hi Prob 7s, Hi Prob 8s
- **VOWEL MANAGEMENT** -- I Dumps, U Dumps, Vowel Dumps

### Progressive Unlock

**No progressive unlock.** All packs are available from the start. Scrabble players have varied skill levels -- a tournament player might want to jump straight to bingo stems, while a beginner starts with 2-letter words. Locking packs behind gates creates friction and frustration for a study tool.

However, the **visual ordering** guides beginners naturally: 2-letter words are first and most prominent. Packs with 0% progress appear slightly lower contrast than those with some progress, creating an organic sense of progression without hard locks.

### Empty State

When the user first visits Practice, all progress bars are empty. No special empty state needed -- the packs themselves are the content.

---

## 3. Pack Detail Screen (`/practice/[packId]`)

### Purpose

This is the launch screen for a specific pack. It shows the pack name, word count, and three mode buttons. It also houses the **Blank Slider Control** (see Section 6).

### Layout

```
+------------------------------------------+
|  [<  Back]           2-Letter Words       |
+------------------------------------------+
|                                           |
|        107 words  ·  NWL23               |
|                                           |
|  +------------------------------------+  |
|  |  [cards icon]  Flashcards          |  |
|  |  Read through all words            |  |
|  +------------------------------------+  |
|                                           |
|  +------------------------------------+  |
|  |  [grid icon]   Quiz               |  |
|  |  Fill in the blank                 |  |
|  +------------------------------------+  |
|                                           |
|  +------------------------------------+  |
|  |  [keyboard icon]  Free Type       |  |
|  |  Type the missing letters          |  |
|  +------------------------------------+  |
|                                           |
|  Blanks                                   |
|  [=====O-----------]  1 of 2            |
|                                           |
+------------------------------------------+
```

The three mode buttons are tall, tappable cards (similar visual style to the pack cards on the list screen). Each has an icon on the left, mode name in `type.headline`, and a short description in `type.caption` / `textSecondary` below the name.

The **Blanks slider** lives at the bottom of this screen (see Section 6). It controls how many letters are hidden in Quiz and Free Type modes. For Flashcards, the slider is irrelevant (flashcards always show the full word) -- when the user selects Flashcards, the slider is visually grayed out or ignored.

### Dictionary Badge

Show the currently selected dictionary abbreviation (from the DictionaryContext) as a small badge next to the word count: "107 words  ·  NWL23". This matters because the word lists differ between dictionaries. For V1, all packs use fixed NWL23 word lists from the cheat sheet. The badge is informational.

---

## 4. Flashcard Mode (`/practice/[packId]/flashcards`)

### Core Concept

This is the easiest mode. The user sees one word at a time, reads it, and moves to the next. There is nothing to "answer" -- it is pure exposure. The goal is familiarization before testing.

### Card Design

The card is centered on the screen, taking up roughly 60% of the screen height and 85% of the width. It has:

- `borderRadius: 20`
- `backgroundColor: background`
- `borderWidth: StyleSheet.hairlineWidth`
- `borderColor: border`
- Subtle shadow (same treatment as the result card on Home)

Card content (centered vertically and horizontally):

```
+----------------------------------+
|                                  |
|              QI                  |
|                                  |
|    the vital force in Chinese    |
|    philosophy                    |
|                                  |
+----------------------------------+
```

- **Word**: Displayed in uppercase, `type.largeTitle` (New York, 36pt, bold). This is the hero element. For 2-letter words, bump the font size up to 56pt so the letters feel substantial and tile-like. For 3-letter words, 48pt. For 4+ letter words, stay at 36pt (or scale down for longer words to prevent overflow).
- **Definition**: Below the word, in `type.body`, `textSecondary`, centered, with `marginTop: 16`. Truncate to the first clause (same logic as the Home screen: split on "[" and ", also"). If no definition exists, show nothing -- don't show a placeholder.

### Why Show Definitions

Definitions are crucial for Scrabble word memorization. Knowing that QI means "the vital force in Chinese philosophy" creates a mental hook. A word without meaning is just two random letters -- much harder to remember. The definition makes the card a real flashcard, not just a word list.

### Navigation Between Cards

**Swipe left/right to navigate.** Use a horizontal `FlatList` or `PagerView` with snap-to-item behavior. Swiping left goes to the next word, swiping right goes to the previous word.

Additionally, show two small arrow buttons at the bottom of the screen (below the card) for users who prefer tapping:

```
      [<]    12 of 107    [>]
```

Both swipe and tap are supported because:
1. Swiping is faster for power users flipping through quickly
2. Tapping is more precise and accessible
3. Having both eliminates confusion -- the user will naturally try one or the other

### Progress Indicator

Centered between the navigation arrows: "12 of 107" in `type.callout`, `textSecondary`. This tells the user exactly where they are. No ambiguity.

Above the card, show a thin (3px) horizontal progress bar spanning the full screen width (no margins). It fills from left to right as the user advances through cards. Color: `primary` (blue). Background: `backgroundSecondary`. This provides a constant ambient sense of progress.

### Top Bar

```
[< Back]                    [Shuffle]
```

- Back button returns to the Pack Detail screen.
- Shuffle button (a shuffle/randomize icon) randomizes the card order. Shuffling is important for learning -- if you always study in alphabetical order, you memorize sequence rather than words. The shuffle icon toggles: tap once to shuffle, tap again to return to alphabetical order. Show a brief `FadeIn` animation on the card when shuffled to indicate the reorder happened.

### Completion State

When the user reaches the last card and swipes or taps forward:

The card transitions (with a `FadeInDown` spring animation, matching the existing app style) to a completion card:

```
+----------------------------------+
|                                  |
|           [Check icon]           |
|                                  |
|          All 107 words           |
|           reviewed               |
|                                  |
|    [  Review again  ]            |
|    [  Back to pack  ]            |
|                                  |
+----------------------------------+
```

- The green check icon (reuse `CheckIcon` component at 80x80).
- "All 107 words reviewed" in `type.titleOne`.
- "Review again" button: solid fill, `text` color background with `background` color text (same inverted style as the Android search button on Home). Resets to card 1.
- "Back to pack" button: text-only / ghost style. Navigates back to Pack Detail.

### What Gets Saved

Flashcard progress is **not** persisted. It is session-only. If you leave and come back, it resets to card 1. Rationale: flashcards are for casual browsing. The quiz is where real progress is measured. Persisting flashcard position adds complexity for minimal value.

---

## 5. Quiz Mode -- Fill the Blank (`/practice/[packId]/quiz`)

### Core Concept

The user sees a word with one or more letters replaced by blanks. Below the word, a row of 7 letter tiles is presented. The user taps the letter that correctly fills the blank. This tests recognition -- you see most of the word and need to identify the missing piece.

### Word Display

The word is displayed centered on screen, large, using the same sizing rules as flashcards (56pt for 2-letter, 48pt for 3-letter, 36pt for 4+). Each letter occupies its own "tile" -- a square with rounded corners (8px radius), subtle background (`backgroundSecondary`), fixed width based on word length.

Blank positions are shown as empty tiles with a dashed border (`borderStyle: 'dashed'`, `borderWidth: 2`, `borderColor: border`). The dashed border communicates "something goes here" without being heavy.

Example for the word QI with 1 blank (first letter hidden):

```
  +---+  +---+
  | _ |  | I |
  +---+  +---+
```

The blank tile pulses subtly (a gentle scale animation from 1.0 to 1.02 and back, looping, using Reanimated) to draw the eye.

### Letter Choices

Below the word, centered, a row of 7 letter tiles:

```
   [Q]  [B]  [F]  [K]  [N]  [T]  [W]
```

Each choice tile:
- 44x44 points
- `borderRadius: 8`
- `backgroundColor: backgroundSecondary`
- `borderWidth: StyleSheet.hairlineWidth`
- `borderColor: border`
- Letter in `type.titleTwo` (New York, 22pt), centered
- The tiles should feel Scrabble-like but not literally replicate a Scrabble tile. The warm beige palette already evokes a game board. Keep the tiles clean.

Tiles are spaced 8px apart. On smaller screens, if 7 tiles at 44px + gaps don't fit, shrink to 40px tiles. Use `Layout.isSmallDevice` to determine this.

### Generating the 6 Wrong Letters

This is the critical algorithm for making the quiz feel good. The approach:

1. **Identify the correct letter(s)** for each blank position. There may be more than one correct answer if multiple letters produce valid words at that position.

2. **Query the database** to find which letters, when placed in the blank position(s), form a valid word in the current dictionary. This gives the set of ALL correct answers.

3. **Pick 6 distractor letters** from the remaining 26 - (correct count) letters. Weight the distractors:
   - **Priority 1**: Letters that are commonly confused with the correct answer. For vowels, include other vowels. For consonants like Q, include K, G. For S, include Z, C.
   - **Priority 2**: High-frequency Scrabble letters (E, A, R, I, O, T, N, S) to make the choices feel plausible.
   - **Priority 3**: Random fill for the remaining slots.

4. **Shuffle the 7 tiles** (1 correct + 6 wrong, or more correctly: all valid + enough wrong to total 7). Present in random order.

5. **Validation rule**: If the user taps a letter and it produces a valid word (even if it wasn't the "intended" answer), accept it as correct. Use the database `lookUpWord` function to validate on tap. This is the simplest and most fair approach.

### Handling Multiple Blanks

When the Blank Slider is set to hide more than 1 letter, the quiz shows all blanks simultaneously. The user fills them **one at a time, left to right**. The currently active blank has the pulsing animation. After correctly filling one blank, the next blank activates.

The 7 letter choices update for each blank position (different distractors may be needed for each position).

### Feedback

**Correct answer:**
- The blank tile fills with the selected letter.
- The tile background flashes `success` (green) briefly (200ms fade in, hold 300ms, 200ms fade to normal).
- A subtle haptic tap (use `expo-haptics` if available, or skip -- don't add a new dependency just for this).
- After the green flash, auto-advance to the next word after a 600ms delay. The next word slides in from the right (horizontal translate animation, 300ms, eased).

**Incorrect answer:**
- The tapped choice tile shakes horizontally (a quick -4px, +4px, -2px, +2px, 0px animation, 300ms total, using Reanimated `withSequence` and `withTiming`).
- The tile background flashes `danger` (red) briefly (same timing as correct).
- The choice tile becomes disabled (reduced opacity to 0.3) so the user cannot tap it again.
- The word stays on screen. The user tries again with the remaining choices.
- **Do not reveal the answer automatically.** Let the user work through the choices. This is spaced repetition in action -- the effort of being wrong and trying again strengthens memory.

### Progress

Top of screen: same thin progress bar as flashcards (fills left to right).

Below the word and above the choice tiles: "24 of 107" in `type.callout`.

### Completion Screen

Same structure as the flashcard completion screen, but with score information:

```
+----------------------------------+
|                                  |
|           [Check icon]           |
|                                  |
|           92 of 107              |
|         correct on first try     |
|                                  |
|             86%                  |
|                                  |
|    [  Try missed words  ]        |
|    [  Restart all       ]        |
|    [  Back to pack      ]        |
|                                  |
+----------------------------------+
```

- **Score**: "92 of 107 correct on first try" shows how many the user got right without any wrong guesses.
- **Percentage**: The percentage in large text (`type.largeTitle`).
- **"Try missed words"** button: Only shows if the user got some wrong. Starts a new quiz session containing only the words they missed (got wrong on first try). This is the most important button -- it implements targeted review.
- **"Restart all"**: Full reset.
- **"Back to pack"**: Returns to Pack Detail.

### What Gets Saved

Save the **best score percentage** per pack to AsyncStorage (or `expo-sqlite/kv-store` to match the existing pattern). Key format: `practice_quiz_score_{packId}_{dictionary}`. This score is what drives the progress bar on the Packs list screen.

Also save the **list of missed word IDs** from the most recent attempt, so the "Try missed words" feature can persist across sessions. Key: `practice_quiz_missed_{packId}_{dictionary}`.

---

## 6. Free Type Mode (`/practice/[packId]/free-type`)

### Core Concept

This is the hardest mode. The user sees a word with blanks (same as quiz mode) but instead of multiple choice, they must type the missing letter(s) from memory. No choices are presented -- pure recall.

This mode is for players who have graduated from Quiz and want to truly test their knowledge. In competitive Scrabble study, this is the equivalent of writing out word lists from memory.

### Word Display

Same as Quiz mode -- tiles for each letter position, blanks shown with dashed borders. The active blank pulses.

### Input Mechanism

Below the word, show a **single row of the full alphabet** (A-Z) as small tappable letter keys. This is NOT the system keyboard -- it's a custom, in-app alphabet bar.

```
  A B C D E F G H I J K L M
  N O P Q R S T U V W X Y Z
```

Two rows of 13 letters each. Each key is a small square (32x32), `borderRadius: 6`, with the letter in `type.callout` (16pt). Background is `backgroundSecondary`. Keys are spaced 4px apart.

**Why a custom alphabet bar instead of the system keyboard:**
1. The system keyboard takes up too much vertical space, pushing the word tiles up or off screen.
2. We don't need text editing (no cursor, no delete-and-retype) -- just single letter taps.
3. The custom bar can be styled to match the app's aesthetic.
4. It works identically on iOS and Android -- no keyboard behavior differences.

When the user taps a letter:
- If it's correct for the current blank, the blank fills in. Same green flash feedback as Quiz mode. Move to the next blank (or next word if all blanks filled).
- If it's wrong, the key shakes briefly and flashes red. The key becomes disabled (grayed out) for THIS blank only -- it re-enables for the next blank/word. The blank remains empty.

### Hint System

After 3 wrong guesses on a single blank, show a subtle hint: the definition of the word fades in below the tiles (`type.body`, `textSecondary`, `FadeIn` animation). This prevents complete stuckness while still requiring the user to make the final connection.

After 5 wrong guesses on a single blank, reveal the letter automatically (fade it in with a `danger`-colored background instead of `success`, so it's clear the user didn't get it). Mark this word as "missed."

### Progress and Completion

Same progress bar and counter as Quiz mode. Completion screen is identical in structure, with the same "Try missed words" / "Restart" / "Back" options.

### What Gets Saved

Same pattern as Quiz: best score and missed words list, but with a different key prefix: `practice_freetype_score_{packId}_{dictionary}`.

---

## 7. The Blank Slider Control

### Purpose

The blank slider controls **how many letters of each word are hidden**. This is the difficulty dial. For 2-letter words, hiding 1 of 2 letters is the standard challenge. Hiding 2 of 2 letters means you're guessing the entire word (extremely hard). Hiding 0 is just reading (same as flashcards).

### Location

The slider lives on the **Pack Detail screen**, below the three mode buttons. It affects Quiz and Free Type modes only. The slider's current value is passed as a route parameter when navigating to a mode screen.

### Design

```
  Blanks per word
  [==========O---------]  1 / 2
```

- Label: "Blanks per word" in `type.caption`, `textSecondary`, left-aligned.
- Slider: A standard horizontal slider. Track color is `border` (inactive) and `primary` (active). Thumb is a circle, 24px, white with a subtle shadow.
- Value display: "1 / 2" in `type.callout`, right-aligned. The denominator is the word length for the pack (e.g., 2 for 2-letter words).

### Range

- **Minimum**: 1 (at least one blank -- otherwise it's just flashcards).
- **Maximum**: The length of the words in the pack.
- **Default**: 1 blank. This is the sweet spot for learning. Start easy.
- **Step**: 1.

For packs with mixed word lengths (e.g., "Short Q Words" has 2-4 letter words), the slider maximum is the length of the shortest word in the pack. This prevents hiding 4 blanks in a 2-letter word. Alternatively, if the blank count exceeds a specific word's length, just blank the entire word for that card.

### Interaction With Modes

- **Flashcards**: Slider is ignored. Flashcards always show the full word. The slider is visually present but disabled (reduced opacity) when Flashcards is the most recently tapped mode. Actually -- simpler: the slider sits below all three mode buttons and is always enabled. The user sets it, then picks a mode. In Flashcards, it simply has no effect. This avoids confusing state toggling.
- **Quiz**: The slider value determines how many letters per word are hidden and presented as fill-the-blank challenges.
- **Free Type**: Same as Quiz -- the slider value determines blank count.

### Passing the Value

When the user taps a mode button, navigate with the blank count as a query parameter:

```tsx
router.push(`/practice/${packId}/quiz?blanks=1`);
```

Read it in the mode screen with `useLocalSearchParams()`.

---

## 8. Component Reuse & Patterns

### Shared Components

Create these reusable components in `components/practice/`:

**`LetterTile`**
The fundamental building block. A single letter displayed in a rounded square.

Props:
- `letter: string` -- the letter to display (or empty string for blank)
- `size: 'small' | 'medium' | 'large'` -- 32px, 44px, 56px
- `state: 'default' | 'blank' | 'correct' | 'incorrect' | 'disabled'`
- `onPress?: () => void` -- if tappable

States map to visual treatments:
- `default`: `backgroundSecondary` bg, `text` letter color
- `blank`: transparent bg, dashed `border` color border, pulsing animation
- `correct`: `success` bg (briefly), `background` letter color
- `incorrect`: `danger` bg (briefly), `background` letter color, shake animation
- `disabled`: `backgroundSecondary` bg, `textSecondary` letter color, 0.3 opacity

This component is used everywhere: in the word display, in the choice tiles, in the alphabet bar, and in the pack list icons.

**`ProgressBar`**
A thin horizontal bar showing progress.

Props:
- `progress: number` -- 0 to 1
- `color?: string` -- fill color, defaults to `primary`
- `height?: number` -- defaults to 3

Used on: Packs list (per card), Flashcard mode (top), Quiz mode (top), Free Type mode (top).

**`WordDisplay`**
Displays a word as a row of `LetterTile` components, with blanks at specified positions.

Props:
- `word: string`
- `blankPositions: number[]` -- indices to hide
- `revealedLetters: Record<number, string>` -- blanks that have been correctly filled
- `size: 'small' | 'medium' | 'large'`

Used on: Quiz mode, Free Type mode, and potentially Flashcards (though flashcards could just use `Text` directly since no tiles are needed -- actually, for visual consistency, use `WordDisplay` with no blanks in flashcards too).

**`ModeCompletionCard`**
The completion/results screen shown at the end of any mode.

Props:
- `totalWords: number`
- `correctOnFirstTry?: number` -- for quiz/free type
- `onRestart: () => void`
- `onRetryMissed?: () => void` -- only if there are missed words
- `onBack: () => void`

**`PracticeHeader`**
A consistent top bar for all practice screens.

Props:
- `title: string`
- `onBack: () => void`
- `rightAction?: { icon: string; onPress: () => void }`

### Tile Styling Philosophy

The tiles should feel warm and tactile -- evocative of Scrabble without being a literal copy. Scrabble tiles are cream/beige with black letters and subtle embossing. Our tiles naturally get this from the existing color palette:

- Light mode: `backgroundSecondary` (#EAE6DB) is almost exactly the color of a physical Scrabble tile. `text` (#3B352B) is a warm dark brown, not black. This is perfect.
- Dark mode: The tiles use `backgroundSecondary` (#1c1917) -- a warm dark stone. Letters in `text` (#d6d3d1) feel like etched stone.

**No Scrabble point values on tiles.** This is a word learning app, not a scoring app. Point values add visual noise and are irrelevant to the memorization task.

### Animation Patterns

All animations use Reanimated, consistent with the existing app:

- **Screen transitions**: Use Expo Router's default Stack push/pop animations.
- **Card entrance**: `FadeInDown.duration(600).springify()` -- same as the existing result card.
- **Correct answer flash**: `withSequence(withTiming(1, { duration: 200 }), withDelay(300, withTiming(0, { duration: 200 })))` on the green overlay opacity.
- **Incorrect shake**: `withSequence(withTiming(-4, {duration:50}), withTiming(4, {duration:50}), withTiming(-2, {duration:50}), withTiming(2, {duration:50}), withTiming(0, {duration:50}))` on translateX.
- **Blank tile pulse**: `withRepeat(withSequence(withTiming(1.04, {duration:800}), withTiming(1.0, {duration:800})), -1, true)` on scale.
- **Card swipe (flashcards)**: Use FlatList with `pagingEnabled` and `horizontal` for native-feeling snapping. No custom gesture handling needed.
- **Progress bar fill**: `withTiming` over 300ms when the value changes. Smooth, not instant.

---

## 9. Data Architecture

### Word Pack Data

Store the word packs as a **static TypeScript data file**: `constants/packs.ts`. Each pack is a hardcoded list of words.

```tsx
export interface WordPack {
  id: string;
  name: string;
  section: string;       // Section header: "ESSENTIALS", "TRICKY LETTERS", etc.
  icon: string;          // 1-2 characters for the tile icon
  words: string[];       // The actual words, uppercase
}

export const WORD_PACKS: WordPack[] = [
  {
    id: "2-letter",
    name: "2-Letter Words",
    section: "ESSENTIALS",
    icon: "Aa",
    words: ["AA", "AB", "AD", "AE", "AG", "AH", "AI", "AL", "AM", "AN", ...],
  },
  // ... etc
];
```

**Why static data and not in the database:**
1. The cheat sheet word lists are curated, fixed sets. They don't change with dictionary updates.
2. A static file loads instantly -- no async database query on app start.
3. The total data is small (a few hundred strings). No performance concern.
4. The database is still used at runtime to look up definitions and validate letter choices in Quiz mode.

### Progress Storage

Use `expo-sqlite/kv-store` (already used in the app for dictionary preference) for all progress data:

```
Key: practice_quiz_best_{packId}
Value: JSON string { score: number, total: number, percentage: number }

Key: practice_quiz_missed_{packId}
Value: JSON string of word strings: ["QI", "XU", ...]

Key: practice_freetype_best_{packId}
Value: same structure as quiz best

Key: practice_freetype_missed_{packId}
Value: same structure as quiz missed
```

Note: Progress is not keyed by dictionary. The cheat sheet packs are NWL23-specific. If future packs are dictionary-specific, add the dictionary to the key.

### Database Queries for Quiz Mode

Quiz mode needs to validate whether a letter choice produces a valid word. Use the existing `databaseManager.lookUpWord()` method:

```tsx
async function isValidWord(word: string, dictionary: Dictionary): Promise<boolean> {
  const result = await databaseManager.lookUpWord(word, dictionary);
  return result?.isValid ?? false;
}
```

For generating distractors, query all possible single-letter substitutions:

```tsx
// For a word like "_I" (QI with first letter blanked):
// Check each letter A-Z: "AI", "BI", "CI", ... "ZI"
// Return which ones are valid words
async function findValidCompletions(
  word: string,
  blankPosition: number,
  dictionary: Dictionary
): Promise<string[]> {
  const validLetters: string[] = [];
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const candidate = word.slice(0, blankPosition) + letter + word.slice(blankPosition + 1);
    const result = await databaseManager.lookUpWord(candidate, dictionary);
    if (result?.isValid) {
      validLetters.push(letter);
    }
  }
  return validLetters;
}
```

**Performance note:** This runs 26 database lookups per blank position. For 2-letter words, that's 26 queries per card. Each query is a simple indexed SELECT on the `word` column -- should complete in under 1ms each. Total: ~26ms per card. Completely fine.

For longer words or multiple blanks, the combinatorics grow. For 2 blanks in a 7-letter word, that's 26 x 26 = 676 queries. This might take 500ms+. **Optimization**: pre-compute all valid completions for the entire pack when the quiz starts. Run the queries in the background while showing a brief loading spinner (or the first card, which can be computed quickly). Cache results in memory for the session.

Actually, a better approach for multi-blank validation: use a single SQL query with LIKE:

```sql
SELECT DISTINCT SUBSTR(word, ?, 1) FROM words
WHERE word LIKE ? AND lists LIKE ?
```

Where the LIKE pattern replaces blank positions with `_` (SQL wildcard). This is a single query that returns all valid letters for a position. Much faster than 26 individual lookups.

### Fetching Definitions

For flashcards, fetch the definition when the card is displayed:

```tsx
const result = await databaseManager.lookUpWord(word, dictionary);
const definition = result?.definition;
```

Pre-fetch definitions for the next 2-3 cards to prevent any visible loading delay when swiping.

---

## 10. Summary of Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entry point location | Below search on Home, visible when no result | Discoverable but not intrusive. The primary feature is still word lookup. |
| Navigation style | Stack push (not tabs) | Practice is a drill-down flow, not a parallel mode. Users go in, study, come back. |
| Pack unlock | All unlocked from start | Scrabble players have varied skill levels. Don't gate content in a study tool. |
| Flashcard definitions | Shown on card | Definitions create memory hooks. A word without meaning is harder to learn. |
| Flashcard navigation | Swipe + tap buttons | Covers both fast browsing and precise navigation preferences. |
| Quiz wrong answer behavior | Disable wrong choice, keep trying | Effortful retrieval strengthens memory. Don't give away the answer. |
| Quiz letter validation | Check against database at tap time | Handles edge cases where multiple letters create valid words. Always fair. |
| Free Type input | Custom alphabet bar, not system keyboard | Better layout control, consistent cross-platform, no keyboard resize issues. |
| Blank slider location | Pack Detail screen | Set difficulty once, then enter a mode. Don't clutter the mode screens. |
| Word pack storage | Static TypeScript file | Instant load, simple, small data set, no async overhead. |
| Progress storage | expo-sqlite/kv-store | Consistent with existing dictionary preference storage pattern. |
| Tile visual style | Warm beige squares, no point values | Evokes Scrabble naturally through the color palette without being a clone. |
| Progress metric | Best quiz score (first-try accuracy) | Quiz is the real test of knowledge. Flashcard views don't prove learning. |
