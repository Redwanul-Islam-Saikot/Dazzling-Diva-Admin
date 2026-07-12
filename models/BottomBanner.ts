import mongoose from "mongoose";

const BottomBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  linkUrl: { type: String, required: true }, // ব্যানারে ক্লিক করলে যেখানে রিডাইরেক্ট হবে
  imageUrl: { type: String, required: true },
}, { timestamps: true });

// যেহেতু বটমে একটাই মাত্র ওয়াইড ব্যানার থাকবে, তাই আমরা সিঙ্গেল অবজেক্ট হিসেবেই হ্যান্ডেল করব
const BottomBanner = mongoose.models.BottomBanner || mongoose.model("BottomBanner", BottomBannerSchema);
export default BottomBanner;