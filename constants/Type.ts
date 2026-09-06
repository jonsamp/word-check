import type { TextStyle } from "react-native";

const tabularNumerals: TextStyle["fontVariant"] = ["tabular-nums"];

const serif = "New York";

export const type = {
  largeTitle: {
    fontFamily: serif,
    fontWeight: "bold" as const,
    fontSize: 36,
  },
  titleOne: {
    fontFamily: serif,
    fontSize: 28,
  },
  titleTwo: {
    fontFamily: serif,
    fontSize: 22,
  },
  title: {
    fontFamily: serif,
    fontSize: 20,
  },
  headline: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontFamily: serif,
    fontSize: 18,
  },
  callout: {
    fontFamily: serif,
    fontSize: 16,
  },
  subhead: {
    fontFamily: serif,
    fontSize: 15,
  },
  footnote: {
    fontFamily: serif,
    fontSize: 13,
  },
  caption: {
    fontFamily: serif,
    fontSize: 12,
  },
  label: {
    fontFamily: serif,
    fontSize: 13,
  },
  wordTitle: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: "500" as const,
  },
  sectionHeader: {
    fontFamily: serif,
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  numeric: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: "400" as const,
    fontVariant: tabularNumerals,
  },
};
