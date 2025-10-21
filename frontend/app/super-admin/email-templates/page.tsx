'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Eye,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'application_confirmation' | 'status_update' | 'acceptance' | 'rejection' | 'custom';
  variables: string[];
  isActive: boolean;
  lastModified: string;
}

const templateTypes = [
  { value: 'application_confirmation', label: 'Application Confirmation' },
  { value: 'status_update', label: 'Status Update' },
  { value: 'acceptance', label: 'Application Accepted' },
  { value: 'rejection', label: 'Application Rejected' },
  { value: 'custom', label: 'Custom Template' },
];

const availableVariables = [
  { key: '{{firstName}}', description: "Applicant's first name" },
  { key: '{{lastName}}', description: "Applicant's last name" },
  { key: '{{email}}', description: "Applicant's email" },
  { key: '{{applicationId}}', description: 'Application ID' },
  { key: '{{submissionDate}}', description: 'Date application was submitted' },
  { key: '{{status}}', description: 'Current application status' },
  { key: '{{reviewerName}}', description: "Reviewer's name" },
  { key: '{{campYear}}', description: 'Camp year' },
  { key: '{{nextSteps}}', description: 'Next steps information' },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Application Received',
      subject: 'Application Received - Camp FASD {{campYear}}',
      body: `Dear {{firstName}} {{lastName}},\n\nThank you for submitting your application for Camp FASD {{campYear}}. We have received your application and will review it shortly.\n\nYour Application ID: {{applicationId}}\nSubmission Date: {{submissionDate}}\n\nYou can check the status of your application at any time by logging into your dashboard.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nThe Camp FASD Team`,
      type: 'application_confirmation',
      variables: ['{{firstName}}', '{{lastName}}', '{{campYear}}', '{{applicationId}}', '{{submissionDate}}'],
      isActive: true,
      lastModified: '2025-01-15',
    },
    {
      id: '2',
      name: 'Application Accepted',
      subject: 'Congratulations! Your Application Has Been Accepted',
      body: `Dear {{firstName}},\n\nWe are pleased to inform you that your application for Camp FASD {{campYear}} has been accepted!\n\nWe were impressed with your application and believe you would be an excellent fit for our program.\n\nNext Steps:\n{{nextSteps}}\n\nWe look forward to welcoming you to Camp FASD!\n\nBest regards,\n{{reviewerName}}\nThe Camp FASD Team`,
      type: 'acceptance',
      variables: ['{{firstName}}', '{{campYear}}', '{{nextSteps}}', '{{reviewerName}}'],
      isActive: true,
      lastModified: '2025-01-15',
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate>>({});

  const handleCreateNew = () => {
    setEditingTemplate({
      name: '',
      subject: '',
      body: '',
      type: 'custom',
      variables: [],
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      // TODO: Replace with actual API call
      // await fetch('/api/admin/email-templates', {
      //   method: editingTemplate.id ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingTemplate),
      // });

      // Simulated save
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingTemplate.id) {
        setTemplates(prev =>
          prev.map(t => (t.id === editingTemplate.id ? { ...t, ...editingTemplate } as EmailTemplate : t))
        );
      } else {
        const newTemplate = {
          ...editingTemplate,
          id: Date.now().toString(),
          lastModified: new Date().toISOString().split('T')[0],
        } as EmailTemplate;
        setTemplates(prev => [...prev, newTemplate]);
      }

      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save template:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/email-templates/${id}`, { method: 'DELETE' });

      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingTemplate.body || '';
    const newText = text.substring(0, start) + variable + text.substring(end);

    setEditingTemplate(prev => ({
      ...prev,
      body: newText,
    }));

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const getPreviewContent = (template: EmailTemplate) => {
    let preview = template.body;
    preview = preview.replace(/{{firstName}}/g, 'John');
    preview = preview.replace(/{{lastName}}/g, 'Doe');
    preview = preview.replace(/{{email}}/g, 'john.doe@example.com');
    preview = preview.replace(/{{applicationId}}/g, 'APP-2025-001');
    preview = preview.replace(/{{submissionDate}}/g, new Date().toLocaleDateString());
    preview = preview.replace(/{{status}}/g, 'Under Review');
    preview = preview.replace(/{{reviewerName}}/g, 'Admin User');
    preview = preview.replace(/{{campYear}}/g, '2025');
    preview = preview.replace(/{{nextSteps}}/g, '1. Complete registration form\n2. Submit medical documents\n3. Pay deposit');
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage email templates for application communications
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Template saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save template. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {templateTypes.find(t => t.value === template.type)?.label}
                    </Badge>
                  </div>
                  <CardDescription className="font-medium">
                    Subject: {template.subject}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground">
                    Last modified: {template.lastModified}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                {template.body}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate.id ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Design your email template using the available variables
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={editingTemplate.name || ''}
                  onChange={(e) =>
                    setEditingTemplate(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Select
                  value={editingTemplate.type}
                  onValueChange={(value) =>
                    setEditingTemplate(prev => ({ ...prev, type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={editingTemplate.subject || ''}
                onChange={(e) =>
                  setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))
                }
                placeholder="e.g., Your Application Status Update"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-body">Email Body</Label>
              <Textarea
                id="template-body"
                value={editingTemplate.body || ''}
                onChange={(e) =>
                  setEditingTemplate(prev => ({ ...prev, body: e.target.value }))
                }
                placeholder="Enter your email template here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Variables</CardTitle>
                <CardDescription className="text-xs">
                  Click to insert into template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableVariables.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.key)}
                      className="font-mono text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      {variable.key}
                    </Button>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="space-y-1">
                  {availableVariables.map((variable) => (
                    <div key={variable.key} className="text-xs">
                      <span className="font-mono font-medium">{variable.key}</span>
                      <span className="text-muted-foreground"> - {variable.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              Preview with sample data
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {getPreviewContent({ ...selectedTemplate, body: selectedTemplate.subject })}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Body</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                  {getPreviewContent(selectedTemplate)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
