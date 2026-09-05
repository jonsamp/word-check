import { StyleSheet, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { Text, useThemeColor } from "../Themed";
import { sansSerifType } from "../../constants/Type";

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
  const textSecondaryColor = useThemeColor("textSecondary");

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = percentage === null ? 0 : Math.max(0, Math.min(100, percentage));
  const dashOffset = circumference * (1 - clamped / 100);

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
          style={{
            ...sansSerifType.numeric,
            fontSize: size * 0.3,
            color: percentage === null ? textSecondaryColor : undefined,
          }}
        >
          {percentage === null ? "--" : `${percentage}${showPercentSign ? "%" : ""}`}
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
