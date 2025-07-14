"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Gift, Leaf, Package, ArrowRight } from "lucide-react"
import { Confetti } from "@/components/confetti"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Get order details from URL params or localStorage
    const orderId = searchParams.get("orderId")
    const giftCouponAwarded = searchParams.get("giftCoupon") === "true"
    const newCouponCode = searchParams.get("couponCode")
    const ecoOrderCount = searchParams.get("ecoCount")

    if (giftCouponAwarded) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }

    setOrderDetails({
      orderId,
      giftCouponAwarded,
      newCouponCode,
      ecoOrderCount: Number.parseInt(ecoOrderCount || "0"),
    })

    // Clear any stored order data
    localStorage.removeItem("pendingOrder")
  }, [searchParams])

  const handleContinueShopping = () => {
    router.push("/shop")
  }

  const handleViewOrders = () => {
    router.push("/orders")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <Card className="text-center border-green-200 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">Order Placed Successfully!</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-500">
              Thank you for your purchase. Your order has been confirmed and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderDetails?.orderId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono text-lg font-semibold">{orderDetails.orderId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gift Coupon Reward */}
        {orderDetails?.giftCouponAwarded && (
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Gift className="h-6 w-6 text-yellow-600" />
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-yellow-700 dark:text-yellow-400 text-center">
                🎉 Eco Reward Unlocked!
              </CardTitle>
              <CardDescription className="text-center text-yellow-600 dark:text-yellow-500">
                Congratulations! You've completed {orderDetails.ecoOrderCount} eco-friendly orders
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-yellow-300">
                <p className="text-sm text-muted-foreground mb-2">Your Gift Coupon Code</p>
                <p className="font-mono text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {orderDetails.newCouponCode}
                </p>
                <Badge className="mt-2 bg-yellow-600 hover:bg-yellow-700">15% OFF Your Next Order</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This coupon is valid for 90 days and can be used on your next purchase!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Processing</h3>
                <p className="text-sm text-muted-foreground">Your order is being prepared</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Shipping</h3>
                <p className="text-sm text-muted-foreground">We'll notify you when shipped</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Delivered</h3>
                <p className="text-sm text-muted-foreground">Enjoy your purchase!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleContinueShopping} className="flex-1">
            Continue Shopping
          </Button>
          <Button onClick={handleViewOrders} variant="outline" className="flex-1 bg-transparent">
            View My Orders
          </Button>
        </div>

        {/* Eco-Friendly Message */}
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-400">
              <Leaf className="h-5 w-5" />
              <p className="text-center">
                Thank you for choosing eco-friendly delivery! Every sustainable choice makes a difference.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
