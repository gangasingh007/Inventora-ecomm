import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Cart } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"

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
    const carts = db.collection<Cart>("carts")

    const cart = await carts.findOne({ userId: decoded.userId })
    return NextResponse.json(cart || { items: [], total: 0 })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { productId, quantity, price, name, image } = await request.json()

    const client = await clientPromise
    const db = client.db("inventora")
    const carts = db.collection<Cart>("carts")

    const existingCart = await carts.findOne({ userId: decoded.userId })

    if (existingCart) {
      const existingItemIndex = existingCart.items.findIndex((item) => item.productId === productId)

      if (existingItemIndex > -1) {
        existingCart.items[existingItemIndex].quantity += quantity
      } else {
        existingCart.items.push({ productId, quantity, price, name, image })
      }

      const total = existingCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      await carts.updateOne(
        { userId: decoded.userId },
        {
          $set: {
            items: existingCart.items,
            total,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      const newCart: Omit<Cart, "_id"> = {
        userId: decoded.userId,
        items: [{ productId, quantity, price, name, image }],
        total: price * quantity,
        updatedAt: new Date(),
      }

      await carts.insertOne(newCart)
    }

    return NextResponse.json({ message: "Item added to cart successfully" })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
