import { performance } from "node:perf_hooks";
import Alias from "../models/Alias.js";
import Merchant from "../models/Merchant.js";
import { Trie } from "../algorithms/trie.js";
import { kmpSearch } from "../algorithms/kmp.js";
import { rabinKarpSearch } from "../algorithms/rabinKarp.js";
import { similarityScore } from "../algorithms/levenshtein.js";
import { AhoCorasick } from "../algorithms/ahoCorasick.js";

const normalizeText = (value) => (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const toRounded = (value) => Math.max(0, Math.min(1, Number(value.toFixed(3))));

const pickTop = (scores) => {
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1].score - a[1].score);
  if (!entries.length) return null;
  return { merchant: entries[0][0], ...entries[0][1] };
};

const addScore = (scores, merchant, category, amount, sourceAlias) => {
  if (!merchant || amount <= 0) return;
  if (!scores[merchant]) {
    scores[merchant] = { score: 0, category: category || "Uncategorized", sourceAlias };
  }
  scores[merchant].score += amount;
};

export const createResolverContext = async (userId) => {
  const [merchants, aliases] = await Promise.all([
    Merchant.find({ isActive: true }).lean(),
    Alias.find({ $or: [{ user: userId }, { user: null }] }).lean()
  ]);

  const aliasEntries = [];
  for (const merchant of merchants) {
    aliasEntries.push({
      key: normalizeText(merchant.name),
      merchantName: merchant.name,
      category: merchant.category
    });
    for (const alias of merchant.aliases || []) {
      aliasEntries.push({
        key: normalizeText(alias),
        merchantName: merchant.name,
        category: merchant.category
      });
    }
  }

  for (const alias of aliases) {
    aliasEntries.push({
      key: alias.normalizedAlias,
      merchantName: alias.merchantName,
      category: alias.category
    });
  }

  const dedup = new Map();
  aliasEntries.forEach((entry) => {
    if (!entry.key) return;
    const mapKey = `${entry.key}::${entry.merchantName}`;
    dedup.set(mapKey, entry);
  });

  const uniqueEntries = [...dedup.values()];
  const trie = new Trie();
  uniqueEntries.forEach((entry) => trie.insert(entry.key, entry));
  const aho = new AhoCorasick(uniqueEntries.map((entry) => entry.key));

  return {
    aliases: uniqueEntries,
    trie,
    aho
  };
};

const resolveWithAliasHash = (description, aliases) => {
  const normalized = normalizeText(description);
  let best = null;
  for (const alias of aliases) {
    if (!alias.key || alias.key.length < 2) continue;
    if (normalized.includes(alias.key)) {
      const score = Math.min(1, 0.9 + alias.key.length / (normalized.length + 2));
      if (!best || score > best.score) {
        best = { ...alias, score };
      }
    }
  }
  return best;
};

const resolveWithTrie = (description, trie) => {
  const normalized = normalizeText(description);
  const tokens = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  let best = null;

  const candidateTokens = [normalized, ...tokens];
  for (const token of candidateTokens) {
    const hit = trie.searchLongestPrefix(token);
    if (hit?.meta) {
      const score = Math.min(1, 0.65 + hit.prefix.length / (hit.meta.key.length + 2));
      if (!best || score > best.score) {
        best = { ...hit.meta, score };
      }
    }
  }
  return best;
};

const resolveWithPattern = (description, aliases, matcher) => {
  const normalized = normalizeText(description);
  let best = null;
  for (const alias of aliases) {
    if (!alias.key || alias.key.length < 3) continue;
    if (matcher(normalized, alias.key)) {
      const score = Math.min(1, 0.62 + alias.key.length / (normalized.length + 4));
      if (!best || score > best.score) {
        best = { ...alias, score };
      }
    }
  }
  return best;
};

const resolveWithAhoCorasick = (description, aliases, aho) => {
  const normalized = normalizeText(description);
  const aliasByKey = new Map(aliases.map((alias) => [alias.key, alias]));
  const matches = aho.search(normalized);
  let best = null;
  for (const match of matches) {
    const alias = aliasByKey.get(match.pattern);
    if (!alias) continue;
    const score = Math.min(1, 0.66 + alias.key.length / (normalized.length + 4));
    if (!best || score > best.score) {
      best = { ...alias, score };
    }
  }
  return best;
};

const resolveWithLevenshtein = (description, aliases) => {
  const normalized = normalizeText(description);
  const tokens = normalized.match(/[A-Z0-9]{2,}/g) || [];
  const candidates = [normalized, ...tokens];
  let best = null;

  for (const alias of aliases) {
    if (alias.key.length < 3) continue;
    let localBest = 0;
    for (const candidate of candidates) {
      const score = similarityScore(candidate, alias.key);
      if (score > localBest) localBest = score;
    }
    if (localBest > 0.55 && (!best || localBest > best.score)) {
      best = { ...alias, score: localBest };
    }
  }
  return best;
};

export const resolveMerchant = (description, context) => {
  const merchantScores = {};
  const algorithmBreakdown = {
    aliasHash: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 },
    trie: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 },
    kmp: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 },
    rabinKarp: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 },
    ahoCorasick: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 },
    levenshtein: { merchant: "Unknown", score: 0, matched: false, timeMs: 0 }
  };

  const run = (name, fn, weight) => {
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    algorithmBreakdown[name].timeMs = Number(elapsed.toFixed(3));
    if (result) {
      algorithmBreakdown[name] = {
        merchant: result.merchantName,
        score: toRounded(result.score),
        matched: true,
        timeMs: Number(elapsed.toFixed(3))
      };
      addScore(
        merchantScores,
        result.merchantName,
        result.category,
        toRounded(result.score * weight),
        result.key
      );
    }
  };

  run("aliasHash", () => resolveWithAliasHash(description, context.aliases), 1.0);
  run("trie", () => resolveWithTrie(description, context.trie), 0.85);
  run("kmp", () => resolveWithPattern(description, context.aliases, kmpSearch), 0.75);
  run("rabinKarp", () => resolveWithPattern(description, context.aliases, rabinKarpSearch), 0.72);
  run(
    "ahoCorasick",
    () => resolveWithAhoCorasick(description, context.aliases, context.aho),
    0.8
  );
  run("levenshtein", () => resolveWithLevenshtein(description, context.aliases), 0.7);

  const top = pickTop(merchantScores);
  if (!top || top.score < 0.56) {
    return {
      merchant: "Unknown",
      category: "Uncategorized",
      confidence: top ? toRounded(top.score) : 0.2,
      isUnknown: true,
      algorithmBreakdown
    };
  }

  return {
    merchant: top.merchant,
    category: top.category,
    confidence: toRounded(top.score),
    isUnknown: false,
    algorithmBreakdown
  };
};

