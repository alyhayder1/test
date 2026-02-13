import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    name: String,
    age: Number,
    city: String,
    bio: String,
    photoUrl: String,
    audioUrl: String,
  },
  { timestamps: true }
);

export const Page = mongoose.model("Page", PageSchema);