import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",
  visitorSalt: process.env.VISITOR_SALT || "dev-salt",
};