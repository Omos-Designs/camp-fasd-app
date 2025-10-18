/**
 * Authentication Context
 * Manages user authentication state across the application
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout, LoginCredentials, RegisterData } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('camp_token')
    if (storedToken) {
      // Verify token is still valid
      getCurrentUser(storedToken)
        .then((userData) => {
          setToken(storedToken)
          setUser(userData)
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('camp_token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const response = await apiLogin(credentials)
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem('camp_token', response.access_token)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setLoading(true)
    try {
      const response = await apiRegister(data)
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem('camp_token', response.access_token)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      if (token) {
        await apiLogout(token)
      }
      setToken(null)
      setUser(null)
      localStorage.removeItem('camp_token')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}