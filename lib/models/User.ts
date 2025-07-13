export interface User {
  _id?: string
  email: string
  password: string
  name: string
  role: "user" | "admin"
  ecoFriendlyOrders: number
  giftCoupons: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
  name: string
  image: string
}

export interface Cart {
  _id?: string
  userId: string
  items: CartItem[]
  total: number
  updatedAt: Date
}
