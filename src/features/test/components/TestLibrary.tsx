import { useTests, useAddTest, useUpdateTest, useDeleteTest } from '../api/test-api';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';
import { Separator } from '@/components/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/dropdown-menu';
import {
  Search,
  Plus,
  Play,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Filter,
  Clock,
  Globe,
  Code2,
  Tag,
  Archive,
  CheckCircle,
  FileText,
  MoreHorizontal,
  Eye,
  Settings,
  FolderOpen,
  Star,
  Calendar,
  ArrowLeft
} from 'lucide-react';

interface TestLibraryProps {
  onLoadTest: (test: any) => void;
  currentTest?: any | null;
  currentProject: any;
  onBackToProjects: () => void;
}

export function TestLibrary({ onLoadTest, currentTest, currentProject, onBackToProjects }: TestLibraryProps) {
  // API hooks
  const { data: tests = [], isLoading, isError, refetch } = useTests(currentProject.id);
  const addTest = useAddTest(currentProject.id);
  const updateTest = useUpdateTest(currentProject.id);
  const deleteTest = useDeleteTest(currentProject.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>({});

  // Remove useEffect and loadTests for testStorage

  const filteredTests = tests.filter(test => {
    const matchesSearch = (test.testName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (test.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (test.url?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(test.testType) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveTest = async () => {
    if (!editingTest.testName?.trim()) return;
    const payload = {
      projectId: currentProject.id,
      testType: editingTest.testType || 'Exploratory',
      testName: editingTest.testName,
      url: editingTest.url,
      description: editingTest.description,
      tags: editingTest.tags || [],
    };
    if (editingTest.id) {
      await updateTest.mutateAsync({ testId: editingTest.id, ...payload });
    } else {
      await addTest.mutateAsync(payload);
    }
    setIsEditDialogOpen(false);
    setEditingTest({});
  };

  const handleDeleteTest = async (testId: string) => {
    await deleteTest.mutateAsync(testId);
  };

  // Duplicate, import, export: keep as local for now

  const handleEditTest = (test: any) => {
    setEditingTest({ ...test });
    setIsEditDialogOpen(true);
  };

  const handleViewTest = (test: any) => {
    setSelectedTest(test);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'Exploratory':
        return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800';
      case 'Functional':
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800';
    }
  };

  // const getStatusIcon = (status: SavedTest['testType']) => {
  //   switch (status) {
  //     case 'ready':
  //       return <Exploratory className="h-3 w-3" />;
  //     case 'archived':
  //       return <Archive className="h-3 w-3" />;
  //     default:
  //       return <FileText className="h-3 w-3" />;
  //   }
  // };

  const exportTests = () => {
    // This functionality needs to be implemented using the API
    alert('Export functionality is not yet implemented via API.');
  };

  const importTests = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // This functionality needs to be implemented using the API
      alert('Import functionality is not yet implemented via API.');
    };
    reader.readAsText(file);
  };

  const stats = {
    totalTests: tests.length,
    readyTests: tests.filter(t => t.testType === 1).length,
    draftTests: tests.filter(t => t.testType === 2).length,
    totalSteps: tests.reduce((sum, test) => sum + (Array.isArray((test as any)?.steps) ? (test as any).steps.length : 0), 0),
  };

  return (
    <ScrollArea className="h-full flex flex-col">
      <div >
        {/* Header */}
        <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToProjects}
                className="h-8 px-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Projects
              </Button>
              {/* <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${currentProject.color || 'bg-blue-500'} flex items-center justify-center text-white text-xs font-semibold`}>
                {currentProject.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{currentProject.name}</h2>
                <p className="text-xs text-muted-foreground">Test Library</p>
              </div>
            </div> */}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTest({ projectId: currentProject.id });
                  setIsEditDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Test
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportTests}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Tests
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <label className="flex items-center cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Tests
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTests}
                        className="hidden"
                      />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-card rounded-lg border">
            <div className="text-lg font-semibold text-primary">{stats.totalTests}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-card rounded-lg border">
            <div className="text-lg font-semibold text-green-600">{stats.readyTests}</div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </div>
          <div className="text-center p-2 bg-card rounded-lg border">
            <div className="text-lg font-semibold text-yellow-600">{stats.draftTests}</div>
            <div className="text-xs text-muted-foreground">Draft</div>
          </div>
          <div className="text-center p-2 bg-card rounded-lg border">
            <div className="text-lg font-semibold text-blue-600">{stats.totalSteps}</div>
            <div className="text-xs text-muted-foreground">Steps</div>
          </div>
        </div> */}

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Exploratory">Exploratory</SelectItem>
                <SelectItem value="Functional">Functional</SelectItem>

              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : isError ? (
              <div className="flex items-center justify-center h-32 text-red-500">Failed to load tests</div>
            ) : filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No tests found</p>
                <p className="text-xs">Create your first test to get started</p>
              </div>
            ) : (
              filteredTests.map((test: any) => (
                <Card
                  key={test.id}
                  className={`hover:bg-accent/50 transition-colors cursor-pointer ${currentTest?.id === test.id ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                          {test.testName}
                          {/* {currentTest?.id === test.id && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )} */}
                        </CardTitle>
                        {test.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {test.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onLoadTest(test)}>
                            <Play className="h-4 w-4 mr-2" />
                            Load Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewTest(test)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTest(test)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {/* Duplicate removed for now (API does not support) */}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Test</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{test.testName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTest(test.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-24">{test.url || 'No URL'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          <span>{Array.isArray(test.steps) ? test.steps.length : 0} steps</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(test.testType)}`}>
                          <span className="ml-1 capitalize">{test.testType}</span>
                        </Badge>
                        {Array.isArray(test.tags) && test.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {test.tags.slice(0, 2).join(', ')}
                              {test.tags.length > 2 && '...'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadTest(test)}
                        className="h-6 px-2 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Load
                      </Button>
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
                {editingTest.id ? 'Edit Test' : 'Create New Test'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-name">Test Name *</Label>
                  <Input
                    id="test-name"
                    value={editingTest.testName || ''}
                    onChange={(e) => setEditingTest({ ...editingTest, testName: e.target.value })}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="test-status">Test type *</Label>
                  <Select
                    value={editingTest.testType || 'Exploratory'}
                    onValueChange={(value) => setEditingTest({ ...editingTest, testType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exploratory">Exploratory</SelectItem>
                      <SelectItem value="Functional">Functional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="test-url">URL *</Label>
                <Input
                  id="test-url"
                  value={editingTest.url || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="test-description">Description for AI generation *</Label>
                <Textarea
                  id="test-description"
                  value={editingTest.description || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                  placeholder="Describe what this test does..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="test-tags">Tags (comma separated)</Label>
                <Input
                  id="test-tags"
                  value={editingTest.tags?.join(', ') || ''}
                  onChange={(e) => setEditingTest({
                    ...editingTest,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="login, smoke, regression"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTest} disabled={!editingTest.testName?.trim() || !editingTest.description || editingTest?.testType}>
                  {editingTest.id ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedTest?.testName}
              </DialogTitle>
            </DialogHeader>
            {selectedTest && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedTest.testType)}`}>
                        {/* {getStatusIcon(selectedTest.testType)} */}
                        <span className="ml-1 capitalize">{selectedTest.testType}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">URL</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTest.url || 'No URL'}</p>
                    </div>
                  </div>

                  {selectedTest.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTest.description}</p>
                    </div>
                  )}

                  {Array.isArray(selectedTest?.tags) && selectedTest.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTest.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Test Steps ({Array.isArray(selectedTest?.steps) ? selectedTest.steps.length : 0})</Label>
                    <div className="space-y-2 mt-2">
                      {Array.isArray(selectedTest?.steps) && selectedTest.steps.map((step: any, index: number) => (
                        <Card key={step.id || index} className="p-3">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{step.description}</p>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                <code>{step.code}</code>
                              </pre>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="mt-1">{new Date(selectedTest.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="mt-1">{new Date(selectedTest.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}