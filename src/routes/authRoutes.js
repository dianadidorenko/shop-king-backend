import { User } from "../models/userModel.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export default async function authRoutes(fastify, options) {
  // User Registration
  fastify.post("/api/register", async (req, reply) => {
    const { name, email, phone, password } = req.body;

    try {
      if (!name || !email || !phone || !password) {
        return reply
          .status(400)
          .send({ status: false, msg: "All fields are required!" });
      }

      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return reply
          .status(400)
          .send({ status: false, msg: "User already exists!" });
      }

      const newUser = new User({
        name,
        email: email.toLowerCase(),
        phone,
        password,
      });
      await newUser.save();

      reply
        .status(201)
        .send({ status: true, msg: "User Registered Successfully!" });
    } catch (error) {
      console.error("Registration error:", error);
      reply.status(500).send({ status: false, msg: "Internal Server Error" });
    }
  });

  // User Login
  fastify.post("/api/login", async (req, reply) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return reply
        .status(400)
        .send({ status: false, msg: "Invalid Email or Password" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return reply.status(400).send({ status: false, msg: "Invalid Password" });

    const token = fastify.jwt.sign({ userId: user._id, role: user?.role });
    reply.send({
      status: true,
      msg: "Login Successsfull",
      token,
      role: user.role,
    });
  });

  // Forgot Password
  fastify.post("/api/forgot-password", async (req, reply) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return reply.status(400).send({ status: false, msg: "Invalid Email" });
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave });
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    reply.status(200).send({
      status: true,
      msg: `Password Reset Token Sent. Please visit ${resetUrl}`,
    });
  });

  // Change Password
  fastify.put(
    "/api/user/change-password",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.userId;

      try {
        const user = await User.findById(userId);

        if (!user)
          return reply
            .status(400)
            .send({ status: false, msg: "User not found" });

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
          return reply
            .code(400)
            .send({ status: false, msg: "Old password is incorrect" });
        }

        if (newPassword !== confirmPassword) {
          return reply.code(400).send({
            status: false,
            msg: "New password and confirm password is incorrect",
          });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        reply.status(200).send({
          status: true,
          msg: "Password changed successfully",
        });
      } catch (error) {
        console.error(error);
        reply.code(500).send({ status: false, msg: "Something went wrong" });
      }
    }
  );

  // Reset Password
  fastify.post("/api/reset-password/:token", async (req, reply) => {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return reply
        .status(400)
        .send({ status: false, msg: "Token is invalid or expired" });
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave });
    reply
      .status(200)
      .send({ status: true, msg: "Password Reset Successsfull" });
  });

  // Get All Users (Admin only: need to make middleware)
  fastify.get("/api/users", async (req, reply) => {
    const users = await User.find().select("-password");
    reply.send({ status: true, msg: "Users Found", users: users });
  });

  // Get A User By ID
  fastify.get(
    "/api/user",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const id = req.user?.userId;
      const user = await User.findById(id).select("-password");
      if (!user)
        return reply.status(400).send({ status: false, msg: "User Not Found" });
      reply.status(200).send({ status: true, msg: "User Found", user: user });
    }
  );

  // Update A User By ID
  fastify.put(
    "/api/users",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const id = req.user?.userId;
      const user = await User.findByIdAndUpdate(id, req.body, { new: true });
      if (!user)
        return reply.status(400).send({ status: false, msg: "User Not Found" });
      reply.status(200).send({ status: true, msg: "User Found", user: user });
    }
  );

  // Delete A User
  fastify.delete("/api/users/:id", async (req, reply) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
      return reply.status(400).send({ status: false, msg: "User Not Found" });
    reply.status(200).send({ status: true, msg: "User Deleted Successfully" });
  });
}
