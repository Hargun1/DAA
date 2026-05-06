class ACNode {
  constructor() {
    this.children = new Map();
    this.fail = null;
    this.outputs = [];
  }
}

// Optional bonus multi-pattern matcher: O(N + total_matches).
export class AhoCorasick {
  constructor(patterns = []) {
    this.root = new ACNode();
    patterns.forEach((pattern) => this.addPattern(pattern));
    this.buildFailureLinks();
  }

  addPattern(pattern) {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new ACNode());
      }
      node = node.children.get(char);
    }
    node.outputs.push(pattern);
  }

  buildFailureLinks() {
    const queue = [];
    this.root.fail = this.root;

    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length) {
      const current = queue.shift();
      for (const [char, child] of current.children.entries()) {
        let fallback = current.fail;
        while (fallback !== this.root && !fallback.children.has(char)) {
          fallback = fallback.fail;
        }
        child.fail = fallback.children.get(char) || this.root;
        child.outputs = child.outputs.concat(child.fail.outputs);
        queue.push(child);
      }
    }
  }

  search(text) {
    const matches = [];
    let node = this.root;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      while (node !== this.root && !node.children.has(char)) {
        node = node.fail;
      }
      node = node.children.get(char) || this.root;
      if (node.outputs.length) {
        for (const pattern of node.outputs) {
          matches.push({ pattern, index });
        }
      }
    }
    return matches;
  }
}

