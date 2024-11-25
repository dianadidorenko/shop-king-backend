import mongoose from "mongoose";

const variationsSchema = new mongoose.Schema({
  color: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  sku: { type: String, required: true },
  quantityAvailable: { type: Number, required: true },
});

const offerSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  discountPercentage: { type: Number, required: true },
  flashSale: { type: Boolean, required: true },
});

const seoSchema = new mongoose.Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: [String] },
  metaImage: { type: String },
});

const shippingReturnSchema = new mongoose.Schema({
  shippingType: { type: String, enum: ["Free", "Flat Rate"], default: "Free" },
  shippingCost: { type: String },
  isProductQuantityMultiply: { type: Boolean, required: true },
  shippingAndReturnPolicy: { type: String },
});

const videosSchema = new mongoose.Schema({
  videoProvider: { type: String, required: true },
  videoLink: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    barcode: { type: String },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    brand: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], required: true },
    canPurchaseAble: { type: Boolean, required: true },
    showStockOut: { type: Boolean, required: true },
    refundable: { type: Boolean, required: true },
    maximumPurchaseQuantity: { type: Number, required: true },
    lowStockWarning: { type: Number, required: true },
    unit: { type: String },
    weight: { type: Number },
    tags: { type: String },
    description: { type: String },
    images: { type: [String] },
    videos: [videosSchema],
    offer: offerSchema,
    variations: [variationsSchema],
    seo: seoSchema,
    shippingReturn: shippingReturnSchema,
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);