import { Stack } from "expo-router";

export default function PackDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="flashcards" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="free-type" options={{ headerShown: false }} />
    </Stack>
  );
}
