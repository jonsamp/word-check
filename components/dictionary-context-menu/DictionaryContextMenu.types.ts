import type { Dictionary } from "../../constants/database";

export interface DictionaryContextMenuProps {
  onSelectDictionary: (dictionary: Dictionary) => void;
  value: string;
  color?: string;
  backgroundColor?: string;
  isLoading?: boolean;
}
