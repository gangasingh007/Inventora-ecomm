"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Leaf, Gift, Package } from "lucide-react"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Order ID</p>
            <p className="font-mono text-sm bg-muted p-2 rounded">{orderId}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Eco-Friendly Choice</p>
                <p className="text-sm text-muted-foreground">Thank you for choosing sustainable delivery!</p>
              </div>
            </div>

            {user?.ecoFriendlyOrders && user.ecoFriendlyOrders % 5 === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Gift className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Congratulations!</p>
                  <p className="text-sm text-muted-foreground">
                    You've earned a gift coupon for 5 eco-friendly orders!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-muted-foreground">We'll send you updates via email</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/shop" className="block">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                View Order History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
