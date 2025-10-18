/**
 * Registration Page
 * Modern sign-up form with CAMP FASD branding
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone: formData.phone || undefined,
      })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-camp-orange/10 via-white to-camp-green/10 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-camp-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-camp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-camp-green mb-2">
            CAMP FASD
          </h1>
          <p className="text-lg text-camp-charcoal/70">
            Join Our Community
          </p>
        </div>

        {/* Registration Card */}
        <Card className="backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Enter your information to get started with your application
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="given-name"
                />

                <Input
                  label="Last Name"
                  name="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="email"
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="tel"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />

              <div className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-camp-green focus:ring-camp-green focus:ring-offset-0"
                />
                <label className="text-camp-charcoal">
                  I agree to the{' '}
                  <Link href="/terms" className="text-camp-green hover:text-camp-orange font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-camp-green hover:text-camp-orange font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>

              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-camp-green hover:text-camp-orange font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 CAMP – A FASD Community. All rights reserved.
        </p>
      </div>
    </div>
  )
}