import mongoose from "mongoose";

const SplitBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  linkUrl: { type: String, required: true }, // ব্যানারে ক্লিক করলে কোন পেজে যাবে (যেমন: /shop/summer)
  imageUrl: { type: String, required: true },
  position: { type: Number, required: true, unique: true }, // ব্যানারটি ১ নম্বর নাকি ২ নম্বরে বসবে
}, { timestamps: true });

const SplitBanner = mongoose.models.SplitBanner || mongoose.model("SplitBanner", SplitBannerSchema);
export default SplitBanner;