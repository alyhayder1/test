import mongoose from "mongoose";

const RightSwipeSchema = new mongoose.Schema(
  {
    slug: { type: String, index: true },
    ip: String,        // store anonymized IP recommended
    ipHash: String,    // optional: stable-ish unique visitor hash
    userAgent: String,
    acceptLanguage: String,
    referrer: String,
    device: {
      isMobile: Boolean,
      isTablet: Boolean,
      isDesktop: Boolean,
    },
    geo: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lon: Number,
    },
  },
  { timestamps: true }
);

// Force exact collection name:
export const RightSwipe = mongoose.model("RightSwipe", RightSwipeSchema, "right-swipes");
