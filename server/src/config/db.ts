import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  if (!env.mongoUri) throw new Error("MONGO_URI missing");
  await mongoose.connect(env.mongoUri);
  console.log("MONGO_URI:", env.mongoUri);
  console.log("MONGO_URI:", env.mongoUri);
  console.log("Mongo connected:", mongoose.connection.host, mongoose.connection.port, mongoose.connection.name);
  console.log("✅ Mongo connected");
}
