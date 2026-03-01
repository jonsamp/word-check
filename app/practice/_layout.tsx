import { Stack } from "expo-router";

export default function PracticeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Practice", headerShown: false }} />
      <Stack.Screen name="[packId]" options={{ headerShown: false }} />
    </Stack>
  );
}
