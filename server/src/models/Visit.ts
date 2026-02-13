import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema(
  {
    slug: { type: String, index: true },
    path: String,
    ip: String,       // anonymized
    ipHash: String,   // stable-ish
    userAgent: String,
    acceptLanguage: String,
    referrer: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Visit = mongoose.model("Visit", VisitSchema);