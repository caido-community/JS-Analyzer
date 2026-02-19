import type { AnalyzerMatch } from "shared";
import { ref } from "vue";

export function useFileContent() {
  const highlightMatch = ref<AnalyzerMatch | undefined>(undefined);

  function setHighlight(match: AnalyzerMatch) {
    highlightMatch.value = match;
  }

  function clearHighlight() {
    highlightMatch.value = undefined;
  }

  return {
    highlightMatch,
    setHighlight,
    clearHighlight,
  };
}
