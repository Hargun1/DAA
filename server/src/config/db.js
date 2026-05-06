import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

