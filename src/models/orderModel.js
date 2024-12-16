import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sku: { type: String, required: true },
});

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  // addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentType: { type: String, required: true },
    orderType: { type: String, required: true },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Shipped",
        "On the Way",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refunded",
      ],
      default: "Pending",
    },
    returnReason: { type: String },
    returnStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processed", "Rejected"],
    },
    cancellationReason: { type: String },
    items: [orderItemsSchema],
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
