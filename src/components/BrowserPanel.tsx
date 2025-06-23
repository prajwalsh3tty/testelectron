import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen } from 'lucide-react';

interface BrowserPanelProps {
  webviewRef: React.RefObject<HTMLWebViewElement>;
  isLeftPanelCollapsed: boolean;
  toggleLeftPanel: () => void;
}

export function BrowserPanel({ webviewRef, isLeftPanelCollapsed, toggleLeftPanel }: BrowserPanelProps) {
  return (
    <div className="h-full relative">
      {isLeftPanelCollapsed && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLeftPanel}
            className="bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-accent/80 transition-all duration-200"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      )}
      <webview
        ref={webviewRef}
        src="about:blank"
        className="w-full h-full"
        webpreferences="allowtransparency=true,nodeIntegration=false, contextIsolation=false, webSecurity=false, allowRunningInsecureContent=true"
      />
    </div>
  );
}