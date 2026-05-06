import mongoose from "mongoose";

const statementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    totalTransactions: {
      type: Number,
      required: true
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Statement = mongoose.model("Statement", statementSchema);
export default Statement;

