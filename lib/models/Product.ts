export interface Product {
  _id?: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  isEcoFriendly: boolean
  createdAt: Date
  updatedAt: Date
}
