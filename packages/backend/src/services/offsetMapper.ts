import type { AnalyzerMatch } from "shared";

export function mapBeautifiedOffsetsToRaw(
  rawContent: string,
  matches: AnalyzerMatch[],
): AnalyzerMatch[] {
  return matches.map((match) => {
    const rawOffsets = findValueInRaw(rawContent, match);
    return {
      ...match,
      rawStartOffset: rawOffsets.start,
      rawEndOffset: rawOffsets.end,
    };
  });
}

function findValueInRaw(
  rawContent: string,
  match: AnalyzerMatch,
): { start: number | undefined; end: number | undefined } {
  const searchValue = extractSearchValue(match);
  if (searchValue.length === 0) {
    return { start: undefined, end: undefined };
  }

  const index = rawContent.indexOf(searchValue);
  if (index === -1) {
    const caseInsensitiveIndex = rawContent
      .toLowerCase()
      .indexOf(searchValue.toLowerCase());
    if (caseInsensitiveIndex === -1) {
      return { start: undefined, end: undefined };
    }
    return {
      start: caseInsensitiveIndex,
      end: caseInsensitiveIndex + searchValue.length,
    };
  }

  return { start: index, end: index + searchValue.length };
}

function extractSearchValue(match: AnalyzerMatch): string {
  const value = match.value;

  const bracketEnd = value.indexOf("] ");
  if (bracketEnd !== -1) {
    return value.slice(bracketEnd + 2);
  }

  return value;
}
