import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Merchant from "../models/Merchant.js";
import Alias from "../models/Alias.js";
import { commonMerchants } from "./commonMerchants.js";

dotenv.config();

const run = async () => {
  await connectDB(process.env.MONGODB_URI);

  await Merchant.deleteMany({});
  await Alias.deleteMany({ user: null });

  const merchants = await Merchant.insertMany(commonMerchants);
  const globalAliases = merchants.flatMap((merchant) =>
    merchant.aliases.map((alias) => ({
      user: null,
      alias,
      merchant: merchant._id,
      merchantName: merchant.name,
      category: merchant.category,
      createdByAdmin: true
    }))
  );

  await Alias.insertMany(globalAliases);
  console.log(
    `Seeded ${merchants.length} merchants and ${globalAliases.length} global aliases`
  );
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});

