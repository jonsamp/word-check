import type { TextStyle } from "react-native";

const tabularNumerals: TextStyle["fontVariant"] = ["tabular-nums"];

export const type = {
  largeTitle: {
    fontFamily: "New York",
    fontWeight: "bold",
    fontSize: 36,
  },
  titleOne: {
    fontFamily: "New York",
    fontSize: 28,
  },
  titleTwo: {
    fontFamily: "New York",
    fontSize: 22,
  },
  title: {
    fontFamily: "New York",
    fontSize: 20,
  },
  headline: {
    fontFamily: "New York",
    fontSize: 17,
  },
  body: {
    fontFamily: "New York",
    fontSize: 18,
  },
  callout: {
    fontFamily: "New York",
    fontSize: 16,
  },
  subhead: {
    fontFamily: "New York",
    fontSize: 15,
  },
  footnote: {
    fontFamily: "New York",
    fontSize: 13,
  },
  caption: {
    fontFamily: "New York",
    fontSize: 12,
  },
  label: {
    fontFamily: "New York",
    fontSize: 13,
  },
};

export const sansSerifType = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.37,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.45,
  },
  headline: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.43,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: "400" as const,
    letterSpacing: -0.08,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  numeric: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontVariant: tabularNumerals,
  },
};
