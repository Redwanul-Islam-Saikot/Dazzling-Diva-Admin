import mongoose from "mongoose";

const FlashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  endTime: { type: Date, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

const FlashSale = mongoose.models.FlashSale || mongoose.model("FlashSale", FlashSaleSchema);
export default FlashSale;