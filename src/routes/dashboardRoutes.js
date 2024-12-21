import { User } from "../models/userModel.js";
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";

export default async function dashboardRoutes(fastify, options) {
  fastify.get("/api/dashboard/metrics", async (req, reply) => {
    try {
      const totalEarningResult = await Order.aggregate([
        { $match: { orderStatus: "Paid" } },
        { $group: { _id: null, totalEarning: { $sum: "$total" } } },
      ]);

      // Если массив пуст, значит, нет оплаченных заказов
      const totalEarning =
        totalEarningResult.length > 0 ? totalEarningResult[0].totalEarning : 0;

      const totalOrders = await Order.countDocuments();
      const totalCustomers = await User.countDocuments({ role: "customer" });
      const totalProducts = await Product.countDocuments();

      reply.code(200).send({
        status: true,
        data: {
          totalOrders,
          totalCustomers,
          totalEarning,
          totalProducts,
        },
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });

  fastify.get("/api/dashboard/order-stats", async (req, reply) => {
    try {
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]);

      reply.code(200).send({
        status: true,
        data: orderStats,
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });

  fastify.get("/api/dashboard/summary", async (req, reply) => {
    try {
      const { startDate, endDate } = req.query;
      const start = new Date(startDate || "2024-01-01");
      const end = new Date(endDate || new Date());

      // Sale Summary
      const salesResult = await Order.aggregate([
        {
          $match: {
            orderStatus: "Paid",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            avgSalesPerDay: { $avg: "$total" },
          },
        },
      ]);
      const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
      const avgSales =
        salesResult.length > 0 ? salesResult[0].avgSalesPerDay : 0;
      const totalOrders = await Order.countDocuments({
        createdAt: { $gte: start, $lte: end },
      });
      const orderStats = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]);
      const dailySales = await Order.aggregate([
        {
          $match: {
            orderStatus: "Paid",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            total: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const orderStatusSummary = {
        Delivered: 0,
        Cancelled: 0,
        Rejected: 0,
      };
      orderStats.forEach((stat) => {
        if (orderStatusSummary[stat._id] !== undefined) {
          orderStatusSummary[stat._id] = stat.count;
        }
      });
      const customerActivity = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const topCustomers = await Order.aggregate([
        {
          $group: {
            _id: "$userId",
            fullName: { $first: "$shippingAddress.fullName" },
            email: { $first: "$shippingAddress.email" },
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$total" },
          },
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 5 },
      ]);

      reply.code(200).send({
        status: true,
        data: {
          salesSummary: { totalSales, avgSales, dailySales },
          orderSummary: { totalOrders, orderStatusSummary },
          customerActivity,
          topCustomers,
        },
      });
    } catch (error) {
      reply.code(500).send({
        status: false,
        msg: "Something went wrong",
        error: error.message,
      });
    }
  });
}
