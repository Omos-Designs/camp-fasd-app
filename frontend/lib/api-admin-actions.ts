/**
 * Admin Actions API Client
 * Functions for admin workflow: approve, deny, and notes
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface AdminInfo {
  id: string
  first_name?: string
  last_name?: string
  email: string
  team?: string
}

export interface AdminNote {
  id: string
  application_id: string
  admin_id: string
  admin?: AdminInfo
  note: string
  created_at: string
  updated_at: string
}

export interface CreateNoteRequest {
  note: string
}

/**
 * Create a new admin note on an application
 */
export async function createAdminNote(
  token: string,
  applicationId: string,
  noteData: CreateNoteRequest
): Promise<AdminNote> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create note')
  }

  return response.json()
}

/**
 * Get all notes for an application
 */
export async function getAdminNotes(
  token: string,
  applicationId: string
): Promise<AdminNote[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/notes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch notes')
  }

  return response.json()
}

/**
 * Approve an application
 */
export async function approveApplication(
  token: string,
  applicationId: string
): Promise<{ message: string; application_id: string; status: string; approval_count: number; auto_accepted: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to approve application')
  }

  return response.json()
}

/**
 * Decline an application
 */
export async function declineApplication(
  token: string,
  applicationId: string
): Promise<{ message: string; application_id: string; status: string; approval_count: number; decline_count: number }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/decline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to decline application')
  }

  return response.json()
}

/**
 * Get approval status for an application
 */
export async function getApprovalStatus(
  token: string,
  applicationId: string
): Promise<{
  application_id: string
  approval_count: number
  decline_count: number
  current_user_vote: string | null
  approved_by: Array<{ admin_id: string; name: string; team: string | null }>
  declined_by: Array<{ admin_id: string; name: string; team: string | null }>
  status: string
}> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/approval-status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch approval status')
  }

  return response.json()
}

/**
 * Accept an application (manually transition to 'accepted' status)
 * Requires 3 approvals from 3 different teams
 */
export async function acceptApplication(
  token: string,
  applicationId: string
): Promise<{
  message: string
  application_id: string
  status: string
  accepted_at: string
  approved_by_teams: string[]
}> {
  const response = await fetch(`${API_BASE_URL}/api/admin/applications/${applicationId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to accept application')
  }

  return response.json()
}
