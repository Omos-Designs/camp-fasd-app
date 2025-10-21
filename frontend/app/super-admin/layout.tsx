'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')

  const handleSignOut = async () => {
    await logout()
    router.push('/login')
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-camp-green border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  const navigation = [
    {
      name: 'Overview',
      href: '/super-admin',
      icon: '🏠',
      section: 'dashboard',
    },
    {
      name: 'User Management',
      href: '/super-admin/users',
      icon: '👥',
      section: 'users',
    },
    {
      name: 'Teams',
      href: '/super-admin/teams',
      icon: '🤝',
      section: 'teams',
    },
    {
      name: 'Application Builder',
      href: '/super-admin/application-builder',
      icon: '📝',
      section: 'builder',
    },
    {
      name: 'System Configuration',
      href: '/super-admin/settings',
      icon: '⚙️',
      section: 'settings',
    },
    {
      name: 'Email Templates',
      href: '/super-admin/email-templates',
      icon: '✉️',
      section: 'email',
    },
    {
      name: 'Audit Logs',
      href: '/super-admin/audit-logs',
      icon: '📋',
      section: 'audit',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-camp-green">CAMP FASD</h1>
              </div>
              <div className="ml-10">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Super Admin
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/applications"
                className="text-sm text-gray-600 hover:text-camp-green"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-camp-green"
              >
                User Dashboard
              </Link>
              <div className="text-sm text-gray-700">
                {user.first_name} {user.last_name}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Side Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg
                      ${isActive
                        ? 'bg-camp-green text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/super-admin/users?role=admin"
                  className="block text-xs text-blue-700 hover:text-blue-900"
                >
                  View All Admins
                </Link>
                <Link
                  href="/super-admin/audit-logs?action=status_changed"
                  className="block text-xs text-blue-700 hover:text-blue-900"
                >
                  Recent Status Changes
                </Link>
                <Link
                  href="/super-admin/config?category=camp"
                  className="block text-xs text-blue-700 hover:text-blue-900"
                >
                  Camp Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
