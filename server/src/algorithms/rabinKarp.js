// Rabin-Karp uses rolling hash for average O(N + M) pattern matching.
export const rabinKarpSearch = (text, pattern) => {
  if (!text || !pattern || pattern.length > text.length) return false;

  const base = 256;
  const prime = 101;
  const patternLength = pattern.length;
  let patternHash = 0;
  let textHash = 0;
  let h = 1;

  for (let i = 0; i < patternLength - 1; i += 1) {
    h = (h * base) % prime;
  }

  for (let i = 0; i < patternLength; i += 1) {
    patternHash = (base * patternHash + pattern.charCodeAt(i)) % prime;
    textHash = (base * textHash + text.charCodeAt(i)) % prime;
  }

  for (let i = 0; i <= text.length - patternLength; i += 1) {
    if (patternHash === textHash) {
      let isMatch = true;
      for (let j = 0; j < patternLength; j += 1) {
        if (text[i + j] !== pattern[j]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) return true;
    }
    if (i < text.length - patternLength) {
      textHash =
        (base * (textHash - text.charCodeAt(i) * h) +
          text.charCodeAt(i + patternLength)) %
        prime;
      if (textHash < 0) textHash += prime;
    }
  }
  return false;
};

