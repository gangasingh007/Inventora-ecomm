"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, ShoppingCart, Gift, Users, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventora</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/auth">
            <Button variant="outline">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Sustainable Shopping for a<span className="text-green-600"> Better Tomorrow</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join Inventora's eco-friendly marketplace where every purchase makes a difference. Earn rewards for choosing
            sustainable delivery options and help protect our planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=signup">
              <Button size="lg" className="eco-gradient text-white">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
            <Link href="/auth?tab=admin">
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why Choose Inventora?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="eco-card">
            <CardHeader>
              <Leaf className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Eco-Friendly Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose sustainable delivery options and reduce your carbon footprint. Every eco-friendly delivery brings
                us closer to a greener future.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="eco-card">
            <CardHeader>
              <Gift className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Reward System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete 5 eco-friendly orders and receive exclusive gift coupons. The more sustainable choices you
                make, the more rewards you earn.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="eco-card">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Community Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join thousands of eco-conscious shoppers making a positive impact. Together, we're building a
                sustainable shopping community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-3xl font-bold mb-2">10,000+</h4>
              <p className="text-green-100">Happy Customers</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-2">50,000+</h4>
              <p className="text-green-100">Eco-Friendly Deliveries</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-2">5,000+</h4>
              <p className="text-green-100">Gift Coupons Awarded</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-2">95%</h4>
              <p className="text-green-100">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold">Inventora</span>
              </div>
              <p className="text-gray-400">
                Sustainable shopping for a better tomorrow. Join our eco-friendly marketplace today.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <p className="text-gray-400">
                Follow us for updates on new eco-friendly products and sustainability tips.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Inventora. All rights reserved. Built with sustainability in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
