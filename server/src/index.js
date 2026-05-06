import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`PayTrace API running on http://localhost:${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server:", error.message);
  process.exit(1);
});

