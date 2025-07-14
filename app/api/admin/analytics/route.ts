import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("inventora")

    // Get basic analytics data
    const totalUsers = await db.collection("users").countDocuments({ role: "user" })
    const totalProducts = await db.collection("products").countDocuments()
    const totalOrders = await db.collection("orders").countDocuments()

    const orders = await db.collection("orders").find({}).toArray()
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const ecoFriendlyOrders = orders.filter((order) => order.isEcoFriendlyDelivery).length

    // Monthly sales data for charts (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlySales = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$total" },
            count: { $sum: 1 },
            ecoOrders: {
              $sum: { $cond: ["$isEcoFriendlyDelivery", 1, 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray()

    // Category-wise sales with detailed metrics
    const categorySales = await db
      .collection("orders")
      .aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            count: { $sum: "$items.quantity" },
            orders: { $addToSet: "$_id" },
          },
        },
        {
          $addFields: {
            orderCount: { $size: "$orders" },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray()

    // Top selling products
    const topProducts = await db
      .collection("orders")
      .aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            orders: { $addToSet: "$_id" },
          },
        },
        {
          $addFields: {
            orderCount: { $size: "$orders" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // User engagement metrics
    const userMetrics = await db
      .collection("users")
      .aggregate([
        { $match: { role: "user" } },
        {
          $group: {
            _id: null,
            totalEcoOrders: { $sum: "$ecoFriendlyOrders" },
            usersWithCoupons: {
              $sum: {
                $cond: [{ $gt: [{ $size: { $ifNull: ["$giftCoupons", []] } }, 0] }, 1, 0],
              },
            },
            totalCouponsIssued: {
              $sum: { $size: { $ifNull: ["$giftCoupons", []] } },
            },
            avgEcoOrdersPerUser: { $avg: "$ecoFriendlyOrders" },
          },
        },
      ])
      .toArray()

    // Recent orders for activity feed
    const recentOrders = await db.collection("orders").find({}).sort({ createdAt: -1 }).limit(10).toArray()

    // Order status distribution
    const orderStatusDistribution = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: "$total" },
          },
        },
      ])
      .toArray()

    // Daily sales for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailySales = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray()

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        ecoFriendlyOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
      },
      monthlySales,
      categorySales,
      topProducts,
      userMetrics: userMetrics[0] || {
        totalEcoOrders: 0,
        usersWithCoupons: 0,
        totalCouponsIssued: 0,
        avgEcoOrdersPerUser: 0,
      },
      recentOrders,
      orderStatusDistribution,
      dailySales,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
