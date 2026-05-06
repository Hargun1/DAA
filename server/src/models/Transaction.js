import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    statement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Statement",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    normalizedDescription: {
      type: String,
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    resolvedMerchant: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "Uncategorized"
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    isUnknown: {
      type: Boolean,
      default: false
    },
    expectedMerchant: {
      type: String,
      default: null
    },
    algorithmBreakdown: {
      aliasHash: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      },
      trie: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      },
      kmp: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      },
      rabinKarp: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      },
      ahoCorasick: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      },
      levenshtein: {
        merchant: String,
        score: Number,
        matched: Boolean,
        timeMs: Number
      }
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;

