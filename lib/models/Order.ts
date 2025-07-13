export interface Order {
  _id?: string
  userId: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    image: string
  }[]
  total: number
  discountApplied: number
  isEcoFriendlyDelivery: boolean
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}
