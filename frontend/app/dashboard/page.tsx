/**
 * Dashboard Page
 * Main user dashboard after login
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createApplication, getMyApplications, Application } from '@/lib/api-applications'

export default function DashboardPage() {
  const router = useRouter()
  const { user, token, logout, isAuthenticated, loading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    // Redirect admins to admin dashboard
    if (!loading && user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.push('/admin/applications')
    }
  }, [isAuthenticated, loading, user, router])

  // Load user's applications
  useEffect(() => {
    if (!token || !isAuthenticated) return

    const loadApplications = async () => {
      try {
        const apps = await getMyApplications(token)
        setApplications(apps)
      } catch (error) {
        console.error('Failed to load applications:', error)
      } finally {
        setLoadingApps(false)
      }
    }

    loadApplications()
  }, [token, isAuthenticated])

  const handleStartApplication = async () => {
    if (!token) return

    setCreating(true)
    try {
      // Check if user already has an application
      if (applications.length > 0) {
        // Redirect to existing application
        const existingApp = applications[0]
        router.push(`/dashboard/application/${existingApp.id}`)
        return
      }

      // Create new application
      const newApp = await createApplication(token, {
        camper_first_name: user?.first_name || '',
        camper_last_name: user?.last_name || ''
      })

      // Redirect to application wizard
      router.push(`/dashboard/application/${newApp.id}`)
    } catch (error) {
      console.error('Failed to create application:', error)
      alert('Failed to start application. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-camp-green"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-camp-green">CAMP FASD</h1>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Application Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-camp-charcoal">
                {user.first_name || user.last_name
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/admin/applications')}
              >
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-camp-charcoal mb-2">
            Welcome back, {user.first_name || 'Camper'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your camper application and track your progress.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-camp-green">
            <CardHeader>
              <CardTitle className="text-lg">Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApps ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : applications.length > 0 ? (
                <>
                  <p className="text-3xl font-bold text-camp-green capitalize">
                    {applications[0].status.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {applications[0].completion_percentage}% Complete
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-400">Not Started</p>
                  <p className="text-sm text-gray-600 mt-1">0% Complete</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-camp-orange">
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-camp-orange">0</p>
              <p className="text-sm text-gray-600 mt-1">Files Uploaded</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-gray-400">
            <CardHeader>
              <CardTitle className="text-lg">Next Step</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-camp-charcoal">Continue Application</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {applications[0].completion_percentage < 100
                      ? 'Complete remaining sections'
                      : 'Application complete'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-camp-charcoal">Start Application</p>
                  <p className="text-sm text-gray-600 mt-1">Complete camper info</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Your Application</CardTitle>
            <CardDescription>
              Complete your camper application to attend CAMP FASD. The process takes about 30 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 What You'll Need</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Camper's medical history and current medications</li>
                <li>Insurance card (front and back)</li>
                <li>IEP or 504 Plan (if applicable)</li>
                <li>Immunization records</li>
                <li>Emergency contact information</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartApplication}
                disabled={creating || loadingApps}
              >
                {creating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : applications.length > 0 ? (
                  'Continue Application'
                ) : (
                  'Start New Application'
                )}
              </Button>
              <Button variant="outline" size="lg">
                View Requirements
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 bg-camp-green/5 border border-camp-green/20 rounded-lg p-6">
          <h3 className="font-semibold text-camp-green mb-2">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Our team is here to assist you with your application. Reach out anytime!
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              📧 Contact Support
            </Button>
            <Button variant="outline" size="sm">
              📚 View FAQ
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-camp-charcoal text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80">
            CAMP – A FASD Community | Application Portal
          </p>
          <p className="text-white/60 text-sm mt-2">
            © 2025 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}