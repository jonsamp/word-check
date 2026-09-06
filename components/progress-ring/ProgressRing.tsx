import { StyleSheet, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { Text, useThemeColor } from "../Themed";
import { type } from "../../constants/Type";

type ProgressRingProps = {
  percentage: number | null;
  size?: number;
  strokeWidth?: number;
  showPercentSign?: boolean;
};

export function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 4,
  showPercentSign = false,
}: ProgressRingProps) {
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = percentage === null ? 0 : Math.max(0, Math.min(100, percentage));
  const dashOffset = circumference * (1 - clamped / 100);

  const label = percentage === null ? "--" : `${percentage}${showPercentSign ? "%" : ""}`;
  const innerWidth = size - strokeWidth * 2 - size * 0.1;
  const fontSize = Math.min(size * 0.32, (innerWidth / Math.max(label.length, 2)) * 1.5);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={borderColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.5}
        />
        {percentage !== null && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tintColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={styles.center}>
        <Text
          numberOfLines={1}
          style={{
            ...type.numeric,
            fontSize,
            lineHeight: fontSize * 1.2,
            color: percentage === null ? textSecondaryColor : textColor,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
