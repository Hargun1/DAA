import Statement from "../models/Statement.js";
import Transaction from "../models/Transaction.js";
import { parseStatementCsv } from "../utils/csvParser.js";
import { createResolverContext, resolveMerchant } from "../services/resolverService.js";
import { buildDashboardData, markRecurringTransactions } from "../services/analysisService.js";

const normalizeText = (value) => (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const recurringSummaryFromTransactions = (transactions) => {
  const grouped = new Map();
  for (const transaction of transactions) {
    if (!transaction.isRecurring) continue;
    const amountBucket = Math.round(Math.abs(transaction.amount));
    const key = `${transaction.resolvedMerchant}::${amountBucket}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(transaction);
  }
  return [...grouped.entries()].map(([key, items]) => {
    const [merchant] = key.split("::");
    return {
      merchant,
      amount: Number(Math.abs(items[0].amount).toFixed(2)),
      occurrences: items.length
    };
  });
};

export const uploadStatement = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("CSV file is required under field name 'statement'");
      error.statusCode = 400;
      throw error;
    }

    const parsedRows = parseStatementCsv(req.file.buffer);
    const resolverContext = await createResolverContext(req.user._id);

    const statement = await Statement.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      totalTransactions: parsedRows.length
    });

    const transactionDocs = parsedRows.map((row) => {
      const resolved = resolveMerchant(row.description, resolverContext);
      return {
        user: req.user._id,
        statement: statement._id,
        date: row.date,
        description: row.description,
        normalizedDescription: normalizeText(row.description),
        amount: row.amount,
        resolvedMerchant: resolved.merchant,
        category: resolved.category,
        confidence: resolved.confidence,
        isUnknown: resolved.isUnknown,
        isRecurring: false,
        expectedMerchant: row.expectedMerchant,
        algorithmBreakdown: resolved.algorithmBreakdown
      };
    });

    const recurringPayments = markRecurringTransactions(transactionDocs);
    const storedTransactions = await Transaction.insertMany(transactionDocs);
    const dashboard = buildDashboardData(storedTransactions);

    res.status(201).json({
      message: "Statement uploaded and processed",
      statementId: statement._id,
      dashboard: {
        ...dashboard,
        recurringPayments,
        transactions: storedTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listStatements = async (req, res, next) => {
  try {
    const statements = await Statement.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("_id originalFileName totalTransactions processedAt createdAt")
      .lean();
    res.json({ statements });
  } catch (error) {
    next(error);
  }
};

const getStatementOrLatest = async (userId, statementId) => {
  if (statementId) {
    return Statement.findOne({ _id: statementId, user: userId }).lean();
  }
  return Statement.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
};

export const getDashboard = async (req, res, next) => {
  try {
    const statement = await getStatementOrLatest(req.user._id, req.params.statementId);
    if (!statement) {
      const error = new Error("No statement found");
      error.statusCode = 404;
      throw error;
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      statement: statement._id
    })
      .sort({ date: -1 })
      .lean();

    const dashboard = buildDashboardData(transactions);
    res.json({
      statement,
      dashboard: {
        ...dashboard,
        recurringPayments: recurringSummaryFromTransactions(transactions),
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

