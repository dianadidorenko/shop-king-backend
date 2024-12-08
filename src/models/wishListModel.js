import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema(
  {
    product: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const WishList = mongoose.model("WishList", wishListSchema);
