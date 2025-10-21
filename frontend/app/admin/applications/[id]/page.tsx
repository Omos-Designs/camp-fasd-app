/**
 * Admin Application Detail Page
 * View all responses and files for a specific application
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getApplicationAdmin, updateApplicationAdmin } from '@/lib/api-admin'
import { getApplicationSections, ApplicationSection } from '@/lib/api-applications'
import { getFile, FileInfo } from '@/lib/api-files'
import { getAdminNotes, createAdminNote, approveApplication, declineApplication, getApprovalStatus, AdminNote } from '@/lib/api-admin-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateCST } from '@/lib/date-utils'

interface ApplicationData {
  id: string
  user_id: string
  camper_first_name?: string
  camper_last_name?: string
  status: string
  completion_percentage: number
  is_returning_camper: boolean
  cabin_assignment?: string
  created_at: string
  updated_at: string
  completed_at?: string
  responses?: Array<{
    id: string
    question_id: string
    response_value?: string
    file_id?: string
  }>
}

export default function AdminApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, logout } = useAuth()
  const applicationId = params.id as string

  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [sections, setSections] = useState<ApplicationSection[]>([])
  const [files, setFiles] = useState<Record<string, FileInfo>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [approvalStatus, setApprovalStatus] = useState<{
    approval_count: number
    decline_count: number
    current_user_vote: string | null
    approved_by: Array<{ admin_id: string; name: string; team: string | null }>
    declined_by: Array<{ admin_id: string; name: string; team: string | null }>
  } | null>(null)
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Load application data
  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [appData, sectionsData] = await Promise.all([
          getApplicationAdmin(token, applicationId),
          getApplicationSections(token)
        ])

        console.log('Application data:', appData)
        console.log('Responses:', appData.responses)

        setApplication(appData)
        setSections(sectionsData)

        // Load file information for responses with file_id
        const filesMap: Record<string, FileInfo> = {}
        const errorsMap: Record<string, string> = {}

        // Find responses with files (either in file_id or response_value that looks like a UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const responsesWithFiles = (appData.responses || []).filter(r => {
          return r.file_id || (r.response_value && uuidRegex.test(r.response_value))
        })

        console.log(`Loading ${responsesWithFiles.length} files...`, responsesWithFiles)

        // Load files sequentially to avoid overwhelming the server
        for (const r of responsesWithFiles) {
          try {
            // Get file ID from either file_id field or response_value (legacy)
            const fileId = r.file_id || r.response_value
            if (!fileId) continue

            console.log(`Loading file ${fileId} for question ${r.question_id}`)
            const fileInfo = await getFile(token, String(fileId))
            console.log(`File loaded:`, fileInfo)
            filesMap[r.question_id] = fileInfo
            // Update state as each file loads so they appear progressively
            setFiles({ ...filesMap })
          } catch (err) {
            const fileId = r.file_id || r.response_value
            console.error(`Failed to load file ${fileId} for question ${r.question_id}:`, err)
            errorsMap[r.question_id] = err instanceof Error ? err.message : 'Failed to load file'
            setFileErrors({ ...errorsMap })
          }
        }

        console.log('All files loaded:', filesMap)
        console.log('File errors:', errorsMap)
      } catch (err) {
        console.error('Failed to load application:', err)
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, applicationId])

  // Load notes
  useEffect(() => {
    if (!token) return

    const loadNotes = async () => {
      try {
        const fetchedNotes = await getAdminNotes(token, applicationId)
        setNotes(fetchedNotes)
      } catch (err) {
        console.error('Failed to load notes:', err)
      }
    }

    loadNotes()
  }, [token, applicationId])

  // Load approval status
  useEffect(() => {
    if (!token) return

    const loadApprovalStatus = async () => {
      try {
        const status = await getApprovalStatus(token, applicationId)
        setApprovalStatus(status)
      } catch (err) {
        console.error('Failed to load approval status:', err)
      }
    }

    loadApprovalStatus()
  }, [token, applicationId])

  const handleCreateNote = async () => {
    if (!token || !newNote.trim()) return

    try {
      setNotesLoading(true)
      const note = await createAdminNote(token, applicationId, { note: newNote })
      setNotes([note, ...notes])
      setNewNote('')
    } catch (err) {
      console.error('Failed to create note:', err)
      alert(err instanceof Error ? err.message : 'Failed to create note')
    } finally {
      setNotesLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!token) return

    try {
      setActionLoading(true)
      const result = await approveApplication(token, applicationId)

      // Reload approval status
      const status = await getApprovalStatus(token, applicationId)
      setApprovalStatus(status)

      // Reload application if status changed
      if (result.auto_accepted) {
        const updatedApp = await getApplicationAdmin(token, applicationId)
        setApplication(updatedApp as ApplicationData)
        alert(`Application approved! With 3 approvals, status changed to 'Accepted'. This application is now eligible for final camper acceptance.`)
      } else {
        alert(`Application approved! (${result.approval_count}/3 approvals)`)
      }
    } catch (err) {
      console.error('Failed to approve application:', err)
      alert(err instanceof Error ? err.message : 'Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!token) return

    try {
      setActionLoading(true)
      const result = await declineApplication(token, applicationId)

      // Reload approval status
      const status = await getApprovalStatus(token, applicationId)
      setApprovalStatus(status)

      alert(`Application declined. Current approvals: ${result.approval_count}, Declines: ${result.decline_count}`)
    } catch (err) {
      console.error('Failed to decline application:', err)
      alert(err instanceof Error ? err.message : 'Failed to decline application')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'paid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getResponseValue = (questionId: string) => {
    const response = application?.responses?.find(r => r.question_id === questionId)
    if (!response) return null

    console.log(`Getting response for question ${questionId}:`, response)

    // Check if this is a file response (check file_id OR if response_value looks like a UUID)
    const isFileId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.response_value || '')
    if (response.file_id || isFileId) {
      const file = files[questionId]
      const fileError = fileErrors[questionId]
      console.log(`File for question ${questionId}:`, file)
      console.log(`File error for question ${questionId}:`, fileError)

      // Show error if file failed to load
      if (fileError) {
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">Failed to load file</p>
              <p className="text-xs text-red-500 mt-0.5">{fileError}</p>
            </div>
          </div>
        )
      }

      // Show loading if file not yet loaded
      if (!file) {
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-sm">Loading file...</span>
          </div>
        )
      }

      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
            <svg className="h-8 w-8 text-camp-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-camp-charcoal truncate">
                {file.filename}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB • {file.content_type}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-camp-green rounded-lg hover:bg-camp-green/90 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </a>
              <a
                href={file.url}
                download={file.filename}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-camp-green bg-white border border-camp-green rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )
    }

    // Regular text response
    if (response.response_value) {
      return <span>{response.response_value}</span>
    }

    return <span className="text-gray-400">No response</span>
  }

  const handleStartEdit = (questionId: string, currentValue: string) => {
    setEditingQuestion(questionId)
    setEditValue(currentValue || '')
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setEditValue('')
  }

  const handleSaveEdit = async (questionId: string) => {
    if (!token || !application) return

    try {
      setSaving(true)
      await updateApplicationAdmin(token, applicationId, {
        responses: [{
          question_id: questionId,
          response_value: editValue
        }]
      })

      // Update local state
      if (application.responses) {
        const updatedResponses = application.responses.map(r =>
          r.question_id === questionId
            ? { ...r, response_value: editValue }
            : r
        )
        setApplication({ ...application, responses: updatedResponses })
      }

      setEditingQuestion(null)
      setEditValue('')
    } catch (err) {
      console.error('Failed to save edit:', err)
      alert(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-camp-green"></div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || 'Application not found'}</p>
            <Button onClick={() => router.push('/admin/applications')}>
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo and Back Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/applications')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-camp-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div className="ml-2">
                  <h1 className="text-lg font-bold text-camp-green">CAMP FASD</h1>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Right: User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-camp-charcoal">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Application Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                {formatStatus(application.status)}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-camp-green h-3 rounded-full transition-all"
                    style={{ width: `${application.completion_percentage}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-camp-charcoal">
                  {application.completion_percentage}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {application.completed_at
                  ? formatDateCST(application.completed_at)
                  : <span className="text-gray-500 italic">In progress</span>}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Responses */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const sectionResponses = section.questions.map(q => ({
              question: q,
              value: getResponseValue(q.id)
            })).filter(r => r.value !== null)

            if (sectionResponses.length === 0) return null

            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle>
                    {sectionIndex + 1}. {section.title}
                  </CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.questions.map((question, qIndex) => {
                      const value = getResponseValue(question.id)
                      if (value === null) return null

                      return (
                        <div key={question.id} className="pb-6 border-b border-gray-100 last:border-0">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <div className="sm:w-1/3">
                              <p className="font-medium text-gray-700">
                                {qIndex + 1}. {question.question_text}
                                {question.is_required && (
                                  <span className="text-camp-orange ml-1">*</span>
                                )}
                              </p>
                              {question.help_text && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {question.help_text}
                                </p>
                              )}
                            </div>
                            <div className="sm:w-2/3">
                              {editingQuestion === question.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-camp-green focus:border-transparent resize-none"
                                    rows={3}
                                    disabled={saving}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(question.id)}
                                      disabled={saving}
                                      className="bg-camp-green hover:bg-camp-green/90 text-white"
                                    >
                                      {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      disabled={saving}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 px-4 py-3 rounded-lg group relative">
                                  {value}
                                  {question.question_type !== 'file' && (
                                    <button
                                      onClick={() => {
                                        const response = application?.responses?.find(r => r.question_id === question.id)
                                        handleStartEdit(question.id, response?.response_value || '')
                                      }}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                      ✏️ Edit
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Application Metadata */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Application Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Application ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">{application.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">{application.user_id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-600">{formatDateCST(application.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">{formatDateCST(application.updated_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Returning Camper:</span>
                <span className="ml-2 text-gray-600">{application.is_returning_camper ? 'Yes' : 'No'}</span>
              </div>
              {application.cabin_assignment && (
                <div>
                  <span className="font-medium text-gray-700">Cabin Assignment:</span>
                  <span className="ml-2 text-gray-600">{application.cabin_assignment}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Approval Section */}
        <Card className="mt-8 border-l-4 border-l-camp-green">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <svg className="w-6 h-6 text-camp-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Team Approval
            </CardTitle>
            <CardDescription>
              Approve or decline this application. 3 approvals required to move to 'Accepted' status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Approval Counter */}
            {approvalStatus && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-camp-charcoal">Approval Progress</h4>
                    <p className="text-sm text-gray-600">
                      {approvalStatus.approval_count} of 3 approvals received
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{approvalStatus.approval_count}</div>
                      <div className="text-xs text-gray-500">Approved</div>
                    </div>
                    {approvalStatus.decline_count > 0 && (
                      <div className="text-center ml-4">
                        <div className="text-2xl font-bold text-red-600">{approvalStatus.decline_count}</div>
                        <div className="text-xs text-gray-500">Declined</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((approvalStatus.approval_count / 3) * 100, 100)}%` }}
                  />
                </div>

                {/* Who approved/declined */}
                {approvalStatus.approved_by.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Approved by:</p>
                    <div className="flex flex-wrap gap-2">
                      {approvalStatus.approved_by.map((admin) => (
                        <span key={admin.admin_id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {admin.name}
                          {admin.team && <span className="ml-1 font-semibold">({admin.team.toUpperCase()})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {approvalStatus.declined_by.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Declined by:</p>
                    <div className="flex flex-wrap gap-2">
                      {approvalStatus.declined_by.map((admin) => (
                        <span key={admin.admin_id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                          {admin.name}
                          {admin.team && <span className="ml-1 font-semibold">({admin.team.toUpperCase()})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleApprove}
                disabled={actionLoading || approvalStatus?.current_user_vote === 'approved'}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
              >
                {actionLoading ? 'Processing...' : approvalStatus?.current_user_vote === 'approved' ? '✓ You Approved' : 'Approve Application'}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={actionLoading || approvalStatus?.current_user_vote === 'declined'}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 font-semibold px-6 py-2"
              >
                {actionLoading ? 'Processing...' : approvalStatus?.current_user_vote === 'declined' ? '✗ You Declined' : 'Decline Application'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Review & Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <svg className="w-6 h-6 text-camp-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Team Notes
            </CardTitle>
            <CardDescription>
              Add notes about this application. Notes are visible to all admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Note Form */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here... (e.g., 'Medical team needs to review medications')"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-camp-green focus:border-transparent resize-none"
                rows={3}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleCreateNote}
                  disabled={notesLoading || !newNote.trim()}
                  className="bg-camp-green hover:bg-camp-green/90 text-white font-medium"
                >
                  {notesLoading ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p>No notes yet. Be the first to add a note!</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-camp-green rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {note.admin?.first_name?.[0]}{note.admin?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-camp-charcoal">
                            {note.admin?.first_name} {note.admin?.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {note.admin?.team && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                                {note.admin.team}
                              </span>
                            )}
                            <span>{formatDateCST(note.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3 ml-13 whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
