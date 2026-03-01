import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";

import { Text, useThemeColor } from "../Themed";
import { type } from "../../constants/Type";

interface PracticeHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: {
    icon: "shuffle" | "shuffle-active";
    onPress: () => void;
  };
}

function BackArrow({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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

function ShuffleIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PracticeHeader({
  title,
  onBack,
  rightAction,
}: PracticeHeaderProps) {
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor("text");
  const primaryColor = useThemeColor("primary");

  return (
    <RNView
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BackArrow color={textColor} />
        <Text style={[styles.backText, { color: textColor }]}>Back</Text>
      </TouchableOpacity>
      <Text
        style={[styles.title, { color: textColor }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.rightButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ShuffleIcon
            color={
              rightAction.icon === "shuffle-active" ? primaryColor : textColor
            }
          />
        </TouchableOpacity>
      ) : (
        <RNView style={styles.rightPlaceholder} />
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 70,
  },
  backText: {
    ...type.callout,
    marginLeft: 4,
  },
  title: {
    ...type.headline,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  rightButton: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  rightPlaceholder: {
    minWidth: 70,
  },
});
