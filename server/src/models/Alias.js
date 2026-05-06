import mongoose from "mongoose";

const aliasSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    alias: {
      type: String,
      required: true,
      trim: true
    },
    normalizedAlias: {
      type: String,
      required: true
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      default: null
    },
    merchantName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Uncategorized"
    },
    createdByAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

aliasSchema.pre("validate", function normalize(next) {
  this.normalizedAlias = this.alias.toUpperCase().replace(/[^A-Z0-9]/g, "");
  this.merchantName = this.merchantName.trim();
  next();
});

aliasSchema.index({ user: 1, normalizedAlias: 1 }, { unique: true });

const Alias = mongoose.model("Alias", aliasSchema);
export default Alias;

