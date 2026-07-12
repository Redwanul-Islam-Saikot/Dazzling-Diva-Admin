import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSlider extends Document {
  tagline: string;
  title: string;
  badgeText: string;
  imageUrl: string;
  status: "active" | "inactive";
}

const HeroSliderSchema: Schema = new Schema(
  {
    tagline: { type: String, default: "" },
    title: { type: String, required: true },
    badgeText: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.HeroSlider ||
  mongoose.model<IHeroSlider>("HeroSlider", HeroSliderSchema);