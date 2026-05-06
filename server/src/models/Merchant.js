import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      default: "Uncategorized"
    },
    aliases: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

merchantSchema.pre("validate", function normalize(next) {
  if (this.name) {
    this.normalizedName = this.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
  this.aliases = (this.aliases || []).map((alias) => alias.toUpperCase().trim());
  next();
});

const Merchant = mongoose.model("Merchant", merchantSchema);
export default Merchant;

