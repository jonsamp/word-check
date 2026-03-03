import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "../../components/Themed";
import { type } from "../../constants/Type";

export default function Practice() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    ...type.largeTitle,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    ...type.body,
  },
});
