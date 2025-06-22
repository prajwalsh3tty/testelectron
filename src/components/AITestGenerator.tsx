import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Brain, Zap } from 'lucide-react';
import { Project } from '@/types/recorder';

interface AITestGeneratorProps {
  onGenerateTest: (description: string, testType: 'Monkey' | 'Functional') => Promise<void>;
  isGenerating: boolean;
  currentProject: Project | null;
}

const SAMPLE_PROMPTS = [
  "Test user login with valid credentials",
  "Fill out contact form and submit",
  "Navigate through main menu items",
  "Search for products and view results",
  "Add items to cart and checkout",
  "Test responsive navigation menu",
  "Verify form validation errors",
  "Test user registration flow"
];

export function AITestGenerator({ onGenerateTest, isGenerating, currentProject }: AITestGeneratorProps) {
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState<'Monkey' | 'Functional'>('Functional');

  const handleGenerate = async () => {
    if (!description.trim()) return;
    await onGenerateTest(description, testType);
  };

  const handleUseSamplePrompt = (prompt: string) => {
    setDescription(prompt);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Test Generator
          <Badge variant="secondary" className="ml-2">
            <Brain className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Test Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to test (e.g., 'Test user login with valid credentials')"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Test Type</Label>
          <Select value={testType} onValueChange={(value: 'Monkey' | 'Functional') => setTestType(value)}>
            <SelectTrigger disabled={isGenerating}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Functional">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Functional Testing
                </div>
              </SelectItem>
              <SelectItem value="Monkey">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Monkey Testing
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating || !currentProject}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating AI Test...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Test
            </>
          )}
        </Button>

        {!currentProject && (
          <p className="text-xs text-muted-foreground text-center">
            Please select a project to generate AI tests
          </p>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Sample Prompts</Label>
          <div className="grid grid-cols-1 gap-1">
            {SAMPLE_PROMPTS.slice(0, 4).map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-auto py-1 px-2"
                onClick={() => handleUseSamplePrompt(prompt)}
                disabled={isGenerating}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}