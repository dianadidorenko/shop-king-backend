import { User } from "../models/userModel.js";
import crypto from "crypto";

export default async function authRoutes(fastify, options) {
  // User Registration
  fastify.post("/api/register", async (req, reply) => {
    const { name, email, mobile, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists)
      return reply
        .status(400)
        .send({ status: false, msg: "User already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
    });
    await newUser.save();

    reply.status(201).send({
      status: true,
      msg: "User Registered Successfully!",
    });
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
  fastify.get("/api/users/:id", async (req, reply) => {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user)
      return reply.status(400).send({ status: false, msg: "User Not Found" });
    reply.status(200).send({ status: true, msg: "User Found", user: user });
  });

  // Delete A User
  fastify.delete("/api/users/:id", async (req, reply) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
      return reply.status(400).send({ status: false, msg: "User Not Found" });
    reply.status(200).send({ status: true, msg: "User Deleted Successfully" });
  });
}
