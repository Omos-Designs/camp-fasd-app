/**
 * API client for super admin endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  total_users: number
  total_families: number
  total_admins: number
  total_super_admins: number
  new_users_this_week: number

  total_applications: number
  applications_this_season: number
  applications_in_progress: number
  applications_under_review: number
  applications_accepted: number
  applications_paid: number
  applications_declined: number

  total_revenue: number
  season_revenue: number
  outstanding_payments: number

  avg_completion_days: number | null
  avg_review_days: number | null
}

export interface TeamPerformance {
  team_key: string
  team_name: string
  admin_count: number
  applications_reviewed: number
  avg_review_time_days: number | null
  approval_rate: number | null
}

export interface SystemConfiguration {
  id: string
  key: string
  value: any
  description: string | null
  data_type: string
  category: string
  is_public: boolean
  updated_at: string
  updated_by: string | null
}

export interface EmailTemplate {
  id: string
  key: string
  name: string
  subject: string
  html_content: string
  text_content: string | null
  variables: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface Team {
  id: string
  key: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
  admin_count?: number
}

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string | null
  action: string
  actor_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  actor_name?: string | null
  actor_email?: string | null
}

export interface UserWithDetails {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  team: string | null
  status?: string
  created_at: string
  last_login: string | null
}

// ============================================================================
// Dashboard APIs
// ============================================================================

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/api/super-admin/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch dashboard stats')
  }

  return response.json()
}

export async function getTeamPerformance(token: string): Promise<TeamPerformance[]> {
  const response = await fetch(`${API_URL}/api/super-admin/dashboard/team-performance`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch team performance')
  }

  return response.json()
}

// ============================================================================
// User Management APIs
// ============================================================================

export async function getAllUsers(
  token: string,
  filters?: {
    role?: string
    status?: string
    team?: string
    search?: string
    skip?: number
    limit?: number
  }
): Promise<UserWithDetails[]> {
  const params = new URLSearchParams()
  if (filters?.role) params.append('role', filters.role)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.team) params.append('team', filters.team)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.skip) params.append('skip', filters.skip.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_URL}/api/super-admin/users${params.toString() ? '?' + params.toString() : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch users')
  }

  return response.json()
}

export async function updateUser(
  token: string,
  userId: string,
  data: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    role?: string
    team?: string
    status?: string
  }
): Promise<UserWithDetails> {
  const response = await fetch(`${API_URL}/api/super-admin/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update user')
  }

  return response.json()
}

export async function changeUserRole(
  token: string,
  userId: string,
  role: string,
  team?: string
): Promise<UserWithDetails> {
  const response = await fetch(`${API_URL}/api/super-admin/users/${userId}/change-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role, team }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to change user role')
  }

  return response.json()
}

export async function suspendUser(
  token: string,
  userId: string,
  status: string,
  reason?: string
): Promise<UserWithDetails> {
  const response = await fetch(`${API_URL}/api/super-admin/users/${userId}/suspend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to suspend user')
  }

  return response.json()
}

// ============================================================================
// System Configuration APIs
// ============================================================================

export async function getAllConfigurations(
  token: string,
  category?: string
): Promise<SystemConfiguration[]> {
  const url = category
    ? `${API_URL}/api/super-admin/config?category=${category}`
    : `${API_URL}/api/super-admin/config`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch configurations')
  }

  return response.json()
}

export async function getConfiguration(
  token: string,
  key: string
): Promise<SystemConfiguration> {
  const response = await fetch(`${API_URL}/api/super-admin/config/${key}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch configuration')
  }

  return response.json()
}

export async function updateConfiguration(
  token: string,
  key: string,
  data: {
    value?: any
    description?: string
    category?: string
    is_public?: boolean
  }
): Promise<SystemConfiguration> {
  const response = await fetch(`${API_URL}/api/super-admin/config/${key}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update configuration')
  }

  return response.json()
}

// ============================================================================
// Email Template APIs
// ============================================================================

export async function getAllEmailTemplates(token: string): Promise<EmailTemplate[]> {
  const response = await fetch(`${API_URL}/api/super-admin/email-templates`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch email templates')
  }

  return response.json()
}

export async function getEmailTemplate(
  token: string,
  key: string
): Promise<EmailTemplate> {
  const response = await fetch(`${API_URL}/api/super-admin/email-templates/${key}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch email template')
  }

  return response.json()
}

export async function updateEmailTemplate(
  token: string,
  key: string,
  data: {
    name?: string
    subject?: string
    html_content?: string
    text_content?: string
    variables?: string[]
    is_active?: boolean
  }
): Promise<EmailTemplate> {
  const response = await fetch(`${API_URL}/api/super-admin/email-templates/${key}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update email template')
  }

  return response.json()
}

// ============================================================================
// Team APIs
// ============================================================================

export async function getAllTeams(token: string): Promise<Team[]> {
  const response = await fetch(`${API_URL}/api/super-admin/teams`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch teams')
  }

  return response.json()
}

export async function createTeam(
  token: string,
  data: {
    key: string
    name: string
    description?: string
    color?: string
    order_index?: number
  }
): Promise<Team> {
  const response = await fetch(`${API_URL}/api/super-admin/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create team')
  }

  return response.json()
}

export async function updateTeam(
  token: string,
  teamId: string,
  data: {
    name?: string
    description?: string
    color?: string
    is_active?: boolean
    order_index?: number
  }
): Promise<Team> {
  const response = await fetch(`${API_URL}/api/super-admin/teams/${teamId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update team')
  }

  return response.json()
}

// ============================================================================
// Audit Log APIs
// ============================================================================

export async function getAuditLogs(
  token: string,
  filters?: {
    entity_type?: string
    entity_id?: string
    action?: string
    actor_id?: string
    skip?: number
    limit?: number
  }
): Promise<AuditLog[]> {
  const params = new URLSearchParams()
  if (filters?.entity_type) params.append('entity_type', filters.entity_type)
  if (filters?.entity_id) params.append('entity_id', filters.entity_id)
  if (filters?.action) params.append('action', filters.action)
  if (filters?.actor_id) params.append('actor_id', filters.actor_id)
  if (filters?.skip) params.append('skip', filters.skip.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_URL}/api/super-admin/audit-logs${params.toString() ? '?' + params.toString() : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch audit logs')
  }

  return response.json()
}
