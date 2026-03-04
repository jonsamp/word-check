# Copilot Instructions for Word Check

## Project Overview

Word Check is a React Native mobile app for iOS and Android that lets users instantly validate whether a word is playable in SCRABBLE and see its definition if valid.

## Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev/) (~55)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite via `expo-sqlite` — all three word lists are bundled in a single local database (`assets/databases/unified.db`)
- **Linter**: [oxlint](https://oxc.rs/docs/guide/usage/linter)
- **Formatter**: [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) (Prettier-compatible, 100-char print width, double quotes, trailing commas)
- **Testing**: Jest via `jest-expo`

## Project Structure

```
app/              # Expo Router screens (_layout.tsx, index.tsx, about.tsx)
assets/           # Images and the bundled SQLite database
components/       # Reusable UI components (Themed.tsx, Icons.tsx, etc.)
constants/        # Shared constants — Colors, Type, dictionary enum, database helpers
contexts/         # React contexts (DictionaryContext)
hooks/            # Custom hooks (useColorScheme)
types/            # Shared TypeScript types
```

## Development Workflow

```bash
# Install dependencies
yarn install

# Start Expo development server
yarn start

# Lint
yarn lint

# Format
yarn format

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run on web
yarn web
```

## Key Conventions

- Use **TypeScript** with strict mode. Avoid `any` types.
- Format code with `oxfmt` (run `yarn format`). Configuration is in `.oxfmtrc.json`: 2-space indent, 100-char print width, double quotes, trailing commas (ES5).
- Lint with `oxlint`. Configuration is in `.oxlintrc.json`.
- Use the `Themed` components (`View`, `Text`) from `components/Themed.tsx` for theme-aware UI instead of bare React Native primitives.
- Use `useThemeColor` from `components/Themed.tsx` to access semantic color tokens.
- Expo Router handles navigation — add new screens as files in the `app/` directory.
- The SQLite database is loaded lazily via `loadDatabase()` in `constants/database.ts`. Always call `loadDatabase()` before calling `lookUpWord()`.
- The `DictionaryContext` manages the currently selected dictionary and exposes `currentDictionary`, `setDictionary`, and `isLoading`.

## Dictionaries

Three SCRABBLE word lists are supported, identified by the `Dictionary` enum in `constants/dictionary.ts`:

| Enum value | Name | Coverage |
|---|---|---|
| `NWL23` | US & Canada Dictionary | NASPA Word List 2023 |
| `CSW24` | Worldwide Dictionary | Collins SCRABBLE Words 2024 |
| `NSWL23` | School Dictionary | NASPA School Word List 2023 |
