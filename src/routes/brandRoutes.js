import { Brand } from "../models/brandModel.js";

export default async function brandRoutes(fastify, options) {
  // Получить все бренды
  fastify.get("/api/brands", async (request, reply) => {
    try {
      const brands = await Brand.find();
      reply.send({ status: true, data: brands });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось получить бренды." });
    }
  });

  // Получить бренд по ID
  fastify.get("/api/brands/:id", async (request, reply) => {
    try {
      const brand = await Brand.findById(request.params.id);

      if (!brand) {
        return reply.code(404).send({ error: "Бренд не найден." });
      }
      reply.send({ status: true, data: brand });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось получить бренд." });
    }
  });

  // Добавить новый бренд
  fastify.post("/api/brands", async (request, reply) => {
    const { name, description, image, status } = request.body;

    try {
      const newBrand = new Brand({ name, description, image, status });
      const result = await newBrand.save();
      reply.status(201).send({
        status: true,
        message: "Бренд добавлен успешно.",
        result,
      });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось добавить бренд." });
    }
  });

  // Обновить бренд
  fastify.put("/api/brands/:id", async (request, reply) => {
    try {
      const updatedBrand = await Brand.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
      );

      if (!updatedBrand) {
        return reply
          .status(404)
          .send({ status: false, error: "Бренд не найден." });
      }

      reply.send({
        status: true,
        message: "Бренд обновлён успешно.",
        data: updatedBrand,
      });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось обновить бренд." });
    }
  });

  // Удалить бренд
  fastify.delete("/api/brands/:id", async (request, reply) => {
    try {
      const deletedBrand = await Brand.findByIdAndDelete(request.params.id);

      if (!deletedBrand) {
        return reply
          .status(404)
          .send({ status: false, error: "Бренд не найден." });
      }

      reply.send({ status: true, message: "Бренд удалён успешно." });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось удалить бренд." });
    }
  });
}
