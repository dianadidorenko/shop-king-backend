import cloudinary from "cloudinary";
import fastifyMultipart from "@fastify/multipart";

export default async function uploadRoutes(fastify, options) {
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  fastify.post("/api/upload", async function (req, reply) {
    try {
      const data = await req.file();
      
      if (!data) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const fileBuffer = await data.toBuffer();
      const fileType = data.mimetype.startsWith("image") ? "image" : "video";

      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream({ resource_type: fileType }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(fileBuffer);
      });

      reply.code(200).send({
        message: "File uploaded successfully",
        file_url: result.secure_url,
        result,
      });
    } catch (error) {
      reply
        .code(500)
        .send({ error: "Failed to upload file", details: error.message });
    }
  });
}
