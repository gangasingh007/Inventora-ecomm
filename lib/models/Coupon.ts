export interface Coupon {
  _id?: string
  code: string
  type: "percentage" | "fixed" | "gift"
  value: number
  isActive: boolean
  expiresAt: Date
  usageLimit: number
  usedCount: number
  createdAt: Date
}
