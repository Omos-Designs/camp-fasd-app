'use client'

import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function GoogleLoginButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Google login failed')
      }

      // Store token and user info
      localStorage.setItem('camp_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on role - use window.location for full page reload
      // This ensures AuthContext picks up the new token
      if (data.user.role === 'super_admin') {
        window.location.href = '/super-admin'
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin/applications'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError(error instanceof Error ? error.message : 'Failed to log in with Google')
    }
  }

  const handleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
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

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          size="large"
          text="signin_with"
          shape="rectangular"
          theme="outline"
          logo_alignment="left"
        />
      </div>
    </div>
  )
}
