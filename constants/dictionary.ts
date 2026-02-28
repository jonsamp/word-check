export enum Dictionary {
  NWL23 = "NWL23",
  CSW24 = "CSW24",
  NSWL23 = "NSWL23",
}

export const DictionaryNames: Record<Dictionary, string> = {
  [Dictionary.CSW24]: "Worldwide Dictionary",
  [Dictionary.NSWL23]: "School Dictionary",
  [Dictionary.NWL23]: "US & Canada Dictionary",
};

export const DB_DICTIONARY_KEY = "dictionary";
