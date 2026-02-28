import { useState } from "react";
import {
  TouchableOpacity,
  Modal,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Text } from "../Themed";
import { ChevronDownIcon } from "../Icons";

import { Dictionary, DictionaryNames } from "../../constants/dictionary";
import type { DictionaryContextMenuProps } from "./DictionaryContextMenu.types";

export function DictionaryContextMenu({
  onSelectDictionary,
  value,
  color,
  backgroundColor,
  isLoading,
}: DictionaryContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);

  const options = [
    { label: "US & Canada Dictionary", value: Dictionary.NWL23 },
    { label: "Worldwide Dictionary", value: Dictionary.CSW24 },
    { label: "School Dictionary", value: Dictionary.NSWL23 },
  ];

  const handleSelect = (dict: Dictionary) => {
    onSelectDictionary(dict);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor,
            borderColor: color + "40",
          },
        ]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <Text style={{ color: color + "99", fontSize: 16, fontWeight: "500" }}>
          {DictionaryNames[value]}
        </Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={color + "99"} />
        ) : (
          <ChevronDownIcon color={color + "99"} size={16} />
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor,
              },
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.menuItem,
                  index === options.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text style={{ color: color + "CC", fontSize: 16 }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 250,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: 280,
    borderRadius: 25,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
});
