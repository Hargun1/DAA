import dayjs from "dayjs";

const round2 = (value) => Number(value.toFixed(2));

export const markRecurringTransactions = (transactions) => {
  const grouped = new Map();

  for (const transaction of transactions) {
    if (transaction.isUnknown) continue;
    const amountBucket = Math.round(Math.abs(transaction.amount));
    const key = `${transaction.resolvedMerchant}::${amountBucket}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(transaction);
  }

  const recurringSummaries = [];
  for (const [key, items] of grouped.entries()) {
    if (items.length < 3) continue;
    items.sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];
    for (let i = 1; i < items.length; i += 1) {
      intervals.push(dayjs(items[i].date).diff(dayjs(items[i - 1].date), "day"));
    }
    const isMonthly = intervals.every((days) => days >= 25 && days <= 35);
    const isWeekly = intervals.every((days) => days >= 6 && days <= 8);
    if (isMonthly || isWeekly) {
      items.forEach((item) => {
        item.isRecurring = true;
      });
      const [merchant] = key.split("::");
      recurringSummaries.push({
        merchant,
        amount: round2(Math.abs(items[0].amount)),
        occurrences: items.length,
        cadence: isMonthly ? "Monthly" : "Weekly"
      });
    }
  }

  return recurringSummaries;
};

export const buildDashboardData = (transactions) => {
  const merchantMap = new Map();
  const categoryMap = new Map();
  let totalSpent = 0;
  let totalIncome = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount);
    if (amount < 0) totalSpent += Math.abs(amount);
    else totalIncome += amount;

    const merchantData = merchantMap.get(transaction.resolvedMerchant) || {
      merchant: transaction.resolvedMerchant,
      amount: 0,
      count: 0,
      category: transaction.category
    };
    merchantData.amount += Math.abs(amount);
    merchantData.count += 1;
    merchantMap.set(transaction.resolvedMerchant, merchantData);

    const categoryData = categoryMap.get(transaction.category) || {
      category: transaction.category,
      amount: 0
    };
    categoryData.amount += Math.abs(amount);
    categoryMap.set(transaction.category, categoryData);
  });

  const merchantBreakdown = [...merchantMap.values()]
    .map((item) => ({
      ...item,
      amount: round2(item.amount)
    }))
    .sort((a, b) => b.amount - a.amount);
  const categoryBreakdown = [...categoryMap.values()]
    .map((item) => ({
      ...item,
      amount: round2(item.amount)
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totals: {
      spent: round2(totalSpent),
      income: round2(totalIncome),
      net: round2(totalIncome - totalSpent)
    },
    merchantBreakdown,
    categoryBreakdown,
    unknownTransactions: transactions.filter((item) => item.isUnknown)
  };
};

const complexity = [
  { algorithm: "Alias HashMap", timeComplexity: "O(1) average lookup", spaceComplexity: "O(K)" },
  { algorithm: "Trie Prefix Match", timeComplexity: "O(L)", spaceComplexity: "O(sum of keys)" },
  { algorithm: "KMP", timeComplexity: "O(N + M)", spaceComplexity: "O(M)" },
  { algorithm: "Rabin-Karp", timeComplexity: "O(N + M) average", spaceComplexity: "O(1)" },
  {
    algorithm: "Aho-Corasick",
    timeComplexity: "O(N + matches)",
    spaceComplexity: "O(sum of keys * alphabet)"
  },
  { algorithm: "Levenshtein", timeComplexity: "O(N*M)", spaceComplexity: "O(N*M)" }
];

export const buildComparisonMetrics = (transactions) => {
  const algorithms = [
    "aliasHash",
    "trie",
    "kmp",
    "rabinKarp",
    "ahoCorasick",
    "levenshtein"
  ];
  const stats = Object.fromEntries(
    algorithms.map((algorithm) => [
      algorithm,
      { matched: 0, totalTimeMs: 0, agreement: 0, accuracyHits: 0, evaluated: 0 }
    ])
  );

  const hasGroundTruth = transactions.some((item) => item.expectedMerchant);

  for (const transaction of transactions) {
    for (const algorithm of algorithms) {
      const detail = transaction.algorithmBreakdown?.[algorithm];
      if (!detail) continue;
      if (detail.matched) stats[algorithm].matched += 1;
      stats[algorithm].totalTimeMs += detail.timeMs || 0;
      if (detail.merchant === transaction.resolvedMerchant) {
        stats[algorithm].agreement += 1;
      }
      if (hasGroundTruth && transaction.expectedMerchant) {
        stats[algorithm].evaluated += 1;
        if (
          detail.merchant.toLowerCase() === transaction.expectedMerchant.toLowerCase()
        ) {
          stats[algorithm].accuracyHits += 1;
        }
      }
    }
  }

  const totalTransactions = transactions.length || 1;
  const summary = algorithms.map((algorithm) => ({
    algorithm,
    matchedTransactions: stats[algorithm].matched,
    avgTimeMs: Number((stats[algorithm].totalTimeMs / totalTransactions).toFixed(4)),
    agreementWithEnsemblePct: Number(
      ((stats[algorithm].agreement / totalTransactions) * 100).toFixed(2)
    ),
    accuracyPct:
      stats[algorithm].evaluated > 0
        ? Number(
            ((stats[algorithm].accuracyHits / stats[algorithm].evaluated) * 100).toFixed(2)
          )
        : null
  }));

  return {
    hasGroundTruth,
    comparisonSummary: summary,
    complexity
  };
};

