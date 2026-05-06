import Alias from "../models/Alias.js";
import Merchant from "../models/Merchant.js";

export const listAliases = async (req, res, next) => {
  try {
    const aliases = await Alias.find({
      $or: [{ user: req.user._id }, { user: null }]
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ aliases });
  } catch (error) {
    next(error);
  }
};

export const createAlias = async (req, res, next) => {
  try {
    const { alias, merchantName, category } = req.body;
    if (!alias || !merchantName) {
      const error = new Error("Alias and merchantName are required");
      error.statusCode = 400;
      throw error;
    }

    const merchant = await Merchant.findOne({ name: merchantName });
    const created = await Alias.create({
      user: req.user._id,
      alias,
      merchantName,
      category: category || merchant?.category || "Uncategorized",
      merchant: merchant?._id || null
    });

    res.status(201).json({ alias: created });
  } catch (error) {
    if (error.code === 11000) {
      error.message = "Alias already exists for this user";
      error.statusCode = 409;
    }
    next(error);
  }
};

