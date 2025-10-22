/**
 * Application Wizard Page
 * Dynamic multi-section form with sidebar navigation
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import {
  getApplicationSections,
  getApplicationProgress,
  getApplication,
  updateApplication,
  ApplicationSection,
  ApplicationProgress,
  ApplicationResponse
} from '@/lib/api-applications'
import { uploadFile, deleteFile, getFile, getFilesBatch, getTemplateFile, FileInfo } from '@/lib/api-files'
import { getMedicationsForQuestion, saveMedicationsForQuestion, getAllergiesForQuestion, saveAllergiesForQuestion } from '@/lib/api-medications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ProfileHeader from '@/components/ProfileHeader'
import MedicationList, { Medication } from '@/components/MedicationList'
import AllergyList, { Allergy } from '@/components/AllergyList'
import GenericTable, { TableRow } from '@/components/GenericTable'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ApplicationWizardPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user } = useAuth()
  const applicationId = params.id as string

  const [sections, setSections] = useState<ApplicationSection[]>([])
  const [progress, setProgress] = useState<ApplicationProgress | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileInfo>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string>('')
  const [camperFirstName, setCamperFirstName] = useState<string>('')
  const [camperLastName, setCamperLastName] = useState<string>('')
  const [camperSex, setCamperSex] = useState<string>('')
  const [camperDateOfBirth, setCamperDateOfBirth] = useState<string>('')
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('')
  const [medications, setMedications] = useState<Record<string, Medication[]>>({}) // questionId -> medications
  const [allergies, setAllergies] = useState<Record<string, Allergy[]>>({}) // questionId -> allergies
  const [tableData, setTableData] = useState<Record<string, TableRow[]>>({}) // questionId -> table rows

  // Load sections, progress, and existing responses
  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        console.log('Loading application data...', { token: !!token, applicationId })

        const [sectionsData, progressData, applicationData] = await Promise.all([
          getApplicationSections(token, applicationId).catch(err => {
            console.error('Failed to load sections:', err)
            throw new Error(`Failed to load sections: ${err.message}`)
          }),
          getApplicationProgress(token, applicationId).catch(err => {
            console.error('Failed to load progress:', err)
            throw new Error(`Failed to load progress: ${err.message}`)
          }),
          getApplication(token, applicationId).catch(err => {
            console.error('Failed to load application:', err)
            throw new Error(`Failed to load application: ${err.message}`)
          })
        ])

        console.log('Data loaded successfully:', {
          sectionsCount: sectionsData.length,
          progressData,
          applicationStatus: applicationData.status
        })
        setSections(sectionsData)
        setProgress(progressData)

        // Transform responses array to Record<string, string>
        const responsesMap: Record<string, string> = {}
        const filesMap: Record<string, FileInfo> = {}

        if (applicationData.responses && applicationData.responses.length > 0) {
          console.log('Loading responses:', applicationData.responses)

          // Collect all file IDs that need to be loaded
          const fileResponses = applicationData.responses.filter(r => r.file_id)
          const fileIds = fileResponses.map(r => String(r.file_id))

          // Load all files in a single batch request (much faster!)
          if (fileIds.length > 0) {
            try {
              console.log(`Loading ${fileIds.length} files in batch...`)
              const fileInfos = await getFilesBatch(token, fileIds)
              console.log(`Batch loaded ${fileInfos.length} files successfully`)

              // Map file info to question IDs
              fileResponses.forEach(r => {
                const fileIdStr = String(r.file_id)
                const questionIdStr = String(r.question_id)
                const fileInfo = fileInfos.find(f => f.id === fileIdStr)

                if (fileInfo) {
                  filesMap[questionIdStr] = fileInfo
                  responsesMap[questionIdStr] = fileIdStr
                } else {
                  // Create placeholder if file not found in batch
                  filesMap[questionIdStr] = {
                    id: fileIdStr,
                    filename: 'Uploaded file',
                    size: 0,
                    content_type: 'application/octet-stream',
                    url: '#',
                    created_at: new Date().toISOString()
                  }
                  responsesMap[questionIdStr] = fileIdStr
                }
              })
            } catch (error) {
              console.error('Failed to batch load files:', error)
              // Fallback: create placeholders for all files
              fileResponses.forEach(r => {
                const fileIdStr = String(r.file_id)
                const questionIdStr = String(r.question_id)
                filesMap[questionIdStr] = {
                  id: fileIdStr,
                  filename: 'Uploaded file',
                  size: 0,
                  content_type: 'application/octet-stream',
                  url: '#',
                  created_at: new Date().toISOString()
                }
                responsesMap[questionIdStr] = fileIdStr
              })
            }
          }

          // Load text responses
          applicationData.responses.forEach(r => {
            if (r.response_value && !r.file_id) {
              responsesMap[r.question_id] = r.response_value
            }
          })

          console.log('Final responsesMap:', responsesMap)
          console.log('Final filesMap:', filesMap)
        }

        setResponses(responsesMap)
        setUploadedFiles(filesMap)

        // Extract camper name and profile picture for ProfileHeader
        sectionsData.forEach(section => {
          section.questions.forEach(question => {
            const questionId = question.id;
            const response = responsesMap[questionId];

            // Look for first name (case-insensitive)
            if (question.question_text.toLowerCase().includes('first name') &&
                question.question_text.toLowerCase().includes('camper') &&
                response) {
              setCamperFirstName(response);
            }

            // Look for last name (case-insensitive)
            if (question.question_text.toLowerCase().includes('last name') &&
                question.question_text.toLowerCase().includes('camper') &&
                response) {
              setCamperLastName(response);
            }

            // Look for sex (legal sex, not gender identity)
            // Match "Legal Sex" exactly to avoid matching "sexual behavior" questions
            if (question.question_text.toLowerCase() === 'legal sex' && response) {
              setCamperSex(response);
            }

            // Look for date of birth
            if (question.question_text.toLowerCase() === 'date of birth' && response) {
              setCamperDateOfBirth(response);
            }

            // Look for profile picture
            if (question.question_type === 'profile_picture' && filesMap[questionId]) {
              setProfilePictureUrl(filesMap[questionId].url);
            }

            // Load medications for medication_list questions
            if (question.question_type === 'medication_list') {
              getMedicationsForQuestion(applicationId, questionId).then(meds => {
                setMedications(prev => ({ ...prev, [questionId]: meds }));
              }).catch(err => {
                console.error('Failed to load medications for question', questionId, err);
                setMedications(prev => ({ ...prev, [questionId]: [] }));
              });
            }

            // Load allergies for allergy_list questions
            if (question.question_type === 'allergy_list') {
              getAllergiesForQuestion(applicationId, questionId).then(allergyList => {
                setAllergies(prev => ({ ...prev, [questionId]: allergyList }));
              }).catch(err => {
                console.error('Failed to load allergies for question', questionId, err);
                setAllergies(prev => ({ ...prev, [questionId]: [] }));
              });
            }

            // Load table data for table questions
            if (question.question_type === 'table') {
              try {
                const tableDataValue = responsesMap[questionId]
                  ? JSON.parse(responsesMap[questionId])
                  : [];
                setTableData(prev => ({ ...prev, [questionId]: tableDataValue }));
              } catch (err) {
                console.error('Failed to parse table data for question', questionId, err);
                setTableData(prev => ({ ...prev, [questionId]: [] }));
              }
            }
          });
        });
      } catch (err) {
        console.error('Failed to load application data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, applicationId])

  // Autosave responses every 3 seconds
  useEffect(() => {
    if (!token || Object.keys(responses).length === 0) return

    const timer = setTimeout(async () => {
      await saveResponses()
    }, 3000)

    return () => clearTimeout(timer)
  }, [responses, token])

  // Autosave medications every 3 seconds
  useEffect(() => {
    if (!token || Object.keys(medications).length === 0) return

    const timer = setTimeout(async () => {
      await saveMedicationsData()
    }, 3000)

    return () => clearTimeout(timer)
  }, [medications, token])

  // Autosave allergies every 3 seconds
  useEffect(() => {
    if (!token || Object.keys(allergies).length === 0) return

    const timer = setTimeout(async () => {
      await saveAllergiesData()
    }, 3000)

    return () => clearTimeout(timer)
  }, [allergies, token])

  // Autosave table data every 3 seconds
  useEffect(() => {
    if (!token || Object.keys(tableData).length === 0) return

    const timer = setTimeout(async () => {
      await saveTableData()
    }, 3000)

    return () => clearTimeout(timer)
  }, [tableData, token])

  const saveResponses = async () => {
    if (!token) return

    setSaving(true)
    try {
      const responseArray: ApplicationResponse[] = Object.entries(responses).map(([questionId, value]) => {
        // Check if this is a file upload response (value is a UUID/file_id)
        const isFileUpload = uploadedFiles[questionId] !== undefined

        if (isFileUpload) {
          return {
            question_id: questionId,
            file_id: value
          }
        } else {
          return {
            question_id: questionId,
            response_value: value
          }
        }
      })

      await updateApplication(token, applicationId, {
        responses: responseArray
      })

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('Autosave failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveMedicationsData = async () => {
    if (!token) return

    setSaving(true)
    try {
      // Save all medications for each question
      const savePromises = Object.entries(medications).map(([questionId, meds]) =>
        saveMedicationsForQuestion(applicationId, questionId, meds)
      )

      await Promise.all(savePromises)

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('Medications autosave failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveAllergiesData = async () => {
    if (!token) return

    setSaving(true)
    try {
      // Save all allergies for each question
      const savePromises = Object.entries(allergies).map(([questionId, allergyList]) =>
        saveAllergiesForQuestion(applicationId, questionId, allergyList)
      )

      await Promise.all(savePromises)

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('Allergies autosave failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveTableData = async () => {
    if (!token) return

    setSaving(true)
    try {
      // Save table data as JSON strings in responses
      const tableResponses: Record<string, string> = {}
      Object.entries(tableData).forEach(([questionId, rows]) => {
        tableResponses[questionId] = JSON.stringify(rows)
      })

      // Merge with existing responses
      const updatedResponses = { ...responses, ...tableResponses }

      await updateApplication(token, applicationId, {
        application_data: updatedResponses
      })

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('Table data autosave failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (questionId: string, file: File) => {
    if (!token) return

    setUploadingFiles(prev => ({ ...prev, [questionId]: true }))
    try {
      const result = await uploadFile(token, file, applicationId, questionId)
      
      // Store file info
      setUploadedFiles(prev => ({
        ...prev,
        [questionId]: {
          id: result.file_id,
          filename: result.filename,
          size: file.size,
          content_type: file.type,
          url: result.url,
          created_at: new Date().toISOString()
        }
      }))

      // Update response to indicate file is uploaded
      setResponses(prev => ({
        ...prev,
        [questionId]: result.file_id
      }))

      // If this is a profile picture, update the profile picture URL
      const question = sections.flatMap(s => s.questions).find(q => q.id === questionId);
      if (question?.question_type === 'profile_picture') {
        setProfilePictureUrl(result.url);
      }

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const handleFileDelete = async (questionId: string) => {
    if (!token) return

    const fileInfo = uploadedFiles[questionId]
    if (!fileInfo) return

    try {
      await deleteFile(token, fileInfo.id)
      
      // Remove file from state
      setUploadedFiles(prev => {
        const newState = { ...prev }
        delete newState[questionId]
        return newState
      })

      // Clear response
      setResponses(prev => {
        const newState = { ...prev }
        delete newState[questionId]
        return newState
      })

      // If this was a profile picture, clear the profile picture URL
      const question = sections.flatMap(s => s.questions).find(q => q.id === questionId);
      if (question?.question_type === 'profile_picture') {
        setProfilePictureUrl('');
      }

      // Refresh progress
      const progressData = await getApplicationProgress(token, applicationId)
      setProgress(progressData)
    } catch (error) {
      console.error('File deletion failed:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))

    // Update camper name in real-time if this is a name question
    const question = sections.flatMap(s => s.questions).find(q => q.id === questionId);
    if (question) {
      const questionText = question.question_text.toLowerCase();

      if (questionText.includes('first name') && questionText.includes('camper')) {
        setCamperFirstName(value);
      }

      if (questionText.includes('last name') && questionText.includes('camper')) {
        setCamperLastName(value);
      }
    }
  }

  const getProgressEmoji = (sectionId: string) => {
    if (!progress) return '⭕'

    const sectionProgress = progress.section_progress.find(sp => sp.section_id === sectionId)
    if (!sectionProgress) return '⭕'

    if (sectionProgress.is_complete) return '✅'
    if (sectionProgress.answered_questions > 0) return '🔄'
    return '⭕'
  }

  const getProgressPercentage = (sectionId: string) => {
    if (!progress) return 0
    const sectionProgress = progress.section_progress.find(sp => sp.section_id === sectionId)
    return sectionProgress?.completion_percentage || 0
  }

  // Check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question: any): boolean => {
    // If no conditional logic, always show
    if (!question.show_if_question_id || !question.show_if_answer) {
      return true;
    }

    // Get the response to the trigger question
    const triggerResponse = responses[question.show_if_question_id];

    // Debug logging for troubleshooting
    console.log('shouldShowQuestion check:', {
      questionText: question.question_text,
      showIfQuestionId: question.show_if_question_id,
      showIfAnswer: question.show_if_answer,
      triggerResponse,
      willShow: triggerResponse && triggerResponse !== '' && triggerResponse === question.show_if_answer
    });

    // Only show if trigger response exists AND matches expected answer
    // This prevents conditional questions from showing before the trigger is answered
    if (!triggerResponse || triggerResponse === '') {
      return false;
    }

    // Show if the trigger question has the expected answer
    return triggerResponse === question.show_if_answer;
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-camp-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSection = sections[currentSectionIndex]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Section Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-camp-green to-camp-green/90">
          <h2 className="text-xl font-bold text-white mb-1">Application Progress</h2>
          <p className="text-white/90 text-sm">
            {progress?.completed_sections || 0} of {progress?.total_sections || 0} sections complete
          </p>
          <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${progress?.overall_percentage || 0}%` }}
            />
          </div>
          <p className="text-white/80 text-xs mt-1">
            {progress?.overall_percentage || 0}% Complete
          </p>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sections.map((section, index) => {
            const emoji = getProgressEmoji(section.id)
            const percentage = getProgressPercentage(section.id)
            const isActive = index === currentSectionIndex

            return (
              <button
                key={section.id}
                onClick={() => setCurrentSectionIndex(index)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-camp-green text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-camp-charcoal'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-sm line-clamp-2">
                      {index + 1}. {section.title}
                    </p>
                  </div>
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                </div>

                {/* Progress bar */}
                {!isActive && (
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-camp-orange h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
                {isActive && (
                  <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Autosave Indicator */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {saving ? (
            <div className="flex items-center text-sm text-camp-orange">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Saving...
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              All changes saved
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-camp-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-camp-charcoal">
                {currentSection?.title}
              </h1>
              {currentSection?.description && (
                <p className="text-gray-600 text-sm mt-1 hidden sm:block">
                  {currentSection.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="ml-2"
          >
            <span className="hidden sm:inline">Save & Exit</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </header>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Section {currentSectionIndex + 1} of {sections.length}</CardTitle>
                <CardDescription className="text-sm">
                  Complete all required questions to proceed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Profile Header - Shows camper name and photo */}
                <ProfileHeader
                  firstName={camperFirstName}
                  lastName={camperLastName}
                  profilePictureUrl={profilePictureUrl}
                  sex={camperSex}
                  dateOfBirth={camperDateOfBirth}
                />

                {currentSection?.questions.filter(shouldShowQuestion).map((question, qIndex) => (
                  <div key={question.id} className="pb-6 sm:pb-8 border-b border-gray-200 last:border-0">
                    {/* Section Header - Appears before question if header_text is set */}
                    {question.header_text && (
                      <div className="mb-6 pb-3 border-b-2 border-camp-green/30">
                        <h3 className="text-xl sm:text-2xl font-bold text-camp-charcoal">
                          {question.header_text}
                        </h3>
                      </div>
                    )}

                    <label className="block text-sm sm:text-base font-medium text-camp-charcoal mb-3">
                      {qIndex + 1}. {question.question_text}
                      {question.is_required && (
                        <span className="text-camp-orange ml-1">*</span>
                      )}
                    </label>

                    {question.help_text && (
                      <p className="text-sm text-gray-600 mb-4">
                        {question.help_text}
                      </p>
                    )}

                    {question.description && (
                      <div className="prose prose-sm max-w-none mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {question.description}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Render different input types */}
                    {question.question_type === 'text' && (
                      <input
                        type="text"
                        placeholder={question.placeholder || ''}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors"
                        required={question.is_required}
                      />
                    )}

                    {question.question_type === 'textarea' && (
                      <textarea
                        placeholder={question.placeholder || ''}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors resize-y"
                        required={question.is_required}
                      />
                    )}

                    {question.question_type === 'dropdown' && question.options && (
                      <>
                        <select
                          value={responses[question.id] || ''}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors"
                          required={question.is_required}
                        >
                          <option value="">Select an option...</option>
                          {Array.isArray(question.options) && question.options.map((option: string, i: number) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>

                        {/* Detail Prompt - Show textarea when specific answer is selected */}
                        {question.detail_prompt_trigger &&
                         question.detail_prompt_text &&
                         Array.isArray(question.detail_prompt_trigger) &&
                         question.detail_prompt_trigger.includes(responses[question.id]) && (
                          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <label className="block text-sm font-medium text-blue-900 mb-2">
                              {question.detail_prompt_text}
                            </label>
                            <textarea
                              value={responses[`${question.id}_detail`] || ''}
                              onChange={(e) => handleResponseChange(`${question.id}_detail`, e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 text-base border-2 border-blue-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors resize-y"
                              placeholder="Please provide details..."
                            />
                          </div>
                        )}
                      </>
                    )}

                    {question.question_type === 'email' && (
                      <input
                        type="email"
                        placeholder={question.placeholder || 'your.email@example.com'}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors"
                        required={question.is_required}
                      />
                    )}

                    {question.question_type === 'phone' && (
                      <input
                        type="tel"
                        placeholder={question.placeholder || '(555) 123-4567'}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors"
                        required={question.is_required}
                      />
                    )}

                    {question.question_type === 'date' && (
                      <input
                        type="date"
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors"
                        required={question.is_required}
                      />
                    )}

                    {question.question_type === 'multiple_choice' && question.options && (
                      <>
                        <div className="space-y-3">
                          {Array.isArray(question.options) && question.options.map((option: string, i: number) => (
                            <label key={i} className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:border-camp-green hover:bg-camp-green/5 transition-colors">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={responses[question.id] === option}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="w-5 h-5 text-camp-green focus:ring-camp-green border-gray-300"
                                required={question.is_required}
                              />
                              <span className="text-sm sm:text-base text-gray-700 flex-1">{option}</span>
                            </label>
                          ))}
                        </div>

                        {/* Detail Prompt - Show textarea when specific answer is selected */}
                        {question.detail_prompt_trigger &&
                         question.detail_prompt_text &&
                         Array.isArray(question.detail_prompt_trigger) &&
                         question.detail_prompt_trigger.includes(responses[question.id]) && (
                          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <label className="block text-sm font-medium text-blue-900 mb-2">
                              {question.detail_prompt_text}
                            </label>
                            <textarea
                              value={responses[`${question.id}_detail`] || ''}
                              onChange={(e) => handleResponseChange(`${question.id}_detail`, e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 text-base border-2 border-blue-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors resize-y"
                              placeholder="Please provide details..."
                            />
                          </div>
                        )}
                      </>
                    )}

                    {question.question_type === 'checkbox' && question.options && (
                      <>
                        <div className="space-y-2">
                          {Array.isArray(question.options) && question.options.map((option: string, i: number) => {
                            const selectedOptions = responses[question.id] ? responses[question.id].split(',') : [];
                            const isChecked = selectedOptions.includes(option);

                            return (
                              <label key={i} className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentSelected = responses[question.id] ? responses[question.id].split(',').filter(v => v) : [];
                                    let newSelected;
                                    if (e.target.checked) {
                                      newSelected = [...currentSelected, option];
                                    } else {
                                      newSelected = currentSelected.filter(v => v !== option);
                                    }
                                    handleResponseChange(question.id, newSelected.join(','));
                                  }}
                                  className="mt-1 w-5 h-5 rounded border-gray-300 text-camp-green focus:ring-camp-green flex-shrink-0"
                                />
                                <span className="text-sm sm:text-base text-gray-700 flex-1">{option}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Detail Prompt - Show textarea when specific options are selected */}
                        {question.detail_prompt_trigger &&
                         question.detail_prompt_text &&
                         Array.isArray(question.detail_prompt_trigger) &&
                         question.detail_prompt_trigger.some((trigger: string) =>
                           responses[question.id]?.split(',').includes(trigger)
                         ) && (
                          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <label className="block text-sm font-medium text-blue-900 mb-2">
                              {question.detail_prompt_text}
                            </label>
                            <textarea
                              value={responses[`${question.id}_detail`] || ''}
                              onChange={(e) => handleResponseChange(`${question.id}_detail`, e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 text-base border-2 border-blue-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors resize-y"
                              placeholder="Please provide details..."
                            />
                          </div>
                        )}
                      </>
                    )}

                    {question.question_type === 'signature' && (
                      <label className="flex items-start space-x-3 cursor-pointer bg-camp-green/5 border border-camp-green/40 rounded-lg p-4 sm:p-5">
                        <input
                          type="checkbox"
                          checked={responses[question.id] === 'true'}
                          onChange={(e) => handleResponseChange(question.id, e.target.checked.toString())}
                          className="mt-1 w-6 h-6 flex-shrink-0 rounded border-gray-300 text-camp-green focus:ring-camp-green"
                          required={question.is_required}
                        />
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          By checking this box, I acknowledge that this acts as my Parent/Guardian signature for this application and that all information provided is accurate to the best of my knowledge.
                        </span>
                      </label>
                    )}

                    {question.question_type === 'file_upload' && (
                      <div className="space-y-4">
                        {/* Template file download button */}
                        {question.template_file_id && (
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                  Download Template
                                </p>
                                <p className="text-xs text-blue-700">
                                  Download, complete, and upload the form using the button below
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!token) return
                                  try {
                                    const templateFile = await getTemplateFile(token, question.template_file_id!)
                                    window.open(templateFile.url, '_blank')
                                  } catch (error) {
                                    console.error('Failed to download template:', error)
                                    alert('Failed to download template file')
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                        {uploadedFiles[question.id] ? (
                          // Show uploaded file
                          <div className="border-2 border-camp-green rounded-lg p-4 bg-green-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <svg className="h-8 w-8 text-camp-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-camp-charcoal">
                                    {uploadedFiles[question.id].filename}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(uploadedFiles[question.id].size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={uploadedFiles[question.id].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-camp-green hover:underline"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() => handleFileDelete(question.id)}
                                  className="text-sm text-red-600 hover:underline"
                                  type="button"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Show upload area
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-camp-green transition-colors">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="hidden"
                              id={`file-${question.id}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(question.id, file)
                                }
                              }}
                              required={question.is_required && !uploadedFiles[question.id]}
                            />
                            <label
                              htmlFor={`file-${question.id}`}
                              className={`cursor-pointer ${uploadingFiles[question.id] ? 'opacity-50' : ''}`}
                            >
                              <div className="text-gray-600">
                                {uploadingFiles[question.id] ? (
                                  <>
                                    <svg className="animate-spin mx-auto h-12 w-12 text-camp-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    <p className="mt-2 text-sm text-camp-green">Uploading...</p>
                                  </>
                                ) : (
                                  <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm">
                                      <span className="font-medium text-camp-green">Click to upload</span>
                                      {' '}or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                    </p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Medication List */}
                    {question.question_type === 'medication_list' && (
                      <MedicationList
                        questionId={question.id}
                        applicationId={applicationId}
                        value={medications[question.id] || []}
                        onChange={(meds) => {
                          setMedications(prev => ({ ...prev, [question.id]: meds }))
                        }}
                        medicationFields={question.options?.medication_fields}
                        doseFields={question.options?.dose_fields}
                        isRequired={question.is_required}
                      />
                    )}

                    {/* Allergy List */}
                    {question.question_type === 'allergy_list' && (
                      <AllergyList
                        questionId={question.id}
                        applicationId={applicationId}
                        value={allergies[question.id] || []}
                        onChange={(allergyList) => {
                          setAllergies(prev => ({ ...prev, [question.id]: allergyList }))
                        }}
                        allergyFields={question.options?.allergy_fields}
                        isRequired={question.is_required}
                      />
                    )}

                    {/* Generic Table */}
                    {question.question_type === 'table' && (
                      <GenericTable
                        questionId={question.id}
                        applicationId={applicationId}
                        value={tableData[question.id] || []}
                        onChange={(rows) => {
                          setTableData(prev => ({ ...prev, [question.id]: rows }))
                        }}
                        columns={question.options?.columns || []}
                        addButtonText={question.options?.addButtonText}
                        emptyStateText={question.options?.emptyStateText}
                        isRequired={question.is_required}
                      />
                    )}

                    {/* Profile Picture Upload - Image-focused */}
                    {question.question_type === 'profile_picture' && (
                      <div className="space-y-4">
                        {uploadedFiles[question.id] ? (
                          // Show uploaded profile picture with preview
                          <div className="border-2 border-camp-green rounded-lg p-6 bg-green-50">
                            <div className="flex flex-col items-center gap-4">
                              <img
                                src={uploadedFiles[question.id].url}
                                alt="Camper Profile Picture"
                                className="h-32 w-32 rounded-full object-cover border-4 border-camp-green shadow-lg"
                              />
                              <div className="text-center">
                                <p className="text-sm font-medium text-camp-charcoal">
                                  {uploadedFiles[question.id].filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(uploadedFiles[question.id].size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <a
                                  href={uploadedFiles[question.id].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-camp-green hover:underline"
                                >
                                  View Full Size
                                </a>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleFileDelete(question.id)}
                                  className="text-sm text-red-600 hover:underline"
                                  type="button"
                                >
                                  Change Photo
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Show upload area
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-camp-green transition-colors">
                            <input
                              type="file"
                              accept="image/*,.jpg,.jpeg,.png,.gif"
                              className="hidden"
                              id={`profile-pic-${question.id}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(question.id, file)
                                }
                              }}
                              required={question.is_required && !uploadedFiles[question.id]}
                            />
                            <label
                              htmlFor={`profile-pic-${question.id}`}
                              className={`cursor-pointer ${uploadingFiles[question.id] ? 'opacity-50' : ''}`}
                            >
                              <div className="text-gray-600">
                                {uploadingFiles[question.id] ? (
                                  <>
                                    <svg className="animate-spin mx-auto h-16 w-16 text-camp-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    <p className="mt-3 text-sm text-camp-green font-medium">Uploading Photo...</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="mx-auto h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                      <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <p className="mt-2 text-base font-medium">
                                      <span className="text-camp-green">Click to upload photo</span>
                                      {' '}or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                      JPG, PNG, or GIF (max 5MB)
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      This photo will appear at the top of your application
                                    </p>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 sm:mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="w-full sm:w-auto min-h-[48px]"
              >
                <span className="hidden sm:inline">← Previous Section</span>
                <span className="sm:hidden">← Previous</span>
              </Button>

              {currentSectionIndex < sections.length - 1 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  <span className="hidden sm:inline">Next Section →</span>
                  <span className="sm:hidden">Next →</span>
                </Button>
              ) : (
                <div className="text-center flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-sm px-4">
                    {progress?.overall_percentage === 100 ? (
                      <span className="text-camp-green font-medium">
                        ✅ Application complete! Your application will be reviewed by our team.
                      </span>
                    ) : (
                      <span>
                        Complete all required questions to finish your application.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
