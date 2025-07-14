import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Order } from "@/lib/models/Order"
import type { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { items, total, discountApplied, isEcoFriendlyDelivery, shippingAddress, paymentMethod } =
      await request.json()

    const client = await clientPromise
    const db = client.db("inventora")
    const orders = db.collection<Order>("orders")
    const users = db.collection<User>("users")

    const newOrder: Omit<Order, "_id"> = {
      userId: decoded.userId,
      items,
      total,
      discountApplied: discountApplied || 0,
      isEcoFriendlyDelivery: Boolean(isEcoFriendlyDelivery),
      status: "pending",
      shippingAddress,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await orders.insertOne(newOrder)

    // Update user's eco-friendly order count and check for gift coupons
    if (isEcoFriendlyDelivery) {
      const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
      if (user) {
        const newEcoCount = (user.ecoFriendlyOrders || 0) + 1
        const updateData: any = {
          ecoFriendlyOrders: newEcoCount,
          updatedAt: new Date(),
        }

        // Award gift coupon every 5 eco-friendly orders
        if (newEcoCount % 5 === 0) {
          const giftCouponCode = `ECO-GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          const existingCoupons = user.giftCoupons || []
          updateData.giftCoupons = [...existingCoupons, giftCouponCode]

          // You could also create a coupon record in a separate collection
          await db.collection("coupons").insertOne({
            code: giftCouponCode,
            userId: decoded.userId,
            type: "eco_reward",
            discountType: "percentage",
            discountValue: 15, // 15% discount
            isUsed: false,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            createdAt: new Date(),
            description: `Eco-Friendly Reward - ${newEcoCount} orders completed!`,
          })
        }

        await users.updateOne({ _id: new ObjectId(decoded.userId) }, { $set: updateData })
      }
    }

    // Clear cart after successful order
    await db.collection("carts").deleteOne({ userId: decoded.userId })

    // Return success with coupon info if applicable
    const response: any = {
      message: "Order placed successfully",
      orderId: result.insertedId,
    }

    if (isEcoFriendlyDelivery) {
      const updatedUser = await users.findOne({ _id: new ObjectId(decoded.userId) })
      if (updatedUser && updatedUser.ecoFriendlyOrders % 5 === 0) {
        response.giftCouponAwarded = true
        response.newCouponCode = updatedUser.giftCoupons[updatedUser.giftCoupons.length - 1]
        response.ecoOrderCount = updatedUser.ecoFriendlyOrders
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("inventora")
    const orders = db.collection<Order>("orders")

    let query = {}
    if (decoded.role === "user") {
      query = { userId: decoded.userId }
    }

    const allOrders = await orders.find(query).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(allOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
