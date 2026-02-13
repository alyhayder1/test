import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  if (!env.mongoUri) throw new Error("MONGO_URI missing");
  await mongoose.connect(env.mongoUri);
  console.log("✅ Mongo connected");
}
