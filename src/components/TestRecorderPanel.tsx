import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { testRecorder } from '@/lib/test-recorder';
import { testStorage } from '@/lib/test-storage';
import { INJECT_SCRIPT } from '@/lib/inject-script';
import { EventType, RecordedEvent, SavedTest, Project } from '@/types/recorder';
import { ProjectLibrary } from '@/components/ProjectLibrary';
import { TestLibrary } from '@/components/TestLibrary';
import { BrowserView } from '@/components/BrowserView';
import { RecordingControls } from '@/components/RecordingControls';
import { EventsList } from '@/components/EventsList';
import { TestStepsList } from '@/components/TestStepsList';
import { SaveTestDialog } from '@/components/SaveTestDialog';
import { AITestGenerator } from '@/components/AITestGenerator';
import { CodeEditor } from '@/components/CodeEditor';
import { TestReport } from '@/components/TestReport';
import {
  Play,
  Square,
  Save,
  Trash2,
  Globe,
  FolderOpen,
  TestTube2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code,
  FileBarChart,
} from 'lucide-react';
import { toast } from 'sonner';

export function TestRecorderPanel() {
  const [url, setUrl] = useState('https://example.com');
  const [isRecording, setIsRecording] = useState(false);
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const [currentTest, setCurrentTest] = useState<SavedTest | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectLibrary, setShowProjectLibrary] = useState(true);
  const [showTestLibrary, setShowTestLibrary] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('browser');
  const webviewRef = useRef<HTMLWebViewElement>(null);

  useEffect(() => {
    const handleConsoleMessage = (event: any) => {
      try {
        const message = event.message;
        if (message.startsWith('{') && message.includes('RECORDED_EVENT')) {
          const data = JSON.parse(message);
          if (data.type === 'RECORDED_EVENT') {
            const recordedEvent: RecordedEvent = {
              ...data.event,
              type: data.event.type as EventType,
            };
            testRecorder.addEvent(recordedEvent);
            setEvents(testRecorder.getEvents());
          }
        }
      } catch (error) {
        console.error('Error parsing console message:', error);
      }
    };

    const webview = webviewRef.current;
    if (webview) {
      webview.addEventListener('console-message', handleConsoleMessage);
      return () => {
        webview.removeEventListener('console-message', handleConsoleMessage);
      };
    }
  }, []);

  const handleStartRecording = async () => {
    if (!webviewRef.current) return;
    
    setIsRecording(true);
    testRecorder.clearEvents();
    setEvents([]);
    
    try {
      await webviewRef.current.executeJavaScript(INJECT_SCRIPT);
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to inject script:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped');
  };

  const handleClearEvents = () => {
    testRecorder.clearEvents();
    setEvents([]);
    toast.success('Events cleared');
  };

  const handleSaveTest = () => {
    if (events.length === 0) {
      toast.error('No events to save');
      return;
    }
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleTestSaved = (savedTest: SavedTest) => {
    setCurrentTest(savedTest);
    toast.success('Test saved successfully');
  };

  const handleLoadTest = (test: SavedTest) => {
    setCurrentTest(test);
    setEvents(test.events);
    testRecorder.clearEvents();
    test.events.forEach(event => testRecorder.addEvent(event));
    setUrl(test.url);
    toast.success(`Test "${test.name}" loaded`);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setShowProjectLibrary(false);
    setShowTestLibrary(true);
  };

  const handleBackToProjects = () => {
    setShowProjectLibrary(true);
    setShowTestLibrary(false);
    setCurrentProject(null);
  };

  const handleGenerateAITest = async (description: string, testType: 'Monkey' | 'Functional') => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Simulate AI generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI test based on description and type
      const aiGeneratedTest = await generateAITestScenario(description, testType, url);
      
      // Add generated events to recorder
      testRecorder.clearEvents();
      setEvents([]);
      
      aiGeneratedTest.events.forEach(event => {
        testRecorder.addEvent(event);
      });
      
      setEvents(testRecorder.getEvents());
      toast.success('AI test scenario generated successfully');
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate AI test scenario');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const testSteps = testRecorder.generateTest();

  return (
    <div className="h-screen flex flex-col bg-background">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel */}
        <ResizablePanel 
          defaultSize={25} 
          minSize={20} 
          maxSize={40}
          className={`transition-all duration-300 ${isLeftPanelCollapsed ? 'min-w-0' : ''}`}
          collapsible={true}
          onCollapse={() => setIsLeftPanelCollapsed(true)}
          onExpand={() => setIsLeftPanelCollapsed(false)}
        >
          {!isLeftPanelCollapsed && (
            <div className="h-full border-r bg-card">
              {showProjectLibrary && (
                <ProjectLibrary onSelectProject={handleSelectProject} />
              )}
              {showTestLibrary && currentProject && (
                <TestLibrary
                  onLoadTest={handleLoadTest}
                  currentTest={currentTest}
                  currentProject={currentProject}
                  onBackToProjects={handleBackToProjects}
                />
              )}
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Recording Controls and Events */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full flex flex-col bg-card border-r">
            {/* Recording Controls */}
            <RecordingControls
              url={url}
              onUrlChange={setUrl}
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onClearEvents={handleClearEvents}
              onSaveTest={handleSaveTest}
              eventsCount={events.length}
              currentProject={currentProject}
            />

            <Separator />

            {/* AI Test Generator */}
            <AITestGenerator
              onGenerateTest={handleGenerateAITest}
              isGenerating={isGeneratingAI}
              currentProject={currentProject}
            />

            <Separator />

            {/* Events and Steps */}
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs defaultValue="events" className="flex-1 flex flex-col">
                <div className="px-4 pt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="events" className="text-xs">
                      Events ({events.length})
                    </TabsTrigger>
                    <TabsTrigger value="steps" className="text-xs">
                      Steps ({testSteps.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="events" className="flex-1 mt-2">
                  <EventsList events={events} />
                </TabsContent>
                
                <TabsContent value="steps" className="flex-1 mt-2">
                  <TestStepsList steps={testSteps} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Browser View with Tabs */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col bg-background">
            <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
              <div className="border-b bg-card px-4 pt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="browser" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Browser
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="report" className="text-xs">
                    <FileBarChart className="h-3 w-3 mr-1" />
                    Report
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="browser" className="flex-1 mt-0">
                <BrowserView
                  ref={webviewRef}
                  url={url}
                  onUrlChange={setUrl}
                />
              </TabsContent>
              
              <TabsContent value="code" className="flex-1 mt-0">
                <CodeEditor />
              </TabsContent>
              
              <TabsContent value="report" className="flex-1 mt-0">
                <TestReport />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Collapse/Expand Button for Left Panel */}
      {isLeftPanelCollapsed && (
        <Button
          variant="outline"
          size="sm"
          className="fixed left-2 top-1/2 z-50 h-8 w-8 p-0"
          onClick={() => setIsLeftPanelCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Save Test Dialog */}
      <SaveTestDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        events={events}
        testSteps={testSteps}
        url={url}
        currentProject={currentProject}
        onTestSaved={handleTestSaved}
      />
    </div>
  );
}

// AI Test Generation Function
async function generateAITestScenario(
  description: string, 
  testType: 'Monkey' | 'Functional', 
  url: string
): Promise<{ events: RecordedEvent[] }> {
  // Simulate API call to AI service
  const prompt = `Generate a ${testType.toLowerCase()} test scenario for: ${description}
  Target URL: ${url}
  
  Please create realistic user interactions including clicks, form inputs, and navigation.`;

  // Mock AI-generated test scenarios based on description
  const scenarios = {
    login: [
      {
        type: EventType.Click,
        selector: '#login-button',
        xpath: '/html[1]/body[1]/div[1]/nav[1]/button[1]',
        tagName: 'button',
        timestamp: Date.now(),
        value: null,
        text: 'Login',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'input[name="email"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/input[1]',
        tagName: 'input',
        timestamp: Date.now() + 1000,
        value: 'test@example.com',
        placeholder: 'Enter your email',
        text: '',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'input[name="password"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/input[2]',
        tagName: 'input',
        timestamp: Date.now() + 2000,
        value: 'password123',
        placeholder: 'Enter your password',
        text: '',
        context: null
      },
      {
        type: EventType.Click,
        selector: 'button[type="submit"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/button[1]',
        tagName: 'button',
        timestamp: Date.now() + 3000,
        value: null,
        text: 'Sign In',
        context: null
      }
    ],
    form: [
      {
        type: EventType.Click,
        selector: '#contact-form',
        xpath: '/html[1]/body[1]/div[1]/section[1]/form[1]',
        tagName: 'form',
        timestamp: Date.now(),
        value: null,
        text: 'Contact Form',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'input[name="firstName"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/input[1]',
        tagName: 'input',
        timestamp: Date.now() + 1000,
        value: 'John',
        placeholder: 'First Name',
        text: '',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'input[name="lastName"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/input[2]',
        tagName: 'input',
        timestamp: Date.now() + 2000,
        value: 'Doe',
        placeholder: 'Last Name',
        text: '',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'textarea[name="message"]',
        xpath: '/html[1]/body[1]/div[1]/form[1]/textarea[1]',
        tagName: 'textarea',
        timestamp: Date.now() + 3000,
        value: 'This is a test message generated by AI.',
        placeholder: 'Your message',
        text: '',
        context: null
      },
      {
        type: EventType.Submit,
        selector: 'form#contact-form',
        xpath: '/html[1]/body[1]/div[1]/form[1]',
        tagName: 'form',
        timestamp: Date.now() + 4000,
        value: null,
        text: '',
        context: null
      }
    ],
    navigation: [
      {
        type: EventType.Click,
        selector: 'nav a[href="/about"]',
        xpath: '/html[1]/body[1]/nav[1]/a[2]',
        tagName: 'a',
        timestamp: Date.now(),
        value: null,
        text: 'About',
        context: null
      },
      {
        type: EventType.Click,
        selector: 'nav a[href="/services"]',
        xpath: '/html[1]/body[1]/nav[1]/a[3]',
        tagName: 'a',
        timestamp: Date.now() + 2000,
        value: null,
        text: 'Services',
        context: null
      },
      {
        type: EventType.Click,
        selector: 'nav a[href="/contact"]',
        xpath: '/html[1]/body[1]/nav[1]/a[4]',
        tagName: 'a',
        timestamp: Date.now() + 4000,
        value: null,
        text: 'Contact',
        context: null
      }
    ]
  };

  // Determine scenario based on description keywords
  let selectedScenario = scenarios.navigation; // default
  
  if (description.toLowerCase().includes('login') || description.toLowerCase().includes('auth')) {
    selectedScenario = scenarios.login;
  } else if (description.toLowerCase().includes('form') || description.toLowerCase().includes('contact')) {
    selectedScenario = scenarios.form;
  } else if (description.toLowerCase().includes('nav') || description.toLowerCase().includes('menu')) {
    selectedScenario = scenarios.navigation;
  }

  // For Monkey testing, add more random interactions
  if (testType === 'Monkey') {
    const monkeyEvents = [
      {
        type: EventType.Click,
        selector: 'button:nth-child(1)',
        xpath: '/html[1]/body[1]/div[1]/button[1]',
        tagName: 'button',
        timestamp: Date.now() + 5000,
        value: null,
        text: 'Random Button',
        context: null
      },
      {
        type: EventType.Input,
        selector: 'input[type="text"]:first',
        xpath: '/html[1]/body[1]/div[1]/input[1]',
        tagName: 'input',
        timestamp: Date.now() + 6000,
        value: 'Random text input',
        placeholder: 'Enter text',
        text: '',
        context: null
      }
    ];
    selectedScenario = [...selectedScenario, ...monkeyEvents];
  }

  return { events: selectedScenario as RecordedEvent[] };
}