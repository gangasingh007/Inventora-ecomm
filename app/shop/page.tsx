"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Leaf, Search, UserIcon, LogOut, Gift, Star, Heart, Eye } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

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
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
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
    loadFavorites()
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

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
      toast({
        title: "Removed from favorites",
        description: "Product removed from your favorites list",
      })
    } else {
      newFavorites.add(productId)
      toast({
        title: "Added to favorites",
        description: "Product added to your favorites list",
      })
    }
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)))
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
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        })

        // Add visual feedback
        const button = document.querySelector(`[data-product-id="${product._id}"]`)
        button?.classList.add("cart-bounce")
        setTimeout(() => button?.classList.remove("cart-bounce"), 500)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600" }
    if (stock <= 5) return { text: "Low Stock", color: "text-yellow-600" }
    return { text: "In Stock", color: "text-green-600" }
  }

  const getNextCouponProgress = () => {
    const ecoOrders = user?.ecoFriendlyOrders || 0
    const nextMilestone = Math.ceil((ecoOrders + 1) / 5) * 5
    const progress = ((ecoOrders % 5) / 5) * 100
    const remaining = nextMilestone - ecoOrders
    return { progress, remaining, nextMilestone }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const couponProgress = getNextCouponProgress()

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
              {/* Eco Progress Indicator */}
              <div className="hidden md:flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <Leaf className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium text-green-700 dark:text-green-400">
                    {user?.ecoFriendlyOrders || 0} Eco Orders
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500">
                    {couponProgress.remaining} more for coupon
                  </div>
                </div>
              </div>

              {user?.giftCoupons && user.giftCoupons.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  {user.giftCoupons.length} Coupons
                </Badge>
              )}

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

      {/* Eco Progress Bar */}
      <div className="bg-green-50 dark:bg-green-900/10 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">Eco Reward Progress</span>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600">{user?.ecoFriendlyOrders || 0}/5 orders</span>
                  <span className="text-green-600">{couponProgress.remaining} to go</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${couponProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Choose eco-friendly delivery to earn 15% off coupons!
            </div>
          </div>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              const isFavorite = favorites.has(product._id)

              return (
                <Card
                  key={product._id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.isEcoFriendly && (
                        <Badge className="bg-green-600 hover:bg-green-700">
                          <Leaf className="h-3 w-3 mr-1" />
                          Eco-Friendly
                        </Badge>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Low Stock
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={() => toggleFavorite(product._id)}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>

                    {/* Stock Status Overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {product.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                        {product.isEcoFriendly && (
                          <div className="text-xs text-green-600 mt-1">Eco-friendly choice</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</div>
                        <div className="text-xs text-muted-foreground">{product.stock} available</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        data-product-id={product._id}
                        className="flex-1 eco-gradient text-white hover:shadow-md transition-all duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>

                      {isFavorite && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      )}
                    </div>

                    {/* Rating placeholder */}
                    <div className="flex items-center mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">4.8 (124 reviews)</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
