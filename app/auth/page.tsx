"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, User, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "signin"

  const handleAuth = async (formData: FormData, isSignUp: boolean, role = "user") => {
    setIsLoading(true)
    setError("")

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login"
      const body: any = {
        email: formData.get("email"),
        password: formData.get("password"),
      }

      if (isSignUp) {
        body.name = formData.get("name")
        body.role = role
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/shop")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Inventora</span>
          </Link>
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">User Sign Up</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* User Sign In */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Welcome Back
                </CardTitle>
                <CardDescription>Sign in to your Inventora account to continue shopping sustainably.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAuth(formData, false)
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" name="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <Input id="signin-password" name="password" type="password" required />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Sign Up */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Join Inventora
                </CardTitle>
                <CardDescription>Create your account and start your sustainable shopping journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAuth(formData, true, "user")
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" name="name" type="text" placeholder="John Doe" required />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button type="submit" className="w-full eco-gradient text-white" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Access
                </CardTitle>
                <CardDescription>Sign in or create an admin account to manage the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="admin-signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="admin-signin">Sign In</TabsTrigger>
                    <TabsTrigger value="admin-signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="admin-signin" className="mt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleAuth(formData, false)
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin-signin-email">Admin Email</Label>
                          <Input
                            id="admin-signin-email"
                            name="email"
                            type="email"
                            placeholder="admin@inventora.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-signin-password">Password</Label>
                          <Input id="admin-signin-password" name="password" type="password" required />
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing In..." : "Admin Sign In"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="admin-signup" className="mt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleAuth(formData, true, "admin")
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin-signup-name">Admin Name</Label>
                          <Input id="admin-signup-name" name="name" type="text" placeholder="Admin Name" required />
                        </div>
                        <div>
                          <Label htmlFor="admin-signup-email">Admin Email</Label>
                          <Input
                            id="admin-signup-email"
                            name="email"
                            type="email"
                            placeholder="admin@inventora.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-signup-password">Password</Label>
                          <Input
                            id="admin-signup-password"
                            name="password"
                            type="password"
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                          />
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
