import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

export default async function cartRoutes(fastify, options) {
  fastify.post(
    "/api/cart",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { productId, variationId, quantity } = request.body;
        const userId = request.user?.userId;

        const product = await Product.findById(productId);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, msg: "Product not found" });
        }

        const variation = product.variations.id(variationId);
        if (!variation) {
          return reply
            .code(404)
            .send({ status: false, msg: "Variation not found" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
          cart = new Cart({
            userId,
            items: [{ productId, variationId, quantity }],
          });
        } else {
          const existingItem = cart.items.find(
            (item) =>
              item.productId.toString() === productId &&
              item.variationId.toString() === variationId
          );
          if (existingItem) {
            existingItem.quantity = quantity;
          } else {
            cart.items.push({ productId, variationId, quantity });
          }
        }

        await cart.save();
        reply.send({ status: true, data: cart });
      } catch (err) {
        reply.code(500).send({ status: false, error: "Failed to create cart" });
      }
    }
  );

  fastify.get(
    "/api/cart",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user?.userId;

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        console.log(cart);

        if (!cart) {
          return reply
            .code(404)
            .send({ status: false, message: "Cart not found" });
        }
        reply.send({ status: true, data: cart });
      } catch (err) {
        reply.code(500).send({ status: false, error: "Failed to fetch cart" });
      }
    }
  );

  fastify.put(
    "/api/cart",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user?.userId;
        const { productId, variationId, quantity } = request.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
          return reply
            .code(404)
            .send({ status: false, message: "Cart not found" });
        }

        const item = cart.items.find(
          (item) =>
            item.productId.toString() === productId &&
            item.variationId.toString() === variationId
        );
        if (!item) {
          return reply
            .code(404)
            .send({ status: false, message: "Item not found in cart" });
        }

        item.quantity = quantity;
        await cart.save();
        reply.send({ status: true, data: cart });
      } catch (err) {
        reply
          .code(500)
          .send({ status: false, message: "Failed to update cart" });
      }
    }
  );

  fastify.delete(
    "/api/cart/:userId/:productId/:variationId",
    async (request, reply) => {
      try {
        const userId = request.user?.userId;
        const { productId, variationId } = request.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
          return reply
            .code(404)
            .send({ status: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(
          (item) =>
            item.productId.toString() !== productId ||
            item.variationId.toString() !== variationId
        );

        await cart.save();
        reply.send({ status: true, data: cart });
      } catch (err) {
        reply
          .code(500)
          .send({ status: false, msg: "Failed to delete cart item" });
      }
    }
  );

  fastify.delete("/api/cart/:userId", async (request, reply) => {
    const { userId } = request.body;

    try {
      const cart = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { new: true }
      );

      if (!cart) {
        return reply
          .code(404)
          .send({ status: false, message: "Cart not found" });
      }

      reply.send({
        status: true,
        message: "Cart cleared successfully",
        data: cart,
      });
    } catch (err) {
      reply.code(500).send(err.message);
    }
  });
}