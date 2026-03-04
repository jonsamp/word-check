import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Colors from "../../constants/Colors";
import useColorScheme from "../../hooks/useColorScheme";
import { Text } from "../../components/Themed";
import { type } from "../../constants/Type";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  if (Platform.OS === "web") {
    return <WebTabs />;
  }

  return (
    <NativeTabs
      tintColor={colors.tint}
      backgroundColor={colors.backgroundSecondary}
      indicatorColor={colors.background}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="checkmark.circle" md="check_circle" />
        <NativeTabs.Trigger.Label>Check</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="practice">
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
        <NativeTabs.Trigger.Label>Practice</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function PillTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.tabBarWrapper}>
      <View
        style={[
          styles.tabBarPill,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              }}
              style={[styles.tabItem, isFocused && { backgroundColor: colors.backgroundSecondary }]}
            >
              <Text
                style={{
                  ...type.callout,
                  color: isFocused ? colors.text : colors.textSecondary,
                  fontWeight: isFocused ? "600" : "400",
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WebTabs() {
  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Check" }} />
      <Tabs.Screen name="practice" options={{ title: "Practice" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    alignItems: "center",
    paddingBottom: 16,
  },
  tabBarPill: {
    flexDirection: "row",
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  tabItem: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
  },
});
