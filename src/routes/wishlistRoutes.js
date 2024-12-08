import { Product } from "../models/productModel.js";
import { WishList } from "../models/wishListModel.js";

export default async function wishlistRoutes(fastify, options) {
  // Добавить элемент в список желаний
  fastify.post(
    "/api/wishlist",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { product } = request.body;
        const user = request.user?.userId;

        const data = await Product.findById(product);
        if (!data) {
          return reply.status(404).send({
            status: false,
            msg: "Product not found",
          });
        }

        let wishlist = await WishList.findOne({ user });
        if (!wishlist) {
          wishlist = new WishList({ user, product: [product] });
        } else {
          if (!wishlist.product.includes(product)) {
            wishlist.product.push(product);
          }
        }

        await wishlist.save();
        reply.status(201).send({
          status: true,
          data: wishlist,
        });
      } catch (error) {
        reply.status(500).send({
          status: false,
          msg: "Failed to add product to wishlist",
        });
      }
    }
  );

  // Получить список желаний пользователя
  fastify.get(
    "/api/wishlist",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const user = request.user?.userId;

        const wishlist = await WishList.findOne({ user }).populate("product");
        if (!wishlist) {
          return reply
            .status(404)
            .send({ status: false, message: "Wishlist not found" });
        }

        reply.status(200).send({ status: true, data: wishlist });
      } catch (error) {
        reply
          .status(500)
          .send({ status: false, message: "Error fetching wishlist", error });
      }
    }
  );

  // Удалить элемент из списка желаний
  fastify.delete(
    "/api/wishlist/:productId",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { productId } = request.params;
      const user = request.user?.userId;

      try {
        const wishlist = await WishList.findOne({ user });
        if (!wishlist) {
          return reply
            .status(404)
            .send({ status: false, message: "Wishlist not found" });
        }

        wishlist.product = wishlist.product.filter(
          (item) => item.toString() !== productId
        );

        await wishlist.save();
        reply.status(200).send({
          status: true,
          message: "Product removed from wishlist",
        });
      } catch (error) {
        reply
          .status(500)
          .send({ status: false, message: "Error removing item", error });
      }
    }
  );

  // Удалить все элементы из списка желаний
  fastify.delete(
    "/api/wishlist",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user?.userId;

      try {
        const wishlist = await WishList.findOneAndUpdate(
          { user },
          { $set: { product: [] } },
          { new: true }
        );

        if (!wishlist) {
          return reply
            .status(404)
            .send({ status: false, message: "Wishlist not found" });
        }

        reply.status(200).send({
          status: true,
          message: "Wishlist cleared",
        });
      } catch (error) {
        reply
          .status(500)
          .send({ status: false, message: "Error to clear wishlist", error });
      }
    }
  );
}
