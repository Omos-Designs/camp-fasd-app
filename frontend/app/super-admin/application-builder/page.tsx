'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Copy,
  MoveUp,
  MoveDown,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  GitBranch
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  reorderQuestions,
  Section,
  Question,
  SectionCreate,
  SectionUpdate,
  QuestionCreate,
  QuestionUpdate,
} from '@/lib/api-application-builder';

const questionTypes = [
  { value: 'text', label: 'Short Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'dropdown', label: 'Dropdown', description: 'Select one from dropdown' },
  { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select one option' },
  { value: 'checkbox', label: 'Checkboxes', description: 'Select multiple options' },
  { value: 'file_upload', label: 'File Upload', description: 'Upload documents' },
  { value: 'profile_picture', label: 'Profile Picture', description: 'Upload camper photo (displays at top of each section)' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'email', label: 'Email', description: 'Email address' },
  { value: 'phone', label: 'Phone', description: 'Phone number' },
  { value: 'signature', label: 'Signature', description: 'Electronic signature' },
];

const visibilityOptions = [
  { value: 'always', label: 'Always Visible', description: 'Show for all applicants' },
  { value: 'accepted', label: 'After Acceptance', description: 'Show only after camper is accepted' },
  { value: 'paid', label: 'After Payment', description: 'Show only after payment is complete' },
];

export default function ApplicationBuilderPage() {
  const { token } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1', '2', '3', '4']));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [draggedQuestion, setDraggedQuestion] = useState<{ sectionId: string; questionIndex: number } | null>(null);

  // Section form state
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    show_when_status: 'always' as 'always' | 'accepted' | 'paid',
    is_active: true,
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    question_text: '',
    question_type: 'text' as Question['question_type'],
    help_text: '',
    is_required: true,
    is_active: true,
    show_when_status: null,
    options: [],
    validation_rules: {},
    show_if_question_id: null,
    show_if_answer: null,
  });

  // Load sections on mount
  useEffect(() => {
    if (!token) return;

    const loadSections = async () => {
      try {
        setLoading(true);
        const data = await getSections(token, true); // Include inactive
        setSections(data);

        // Expand all sections by default
        const allIds = new Set(data.map(s => s.id));
        setExpandedSections(allIds);
      } catch (error) {
        console.error('Failed to load sections:', error);
        setSaveStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, [token]);

  const handleCreateSection = () => {
    setSectionForm({
      title: '',
      description: '',
      show_when_status: 'always',
      is_active: true,
    });
    setEditingSectionId(null);
    setIsSectionDialogOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setSectionForm({
      title: section.title,
      description: section.description || '',
      show_when_status: (section.show_when_status || 'always') as 'always' | 'accepted' | 'paid',
      is_active: section.is_active,
    });
    setEditingSectionId(section.id);
    setIsSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!token) return;

    try {
      setSaving(true);

      if (editingSectionId) {
        // Update existing section
        const updated = await updateSection(token, editingSectionId, {
          title: sectionForm.title,
          description: sectionForm.description,
          is_active: sectionForm.is_active,
          show_when_status: sectionForm.show_when_status === 'always' ? null : sectionForm.show_when_status,
        });
        setSections(prev => prev.map(s => s.id === editingSectionId ? updated : s));
      } else {
        // Create new section
        const created = await createSection(token, {
          title: sectionForm.title,
          description: sectionForm.description,
          order_index: sections.length,
          is_active: sectionForm.is_active,
          show_when_status: sectionForm.show_when_status === 'always' ? null : sectionForm.show_when_status,
        });
        setSections(prev => [...prev, created]);
      }

      setSaveStatus('success');
      setIsSectionDialogOpen(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save section:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this section? All questions in this section will also be deleted.')) return;

    try {
      await deleteSection(token, sectionId);
      setSections(prev => prev.filter(s => s.id !== sectionId));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to delete section:', error);
      setSaveStatus('error');
    }
  };

  const handleCreateQuestion = (sectionId: string) => {
    setQuestionForm({
      question_text: '',
      question_type: 'text',
      help_text: '',
      is_required: true,
      is_active: true,
      show_when_status: 'always',
      options: [],
      validation_rules: {},
      show_if_question_id: null,
      show_if_answer: null,
    });
    setSelectedSection(sections.find(s => s.id === sectionId) || null);
    setEditingQuestionId(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (sectionId: string, question: Question) => {
    setQuestionForm(question);
    setSelectedSection(sections.find(s => s.id === sectionId) || null);
    setEditingQuestionId(question.id);
    setIsQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!token || !selectedSection) return;

    try {
      setSaving(true);

      if (editingQuestionId) {
        // Update existing question
        const updated = await updateQuestion(token, editingQuestionId, {
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          help_text: questionForm.help_text,
          placeholder: questionForm.placeholder,
          is_required: questionForm.is_required,
          is_active: questionForm.is_active,
          options: questionForm.options,
          validation_rules: questionForm.validation_rules,
          show_when_status: questionForm.show_when_status,
          template_file_id: questionForm.template_file_id,
          show_if_question_id: questionForm.show_if_question_id,
          show_if_answer: questionForm.show_if_answer,
        });

        setSections(prev =>
          prev.map(section =>
            section.id === selectedSection.id
              ? {
                  ...section,
                  questions: section.questions.map(q =>
                    q.id === editingQuestionId ? updated : q
                  ),
                }
              : section
          )
        );
      } else {
        // Create new question
        const created = await createQuestion(token, {
          section_id: selectedSection.id,
          question_text: questionForm.question_text!,
          question_type: questionForm.question_type!,
          help_text: questionForm.help_text,
          placeholder: questionForm.placeholder,
          is_required: questionForm.is_required!,
          is_active: questionForm.is_active!,
          order_index: selectedSection.questions.length,
          options: questionForm.options,
          validation_rules: questionForm.validation_rules,
          show_when_status: questionForm.show_when_status,
          template_file_id: questionForm.template_file_id,
          show_if_question_id: questionForm.show_if_question_id,
          show_if_answer: questionForm.show_if_answer,
        });

        setSections(prev =>
          prev.map(section =>
            section.id === selectedSection.id
              ? { ...section, questions: [...section.questions, created] }
              : section
          )
        );
      }

      setSaveStatus('success');
      setIsQuestionDialogOpen(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save question:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (sectionId: string, questionId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteQuestion(token, questionId);
      setSections(prev =>
        prev.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            questions: section.questions.filter(q => q.id !== questionId),
          };
        })
      );
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to delete question:', error);
      setSaveStatus('error');
    }
  };

  const handleDuplicateQuestion = async (sectionId: string, questionId: string) => {
    if (!token) return;

    try {
      setSaving(true);
      const duplicatedQuestion = await duplicateQuestion(token, questionId);

      // Add the duplicated question to the section
      setSections(prev =>
        prev.map(section => {
          if (section.id !== sectionId) return section;

          // Find the index of the original question
          const originalIndex = section.questions.findIndex(q => q.id === questionId);

          // Insert the duplicated question right after the original
          const newQuestions = [...section.questions];
          newQuestions.splice(originalIndex + 1, 0, duplicatedQuestion);

          return {
            ...section,
            questions: newQuestions,
          };
        })
      );

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const moveSectionUp = async (index: number) => {
    if (!token || index === 0) return;

    try {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      newSections.forEach((s, i) => s.order_index = i);
      setSections(newSections);

      // Save new order to backend
      await reorderSections(token, newSections.map(s => s.id));
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      // Reload sections on error
      const data = await getSections(token, true);
      setSections(data);
    }
  };

  const moveSectionDown = async (index: number) => {
    if (!token || index === sections.length - 1) return;

    try {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      newSections.forEach((s, i) => s.order_index = i);
      setSections(newSections);

      // Save new order to backend
      await reorderSections(token, newSections.map(s => s.id));
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      // Reload sections on error
      const data = await getSections(token, true);
      setSections(data);
    }
  };

  const moveQuestionUp = async (sectionId: string, questionIndex: number) => {
    if (!token || questionIndex === 0) return;

    try {
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      const section = sections[sectionIndex];
      const newQuestions = [...section.questions];

      // Swap questions
      [newQuestions[questionIndex - 1], newQuestions[questionIndex]] =
        [newQuestions[questionIndex], newQuestions[questionIndex - 1]];

      // Update order_index
      newQuestions.forEach((q, i) => q.order_index = i);

      // Update state
      const newSections = [...sections];
      newSections[sectionIndex] = { ...section, questions: newQuestions };
      setSections(newSections);

      // Save new order to backend
      await reorderQuestions(token, newQuestions.map(q => q.id));
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      // Reload sections on error
      const data = await getSections(token, true);
      setSections(data);
    }
  };

  const moveQuestionDown = async (sectionId: string, questionIndex: number) => {
    if (!token) return;

    try {
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      const section = sections[sectionIndex];
      if (questionIndex === section.questions.length - 1) return;

      const newQuestions = [...section.questions];

      // Swap questions
      [newQuestions[questionIndex], newQuestions[questionIndex + 1]] =
        [newQuestions[questionIndex + 1], newQuestions[questionIndex]];

      // Update order_index
      newQuestions.forEach((q, i) => q.order_index = i);

      // Update state
      const newSections = [...sections];
      newSections[sectionIndex] = { ...section, questions: newQuestions };
      setSections(newSections);

      // Save new order to backend
      await reorderQuestions(token, newQuestions.map(q => q.id));
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      // Reload sections on error
      const data = await getSections(token, true);
      setSections(data);
    }
  };

  // Drag and drop handlers for questions
  const handleQuestionDragStart = (sectionId: string, questionIndex: number) => {
    setDraggedQuestion({ sectionId, questionIndex });
  };

  const handleQuestionDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleQuestionDrop = async (targetSectionId: string, targetIndex: number) => {
    if (!draggedQuestion || !token) return;

    // Can't drag between different sections
    if (draggedQuestion.sectionId !== targetSectionId) {
      setDraggedQuestion(null);
      return;
    }

    const { sectionId, questionIndex: sourceIndex } = draggedQuestion;

    // Same position, no change
    if (sourceIndex === targetIndex) {
      setDraggedQuestion(null);
      return;
    }

    try {
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      const section = sections[sectionIndex];
      const newQuestions = [...section.questions];

      // Remove from source position
      const [movedQuestion] = newQuestions.splice(sourceIndex, 1);

      // Insert at target position
      newQuestions.splice(targetIndex, 0, movedQuestion);

      // Update order_index for all questions
      newQuestions.forEach((q, i) => q.order_index = i);

      // Update state
      const newSections = [...sections];
      newSections[sectionIndex] = { ...section, questions: newQuestions };
      setSections(newSections);

      // Save new order to backend
      await reorderQuestions(token, newQuestions.map(q => q.id));
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      // Reload sections on error
      const data = await getSections(token, true);
      setSections(data);
    } finally {
      setDraggedQuestion(null);
    }
  };

  const handleQuestionDragEnd = () => {
    setDraggedQuestion(null);
  };

  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt),
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

  // Helper function to get conditional logic information for a question
  const getConditionalLogicInfo = (question: Question) => {
    console.log('Checking conditional logic for:', question.question_text, {
      show_if_question_id: question.show_if_question_id,
      show_if_answer: question.show_if_answer
    });

    if (!question.show_if_question_id || !question.show_if_answer) {
      return null;
    }

    // Find the trigger question across all sections
    for (const section of sections) {
      const triggerQuestion = section.questions.find(q => q.id === question.show_if_question_id);
      if (triggerQuestion) {
        console.log('Found conditional logic:', {
          question: question.question_text,
          trigger: triggerQuestion.question_text,
          answer: question.show_if_answer
        });
        return {
          triggerQuestion,
          triggerAnswer: question.show_if_answer,
          sectionTitle: section.title
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Builder</h1>
          <p className="text-muted-foreground mt-1">
            Configure application sections and questions
          </p>
        </div>
        <Button onClick={handleCreateSection}>
          <Plus className="mr-2 h-4 w-4" />
          New Section
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Changes saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save changes. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection(section.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {index + 1}. {section.title}
                      </CardTitle>
                      {!section.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {section.show_when_status !== 'always' && (
                        <Badge variant="outline">
                          {visibilityOptions.find(v => v.value === section.show_when_status)?.label}
                        </Badge>
                      )}
                    </div>
                    {section.description && (
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSectionDown(index)}
                    disabled={index === sections.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSection(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedSections.has(section.id) && (
              <CardContent>
                <div className="space-y-3">
                  {section.questions.map((question, qIndex) => (
                    <div
                      key={question.id}
                      draggable
                      onDragStart={() => handleQuestionDragStart(section.id, qIndex)}
                      onDragOver={handleQuestionDragOver}
                      onDrop={() => handleQuestionDrop(section.id, qIndex)}
                      onDragEnd={handleQuestionDragEnd}
                      className={`flex items-start gap-3 p-3 bg-muted rounded-lg transition-all cursor-move ${
                        draggedQuestion?.sectionId === section.id && draggedQuestion?.questionIndex === qIndex
                          ? 'opacity-50 border-2 border-dashed border-camp-green'
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab active:cursor-grabbing" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {qIndex + 1}. {question.question_text}
                                {question.is_required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </p>
                              {!question.is_active && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                            {question.help_text && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {question.help_text}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {questionTypes.find(t => t.value === question.question_type)?.label}
                              </Badge>
                              {question.show_when_status !== 'always' && (
                                <Badge variant="outline" className="text-xs">
                                  {visibilityOptions.find(v => v.value === question.show_when_status)?.label}
                                </Badge>
                              )}
                              {question.options && question.options.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {question.options.length} options
                                </Badge>
                              )}
                              {(() => {
                                const conditionalInfo = getConditionalLogicInfo(question);
                                if (conditionalInfo) {
                                  return (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-50 border-blue-300 text-blue-700 flex items-center gap-1"
                                      title={`Shows if "${conditionalInfo.triggerQuestion.question_text}" = "${conditionalInfo.triggerAnswer}"`}
                                    >
                                      <GitBranch className="h-3 w-3" />
                                      Conditional
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            {(() => {
                              const conditionalInfo = getConditionalLogicInfo(question);
                              if (conditionalInfo) {
                                return (
                                  <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded border border-blue-200">
                                    <GitBranch className="h-3 w-3 inline mr-1" />
                                    Shows only if <span className="font-semibold">"{conditionalInfo.triggerQuestion.question_text}"</span> = <span className="font-semibold">"{conditionalInfo.triggerAnswer}"</span>
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestionUp(section.id, qIndex)}
                              disabled={qIndex === 0}
                              title="Move up"
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestionDown(section.id, qIndex)}
                              disabled={qIndex === section.questions.length - 1}
                              title="Move down"
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(section.id, question)}
                              title="Edit question"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateQuestion(section.id, question.id)}
                              disabled={saving}
                              title="Duplicate question"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(section.id, question.id)}
                              title="Delete question"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateQuestion(section.id)}
                    className="w-full mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSectionId ? 'Edit Section' : 'Create New Section'}
            </DialogTitle>
            <DialogDescription>
              Configure section details and visibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title *</Label>
              <Input
                id="section-title"
                value={sectionForm.title}
                onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Camper Information"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this section"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-visibility">When to Show</Label>
              <Select
                value={sectionForm.show_when_status}
                onValueChange={(value: any) =>
                  setSectionForm(prev => ({ ...prev, show_when_status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <div className="text-sm text-muted-foreground">
                  Section is visible to applicants
                </div>
              </div>
              <Switch
                checked={sectionForm.is_active}
                onCheckedChange={(checked) =>
                  setSectionForm(prev => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection} disabled={saving || !sectionForm.title}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Section'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionId ? 'Edit Question' : 'Create New Question'}
            </DialogTitle>
            <DialogDescription>
              Configure question details and validation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text *</Label>
              <Input
                id="question-text"
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="e.g., What is the camper's first name?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type *</Label>
              <Select
                value={questionForm.question_type}
                onValueChange={(value: any) =>
                  setQuestionForm(prev => ({ ...prev, question_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="help-text">Help Text</Label>
              <Textarea
                id="help-text"
                value={questionForm.help_text}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, help_text: e.target.value }))}
                placeholder="Additional guidance for applicants"
              />
            </div>

            {/* Options for dropdown/multiple_choice/checkbox */}
            {['dropdown', 'multiple_choice', 'checkbox'].includes(questionForm.question_type || '') && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {questionForm.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="question-visibility">When to Show</Label>
              <Select
                value={questionForm.show_when_status || 'always'}
                onValueChange={(value: any) =>
                  setQuestionForm(prev => ({ ...prev, show_when_status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Conditional Logic */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <Label className="text-blue-900 font-semibold">Conditional Logic</Label>
              </div>
              <p className="text-sm text-blue-700">
                Show this question only when a previous question has a specific answer
              </p>

              <div className="space-y-2">
                <Label htmlFor="conditional-question">Show only if...</Label>
                <Select
                  value={questionForm.show_if_question_id || 'none'}
                  onValueChange={(value) => {
                    setQuestionForm(prev => ({
                      ...prev,
                      show_if_question_id: value === 'none' ? null : value,
                      show_if_answer: value === 'none' ? null : prev.show_if_answer
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Always show (no condition)</SelectItem>
                    {sections.flatMap(section =>
                      section.questions
                        .filter(q => q.id !== editingQuestionId) // Don't show self
                        .filter(q => ['dropdown', 'multiple_choice', 'checkbox'].includes(q.question_type)) // Only questions with options
                        .map(q => (
                          <SelectItem key={q.id} value={q.id}>
                            {section.title} → {q.question_text}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {questionForm.show_if_question_id && questionForm.show_if_question_id !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="conditional-answer">...equals this answer:</Label>
                  {(() => {
                    const triggerQuestion = sections
                      .flatMap(s => s.questions)
                      .find(q => q.id === questionForm.show_if_question_id);

                    if (!triggerQuestion?.options || triggerQuestion.options.length === 0) {
                      return (
                        <Input
                          id="conditional-answer"
                          placeholder="Enter expected answer"
                          value={questionForm.show_if_answer || ''}
                          onChange={(e) =>
                            setQuestionForm(prev => ({ ...prev, show_if_answer: e.target.value }))
                          }
                        />
                      );
                    }

                    return (
                      <Select
                        value={questionForm.show_if_answer || ''}
                        onValueChange={(value) =>
                          setQuestionForm(prev => ({ ...prev, show_if_answer: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an answer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {triggerQuestion.options.map((option, idx) => (
                            <SelectItem key={idx} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                  <p className="text-xs text-blue-600">
                    This question will only appear when the selected question is answered with this value
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Required</Label>
                  <div className="text-sm text-muted-foreground">
                    Must be answered
                  </div>
                </div>
                <Switch
                  checked={questionForm.is_required}
                  onCheckedChange={(checked) =>
                    setQuestionForm(prev => ({ ...prev, is_required: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <div className="text-sm text-muted-foreground">
                    Visible to applicants
                  </div>
                </div>
                <Switch
                  checked={questionForm.is_active}
                  onCheckedChange={(checked) =>
                    setQuestionForm(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={saving || !questionForm.question_text}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
