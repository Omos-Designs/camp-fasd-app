'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemConfig {
  application: {
    applicationWindowOpen: boolean;
    applicationStartDate: string;
    applicationEndDate: string;
    maxApplications: number;
    requireEmailVerification: boolean;
  };
  notifications: {
    sendApplicationConfirmation: boolean;
    sendStatusUpdates: boolean;
    adminNotificationEmail: string;
    notifyOnNewApplication: boolean;
  };
  files: {
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
    requireDocumentUpload: boolean;
  };
  security: {
    enableRateLimiting: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number; // in minutes
    requireTwoFactor: boolean;
  };
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    application: {
      applicationWindowOpen: true,
      applicationStartDate: '',
      applicationEndDate: '',
      maxApplications: 100,
      requireEmailVerification: true,
    },
    notifications: {
      sendApplicationConfirmation: true,
      sendStatusUpdates: true,
      adminNotificationEmail: '',
      notifyOnNewApplication: true,
    },
    files: {
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      requireDocumentUpload: true,
    },
    security: {
      enableRateLimiting: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      requireTwoFactor: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setConfig(data);

      // Simulated load
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load config:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      // TODO: Replace with actual API call
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config),
      // });

      // Simulated save
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage application-wide settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="application" className="space-y-4">
        <TabsList>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="files">File Upload</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Window</CardTitle>
              <CardDescription>
                Control when users can submit applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Application Window Open</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow new applications to be submitted
                  </div>
                </div>
                <Switch
                  checked={config.application.applicationWindowOpen}
                  onCheckedChange={(checked) =>
                    updateConfig('application', 'applicationWindowOpen', checked)
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={config.application.applicationStartDate}
                    onChange={(e) =>
                      updateConfig('application', 'applicationStartDate', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={config.application.applicationEndDate}
                    onChange={(e) =>
                      updateConfig('application', 'applicationEndDate', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxApplications">Maximum Applications</Label>
                <Input
                  id="maxApplications"
                  type="number"
                  min="0"
                  value={config.application.maxApplications}
                  onChange={(e) =>
                    updateConfig('application', 'maxApplications', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Set to 0 for unlimited applications
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <div className="text-sm text-muted-foreground">
                    Users must verify their email before applying
                  </div>
                </div>
                <Switch
                  checked={config.application.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    updateConfig('application', 'requireEmailVerification', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure automatic email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Application Confirmation</Label>
                  <div className="text-sm text-muted-foreground">
                    Email users when they submit an application
                  </div>
                </div>
                <Switch
                  checked={config.notifications.sendApplicationConfirmation}
                  onCheckedChange={(checked) =>
                    updateConfig('notifications', 'sendApplicationConfirmation', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Status Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Email users when their application status changes
                  </div>
                </div>
                <Switch
                  checked={config.notifications.sendStatusUpdates}
                  onCheckedChange={(checked) =>
                    updateConfig('notifications', 'sendStatusUpdates', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify on New Application</Label>
                  <div className="text-sm text-muted-foreground">
                    Send notification to admins when a new application is submitted
                  </div>
                </div>
                <Switch
                  checked={config.notifications.notifyOnNewApplication}
                  onCheckedChange={(checked) =>
                    updateConfig('notifications', 'notifyOnNewApplication', checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Notification Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={config.notifications.adminNotificationEmail}
                  onChange={(e) =>
                    updateConfig('notifications', 'adminNotificationEmail', e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Email address to receive admin notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Upload Settings</CardTitle>
              <CardDescription>
                Configure file upload restrictions and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={config.files.maxFileSize}
                  onChange={(e) =>
                    updateConfig('files', 'maxFileSize', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Maximum size for uploaded files
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.files.allowedFileTypes.map((type) => (
                    <div
                      key={type}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      .{type}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  File types that can be uploaded
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Document Upload</Label>
                  <div className="text-sm text-muted-foreground">
                    Users must upload required documents to submit application
                  </div>
                </div>
                <Switch
                  checked={config.files.requireDocumentUpload}
                  onCheckedChange={(checked) =>
                    updateConfig('files', 'requireDocumentUpload', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Rate Limiting</Label>
                  <div className="text-sm text-muted-foreground">
                    Limit request frequency to prevent abuse
                  </div>
                </div>
                <Switch
                  checked={config.security.enableRateLimiting}
                  onCheckedChange={(checked) =>
                    updateConfig('security', 'enableRateLimiting', checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) =>
                    updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Number of failed login attempts before account lockout
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={config.security.sessionTimeout}
                  onChange={(e) =>
                    updateConfig('security', 'sessionTimeout', parseInt(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Time before user session expires
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Require 2FA for admin users
                  </div>
                </div>
                <Switch
                  checked={config.security.requireTwoFactor}
                  onCheckedChange={(checked) =>
                    updateConfig('security', 'requireTwoFactor', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
