import mongoose, { Schema, Document } from "mongoose";

export interface INewArrival extends Document {
  name: string;
  price: string;
  image: string;
  order: number;
  status: "active" | "inactive";
}

const NewArrivalSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.NewArrival ||
  mongoose.model<INewArrival>("NewArrival", NewArrivalSchema);