import { useState } from 'react';

interface TestReportPanelProps {
  isActive: boolean;
}

export function TestReportPanel({ isActive }: TestReportPanelProps) {
  const [htmlContent, setHtmlContent] = useState(`
    <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Test Execution Report</h1>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="margin: 0; color: #0369a1;">Total Tests</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #0369a1;">15</p>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="margin: 0; color: #15803d;">Passed</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #15803d;">12</p>
        </div>
        <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="margin: 0; color: #dc2626;">Failed</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #dc2626;">2</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center;">
          <h3 style="margin: 0; color: #d97706;">Skipped</h3>
          <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #d97706;">1</p>
        </div>
      </div>

      <h2 style="color: #374151; margin-top: 30px;">Test Results</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Test Case</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Status</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Duration</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Error Message</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">Login Test</td>
            <td style="padding: 12px;"><span style="color: #15803d; font-weight: 600;">✓ Passed</span></td>
            <td style="padding: 12px;">2.3s</td>
            <td style="padding: 12px;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">
            <td style="padding: 12px;">Form Submission</td>
            <td style="padding: 12px;"><span style="color: #15803d; font-weight: 600;">✓ Passed</span></td>
            <td style="padding: 12px;">1.8s</td>
            <td style="padding: 12px;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">Navigation Test</td>
            <td style="padding: 12px;"><span style="color: #dc2626; font-weight: 600;">✗ Failed</span></td>
            <td style="padding: 12px;">0.5s</td>
            <td style="padding: 12px; color: #dc2626;">Element not found: #navigation-menu</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">
            <td style="padding: 12px;">User Registration</td>
            <td style="padding: 12px;"><span style="color: #15803d; font-weight: 600;">✓ Passed</span></td>
            <td style="padding: 12px;">3.1s</td>
            <td style="padding: 12px;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">Password Reset</td>
            <td style="padding: 12px;"><span style="color: #d97706; font-weight: 600;">⚠ Skipped</span></td>
            <td style="padding: 12px;">0.0s</td>
            <td style="padding: 12px; color: #d97706;">Test environment not available</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">
            <td style="padding: 12px;">Data Validation</td>
            <td style="padding: 12px;"><span style="color: #15803d; font-weight: 600;">✓ Passed</span></td>
            <td style="padding: 12px;">1.2s</td>
            <td style="padding: 12px;">-</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">API Integration</td>
            <td style="padding: 12px;"><span style="color: #dc2626; font-weight: 600;">✗ Failed</span></td>
            <td style="padding: 12px;">5.0s</td>
            <td style="padding: 12px; color: #dc2626;">Connection timeout after 5 seconds</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">Test Summary</h3>
        <p style="margin: 5px 0;"><strong>Execution Time:</strong> 2 minutes 15 seconds</p>
        <p style="margin: 5px 0;"><strong>Success Rate:</strong> 80% (12/15 tests passed)</p>
        <p style="margin: 5px 0;"><strong>Environment:</strong> Chrome 120.0.6099.109 on Windows 11</p>
        <p style="margin: 5px 0;"><strong>Test Suite:</strong> Regression Test Suite v2.1</p>
        <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `);

  if (!isActive) {
    return null; // Don't render when not active to save resources
  }

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">HTML Content:</label>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="w-full h-32 p-2 border rounded-md text-sm font-mono bg-background resize-none"
          placeholder="Enter HTML content to render..."
        />
      </div>
      <div className="border rounded-md h-[calc(100%-180px)] overflow-auto bg-white">
        <div 
          className="p-4 h-full"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}