const buildLps = (pattern) => {
  const lps = new Array(pattern.length).fill(0);
  let length = 0;
  let index = 1;

  while (index < pattern.length) {
    if (pattern[index] === pattern[length]) {
      length += 1;
      lps[index] = length;
      index += 1;
    } else if (length !== 0) {
      length = lps[length - 1];
    } else {
      lps[index] = 0;
      index += 1;
    }
  }
  return lps;
};

// KMP guarantees O(N + M) substring matching with no backtracking on text.
export const kmpSearch = (text, pattern) => {
  if (!pattern || !text) return false;
  const lps = buildLps(pattern);
  let textIndex = 0;
  let patternIndex = 0;

  while (textIndex < text.length) {
    if (text[textIndex] === pattern[patternIndex]) {
      textIndex += 1;
      patternIndex += 1;
      if (patternIndex === pattern.length) {
        return true;
      }
    } else if (patternIndex !== 0) {
      patternIndex = lps[patternIndex - 1];
    } else {
      textIndex += 1;
    }
  }

  return false;
};

