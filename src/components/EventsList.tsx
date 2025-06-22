import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RecordedEvent } from '@/types/recorder';
import { Clock, Mouse, Keyboard, Send, Globe } from 'lucide-react';

interface EventsListProps {
  events: RecordedEvent[];
}

export function EventsList({ events }: EventsListProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <Mouse className="h-3 w-3" />;
      case 'input':
      case 'change':
        return <Keyboard className="h-3 w-3" />;
      case 'submit':
        return <Send className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'click':
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400';
      case 'input':
      case 'change':
        return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400';
      case 'submit':
        return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No events recorded yet</p>
          <p className="text-xs">Start recording to capture user interactions</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-2 pb-4">
        {events.map((event, index) => (
          <Card key={index} className="p-3 hover:bg-accent/50 transition-colors">
            <CardContent className="p-0">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className={`text-xs ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                  <span className="ml-1 capitalize">{event.type}</span>
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.selector}</p>
                  {event.text && (
                    <p className="text-xs text-muted-foreground truncate">
                      Text: "{event.text}"
                    </p>
                  )}
                  {event.value && (
                    <p className="text-xs text-muted-foreground truncate">
                      Value: "{event.value}"
                    </p>
                  )}
                  {event.context && (
                    <p className="text-xs text-muted-foreground truncate">
                      Context: {event.context.type}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}