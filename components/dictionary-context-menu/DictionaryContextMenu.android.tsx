import { Button, ContextMenu } from "@expo/ui/jetpack-compose";

import { Dictionary } from "../../constants/database";
import type { DictionaryContextMenuProps } from "./DictionaryContextMenu.types";

export function DictionaryContextMenu({
  onSelectDictionary,
  value,
  color,
  backgroundColor,
}: DictionaryContextMenuProps) {
  return (
    <ContextMenu
      style={{
        height: 50,
        alignSelf: "center",
      }}
    >
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
        <Button
          style={{
            width: 250,
            height: 50,
            alignSelf: "center",
          }}
          systemImage="filled.ArrowDropDown"
          elementColors={{
            contentColor: color,
            containerColor: backgroundColor,
          }}
          variant="bordered"
        >
          {value ?? ""}
        </Button>
      </ContextMenu.Trigger>
    </ContextMenu>
  );
}
