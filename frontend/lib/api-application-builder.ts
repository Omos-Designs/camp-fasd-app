/**
 * API functions for Application Builder (Super Admin)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Question {
  id: string;
  section_id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'dropdown' | 'multiple_choice' | 'file_upload' | 'profile_picture' | 'checkbox' | 'date' | 'email' | 'phone' | 'signature';
  help_text?: string;
  placeholder?: string;
  is_required: boolean;
  is_active: boolean;
  order_index: number;
  options?: string[];
  validation_rules?: {
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    pattern?: string;
    file_types?: string[];
    max_file_size?: number;
  };
  show_when_status?: string | null;
  template_file_id?: string | null;
  show_if_question_id?: string | null;
  show_if_answer?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  show_when_status?: string | null;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface SectionCreate {
  title: string;
  description?: string;
  order_index: number;
  is_active?: boolean;
  show_when_status?: string | null;
}

export interface SectionUpdate {
  title?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
  show_when_status?: string | null;
}

export interface QuestionCreate {
  section_id: string;
  question_text: string;
  question_type: string;
  help_text?: string;
  placeholder?: string;
  is_required?: boolean;
  is_active?: boolean;
  order_index: number;
  options?: string[];
  validation_rules?: any;
  show_when_status?: string | null;
  template_file_id?: string | null;
}

export interface QuestionUpdate {
  question_text?: string;
  question_type?: string;
  help_text?: string;
  placeholder?: string;
  is_required?: boolean;
  is_active?: boolean;
  order_index?: number;
  options?: string[];
  validation_rules?: any;
  show_when_status?: string | null;
  template_file_id?: string | null;
}

// Get all sections with questions
export async function getSections(token: string, includeInactive: boolean = false): Promise<Section[]> {
  const response = await fetch(
    `${API_URL}/api/application-builder/sections?include_inactive=${includeInactive}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch sections');
  }

  return response.json();
}

// Create a new section
export async function createSection(token: string, section: SectionCreate): Promise<Section> {
  const response = await fetch(`${API_URL}/api/application-builder/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(section),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create section');
  }

  return response.json();
}

// Update a section
export async function updateSection(token: string, sectionId: string, section: SectionUpdate): Promise<Section> {
  const response = await fetch(`${API_URL}/api/application-builder/sections/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(section),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update section');
  }

  return response.json();
}

// Delete a section
export async function deleteSection(token: string, sectionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/application-builder/sections/${sectionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete section');
  }
}

// Reorder sections
export async function reorderSections(token: string, sectionIds: string[]): Promise<void> {
  const response = await fetch(`${API_URL}/api/application-builder/sections/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(sectionIds),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reorder sections');
  }
}

// Create a question
export async function createQuestion(token: string, question: QuestionCreate): Promise<Question> {
  const response = await fetch(`${API_URL}/api/application-builder/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create question');
  }

  return response.json();
}

// Update a question
export async function updateQuestion(token: string, questionId: string, question: QuestionUpdate): Promise<Question> {
  const response = await fetch(`${API_URL}/api/application-builder/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update question');
  }

  return response.json();
}

// Delete a question
export async function deleteQuestion(token: string, questionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/application-builder/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete question');
  }
}

// Duplicate a question
export async function duplicateQuestion(token: string, questionId: string): Promise<Question> {
  const response = await fetch(`${API_URL}/api/application-builder/questions/${questionId}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to duplicate question');
  }

  return response.json();
}

// Reorder questions
export async function reorderQuestions(token: string, questionIds: string[]): Promise<void> {
  const response = await fetch(`${API_URL}/api/application-builder/questions/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(questionIds),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reorder questions');
  }
}
