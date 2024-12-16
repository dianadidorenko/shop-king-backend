import { Order } from "../models/orderModel.js";

const generateOrderId = () => {
  return "#" + Math.floor(Math.random() * 100000000).toString();
};

export default async function orderRoutes(fastify, options) {
  fastify.post(
    "/api/orders",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const orderData = req.body;

        const newOrder = new Order({
          orderId: generateOrderId(),
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
          userId: req.user.userId,
        });

        await newOrder.save();

        reply.code(201).send({
          status: true,
          msg: "Order Created Successfully",
          data: newOrder,
        });
      } catch (error) {
        reply.code(500).send({
          status: false,
          msg: "Something went wrong",
          error: error.message,
        });
      }
    }
  );

  fastify.get("/api/orders", async (req, reply) => {
    try {
      const data = await Order.find().populate("userId");

      reply.code(200).send({
        status: true,
        data: data,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
      });
    }
  });

  fastify.get("/api/orders/:id", async (req, reply) => {
    try {
      const { id } = req?.params;
      const data = await Order.findById(id);

      reply.code(200).send({
        status: true,
        data: data,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
      });
    }
  });

  fastify.put("/api/orders/:id", async (req, reply) => {
    try {
      const { id } = req?.params;
      const data = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: req.body?.orderStatus,
        },
        { new: true }
      );

      reply.code(200).send({
        status: true,
        data: data,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });
}
