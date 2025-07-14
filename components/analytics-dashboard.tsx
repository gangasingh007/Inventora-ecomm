"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Leaf,
  Gift,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    ecoFriendlyOrders: number
    averageOrderValue: number
    conversionRate: number
  }
  monthlySales: Array<{
    _id: { year: number; month: number }
    total: number
    count: number
    ecoOrders: number
  }>
  categorySales: Array<{
    _id: string
    total: number
    count: number
    orderCount: number
  }>
  topProducts: Array<{
    _id: string
    name: string
    totalSold: number
    revenue: number
    orderCount: number
  }>
  userMetrics: {
    totalEcoOrders: number
    usersWithCoupons: number
    totalCouponsIssued: number
    avgEcoOrdersPerUser: number
  }
  recentOrders: Array<{
    _id: string
    userId: string
    total: number
    status: string
    isEcoFriendlyDelivery: boolean
    createdAt: string
  }>
  orderStatusDistribution: Array<{
    _id: string
    count: number
    totalValue: number
  }>
  dailySales: Array<{
    _id: { year: number; month: number; day: number }
    total: number
    count: number
  }>
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <AlertCircle className="h-4 w-4 text-blue-500" />,
  shipped: <TrendingUp className="h-4 w-4 text-purple-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { overview, monthlySales, categorySales, topProducts, userMetrics, recentOrders, orderStatusDistribution } =
    data

  // Calculate growth rates (mock data for demonstration)
  const previousMonthRevenue = monthlySales[monthlySales.length - 2]?.total || 0
  const currentMonthRevenue = monthlySales[monthlySales.length - 1]?.total || 0
  const revenueGrowth =
    previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

  const ecoFriendlyPercentage = overview.totalOrders > 0 ? (overview.ecoFriendlyOrders / overview.totalOrders) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Users to customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eco-Friendly Rate</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ecoFriendlyPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{overview.ecoFriendlyOrders} eco orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Gift Coupon Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-yellow-600" />
            Gift Coupon Program Analytics
          </CardTitle>
          <CardDescription>Eco-friendly reward program performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{userMetrics.totalCouponsIssued}</div>
              <p className="text-sm text-muted-foreground">Total Coupons Issued</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userMetrics.usersWithCoupons}</div>
              <p className="text-sm text-muted-foreground">Users with Coupons</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userMetrics.totalEcoOrders}</div>
              <p className="text-sm text-muted-foreground">Total Eco Orders</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userMetrics.avgEcoOrdersPerUser.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Avg Eco Orders/User</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Eco-Friendly Adoption</span>
              <span>{ecoFriendlyPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={ecoFriendlyPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.totalSold} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{product.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySales.slice(0, 5).map((category) => {
                const percentage = (category.total / overview.totalRevenue) * 100
                return (
                  <div key={category._id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{category._id}</span>
                      <span className="text-sm font-semibold">${category.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{category.count} items sold</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderStatusDistribution.map((status) => (
                <div key={status._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {statusIcons[status._id as keyof typeof statusIcons]}
                    <div>
                      <p className="font-medium capitalize">{status._id}</p>
                      <p className="text-sm text-muted-foreground">{status.count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${status.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {statusIcons[order.status as keyof typeof statusIcons]}
                    <div>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.isEcoFriendlyDelivery && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Eco
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Sales Trend
          </CardTitle>
          <CardDescription>Revenue and order trends over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlySales.slice(-6).map((month) => {
              const monthName = monthNames[month._id.month - 1]
              const maxRevenue = Math.max(...monthlySales.map((m) => m.total))
              const revenuePercentage = maxRevenue > 0 ? (month.total / maxRevenue) * 100 : 0

              return (
                <div key={`${month._id.year}-${month._id.month}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {monthName} {month._id.year}
                    </span>
                    <div className="text-right">
                      <span className="font-semibold">${month.total.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground ml-2">({month.count} orders)</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>{month.ecoOrders} eco-friendly orders</span>
                    <span>{((month.ecoOrders / month.count) * 100).toFixed(1)}% eco rate</span>
                  </div>
                  <Progress value={revenuePercentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
