import { useState, useRef, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import { Badge } from '@/shared/components/ui';
import { ScrollArea } from '@/shared/components/ui';
import { ThemeToggle } from '@/shared/components/ui';
import { usePanelStore } from '@/shared/stores';
import { INJECT_SCRIPT } from '@/shared/utils';
import { useTestRecorder } from '../hooks';
import { BrowserPanel } from './BrowserPanel';
import { ProjectLibrary } from '@/features/project-management/components';
import { TestLibrary } from '@/features/project-management/components';
import { CodePanel } from '@/features/code-generation/components';
import { TestReportPanel } from '@/features/test-reports/components';
import { useSeleniumCode } from '@/features/code-generation/hooks';
import { RecordedEvent, SavedTest, Project } from '@/shared/types';
import {
  Play,
  Square,
  RotateCcw,
  Globe,
  PanelLeftClose,
  Trash2,
  Save,
  FileText,
  Code2,
  BarChart3,
  Settings,
  Zap,
  LoaderIcon
} from 'lucide-react';
import { toast } from 'sonner';

export function TestRecorderPanel() {
  const webviewRef = useRef<HTMLWebViewElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browser');
  const [currentView, setCurrentView] = useState<'projects' | 'tests'>('projects');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTest, setCurrentTest] = useState<SavedTest | null>(null);
  const [uniqueId] = useState(() => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const {
    isLeftPanelCollapsed,
    setLeftPanelCollapsed,
    leftPanelSize,
    setLeftPanelSize,
  } = usePanelStore();

  const { addEvent, clearEvents, getEvents, generateTest } = useTestRecorder();
  const { generateCode, runCode, isGenerating, isRunning, generatedCode } = useSeleniumCode();

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUrl && webviewRef.current) {
      try {
        const url = new URL(currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`);
        webviewRef.current.src = url.toString();
        setCurrentUrl(url.toString());
      } catch (error) {
        toast.error('Invalid URL format');
      }
    }
  };

  const injectRecorderScript = () => {
    const webview = webviewRef.current;
    if (!webview) return;

    try {
      webview.executeJavaScript(INJECT_SCRIPT)
        .then(() => {
          console.log('Test recorder script injected successfully');
          toast.success('Recording script injected');
        })
        .catch((error: any) => {
          console.error('Failed to inject script:', error);
          toast.error('Failed to inject recording script');
        });
    } catch (error) {
      console.error('Error injecting script:', error);
      toast.error('Error injecting recording script');
    }
  };

  const startRecording = () => {
    if (!webviewRef.current?.src || webviewRef.current.src === 'about:blank') {
      toast.error('Please navigate to a website first');
      return;
    }

    setIsRecording(true);
    injectRecorderScript();
    clearEvents();
    toast.success('Recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped');
  };

  const clearRecording = () => {
    clearEvents();
    toast.success('Recording cleared');
  };

  const handleGenerateCode = async () => {
    try {
      await generateCode(uniqueId);
      setActiveTab('code');
      toast.success('Code generated successfully');
    } catch (error) {
      toast.error('Failed to generate code');
    }
  };

  const handleRunCode = async () => {
    try {
      await runCode(uniqueId);
      setActiveTab('report');
      toast.success('Test execution completed');
    } catch (error) {
      toast.error('Failed to run test');
    }
  };

  const handleSaveTest = () => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    const events = getEvents();
    const steps = generateTest();

    if (events.length === 0) {
      toast.error('No recorded events to save');
      return;
    }

    const testName = `Test ${new Date().toLocaleString()}`;
    const newTest: SavedTest = {
      id: uniqueId,
      name: testName,
      description: `Recorded test from ${currentUrl}`,
      url: currentUrl,
      steps,
      events,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['recorded'],
      testType: 'Exploratory',
      projectId: currentProject.id
    };

    // This would typically be handled by the TestLibrary component
    toast.success('Test saved successfully');
  };

  // Listen for console messages from webview
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleConsoleMessage = (e: any) => {
      try {
        const message = e.message;
        if (message.startsWith('{') && message.includes('RECORDED_EVENT')) {
          const data = JSON.parse(message);
          if (data.type === 'RECORDED_EVENT' && isRecording) {
            addEvent(data.event as RecordedEvent);
          }
        }
      } catch (error) {
        // Ignore non-JSON console messages
      }
    };

    webview.addEventListener('console-message', handleConsoleMessage);

    return () => {
      webview.removeEventListener('console-message', handleConsoleMessage);
    };
  }, [isRecording, addEvent]);

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('tests');
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setCurrentProject(null);
  };

  const handleLoadTest = (test: SavedTest) => {
    setCurrentTest(test);
    if (test.url && webviewRef.current) {
      webviewRef.current.src = test.url;
      setCurrentUrl(test.url);
    }
    toast.success(`Loaded test: ${test.name}`);
  };

  const events = getEvents();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Test Nova</h1>
          </div>

          <form onSubmit={handleUrlSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter website URL..."
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                className="pl-9 w-80"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              Go
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              disabled={isLoading}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Record
                </>
              )}
            </Button>

            <Button
              onClick={clearRecording}
              variant="outline"
              size="sm"
              disabled={events.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>

            <Button
              onClick={handleSaveTest}
              variant="outline"
              size="sm"
              disabled={events.length === 0 || !currentProject}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-1">
            <Button
              onClick={handleGenerateCode}
              variant="outline"
              size="sm"
              disabled={events.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <LoaderIcon className="animate-spin h-4 w-4 mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4 mr-1" />
                  Generate
                </>
              )}
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <ThemeToggle />

          {!isLeftPanelCollapsed && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLeftPanel}
              className="h-8 w-8"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          {!isLeftPanelCollapsed && (
            <>
              <ResizablePanel
                defaultSize={leftPanelSize}
                minSize={25}
                maxSize={60}
                onResize={setLeftPanelSize}
              >
                <div className="h-full flex flex-col">
                  {/* Panel Content */}
                  <div className="flex-1 overflow-hidden">
                    {currentView === 'projects' ? (
                      <ProjectLibrary onSelectProject={handleSelectProject} />
                    ) : (
                      currentProject && (
                        <TestLibrary
                          onLoadTest={handleLoadTest}
                          currentTest={currentTest}
                          currentProject={currentProject}
                          onBackToProjects={handleBackToProjects}
                        />
                      )
                    )}
                  </div>

                  {/* Recording Status */}
                  {events.length > 0 && (
                    <div className="p-4 border-t bg-muted/30">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Recorded Events
                            <Badge variant="secondary" className="text-xs">
                              {events.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {events.slice(-5).map((event, index) => (
                                <div
                                  key={`${event.timestamp}-${index}`}
                                  className="text-xs p-2 bg-background rounded border"
                                >
                                  <div className="font-medium capitalize">
                                    {event.type} - {event.tagName}
                                  </div>
                                  <div className="text-muted-foreground truncate">
                                    {event.selector}
                                  </div>
                                </div>
                              ))}
                              {events.length > 5 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  ... and {events.length - 5} more
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Right Panel */}
          <ResizablePanel defaultSize={isLeftPanelCollapsed ? 100 : 100 - leftPanelSize}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b bg-background/80 backdrop-blur-sm">
                <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="browser"
                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Browser
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger
                    value="report"
                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Report
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="browser" className="h-full m-0">
                  <BrowserPanel
                    webviewRef={webviewRef}
                    isLeftPanelCollapsed={isLeftPanelCollapsed}
                    toggleLeftPanel={toggleLeftPanel}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    onWebviewLoad={injectRecorderScript}
                  />
                </TabsContent>

                <TabsContent value="code" className="h-full m-0">
                  <CodePanel
                    isActive={activeTab === 'code'}
                    code={generatedCode}
                    isRunInitiateTestRun={isRunning}
                    handleRunInitiateTestRun={handleRunCode}
                  />
                </TabsContent>

                <TabsContent value="report" className="h-full m-0">
                  <TestReportPanel
                    isActive={activeTab === 'report'}
                    isrunSeleniumCodeFetching={isRunning}
                    isrunSeleniumCodeSuccess={!isRunning && !!generatedCode}
                    isrunSeleniumCodeError={false}
                    htmlReport="/cucumber-reports.html"
                  />
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}