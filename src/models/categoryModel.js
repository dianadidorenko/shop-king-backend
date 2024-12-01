import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category: { type: String },
    subcategory: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
