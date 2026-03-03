import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import useColorScheme from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? Colors.dark.text : Colors.light.text,
        tabBarInactiveTintColor: isDark
          ? Colors.dark.textSecondary
          : Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark
            ? Colors.dark.background
            : Colors.light.background,
          borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="check"
        options={{
          title: "Check",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
