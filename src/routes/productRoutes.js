import slugify from "slugify";
import { Product } from "../models/productModel.js";

export default async function productRoutes(fastify, options) {
  // Create a product
  fastify.post("/api/products", async (req, reply) => {
    try {
      if (req.body.name) {
        req.body.slug = slugify(req.body.name.toLowerCase());
      }
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

  // Fetch A Single Product By SLug
  fastify.get("/api/products/:slug/byslug", async (req, reply) => {
    try {
      const slug = req.params.slug;
      const product = await Product.findOne({ slug: slug }).populate("offer");
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
      if (req.body.name) {
        req.body.slug = slugify(req.body.name.toLowerCase());
      }
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

  // Add Videos
  fastify.post("/api/products/:id/videos", async (req, reply) => {
    const { id } = req.params;
    const videoData = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          $push: { videos: videoData.videos },
        },
        { new: true }
      );

      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      reply.send(product);
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error adding videos",
        error: error.message,
      });
    }
  });

  // Edit Videos
  fastify.put("/api/products/:id/videos/:videoId", async (req, reply) => {
    const { id, videoId } = req.params;
    const videoData = req.body;

    try {
      const product = await Product.findById(id);

      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      const video = product.videos.id(videoId);
      if (!video) {
        return reply.code(404).send({ status: false, msg: "Video not found" });
      }
      Object.assign(video, videoData);
      await product.save();
      reply.send(product);
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error adding videos",
        error: error.message,
      });
    }
  });

  // Get Videos
  fastify.get("/api/products/:id/videos", async (req, reply) => {
    const { id } = req.params;

    try {
      const product = await Product.findById(id).select("videos");
      if (!product) {
        return reply.code(404).send({ status: false, msg: "Videos not found" });
      }

      reply.send({
        status: true,
        data: product.videos,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        error: error.message,
      });
    }
  });

  // Delete Videos
  fastify.delete("/api/products/:id/videos/:videoId", async (req, reply) => {
    const { id, videoId } = req.params;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      const videoIndex = product.videos.findIndex(
        (video) => video._id.toString() === videoId
      );

      if (videoIndex === -1) {
        return reply
          .code(404)
          .send({ status: false, error: "Video Not Found" });
      }
      product.videos.splice(videoIndex, 1);
      await product.save();

      reply.send({ status: true, product });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error adding videos",
        error: error.message,
      });
    }
  });

  // Add Images
  fastify.post("/api/products/:id/images", async (req, reply) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          $push: { images: imageUrl },
        },
        { new: true }
      );

      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      reply.send({ status: true, msg: "Image Added Successfully", product });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error adding images",
        error: error.message,
      });
    }
  });

  // Get Images
  fastify.get("/api/products/:id/images", async (req, reply) => {
    const { id } = req.params;

    try {
      const product = await Product.findById(id).select("images");
      if (!product) {
        return reply.code(404).send({ status: false, msg: "Images not found" });
      }

      reply.send({
        status: true,
        data: product.images,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        error: error.message,
      });
    }
  });

  // Delete Images
  fastify.delete("/api/products/:id/images", async (req, reply) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      const imageIndex = product.images.indexOf(imageUrl);
      if (imageIndex === -1) {
        return reply
          .code(404)
          .send({ status: false, error: "Image Not Found" });
      }
      product.images.splice(imageIndex, 1);
      await product.save();

      reply.send({ status: true, msg: "Image Deleted Successfully" });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error deleting image",
        error: error.message,
      });
    }
  });

  // Add Variations
  fastify.post("/api/products/:id/variations", async (req, reply) => {
    const { id } = req.params;
    const variationData = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          $push: { variations: variationData },
        },
        { new: true }
      );

      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Product not found" });
      }

      reply.send({ status: true, msg: "Image Added Successfully", product });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Error adding images",
        error: error.message,
      });
    }
  });

  // Get Variations
  fastify.get("/api/products/:id/variations", async (req, reply) => {
    const { id } = req.params;

    try {
      const product = await Product.findById(id).select("variations");
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, msg: "Variations not found" });
      }

      reply.send({
        status: true,
        data: product.variations,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        error: error.message,
      });
    }
  });

  // Edit Variations
  fastify.put(
    "/api/products/:id/variations/:variationId",
    async (req, reply) => {
      const { id, variationId } = req.params;
      const variationData = req.body;

      try {
        const product = await Product.findById(id);

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
        Object.assign(variation, variationData);
        await product.save();
        reply.send(product);
      } catch (error) {
        reply.code(500).send({
          status: false,
          msg: "Error adding variations",
          error: error.message,
        });
      }
    }
  );

  // Delete Variations
  fastify.delete(
    "/api/products/:id/variations/:variationId",
    async (req, reply) => {
      const { id, variationId } = req.params;

      try {
        const product = await Product.findById(id);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, msg: "Product not found" });
        }

        const variationIndex = product.variations.findIndex(
          (variation) => variation._id.toString() === variationId
        );

        if (variationIndex === -1) {
          return reply
            .code(404)
            .send({ status: false, error: "Variation Not Found" });
        }
        product.variations.splice(variationId, 1);
        await product.save();

        reply.send({ status: true, product });
      } catch (error) {
        reply.code(500).send({
          status: false,
          msg: "Error adding variations",
          error: error.message,
        });
      }
    }
  );

  // Get Products With Flash Sales
  fastify.get("/api/products/flash-sales", async (request, reply) => {
    try {
      const flasSaleProducts = await Product.find({
        "offer.flashSale": true,
      });
      reply.send({ status: true, data: flasSaleProducts });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось получить флеш-распродажи." });
    }
  });
}
