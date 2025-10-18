/**
 * API client for communicating with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  team?: string
  email_verified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  return response.json()
}

/**
 * Get current user info
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}

/**
 * Logout (client-side token removal)
 */
export async function logout(token: string): Promise<void> {
  // Call backend logout endpoint (optional, for logging purposes)
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}