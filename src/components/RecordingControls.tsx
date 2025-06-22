import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Save, Trash2, Globe, Loader2 } from 'lucide-react';

interface RecordingControlsProps {
  url: string;
  onUrlChange: (url: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearEvents: () => void;
  onSaveTest: () => void;
  eventsCount: number;
  currentProject: any;
}

export function RecordingControls({
  url,
  onUrlChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  onClearEvents,
  onSaveTest,
  eventsCount,
  currentProject
}: RecordingControlsProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Test Recorder
          {isRecording && (
            <Badge variant="destructive" className="ml-2 animate-pulse">
              Recording
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Target URL</label>
          <Input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Enter URL to test..."
            disabled={isRecording}
          />
        </div>

        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              onClick={onStartRecording} 
              className="flex-1"
              disabled={!url.trim()}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={onStopRecording} 
              variant="destructive" 
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClearEvents}
            disabled={eventsCount === 0}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear ({eventsCount})
          </Button>
          <Button
            onClick={onSaveTest}
            disabled={eventsCount === 0 || !currentProject}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Test
          </Button>
        </div>

        {currentProject && (
          <div className="text-sm text-muted-foreground">
            Project: <span className="font-medium">{currentProject.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}