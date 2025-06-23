import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastInjectedUrl = useRef<string>('');
  const maxRetries = 3;
  
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
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
      setError(null);
      setRetryCount(0); // Reset retry count on successful load
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
      
      // Handle different error types
      const errorCode = e.errorCode;
      const errorDescription = e.errorDescription || 'Unknown error';
      const validatedUrl = e.validatedURL || webview.src;
      
      let userFriendlyMessage = '';
      
      switch (errorCode) {
        case -3: // ERR_ABORTED
          userFriendlyMessage = 'Page loading was cancelled. This might be due to network issues or the page redirecting.';
          break;
        case -2: // ERR_FAILED
          userFriendlyMessage = 'Failed to load the page. Please check the URL and your internet connection.';
          break;
        case -105: // ERR_NAME_NOT_RESOLVED
          userFriendlyMessage = 'Could not resolve the domain name. Please check the URL spelling.';
          break;
        case -106: // ERR_INTERNET_DISCONNECTED
          userFriendlyMessage = 'No internet connection. Please check your network settings.';
          break;
        case -118: // ERR_CONNECTION_TIMED_OUT
          userFriendlyMessage = 'Connection timed out. The server might be slow or unreachable.';
          break;
        case -200: // ERR_CERT_COMMON_NAME_INVALID
        case -201: // ERR_CERT_DATE_INVALID
        case -202: // ERR_CERT_AUTHORITY_INVALID
          userFriendlyMessage = 'SSL certificate error. The site might not be secure.';
          break;
        default:
          userFriendlyMessage = `Failed to load page: ${errorDescription} (Error ${errorCode})`;
      }
      
      setError(userFriendlyMessage);
      
      // Auto-retry for certain errors (but not for SSL errors or name resolution)
      if (retryCount < maxRetries && ![3, -105, -200, -201, -202].includes(errorCode)) {
        setTimeout(() => {
          console.log(`Retrying load (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          webview.reload();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    };

    const handleNavigationStart = () => {
      // Reset injection status when navigation starts
      setIsScriptInjected(false);
      lastInjectedUrl.current = '';
      setError(null);
    };

    const handleNewWindow = (e: any) => {
      // Handle popup windows by loading them in the same webview
      e.preventDefault();
      const newUrl = e.url;
      if (newUrl && isValidUrl(newUrl)) {
        webview.src = newUrl;
      }
    };

    const handlePermissionRequest = (e: any) => {
      // Handle permission requests (camera, microphone, etc.)
      if (e.permission === 'media' || e.permission === 'geolocation') {
        e.request.allow();
      } else {
        e.request.deny();
      }
    };

    // Add event listeners
    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-fail-load', handleFailLoad);
    webview.addEventListener('did-start-navigation', handleNavigationStart);
    webview.addEventListener('new-window', handleNewWindow);
    webview.addEventListener('permission-request', handlePermissionRequest);

    return () => {
      // Cleanup event listeners
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('did-fail-load', handleFailLoad);
      webview.removeEventListener('did-start-navigation', handleNavigationStart);
      webview.removeEventListener('new-window', handleNewWindow);
      webview.removeEventListener('permission-request', handlePermissionRequest);
    };
  }, [webviewRef, setIsLoading, onWebviewLoad, retryCount]);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

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
      (webviewRef.current as any).retryLoad = () => {
        setError(null);
        setRetryCount(0);
        webviewRef.current?.reload();
      };
    }
  }, [isScriptInjected, currentUrl, onWebviewLoad]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    webviewRef.current?.reload();
  };

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
      
      {/* Error display */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-96 max-w-[calc(100%-2rem)]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2 h-6 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm">Loading page...</span>
            {retryCount > 0 && (
              <span className="text-xs text-muted-foreground">
                (Retry {retryCount}/{maxRetries})
              </span>
            )}
          </div>
        </div>
      )}
      
      <webview
        ref={webviewRef}
        src="about:blank"
        className="w-full h-full"
        webpreferences="allowtransparency=true,nodeIntegration=false,contextIsolation=false,webSecurity=false,allowRunningInsecureContent=true,experimentalFeatures=true"
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        partition="persist:webview"
      />
    </div>
  );
}