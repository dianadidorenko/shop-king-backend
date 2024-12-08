import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import { startDb } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

fastify.register(fastifyJwt, { secret: "supersecret" });

fastify.register(productRoutes);
fastify.register(orderRoutes);
fastify.register(uploadRoutes);
fastify.register(categoryRoutes);
fastify.register(brandRoutes);
fastify.register(wishlistRoutes);
fastify.register(cartRoutes);

fastify.decorate("authenticate", async function (req, reply) {
  try {
    await req.jwtVerify();
    console.log("Authenticating user...");
    const user = req.user; // Проверьте, откуда берется user
    console.log("User authenticated:", user);
  } catch (error) {
    console.error("Authentication failed:", error);
    reply.code(500).send({ status: false, msg: "Something went wrong" });
  }
});

fastify.register(authRoutes);

const start = async () => {
  await startDb();
  try {
    await fastify.listen({ port: 4000 });
    console.log("Server is running on http://localhost:4000");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();

// fastify.get("/", (req, reply) => {
//   reply.send({ msg: "Hello From Server" });
// });
