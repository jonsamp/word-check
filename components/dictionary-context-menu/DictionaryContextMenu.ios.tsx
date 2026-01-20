import {
  Host,
  Button,
  Menu,
  HStack,
  Text as SwiftUIText,
  Image as SwiftUIImage,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  font,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";

import { Dimensions } from "react-native";

import { Dictionary, DictionaryNames } from "../../constants/database";
import type { DictionaryContextMenuProps } from "./DictionaryContextMenu.types";

export function DictionaryContextMenu({
  onSelectDictionary,
  value,
  color,
}: DictionaryContextMenuProps) {
  const menuLabel = (
    <Button modifiers={[buttonStyle("bordered")]}>
      <HStack spacing={8}>
        <SwiftUIImage systemName="chevron.down" size={16} color={color} />
        <SwiftUIText
          modifiers={[font({ design: "serif" }), foregroundStyle(color)]}
        >
          {DictionaryNames[value]}
        </SwiftUIText>
      </HStack>
    </Button>
  );

  const buttons = (Object.keys(DictionaryNames) as Dictionary[]).map(
    (dictionaryId) => {
      // Currently there is a bug in expo/ui that shows menu's label as an option in the menu,
      // so we're hiding one that would be a duplicate.
      if (dictionaryId === value) {
        return null;
      }
      return (
        <Button
          key={dictionaryId}
          onPress={() => onSelectDictionary(dictionaryId)}
        >
          <SwiftUIText>{DictionaryNames[dictionaryId]}</SwiftUIText>
        </Button>
      );
    }
  );

  return (
    <Host style={{ width: Dimensions.get("window").width, height: 40 }}>
      <Menu label={menuLabel}>{buttons}</Menu>
    </Host>
  );
}
