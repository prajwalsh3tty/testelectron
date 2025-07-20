import { useEffect, useState } from 'react';

interface TestReportPanelProps {
  isActive: boolean;
  isrunSeleniumCodeFetching: boolean;
  isrunSeleniumCodeSuccess: boolean;
  isrunSeleniumCodeError: boolean;
  htmlReport: string;
}

export function TestReportPanel({ isActive, htmlReport, isrunSeleniumCodeFetching, isrunSeleniumCodeSuccess, isrunSeleniumCodeError }: TestReportPanelProps) {
  const [htmlContent, setHtmlContent] = useState('');


  useEffect(() => {
    if (isrunSeleniumCodeSuccess && !isrunSeleniumCodeError) {

      setTimeout(() => {
        setHtmlContent(htmlReport);
      }, 2000);
    }

    // const loadHtmlContent = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);

    //     // Import the HTML file as raw text
    //     // This requires moving the file to public/ or configuring your bundler
    //     const response = await fetch('/cucumber-reports.html', {
    //       headers: {
    //         'Accept': 'text/html,text/plain,*/*'
    //       }
    //     });

    //     if (!response.ok) {
    //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    //     }

    //     const contentType = response.headers.get('content-type');
    //     if (contentType && contentType.includes('text/html') && response.url.includes('localhost:5173')) {
    //       // If we're getting the React app instead of the HTML file
    //       throw new Error('HTML file not found - getting React app instead');
    //     }

    //     const content = await response.text();

    //     // Check if we accidentally got the React app
    //     if (content.includes('<!DOCTYPE html>') && content.includes('id="root"')) {
    //       throw new Error('Got React app instead of cucumber report');
    //     }

    //     setHtmlContent(content);
    //   } catch (err) {
    //     console.error('Fetch failed, trying alternative method:', err);

    //     // Alternative: Try to import as a module (requires ?raw or ?url suffix)
    //     try {
    //       // This approach works if you configure your bundler to handle .html files
    //       const htmlModule = await import('../assets/cucumber-reports.html?raw');
    //       setHtmlContent(htmlModule.default);
    //     } catch (importErr) {
    //       console.error('Import failed:', importErr);
    //       setError('Could not load cucumber report. Please ensure the file exists and is accessible.');
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // if (isActive) {
    //   loadHtmlContent();
    // }
  }, [isActive, isrunSeleniumCodeFetching, isrunSeleniumCodeSuccess]);

  if (!isActive) {
    return null;
  }

  if (isrunSeleniumCodeFetching) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading test report...</div>
      </div>
    );
  }

  if (isrunSeleniumCodeError) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <div className="mb-2">Error loading test report</div>
          {/* <div className="text-sm mb-4">{error}</div> */}
          {/* <div className="text-xs text-gray-500">

          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-1">
      <div className="border rounded-md h-[calc(100%-2rem)] overflow-hidden bg-white">
        <iframe
          src={htmlContent}
          className="w-full h-full border-0"
          title="Test Report"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}