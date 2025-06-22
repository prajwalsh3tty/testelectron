import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface BrowserViewProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export const BrowserView = forwardRef<HTMLWebViewElement, BrowserViewProps>(
  ({ url, onUrlChange }, ref) => {
    const webviewRef = useRef<HTMLWebViewElement>(null);

    useImperativeHandle(ref, () => webviewRef.current!, []);

    const handleRefresh = () => {
      if (webviewRef.current) {
        webviewRef.current.reload();
      }
    };

    const handleBack = () => {
      if (webviewRef.current && webviewRef.current.canGoBack()) {
        webviewRef.current.goBack();
      }
    };

    const handleForward = () => {
      if (webviewRef.current && webviewRef.current.canGoForward()) {
        webviewRef.current.goForward();
      }
    };

    const handleHome = () => {
      onUrlChange('https://example.com');
    };

    const handleNavigate = () => {
      if (webviewRef.current) {
        webviewRef.current.src = url;
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNavigate();
      }
    };

    useEffect(() => {
      const webview = webviewRef.current;
      if (!webview) return;

      const handleDidNavigate = () => {
        if (webview.src !== url) {
          onUrlChange(webview.src);
        }
      };

      webview.addEventListener('did-navigate', handleDidNavigate);
      webview.addEventListener('did-navigate-in-page', handleDidNavigate);

      return () => {
        webview.removeEventListener('did-navigate', handleDidNavigate);
        webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
      };
    }, [url, onUrlChange]);

    return (
      <div className="h-full flex flex-col bg-background">
        {/* Browser Controls */}
        <div className="flex items-center gap-2 p-2 border-b bg-card">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleForward}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleHome}>
            <Home className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex gap-2">
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter URL..."
              className="flex-1"
            />
            <Button onClick={handleNavigate} size="sm">
              Go
            </Button>
          </div>
        </div>

        {/* WebView */}
        <div className="flex-1 relative">
          <webview
            ref={webviewRef}
            src={url}
            className="w-full h-full"
            allowpopups="true"
            webpreferences="contextIsolation=false, nodeIntegration=true"
          />
        </div>
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';