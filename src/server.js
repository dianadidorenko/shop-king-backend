import Fastify from "fastify";
import { startDb } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import fastifyJwt from "@fastify/jwt";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cors from "@fastify/cors";

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Register fastify jwt
fastify.register(fastifyJwt, { secret: "supersecret" });
fastify.register(productRoutes);
fastify.register(orderRoutes);

// fastify.get("/", (req, reply) => {
//   reply.send({ msg: "Hello From Server" });
// });

fastify.decorate("authenticate", async function (req, reply) {
  try {
    await req.jwtVerify();
  } catch (error) {
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
