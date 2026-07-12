import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number }, // ডিসকাউন্ট দেখানোর জন্য
    category: { type: String, required: true }, // ক্যাটাগরি বাইন্ডিং-এর জন্য
    stock: { type: Number, required: true, default: 10 },
    imageUrl: { type: String, required: true },
    isFeatured: { type: Boolean, default: false }, // স্পেশাল সেকশনে দেখানোর জন্য
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;