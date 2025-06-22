import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { testStorage } from '@/lib/test-storage';
import { RecordedEvent, TestStep, SavedTest, Project } from '@/types/recorder';

interface SaveTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: RecordedEvent[];
  testSteps: TestStep[];
  url: string;
  currentProject: Project | null;
  onTestSaved: (test: SavedTest) => void;
}

export function SaveTestDialog({
  open,
  onOpenChange,
  events,
  testSteps,
  url,
  currentProject,
  onTestSaved
}: SaveTestDialogProps) {
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testType, setTestType] = useState<'Monkey' | 'Functional'>('Functional');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (!testName.trim() || !currentProject) return;

    const savedTest: SavedTest = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: testName.trim(),
      description: testDescription.trim(),
      url,
      steps: testSteps,
      events,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      testType,
      projectId: currentProject.id
    };

    testStorage.saveTest(savedTest);
    onTestSaved(savedTest);
    onOpenChange(false);
    
    // Reset form
    setTestName('');
    setTestDescription('');
    setTags('');
    setTestType('Functional');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-name">Test Name *</Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
              />
            </div>
            <div>
              <Label htmlFor="test-type">Test Type</Label>
              <Select value={testType} onValueChange={(value: 'Monkey' | 'Functional') => setTestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Functional">Functional</SelectItem>
                  <SelectItem value="Monkey">Monkey</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="test-description">Description</Label>
            <Textarea
              id="test-description"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              placeholder="Describe what this test does..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="test-tags">Tags (comma separated)</Label>
            <Input
              id="test-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="login, smoke, regression"
            />
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Project:</strong> {currentProject?.name}<br />
              <strong>URL:</strong> {url}<br />
              <strong>Events:</strong> {events.length}<br />
              <strong>Steps:</strong> {testSteps.length}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!testName.trim() || !currentProject}>
              Save Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}