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

    // Get analytics data
    const totalUsers = await db.collection("users").countDocuments({ role: "user" })
    const totalProducts = await db.collection("products").countDocuments()
    const totalOrders = await db.collection("orders").countDocuments()

    const orders = await db.collection("orders").find({}).toArray()
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const ecoFriendlyOrders = orders.filter((order) => order.isEcoFriendlyDelivery).length

    // Monthly sales data for charts
    const monthlySales = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray()

    // Category-wise sales
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
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        ecoFriendlyOrders,
      },
      monthlySales,
      categorySales,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
