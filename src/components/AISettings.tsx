import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { aiService } from '@/lib/ai-service';
import { Settings, Key, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function AISettings() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('ai-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      aiService.setApiKey(savedKey);
      validateKey(savedKey);
    }
  }, []);

  const validateKey = async (key: string) => {
    if (!key.trim()) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    try {
      const valid = await aiService.validateApiKey(key);
      setIsValid(valid);
      if (valid) {
        toast.success('API key validated successfully');
      } else {
        toast.error('Invalid API key');
      }
    } catch (error) {
      setIsValid(false);
      toast.error('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    localStorage.setItem('ai-api-key', apiKey);
    aiService.setApiKey(apiKey);
    validateKey(apiKey);
    toast.success('API key saved');
  };

  const handleRemoveKey = () => {
    setApiKey('');
    setIsValid(null);
    localStorage.removeItem('ai-api-key');
    aiService.setApiKey('');
    toast.success('API key removed');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          AI Settings
          {isValid && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">OpenAI API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <div className="flex items-center">
                    {isValidating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    )}
                    {isValid === true && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                    {isValid === false && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveKey} disabled={isValidating}>
                  Save Key
                </Button>
                <Button variant="outline" onClick={() => validateKey(apiKey)} disabled={isValidating || !apiKey.trim()}>
                  Validate
                </Button>
                <Button variant="destructive" onClick={handleRemoveKey} disabled={!apiKey}>
                  Remove
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Note:</strong> Your API key is stored locally and never sent to our servers.
                </p>
                <p>
                  Don't have an API key? 
                  <Button variant="link" className="p-0 h-auto ml-1" asChild>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      Get one from OpenAI <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Scenario Generation</p>
                    <p className="text-sm text-muted-foreground">Generate test scenarios from natural language descriptions</p>
                  </div>
                  <Badge variant={isValid ? "default" : "secondary"}>
                    {isValid ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Smart Test Suggestions</p>
                    <p className="text-sm text-muted-foreground">Get AI-powered suggestions for improving your tests</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Data Generation</p>
                    <p className="text-sm text-muted-foreground">Generate realistic test data for forms and inputs</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isValid && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Fallback Mode:</strong> Without an API key, the AI generator will use predefined scenarios based on common patterns.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}