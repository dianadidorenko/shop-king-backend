import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";

const generateOrderId = () => {
  return "#" + Math.floor(Math.random() * 100000000).toString();
};

export default async function orderRoutes(fastify, options) {
  // Create a product
  fastify.post("/api/orders", async (req, reply) => {
    try {
      const orderData = req.body;

      const newOrder = new Order({
        orderId: generateOrderId,
        paymentType: orderData?.paymentType,
        orderType: orderData?.orderType,
        items: orderData?.items,
        shippingAddress: orderData?.shippingAddress,
        billingAddress: orderData?.billingAddress,
        total: orderData?.total,
        shippingCharge: orderData?.shippingCharge,
        discount: orderData?.discount,
        orderStatus: "Pending",
        tax: orderData?.tax,
        subtotal: orderData?.subtotal,
        userId: req.user.id,
      });
      await newOrder.save(); 
      reply.code(201).send({
        status: true,
        msg: "Order Created Successfully",
        data: newOrder,
      });
    } catch (error) {
      reply.code(500).send({ status: false, msg: "Something went wrong" });
    }
  });
}
