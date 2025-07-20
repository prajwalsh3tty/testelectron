import { useEffect, useState } from 'react';

interface TestReportProps {
  isActive: boolean;
  isrunSeleniumCodeFetching: boolean;
  isrunSeleniumCodeSuccess: boolean;
  isrunSeleniumCodeError: boolean;
  htmlReport: string;
}

export function TestReportPanel({ isActive, htmlReport, isrunSeleniumCodeFetching, isrunSeleniumCodeSuccess, isrunSeleniumCodeError }: TestReportProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (isrunSeleniumCodeSuccess && !isrunSeleniumCodeError) {
      setTimeout(() => {
        setHtmlContent(htmlReport);
      }, 2000);
    }
  }, [isActive, isrunSeleniumCodeFetching, isrunSeleniumCodeSuccess, htmlReport, isrunSeleniumCodeError]);

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