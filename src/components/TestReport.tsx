import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_REPORTS = {
  junit: `<!DOCTYPE html>
<html>
<head>
    <title>JUnit Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .metric-label { color: #64748b; font-size: 0.9em; }
        .test-case { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
        .test-case.passed { border-left: 4px solid #10b981; }
        .test-case.failed { border-left: 4px solid #ef4444; }
        .test-case.skipped { border-left: 4px solid #f59e0b; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status.passed { background: #dcfce7; color: #166534; }
        .status.failed { background: #fecaca; color: #991b1b; }
        .status.skipped { background: #fef3c7; color: #92400e; }
        .duration { color: #6b7280; font-size: 0.9em; }
        .error-details { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Execution Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">15</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value">12</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value">2</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">1</div>
                <div class="metric-label">Skipped</div>
            </div>
            <div class="metric">
                <div class="metric-value">2.3s</div>
                <div class="metric-label">Duration</div>
            </div>
            <div class="metric">
                <div class="metric-value">80%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <h2>Test Cases</h2>
        
        <div class="test-case passed">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h3>testUserLogin</h3>
                <span class="status passed">PASSED</span>
            </div>
            <p>Verify user can login with valid credentials</p>
            <div class="duration">Duration: 0.45s</div>
        </div>

        <div class="test-case passed">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h3>testFormSubmission</h3>
                <span class="status passed">PASSED</span>
            </div>
            <p>Test contact form submission functionality</p>
            <div class="duration">Duration: 0.32s</div>
        </div>

        <div class="test-case failed">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h3>testNavigationMenu</h3>
                <span class="status failed">FAILED</span>
            </div>
            <p>Test navigation menu functionality</p>
            <div class="duration">Duration: 1.2s</div>
            <div class="error-details">
                <strong>AssertionError:</strong> Element not found: By.xpath("//nav//a[contains(text(), 'Services')]")<br>
                at AutomatedTest.testNavigationMenu(AutomatedTest.java:89)<br>
                Expected: element to be present<br>
                Actual: element not found
            </div>
        </div>

        <div class="test-case passed">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h3>testSearchFunctionality</h3>
                <span class="status passed">PASSED</span>
            </div>
            <p>Verify search feature works correctly</p>
            <div class="duration">Duration: 0.67s</div>
        </div>

        <div class="test-case skipped">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h3>testPaymentProcess</h3>
                <span class="status skipped">SKIPPED</span>
            </div>
            <p>Test payment processing (requires test environment)</p>
            <div class="duration">Duration: 0s</div>
        </div>
    </div>
</body>
</html>`,

  cypress: `<!DOCTYPE html>
<html>
<head>
    <title>Cypress Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #fafafa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17202a 0%, #69a3ff 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; }
        .stat-value { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .stat-value.success { color: #00c896; }
        .stat-value.error { color: #ff5722; }
        .stat-value.pending { color: #ffb74d; }
        .stat-label { color: #666; font-size: 0.9em; }
        .spec-file { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; }
        .spec-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e9ecef; }
        .spec-title { font-size: 1.2em; font-weight: bold; margin: 0; }
        .spec-meta { color: #666; font-size: 0.9em; margin-top: 5px; }
        .test-item { padding: 15px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
        .test-item:last-child { border-bottom: none; }
        .test-info { flex: 1; }
        .test-title { font-weight: 500; margin-bottom: 5px; }
        .test-duration { color: #666; font-size: 0.8em; }
        .test-status { padding: 6px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .test-status.passed { background: #e8f5e8; color: #2e7d32; }
        .test-status.failed { background: #ffebee; color: #c62828; }
        .test-status.pending { background: #fff3e0; color: #ef6c00; }
        .error-message { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin-top: 10px; font-family: monospace; font-size: 0.85em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌲 Cypress Test Results</h1>
            <p>Test run completed on ${new Date().toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value success">8</div>
                <div class="stat-label">Passing Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value error">1</div>
                <div class="stat-label">Failing Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value pending">1</div>
                <div class="stat-label">Pending Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">3.2s</div>
                <div class="stat-label">Total Duration</div>
            </div>
        </div>

        <div class="spec-file">
            <div class="spec-header">
                <div class="spec-title">login.spec.js</div>
                <div class="spec-meta">3 tests • 1.2s duration</div>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <div class="test-title">should display login form</div>
                    <div class="test-duration">Duration: 0.3s</div>
                </div>
                <span class="test-status passed">PASSED</span>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <div class="test-title">should login with valid credentials</div>
                    <div class="test-duration">Duration: 0.6s</div>
                </div>
                <span class="test-status passed">PASSED</span>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <div class="test-title">should show error for invalid credentials</div>
                    <div class="test-duration">Duration: 0.3s</div>
                </div>
                <span class="test-status passed">PASSED</span>
            </div>
        </div>

        <div class="spec-file">
            <div class="spec-header">
                <div class="spec-title">navigation.spec.js</div>
                <div class="spec-meta">2 tests • 1.8s duration</div>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <div class="test-title">should navigate between pages</div>
                    <div class="test-duration">Duration: 0.8s</div>
                </div>
                <span class="test-status passed">PASSED</span>
            </div>
            <div class="test-item">
                <div class="test-info">
                    <div class="test-title">should highlight active menu item</div>
                    <div class="test-duration">Duration: 1.0s</div>
                    <div class="error-message">
                        AssertionError: Timed out retrying after 4000ms: Expected to find element: '.active-menu-item', but never found it.
                    </div>
                </div>
                <span class="test-status failed">FAILED</span>
            </div>
        </div>
    </div>
</body>
</html>`,

  playwright: `<!DOCTYPE html>
<html>
<head>
    <title>Playwright Test Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f6f8fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #4299e1; }
        .summary-number { font-size: 2em; font-weight: bold; color: #2d3748; }
        .summary-label { color: #718096; margin-top: 5px; }
        .browser-section { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; overflow: hidden; }
        .browser-header { background: #edf2f7; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
        .browser-icon { width: 24px; height: 24px; margin-right: 10px; }
        .browser-name { font-weight: bold; }
        .test-row { padding: 15px 20px; border-bottom: 1px solid #f7fafc; display: flex; align-items: center; justify-content: space-between; }
        .test-row:last-child { border-bottom: none; }
        .test-name { flex: 1; }
        .test-result { display: flex; align-items: center; gap: 10px; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
        .status-passed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #742a2a; }
        .status-skipped { background: #feebc8; color: #7b341e; }
        .duration { color: #718096; font-size: 0.9em; }
        .error-details { background: #fed7d7; border-left: 4px solid #e53e3e; padding: 15px; margin: 10px 20px; font-family: monospace; font-size: 0.85em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Playwright Test Report</h1>
            <p>Cross-browser testing results • ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-number">24</div>
                <div class="summary-label">Total Tests</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">21</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">2</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">1</div>
                <div class="summary-label">Skipped</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">4.7s</div>
                <div class="summary-label">Duration</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">87.5%</div>
                <div class="summary-label">Success Rate</div>
            </div>
        </div>

        <div class="browser-section">
            <div class="browser-header">
                <div class="browser-icon">🌐</div>
                <div class="browser-name">Chromium 119.0.6045.105</div>
            </div>
            <div class="test-row">
                <div class="test-name">User Authentication › should login successfully</div>
                <div class="test-result">
                    <span class="duration">1.2s</span>
                    <span class="status-badge status-passed">PASSED</span>
                </div>
            </div>
            <div class="test-row">
                <div class="test-name">User Authentication › should handle invalid credentials</div>
                <div class="test-result">
                    <span class="duration">0.8s</span>
                    <span class="status-badge status-passed">PASSED</span>
                </div>
            </div>
            <div class="test-row">
                <div class="test-name">Navigation › should navigate to all pages</div>
                <div class="test-result">
                    <span class="duration">2.1s</span>
                    <span class="status-badge status-failed">FAILED</span>
                </div>
            </div>
            <div class="error-details">
                Error: expect(locator).toBeVisible()<br><br>
                Locator: page.locator('.navigation-menu')<br>
                Expected: visible<br>
                Received: hidden<br><br>
                Call log:<br>
                - expect.toBeVisible with timeout 5000ms<br>
                - waiting for locator('.navigation-menu')<br>
                - locator resolved to &lt;div class="navigation-menu" style="display: none"&gt;...&lt;/div&gt;<br>
                - unexpected value "hidden"
            </div>
        </div>

        <div class="browser-section">
            <div class="browser-header">
                <div class="browser-icon">🦊</div>
                <div class="browser-name">Firefox 119.0</div>
            </div>
            <div class="test-row">
                <div class="test-name">User Authentication › should login successfully</div>
                <div class="test-result">
                    <span class="duration">1.4s</span>
                    <span class="status-badge status-passed">PASSED</span>
                </div>
            </div>
            <div class="test-row">
                <div class="test-name">User Authentication › should handle invalid credentials</div>
                <div class="test-result">
                    <span class="duration">0.9s</span>
                    <span class="status-badge status-passed">PASSED</span>
                </div>
            </div>
            <div class="test-row">
                <div class="test-name">Navigation › should navigate to all pages</div>
                <div class="test-result">
                    <span class="duration">1.8s</span>
                    <span class="status-badge status-passed">PASSED</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
};

export function TestReport() {
  const [reportType, setReportType] = useState<keyof typeof SAMPLE_REPORTS>('junit');
  const [htmlContent, setHtmlContent] = useState(SAMPLE_REPORTS.junit);

  const handleReportTypeChange = (type: keyof typeof SAMPLE_REPORTS) => {
    setReportType(type);
    setHtmlContent(SAMPLE_REPORTS[type]);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${reportType}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  const handleRefreshReport = () => {
    // Simulate report refresh
    toast.info('Refreshing report...');
    setTimeout(() => {
      setHtmlContent(SAMPLE_REPORTS[reportType]);
      toast.success('Report refreshed');
    }, 1000);
  };

  const handleViewFullscreen = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Card className="flex-1 m-4 border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Test Execution Report</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={reportType} onValueChange={handleReportTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junit">JUnit</SelectItem>
                  <SelectItem value="cypress">Cypress</SelectItem>
                  <SelectItem value="playwright">Playwright</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefreshReport}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewFullscreen}>
                <Eye className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
              <Button variant="default" size="sm" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {reportType.toUpperCase()} Format
            </Badge>
            <Badge variant="outline" className="text-xs">
              Generated: {new Date().toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-full border rounded-md overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="Test Report"
              sandbox="allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}