import Merchant from "../models/Merchant.js";

export const listMerchants = async (_req, res, next) => {
  try {
    const merchants = await Merchant.find({ isActive: true })
      .select("name category aliases")
      .sort({ name: 1 })
      .lean();
    res.json({ merchants });
  } catch (error) {
    next(error);
  }
};

