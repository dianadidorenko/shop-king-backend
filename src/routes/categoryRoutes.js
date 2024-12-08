import { Category } from "../models/categoryModel.js";

export default async function categoryRoutes(fastify, options) {
  // Получить все категории
  fastify.get("/api/category", async (request, reply) => {
    try {
      const categories = await Category.find();
      reply.send({ status: true, data: categories });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось получить категории." });
    }
  });

  // Получить категорию по ID
  fastify.get("/api/category/:id", async (request, reply) => {
    try {
      const category = await Category.findById(request.params.id);

      if (!category) {
        return reply.code(404).send({ error: "Catrgoty not found" });
      }
      reply.send({ status: true, data: category });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось получить категории." });
    }
  });

  // Добавить новую категорию
  fastify.post("/api/category", async (request, reply) => {
    const { category, subcategory, image, status } = request.body;

    try {
      const newCategory = new Category({
        category,
        subcategory,
        image,
        status,
      });
      const result = await newCategory.save();
      reply.status(201).send({
        status: true,
        message: "Категория добавлена успешно.",
        data: result,
      });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось добавить категорию." });
    }
  });

  // Обновить категорию
  fastify.put("/api/category/:id", async (request, reply) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        return reply
          .status(404)
          .send({ status: false, error: "Категория не найдена." });
      }

      reply.send({
        status: true,
        message: "Категория обновлена успешно.",
        data: updatedCategory,
      });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось обновить категорию." });
    }
  });

  // Удалить категорию
  fastify.delete("/api/category/:id", async (request, reply) => {
    try {
      const deletedCategory = await Category.findByIdAndDelete(
        request.params.id
      );

      if (!deletedCategory) {
        return reply
          .status(404)
          .send({ status: false, error: "Категория не найдена." });
      }

      reply.send({ status: true, message: "Категория удалена успешно." });
    } catch (error) {
      reply
        .status(500)
        .send({ status: false, error: "Не удалось удалить категорию." });
    }
  });
}
