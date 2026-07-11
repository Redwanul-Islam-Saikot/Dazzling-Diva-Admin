import mongoose, { Schema, model, models } from "mongoose";

const HeroSliderSchema = new Schema(
  {
    tagline: { type: String },
    title: { type: String, required: true },
    badgeText: { type: String },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" }, // স্ট্যাটাস ফিল্ড
  },
  { timestamps: true }
);

const HeroSlider = models.HeroSlider || model("HeroSlider", HeroSliderSchema);

export default HeroSlider;