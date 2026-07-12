import mongoose, { Schema, Document } from "mongoose";

export interface IFooter extends Document {
  companyName: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  copyrightText: string;
}

const FooterSchema: Schema = new Schema(
  {
    companyName: { type: String, default: "" },
    aboutText: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    copyrightText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Footer || mongoose.model<IFooter>("Footer", FooterSchema);