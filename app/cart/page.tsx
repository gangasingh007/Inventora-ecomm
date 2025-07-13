"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Leaf, Minus, Plus, Trash2, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

interface CartItem {
  productId: string
  quantity: number
  price: number
  name: string
  image: string
}

interface Cart {
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [isEcoDelivery, setIsEcoDelivery] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
      return
    }
    fetchCart()
  }, [router])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setCart(data)
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    const updatedItems = cart.items.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item,
    )
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setCart({ items: updatedItems, total: newTotal })
  }

  const removeItem = (productId: string) => {
    const updatedItems = cart.items.filter((item) => item.productId !== productId)
    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setCart({ items: updatedItems, total: newTotal })
  }

  const applyDiscount = () => {
    // Simple discount logic - in real app, validate with backend
    if (discountCode === "ECO10") {
      setDiscountApplied(cart.total * 0.1)
    } else if (discountCode === "SAVE20") {
      setDiscountApplied(cart.total * 0.2)
    } else {
      setDiscountApplied(0)
    }
  }

  const handleCheckout = async () => {
    if (cart.items.length === 0) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const orderData = {
        items: cart.items,
        total: cart.total - discountApplied,
        discountApplied,
        isEcoFriendlyDelivery: isEcoDelivery,
        shippingAddress: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
        paymentMethod: "credit_card",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/order-success?orderId=${result.orderId}`)
      } else {
        throw new Error("Order failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Checkout failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cart.total
  const ecoDeliveryFee = isEcoDelivery ? 0 : 5.99
  const finalTotal = subtotal - discountApplied + ecoDeliveryFee

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link href="/shop">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Eco-Friendly Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="eco-delivery" checked={isEcoDelivery} onCheckedChange={setIsEcoDelivery} />
                      <Label htmlFor="eco-delivery" className="flex-1">
                        <div>
                          <p className="font-medium">Eco-Friendly Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Carbon-neutral delivery with electric vehicles
                          </p>
                        </div>
                      </Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        FREE
                      </Badge>
                    </div>
                    {!isEcoDelivery && <div className="text-sm text-muted-foreground">Standard delivery: $5.99</div>}
                  </div>
                </CardContent>
              </Card>

              {/* Discount Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Discount Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Button onClick={applyDiscount} variant="outline">
                      Apply
                    </Button>
                  </div>
                  {discountApplied > 0 && (
                    <p className="text-sm text-green-600 mt-2">Discount applied: -${discountApplied.toFixed(2)}</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountApplied > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discountApplied.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>{isEcoDelivery ? "FREE" : `$${ecoDeliveryFee.toFixed(2)}`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 eco-gradient text-white"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
