/**
 * API client for application-related endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface ApplicationSection {
  id: string
  title: string
  description: string | null
  order_index: number
  is_active: boolean
  visible_before_acceptance: boolean
  created_at: string
  updated_at: string
  questions: ApplicationQuestion[]
}

export interface ApplicationQuestion {
  id: string
  section_id: string
  question_text: string
  question_type: string
  options: string[] | Record<string, any> | null  // Can be array or object
  is_required: boolean
  reset_annually: boolean
  order_index: number
  validation_rules: any[] | Record<string, any> | null  // Can be array or object
  help_text: string | null
  description: string | null
  placeholder: string | null
  is_active: boolean
  show_if_question_id?: string | null
  show_if_answer?: string | null
  detail_prompt_trigger?: string[] | null
  detail_prompt_text?: string | null
  header_text?: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  camper_first_name: string | null
  camper_last_name: string | null
  status: string
  completion_percentage: number
  is_returning_camper: boolean
  cabin_assignment: string | null
  created_at: string
  updated_at: string
  completed_at: string | null  // When application reached 100%
}

export interface ApplicationResponse {
  question_id: string
  response_value?: string
  file_id?: string
}

export interface ApplicationWithResponses extends Application {
  responses: ApplicationResponse[]
}

export interface SectionProgress {
  section_id: string
  section_title: string
  total_questions: number
  required_questions: number
  answered_questions: number
  answered_required: number
  completion_percentage: number
  is_complete: boolean
}

export interface ApplicationProgress {
  application_id: string
  total_sections: number
  completed_sections: number
  overall_percentage: number
  section_progress: SectionProgress[]
}

/**
 * Get all application sections with questions
 * Optionally filter by application status (for conditional questions)
 */
export async function getApplicationSections(token: string, applicationId?: string): Promise<ApplicationSection[]> {
  const url = applicationId
    ? `${API_URL}/api/applications/sections?application_id=${applicationId}`
    : `${API_URL}/api/applications/sections`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch application sections')
  }

  return response.json()
}

/**
 * Create a new application
 */
export async function createApplication(
  token: string,
  data: { camper_first_name?: string; camper_last_name?: string }
): Promise<Application> {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create application')
  }

  return response.json()
}

/**
 * Get user's applications
 */
export async function getMyApplications(token: string): Promise<Application[]> {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }

  return response.json()
}

/**
 * Get a specific application with responses
 */
export async function getApplication(token: string, applicationId: string): Promise<ApplicationWithResponses> {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch application')
  }

  return response.json()
}

/**
 * Update application (autosave)
 */
export async function updateApplication(
  token: string,
  applicationId: string,
  data: {
    camper_first_name?: string
    camper_last_name?: string
    responses?: ApplicationResponse[]
  }
): Promise<Application> {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update application')
  }

  return response.json()
}

/**
 * Get application progress
 */
export async function getApplicationProgress(
  token: string,
  applicationId: string
): Promise<ApplicationProgress> {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}/progress`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch application progress')
  }

  return response.json()
}

