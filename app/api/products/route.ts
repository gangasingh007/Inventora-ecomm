import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/Product"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("inventora")
    const products = db.collection<Product>("products")

    const allProducts = await products.find({}).toArray()
    return NextResponse.json(allProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { name, description, price, image, category, stock, isEcoFriendly } = await request.json()

    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("inventora")
    const products = db.collection<Product>("products")

    const newProduct: Omit<Product, "_id"> = {
      name,
      description,
      price: Number.parseFloat(price),
      image: image || "/placeholder.svg?height=300&width=300",
      category,
      stock: Number.parseInt(stock),
      isEcoFriendly: Boolean(isEcoFriendly),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await products.insertOne(newProduct)
    return NextResponse.json({ message: "Product created successfully", id: result.insertedId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
