import {
  Host,
  Button,
  ContextMenu,
  HStack,
  Text as SwiftUIText,
  Image as SwiftUIImage,
} from "@expo/ui/swift-ui";

import { Dimensions } from "react-native";

import { Dictionary } from "../../constants/database";
import type { DictionaryContextMenuProps } from "./DictionaryContextMenu.types";

export function DictionaryContextMenu({
  onSelectDictionary,
  value,
  color,
}: DictionaryContextMenuProps) {
  return (
    <Host style={{ width: Dimensions.get("window").width, height: 40 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button onPress={() => onSelectDictionary(Dictionary.NSWL2023)}>
            School Dictionary
          </Button>
          <Button onPress={() => onSelectDictionary(Dictionary.CSW24)}>
            Worldwide Dictionary
          </Button>
          <Button onPress={() => onSelectDictionary(Dictionary.NWL2023)}>
            US & Canada Dictionary
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button variant="bordered">
            <HStack spacing={8}>
              <SwiftUIImage systemName="chevron.down" size={16} color={color} />
              <SwiftUIText design="serif" color={color}>
                {value ?? ""}
              </SwiftUIText>
            </HStack>
          </Button>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
