class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
    this.meta = null;
  }
}

// Trie supports fast O(L) prefix lookups for noisy transaction tokens.
export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, meta) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isWord = true;
    node.meta = meta;
  }

  searchLongestPrefix(text) {
    let node = this.root;
    let longest = null;
    let prefix = "";

    for (const char of text) {
      if (!node.children.has(char)) {
        break;
      }
      node = node.children.get(char);
      prefix += char;
      if (node.isWord) {
        longest = {
          prefix,
          meta: node.meta
        };
      }
    }

    return longest;
  }
}

