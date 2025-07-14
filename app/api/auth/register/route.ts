import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = "user" } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("inventora")
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const newUser: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      name,
      role: role as "user" | "admin",
      ecoFriendlyOrders: 0,
      giftCoupons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(newUser)
    const token = generateToken(result.insertedId.toString(), role)

    return NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: result.insertedId,
        email,
        name,
        role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
