import { Product } from "../models/productModel.js";

export default async function productRoutes(fastify, options) {
  // Create a product
  fastify.post("/api/products", async (req, reply) => {
    try {
      const product = new Product(req.body);
      await product.save();

      reply.code(201).send({
        status: true,
        msg: "Product Created Successfully",
        data: product,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });

  // Fetch All Products
  fastify.get("/api/products", async (req, reply) => {
    try {
      const products = await Product.find();
      reply.code(200).send({
        status: true,
        msg: "Products Fetched Successfully",
        data: products,
      });
    } catch (error) {
      reply.code(500).send({ status: false, msg: "Something went wrong" });
    }
  });

  // Fetch A Single Product By Id
  fastify.get("/api/products/:id", async (req, reply) => {
    try {
      const id = req.params.id;
      const product = await Product.findById(id).populate("offer");
      if (!product)
        return reply
          .code(400)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({ status: true, msg: "Product Found", data: product });
    } catch (error) {
      reply.code(500).send({ status: false, msg: "Something went wrong" });
    }
  });

  // Update A Single Product By Id
  fastify.put("/api/products/:id", async (req, reply) => {
    try {
      const id = req.params.id;
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!product)
        return reply
          .code(400)
          .send({ status: false, msg: "Product Not Found" });
      reply.code(200).send({
        status: true,
        msg: "Product Updated Successfully",
        data: product,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });

  // Delete A Single Product By Id
  fastify.delete("/api/products/:id", async (req, reply) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product)
        return reply
          .code(400)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({ status: true, msg: "Product Deleted Successfully" });
    } catch (error) {
      reply.code(500).send({ status: false, msg: "Something went wrong" });
    }
  });

  // Check Availablity For A Specific Variant (by color or size)
  fastify.get("/api/products/:id/availablity", async (req, reply) => {
    try {
      const id = req.params.id;
      const { color, size } = req.query;

      const product = await Product.findById(id).populate("variants");
      if (!product)
        return reply
          .code(400)
          .send({ status: false, msg: "Product Not Found" });
      const variations = product.variations.find(
        (item) => item.color === color && item.size === size
      );
      if (!variations)
        return reply
          .code(400)
          .send({ status: false, msg: "Variation Not Found" });
      reply.code(200).send({
        status: true,
        msg: "Product Available",
        sku: variations.sku,
        quantityAvailable: variations.quantityAvailable,
      });
    } catch (error) {
      reply.code(500).send({ status: false, msg: "Something went wrong" });
    }
  });

  // CHeck If Any Variations Has Low Stock (less than 5)
  // fastify.get("/api/products/:id/availablity", async (req, reply) => {});
}