import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen } from 'lucide-react';

interface BrowserPanelProps {
  webviewRef: React.RefObject<HTMLWebViewElement>;
  isLeftPanelCollapsed: boolean;
  toggleLeftPanel: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onWebviewLoad?: () => void;
}

export function BrowserPanel({ 
  webviewRef, 
  isLeftPanelCollapsed, 
  toggleLeftPanel, 
  isLoading, 
  setIsLoading,
  onWebviewLoad 
}: BrowserPanelProps) {
  const [isScriptInjected, setIsScriptInjected] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const lastInjectedUrl = useRef<string>('');
  
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      // Reset injection status when navigation starts
      setIsScriptInjected(false);
      lastInjectedUrl.current = '';
    };

    const handleLoadStop = () => {
      setIsLoading(false);
      const newUrl = webview.src;
      setCurrentUrl(newUrl);
      
      // Only inject script if URL has changed and we haven't injected for this URL
      if (newUrl && newUrl !== lastInjectedUrl.current && newUrl !== 'about:blank') {
        setTimeout(() => {
          onWebviewLoad?.();
        }, 500); // Small delay to ensure page is fully loaded
      }
    };

    const handleDomReady = () => {
      setIsLoading(false);
      const newUrl = webview.src;
      setCurrentUrl(newUrl);
      
      // Only inject script if URL has changed and we haven't injected for this URL
      if (newUrl && newUrl !== lastInjectedUrl.current && newUrl !== 'about:blank') {
        setTimeout(() => {
          onWebviewLoad?.();
        }, 100);
      }
    };

    const handleFailLoad = (e: any) => {
      console.error('Webview failed to load:', e);
      setIsLoading(false);
      setIsScriptInjected(false);
    };

    const handleNavigationStart = () => {
      // Reset injection status when navigation starts
      setIsScriptInjected(false);
      lastInjectedUrl.current = '';
    };

    // Add event listeners
    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-fail-load', handleFailLoad);
    webview.addEventListener('did-start-navigation', handleNavigationStart);

    return () => {
      // Cleanup event listeners
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('did-fail-load', handleFailLoad);
      webview.removeEventListener('did-start-navigation', handleNavigationStart);
    };
  }, [webviewRef, setIsLoading, onWebviewLoad]);

  // Expose injection control methods
  useEffect(() => {
    if (webviewRef.current) {
      // Add custom methods to webview ref for external control
      (webviewRef.current as any).injectScript = () => {
        const webview = webviewRef.current;
        if (webview && webview.src && webview.src !== 'about:blank' && !isScriptInjected) {
          const currentPageUrl = webview.src;
          
          // Only inject if we haven't already injected for this URL
          if (currentPageUrl !== lastInjectedUrl.current) {
            onWebviewLoad?.();
            setIsScriptInjected(true);
            lastInjectedUrl.current = currentPageUrl;
          }
        }
      };

      (webviewRef.current as any).isScriptInjected = () => isScriptInjected;
      (webviewRef.current as any).getCurrentUrl = () => currentUrl;
    }
  }, [isScriptInjected, currentUrl, onWebviewLoad]);

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
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm">Loading page...</span>
          </div>
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