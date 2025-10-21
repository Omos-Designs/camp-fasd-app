'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  members: TeamMember[];
  permissions: string[];
  createdAt: string;
}

const teamColors = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
];

const availablePermissions = [
  { value: 'view_applications', label: 'View Applications' },
  { value: 'edit_applications', label: 'Edit Applications' },
  { value: 'review_applications', label: 'Review Applications' },
  { value: 'approve_applications', label: 'Approve Applications' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'view_analytics', label: 'View Analytics' },
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'System Administrators',
      description: 'System administrators with full access',
      color: 'purple',
      memberCount: 0,
      members: [],
      permissions: ['view_applications', 'edit_applications', 'review_applications', 'approve_applications', 'manage_users', 'view_analytics'],
      createdAt: '2025-01-05',
    },
    {
      id: '2',
      name: 'Operations',
      description: 'Operations team managing day-to-day applications',
      color: 'blue',
      memberCount: 0,
      members: [],
      permissions: ['view_applications', 'edit_applications', 'review_applications'],
      createdAt: '2025-01-10',
    },
    {
      id: '3',
      name: 'Medical',
      description: 'Medical team reviewing health-related information',
      color: 'green',
      memberCount: 0,
      members: [],
      permissions: ['view_applications', 'edit_applications', 'review_applications'],
      createdAt: '2025-01-10',
    },
    {
      id: '4',
      name: 'Behavioral Health',
      description: 'Behavioral health team reviewing mental health information',
      color: 'orange',
      memberCount: 0,
      members: [],
      permissions: ['view_applications', 'edit_applications', 'review_applications'],
      createdAt: '2025-01-10',
    },
    {
      id: '5',
      name: 'LIT',
      description: 'Leaders in Training team',
      color: 'pink',
      memberCount: 0,
      members: [],
      permissions: ['view_applications'],
      createdAt: '2025-01-10',
    },
  ]);

  const [allUsers, setAllUsers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Team Lead' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Reviewer' },
    { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'Super Admin' },
    { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'Reviewer' },
    { id: '5', name: 'Alice Brown', email: 'alice@example.com', role: 'Coordinator' },
  ]);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<Team>>({});
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCreateNew = () => {
    setEditingTeam({
      name: '',
      description: '',
      color: 'blue',
      permissions: [],
      members: [],
    });
    setIsEditing(true);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsEditing(true);
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setSelectedMembers(team.members.map(m => m.id));
    setIsManagingMembers(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingTeam.id) {
        setTeams(prev =>
          prev.map(t => (t.id === editingTeam.id ? { ...t, ...editingTeam } as Team : t))
        );
      } else {
        const newTeam = {
          ...editingTeam,
          id: Date.now().toString(),
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString().split('T')[0],
        } as Team;
        setTeams(prev => [...prev, newTeam]);
      }

      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save team:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMembers = async () => {
    if (!selectedTeam) return;

    try {
      setSaving(true);
      setSaveStatus('idle');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedMembers = allUsers.filter(user => selectedMembers.includes(user.id));

      setTeams(prev =>
        prev.map(t =>
          t.id === selectedTeam.id
            ? { ...t, members: updatedMembers, memberCount: updatedMembers.length }
            : t
        )
      );

      setSaveStatus('success');
      setIsManagingMembers(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save members:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const togglePermission = (permission: string) => {
    setEditingTeam(prev => {
      const permissions = prev.permissions || [];
      const hasPermission = permissions.includes(permission);

      return {
        ...prev,
        permissions: hasPermission
          ? permissions.filter(p => p !== permission)
          : [...permissions, permission],
      };
    });
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getColorClass = (color: string) => {
    return teamColors.find(c => c.value === color)?.class || 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Organize users into teams and manage permissions
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
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

      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getColorClass(team.color)}`} />
                  <div className="space-y-1">
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{team.memberCount} members</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleManageMembers(team)}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Manage
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Permissions
                </div>
                <div className="flex flex-wrap gap-1">
                  {team.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {availablePermissions.find(p => p.value === permission)?.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {team.members.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Members</div>
                    <div className="flex flex-wrap gap-2">
                      {team.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.name}</span>
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="flex items-center justify-center p-2 rounded-md bg-muted text-xs text-muted-foreground">
                          +{team.members.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Team Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTeam.id ? 'Edit Team' : 'Create New Team'}
            </DialogTitle>
            <DialogDescription>
              Configure team details and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={editingTeam.name || ''}
                onChange={(e) =>
                  setEditingTeam(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Review Team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={editingTeam.description || ''}
                onChange={(e) =>
                  setEditingTeam(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of the team's purpose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-color">Team Color</Label>
              <Select
                value={editingTeam.color}
                onValueChange={(value) =>
                  setEditingTeam(prev => ({ ...prev, color: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.value}
                    className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                    onClick={() => togglePermission(permission.value)}
                  >
                    <span className="text-sm">{permission.label}</span>
                    <input
                      type="checkbox"
                      checked={editingTeam.permissions?.includes(permission.value) || false}
                      onChange={() => togglePermission(permission.value)}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>
            </div>
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
                'Save Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isManagingMembers} onOpenChange={setIsManagingMembers}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
            <DialogDescription>
              Add or remove members from {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                onClick={() => toggleMember(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="h-4 w-4"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingMembers(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMembers} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Members'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
