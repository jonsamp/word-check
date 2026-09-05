import { PRACTICE_LISTS, PracticeList, STARRED_LIST_ID } from "../constants/PracticeLists";
import { useStarredWords } from "../contexts/StarredWordsContext";

export const STARRED_LIST_TITLE = "Starred Words";

export function usePracticeList(listId: string | undefined): PracticeList | undefined {
  const { starredWords } = useStarredWords();

  if (!listId) {
    return undefined;
  }

  if (listId === STARRED_LIST_ID) {
    return {
      id: STARRED_LIST_ID,
      title: STARRED_LIST_TITLE,
      words: starredWords,
      quizSize: 10,
    };
  }

  return PRACTICE_LISTS[listId];
}
