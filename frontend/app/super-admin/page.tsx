'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getDashboardStats, getTeamPerformance, type DashboardStats, type TeamPerformance } from '@/lib/api-super-admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function SuperAdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, teamData] = await Promise.all([
          getDashboardStats(token),
          getTeamPerformance(token)
        ])
        setStats(statsData)
        setTeamPerformance(teamData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-camp-green border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Failed to load dashboard'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Complete system overview and management controls
        </p>
      </div>

      {/* Users Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.total_families}</div>
              <div className="text-sm text-gray-600">Families</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.total_admins}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.total_super_admins}</div>
              <div className="text-sm text-gray-600">Super Admins</div>
              <div className="text-xs text-gray-500 mt-1">
                +{stats.new_users_this_week} this week
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Applications Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total_applications}</div>
              <div className="text-sm text-gray-600">Total (All Time)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.applications_this_season}</div>
              <div className="text-sm text-gray-600">This Season</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats.applications_in_progress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.applications_under_review}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.applications_accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.applications_paid}</div>
              <div className="text-sm text-gray-600">Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.applications_declined}</div>
              <div className="text-sm text-gray-600">Declined</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.avg_completion_days !== null
                  ? `${stats.avg_completion_days.toFixed(1)} days`
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Avg. Completion Time</div>
              <div className="text-xs text-gray-500 mt-1">From start to submit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.avg_review_days !== null
                  ? `${stats.avg_review_days.toFixed(1)} days`
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Avg. Review Time</div>
              <div className="text-xs text-gray-500 mt-1">From submit to accept</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.outstanding_payments}</div>
              <div className="text-sm text-gray-600">Outstanding Payments</div>
              <div className="text-xs text-gray-500 mt-1">Accepted but not paid</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Performance */}
      {teamPerformance.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
          <Card>
            <CardContent className="pt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admins
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Review Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamPerformance.map((team) => (
                    <tr key={team.team_key}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.team_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.admin_count}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.applications_reviewed}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.avg_review_time_days !== null
                          ? `${team.avg_review_time_days.toFixed(1)} days`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.approval_rate !== null
                          ? `${team.approval_rate.toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Manage Users</div>
                  <div className="text-xs text-gray-500">View and edit all users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">System Settings</div>
                  <div className="text-xs text-gray-500">Configure camp settings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Email Templates</div>
                  <div className="text-xs text-gray-500">Edit notification emails</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
