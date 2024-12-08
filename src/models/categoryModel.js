import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category: { type: String },
    subcategory: { type: String },
    image: { type: String, required: true },
    status: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
