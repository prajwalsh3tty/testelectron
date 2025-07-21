import { useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';
import { Separator } from '@/components/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { useUserStore } from '@/stores/user-store';
import {
  useProjects,
  useAddProject,
  useUpdateProject,
  useDeleteProject,
  Project as APIProject,
} from '../api/project-api';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Filter,
  FolderOpen,
  Settings,
  MoreHorizontal,
  Eye,
  Calendar,
  Tag,
  Archive,
  CheckCircle,
  FileText,
  Folder,
  Activity,
  TestTube2,
  ArrowRight
} from 'lucide-react';
import { useRef } from 'react';

interface ProjectLibraryProps {
  onSelectProject: (project: APIProject) => void;
}

const PROJECT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500'
];

export function ProjectLibrary({ onSelectProject }: ProjectLibraryProps) {
  const email = useUserStore((s) => s.email);
  const userId = email || '';
  const { data: projects = [], refetch, isLoading, error } = useProjects(userId);
  const addProjectMutation = useAddProject();
  const updateProjectMutation = useUpdateProject(userId);
  const deleteProjectMutation = useDeleteProject(userId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<APIProject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<APIProject>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<APIProject | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSaveProject = () => {
    if (!editingProject.name?.trim()) return;
    const payload = {
      userId,
      name: editingProject.name.trim(),
      description: editingProject.description || '',
      tags: editingProject.tags || [],
      colorCode: editingProject.colorCode || '',
    };
    if (editingProject.id) {
      updateProjectMutation.mutate({
        projectId: editingProject.id,
        name: payload.name,
        description: payload.description,
        tags: payload.tags,
        colorCode: payload.colorCode,
      }, { onSuccess: () => { setIsEditDialogOpen(false); setEditingProject({}); refetch(); } });
    } else {
      addProjectMutation.mutate(payload, { onSuccess: () => { setIsEditDialogOpen(false); setEditingProject({}); refetch(); } });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId, { onSuccess: refetch });
  };

  const handleEditProject = (project: APIProject) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleViewProject = (project: APIProject) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (project: APIProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800';
      case 'archived':
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'archived':
        return <Archive className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // UI rendering
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingProject({});
                setIsEditDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-destructive">{String(error)}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Folder className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No projects found</p>
              <p className="text-xs">Create your first project to get started</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onSelectProject(project)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${project.colorCode || 'bg-blue-500'} flex items-center justify-center text-white font-semibold text-sm`}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                          {project.name}
                          <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(project);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteClick(project)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <TestTube2 className="h-3 w-3" />
                        <span>{project.tests?.length ?? 0} tests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{project.tests?.reduce((sum, t) => sum + (t.steps?.length ?? 0), 0) ?? 0} steps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(project.updatedAt ?? Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(project.status ?? 'active')}`}>
                        {getStatusIcon(project.status ?? 'active')}
                        <span className="ml-1 capitalize">{project.status ?? 'active'}</span>
                      </Badge>
                      {project.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.tags.slice(0, 2).join(', ')}
                            {project.tags.length > 2 && '...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {editingProject.id ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={editingProject.name || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={editingProject.description || ''}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                placeholder="Describe what this project is for..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="project-tags">Tags (comma separated)</Label>
              <Input
                id="project-tags"
                value={editingProject.tags?.join(', ') || ''}
                onChange={(e) => setEditingProject({
                  ...editingProject,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="web, mobile, api, regression"
              />
            </div>
            <div>
              <Label>Project Color</Label>
              <div className="flex gap-2 mt-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg ${color} border-2 ${editingProject.colorCode === color ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setEditingProject({ ...editingProject, colorCode: color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={!editingProject.name?.trim() || addProjectMutation.isLoading || updateProjectMutation.isLoading}>
                {editingProject.id ? (updateProjectMutation.isLoading ? 'Updating...' : 'Update Project') : (addProjectMutation.isLoading ? 'Creating...' : 'Create Project')}
              </Button>
            </div>
            {(addProjectMutation.error || updateProjectMutation.error) && (
              <div className="text-destructive text-xs">
                {String(addProjectMutation.error || updateProjectMutation.error)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedProject.status ?? 'active')}`}>
                      {getStatusIcon(selectedProject.status ?? 'active')}
                      <span className="ml-1 capitalize">{selectedProject.status ?? 'active'}</span>
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project Color</Label>
                    <div className={`w-6 h-6 rounded-lg ${selectedProject.colorCode} mt-1`}></div>
                  </div>
                </div>
                {selectedProject.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
                  </div>
                )}
                {selectedProject.tags?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProject.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="mt-1">{selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="mt-1">{selectedProject.updatedAt ? new Date(selectedProject.updatedAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      {/* AlertDialog outside DropdownMenu for reliability */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This will also delete all tests and collections within this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (projectToDelete) handleDeleteProject(projectToDelete.id); setDeleteDialogOpen(false); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}