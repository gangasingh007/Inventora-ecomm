"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Leaf, Search, UserIcon, LogOut, Gift } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  isEcoFriendly: boolean
}

interface AppUser {
  id: string
  name: string
  email: string
  role: string
  ecoFriendlyOrders: number
  giftCoupons: string[]
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [user, setUser] = useState<AppUser | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth")
      return
    }

    setUser(JSON.parse(userData))
    fetchProducts()
    fetchCartCount()
  }, [router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const cart = await response.json()
      setCartCount(cart.items?.length || 0)
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  const addToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          price: product.price,
          name: product.name,
          image: product.image,
        }),
      })

      if (response.ok) {
        setCartCount((prev) => prev + 1)
        // Add visual feedback
        const button = document.querySelector(`[data-product-id="${product._id}"]`)
        button?.classList.add("cart-bounce")
        setTimeout(() => button?.classList.remove("cart-bounce"), 500)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">Inventora</span>
            </Link>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user?.giftCoupons && user.giftCoupons.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Gift className="h-4 w-4 mr-1" />
                  {user.giftCoupons.length} Coupons
                </Badge>
              )}

              <Badge variant="outline" className="text-green-600">
                <Leaf className="h-4 w-4 mr-1" />
                {user?.ecoFriendlyOrders || 0} Eco Orders
              </Badge>

              <Link href="/cart">
                <Button variant="outline" className="relative bg-transparent">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
              </div>

              <ThemeToggle />

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Sustainable Products</h1>
          <p className="text-muted-foreground">
            Discover eco-friendly products and earn rewards for sustainable choices
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {product.isEcoFriendly && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      <Leaf className="h-3 w-3 mr-1" />
                      Eco-Friendly
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      data-product-id={product._id}
                      className="eco-gradient text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
