import Statement from "../models/Statement.js";
import Transaction from "../models/Transaction.js";
import { buildComparisonMetrics } from "../services/analysisService.js";

export const getComparisonMetrics = async (req, res, next) => {
  try {
    const statement = await Statement.findOne({
      _id: req.params.statementId,
      user: req.user._id
    }).lean();

    if (!statement) {
      const error = new Error("Statement not found");
      error.statusCode = 404;
      throw error;
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      statement: statement._id
    }).lean();

    const metrics = buildComparisonMetrics(transactions);
    res.json({
      statement: {
        id: statement._id,
        originalFileName: statement.originalFileName,
        totalTransactions: statement.totalTransactions
      },
      ...metrics
    });
  } catch (error) {
    next(error);
  }
};

