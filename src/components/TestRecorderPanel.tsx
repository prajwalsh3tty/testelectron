import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProjectLibrary } from '@/components/ProjectLibrary';
import { TestLibrary } from '@/components/TestLibrary';
import { BrowserPanel } from '@/components/BrowserPanel';
import { CodePanel } from '@/components/CodePanel';
import { TestReportPanel } from '@/components/TestReportPanel';
import { testRecorder } from '@/lib/test-recorder';
import { testStorage } from '@/lib/test-storage';
import { RecordedEvent, TestStep, SavedTest, Project } from '@/types/recorder';
import { INJECT_SCRIPT } from '@/lib/inject-script';
import { usePanelStore } from '@/lib/store';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Play,
  Square,
  Code2,
  Copy,
  Globe,
  Bug,
  ChevronRight,
  MousePointer2,
  Keyboard,
  FileEdit,
  ExternalLink,
  Clock,
  List,
  TestTube2,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  LoaderIcon,
  Zap,
  X,
  Activity,
  Settings,
  Eye,
  RotateCcw,
  Save,
  FolderOpen,
  BookOpen,
  Folder,
  TestTubeDiagonal,
  Sparkles,
  FileCode,
  FileText,
  Sun,
  ArrowLeft,
  Code,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { Textarea } from '@/components/ui/textarea';
import { generateSeleniumCode, runSeleniumCode, SeleniumCodeResponse } from './services';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
      };
    };
  }
}

interface TimelineEvent {
  id: string;
  type: 'navigation' | 'click' | 'input' | 'change';
  title: string;
  timestamp: number;
  details?: Record<string, any>;
  icon: JSX.Element;
}

interface TimelineTab {
  id: string;
  name: string;
  events: TimelineEvent[];
}

export function TestRecorderPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<SavedTest | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [showTestTabs, setShowTestTabs] = useState(false);
  const [result, setResult] = useState("");
  const [fileId, setfileId] = useState("");

  // Timeline tabs state
  const [timelineTabs, setTimelineTabs] = useState<TimelineTab[]>([
    { id: 'event-1', name: 'Event 1', events: [] }
  ]);
  const [activeTimelineTab, setActiveTimelineTab] = useState('event-1');
  const [tabScrollPosition, setTabScrollPosition] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const [testHTMLReport, setTestHTMLReport] = useState("");
  const [isGenerateLoading, setisGenerateLoading] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('browser');
  const [promptText, setPromptText] = useState('');
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);

  const webviewRef = useRef<HTMLWebViewElement>(null);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScriptInjectedRef = useRef(false);
  const lastInjectedUrlRef = useRef<string>('');

  const {
    data: selenumCodeData,
    error: selenumCodeError,
    isLoading: isSelenumCodeLoading,
    isError: isSelenumCodeError,
    isSuccess: isSelenumCodeSuccess,
    refetch,
    isFetching: isSelenumCodeFetching
  } = useQuery<SeleniumCodeResponse, Error>({
    queryKey: ['seleniumCode', fileId],
    queryFn: () => generateSeleniumCode(fileId),
    enabled: false,
  });

  const {
    data: runSeleniumCodeData,
    error: runSeleniumCodeError,
    isLoading: isrunSeleniumCodeLoading,
    isError: isrunSeleniumCodeError,
    isSuccess: isrunSeleniumCodeSuccess,
    refetch: runSeleniumCodeRefetch,
    isFetching: isrunSeleniumCodeFetching
  } = useQuery<SeleniumCodeResponse, Error>({
    queryKey: ['runSeleniumCode', fileId],
    queryFn: () => runSeleniumCode(fileId),
    enabled: false,
  });

  useEffect(() => {
    if (isSelenumCodeSuccess && selenumCodeData?.result?.length) {
      setRightPanelTab('code')
    }
  }, [isSelenumCodeSuccess, selenumCodeData]);

  // First API mutation
  const initProcessMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://172.18.104.22:5001/api/TestNova/initprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Init process failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Init process successful:', data);
    },
    onError: (error) => {
      console.error('Init process failed:', error);
    },
  });

  // Second API mutation
  const generateFeatureMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://172.18.104.22:5001/api/TestNova/generatefeature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Generate feature failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Generate feature successful:', data);
    },
    onError: (error) => {
      console.error('Generate feature failed:', error);
    },
  });

  const sequentialMutation = useMutation({
    mutationFn: async () => {
      // Collect events from all tabs that have events
      const activities = timelineTabs
        .filter(tab => tab.events.length > 0)
        .map(tab => {
          const recordedEventsList = tab.events.map(recordedEvent => {
            const eventType = recordedEvent.type;
            const eventDetails = recordedEvent.details || {};
            const textContent = eventDetails.placeholder || eventDetails.text || '';
            const elementId = eventDetails.id || eventDetails.name || '';
            const elementPath = eventDetails.xpath || '';
            const parts = [eventType];

            if (textContent) {
              parts.push(`with text "${textContent}"`);
            }
            if (elementId) {
              parts.push(`on element "${elementId}"`);
            }
            if (elementPath) {
              parts.push(`at path: ${elementPath}`);
            }

            return parts.join(' ');
          });

          return {
            pageUrl: url,
            action: recordedEventsList,
            eventName: tab.name
          };
        });

      const initData = {
        requirements: currentTest?.description,
        activities: activities
      };

      setisGenerateLoading(true);
      setIsPromptDialogOpen(false);

      const initResult = await initProcessMutation.mutateAsync(initData);
      setfileId(initResult.result);

      const generateData = {
        fileId: initResult.result || "default-file-id",
        testingType: currentTest?.testType === 'Exploratory' ? 0 : 1,
        userPrompt: promptText
      };

      const generateResult = await generateFeatureMutation.mutateAsync(generateData);
      setResult(generateResult.result);
      return { initResult, generateResult };
    },
    onSuccess: () => {
      toast.success('Scenarios Generated')
      setisGenerateLoading(false);
      setActiveTab('scenarios');
    },
    onError: (error) => {
      setisGenerateLoading(false);
      console.error('Sequential API calls failed:', error);
    },
  });

  const handleGenerate = () => {
    console.log(result);
    if (result.length > 0 && !isPromptDialogOpen) {
      setIsPromptDialogOpen(true);
    } else if (isPromptDialogOpen && result.length > 0) {
      sequentialMutation.mutate();
    } else {
      sequentialMutation.mutate();
    }
  };

  const handleGenerateStepDefCode = () => {
    refetch();
  };

  const handleRunInitiateTestRun = () => {
    if (fileId.length) {
      runSeleniumCodeRefetch()
      setTestHTMLReport("http://172.18.104.22:5001/api/TestNova/fetchhtmlreport?uniqueId=" + fileId);
      setRightPanelTab('report');
    }
  }

  const {
    isLeftPanelCollapsed,
    setLeftPanelCollapsed,
    leftPanelSize,
    setLeftPanelSize
  } = usePanelStore();

  // Keep track of the last event for deduplication
  const lastEventRef = useRef<{
    selector: string;
    xpath: string;
    id: string;
    name: string;
    type: string; value: string | null; timestamp: number
  } | null>(null);

  // Timeline tab functions
  const addTimelineTab = () => {
    const newTabNumber = timelineTabs.length + 1;
    const newTab: TimelineTab = {
      id: `event-${newTabNumber}`,
      name: `Event ${newTabNumber}`,
      events: []
    };
    setTimelineTabs(prev => [...prev, newTab]);
    setActiveTimelineTab(newTab.id);
  };

  const deleteTimelineTab = (tabId: string) => {
    if (timelineTabs.length <= 1) return; // Don't delete if only one tab
    
    setTimelineTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // If deleting active tab, switch to first available tab
    if (activeTimelineTab === tabId) {
      const remainingTabs = timelineTabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTimelineTab(remainingTabs[0].id);
      }
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    
    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? Math.max(0, tabScrollPosition - scrollAmount)
      : tabScrollPosition + scrollAmount;
    
    setTabScrollPosition(newPosition);
    tabsContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  const canScrollLeft = tabScrollPosition > 0;
  const canScrollRight = tabsContainerRef.current 
    ? tabScrollPosition < (tabsContainerRef.current.scrollWidth - tabsContainerRef.current.clientWidth)
    : false;

  // URL validation helper
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  // Format URL helper
  const formatUrl = (urlString: string): string => {
    if (!urlString.trim()) return '';

    // If it already has a protocol, validate and return
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return isValidUrl(urlString) ? urlString : '';
    }

    // Add https:// by default
    const formattedUrl = `https://${urlString}`;
    return isValidUrl(formattedUrl) ? formattedUrl : '';
  };

  const injectRecorderScript = () => {
    const webview = webviewRef.current;
    if (!webview) return;

    const currentUrl = webview.src;

    // Prevent re-injection for the same URL
    if (currentUrl === lastInjectedUrlRef.current && isScriptInjectedRef.current) {
      console.log('Script already injected for this URL, skipping injection');
      return;
    }

    // Don't inject into blank pages
    if (!currentUrl || currentUrl === 'about:blank') {
      console.log('Skipping script injection for blank page');
      return;
    }

    console.log('Injecting script into webview for URL:', currentUrl);

    try {
      webview.executeJavaScript(`
        try {
          ${INJECT_SCRIPT}
          // Mark injection as successful
          console.log('Script injection completed for: ${currentUrl}');
        } catch (error) {
          console.error('Script injection failed:', error);
        }
      `);

      // Mark as injected for this URL
      isScriptInjectedRef.current = true;
      lastInjectedUrlRef.current = currentUrl;

      console.log('Script injection initiated successfully');
    } catch (error) {
      console.error('Failed to execute script injection:', error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <ChevronRight className="h-3.5 w-3.5" />;
      case 'click':
        return <MousePointer2 className="h-3.5 w-3.5" />;
      case 'input':
        return <Keyboard className="h-3.5 w-3.5" />;
      case 'change':
        return <FileEdit className="h-3.5 w-3.5" />;
      default:
        return <ExternalLink className="h-3.5 w-3.5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'navigation':
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800';
      case 'click':
        return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800';
      case 'input':
        return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800';
      case 'change':
        return 'bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const isDuplicateEvent = (event: RecordedEvent) => {
    if (!lastEventRef.current) return false;

    const lastEvent = lastEventRef.current;
    const timeDiff = event.timestamp - lastEvent.timestamp;

    // For input events, only record on blur or after a delay
    if (event.type === 'input') {
      return timeDiff < 1000;
    }

    // For other events, check if it's a duplicate within a short time window
    return (
      lastEvent.selector === event.selector &&
      lastEvent.xpath === event.xpath &&
      lastEvent.id === event.id &&
      lastEvent.name === event.name &&
      lastEvent.type === event.type &&
      lastEvent.value === event.value &&
      timeDiff < 500
    );
  };

  const processEvent = (recordedEvent: RecordedEvent) => {
    // Check for duplicate events
    if (isDuplicateEvent(recordedEvent)) {
      return;
    }
    console.log("recorded", recordedEvent)
    // Update last event reference
    lastEventRef.current = {
      selector: recordedEvent.selector,
      xpath: recordedEvent.xpath,
      id: recordedEvent.id,
      name: recordedEvent.name,
      type: recordedEvent.type,
      value: recordedEvent.value,
      timestamp: recordedEvent.timestamp
    };

    // Add event to test recorder
    testRecorder.addEvent(recordedEvent);
    const newSteps = testRecorder.generateTest();
    setSteps(newSteps);

    // Add event to timeline with unique ID
    const newEvent: TimelineEvent = {
      id: `event-${recordedEvent.timestamp}-${Math.random()}`,
      type: recordedEvent.type as TimelineEvent['type'],
      title: getEventTitle(recordedEvent),
      timestamp: recordedEvent.timestamp,
      details: recordedEvent,
      icon: getEventIcon(recordedEvent.type)
    };
    console.log(recordedEvent);

    // Add event to the active timeline tab
    setTimelineTabs(prev => prev.map(tab => 
      tab.id === activeTimelineTab 
        ? { ...tab, events: [newEvent, ...tab.events].sort((a, b) => b.timestamp - a.timestamp) }
        : tab
    ));
  };

  // Handle webview load completion 
  const handleWebviewLoad = () => {
    const webview = webviewRef.current;
    if (!webview) return;

    const currentUrl = webview.src;

    // Only add navigation event for real URLs, not blank pages
    if (currentUrl && currentUrl !== 'about:blank') {
      // Add navigation event to timeline
      const navigationEvent: TimelineEvent = {
        id: `nav-${Date.now()}`,
        type: 'navigation',
        title: `Navigated to ${currentUrl}`,
        timestamp: Date.now(),
        icon: getEventIcon('navigation')
      };
      
      // Add to active timeline tab
      setTimelineTabs(prev => prev.map(tab => 
        tab.id === activeTimelineTab 
          ? { ...tab, events: [navigationEvent, ...tab.events] }
          : tab
      ));

      // Inject script only if recording and not already injected for this URL
      if (isRecording && currentUrl !== lastInjectedUrlRef.current) {
        setTimeout(() => {
          injectRecorderScript();
        }, 1000); // Increased delay to ensure page is fully loaded
      }
    }
  };

  useEffect(() => {
    const handleConsoleMessage = (e: { message: string }) => {
      try {
        const data = JSON.parse(e.message);
        if (data.type === 'RECORDED_EVENT' && isRecording) {
          const recordedEvent = data.event as RecordedEvent;

          // Handle input events with debouncing
          if (recordedEvent.type === 'input') {
            if (inputTimeoutRef.current) {
              clearTimeout(inputTimeoutRef.current);
            }
            inputTimeoutRef.current = setTimeout(() => {
              processEvent(recordedEvent);
            }, 1000);
            return;
          }

          // Process other events immediately
          processEvent(recordedEvent);
        }
      } catch (error) {
        // Ignore non-JSON console messages
      }
    };

    if (webviewRef.current) {
      webviewRef.current.addEventListener('console-message', handleConsoleMessage);
    }

    return () => {
      if (webviewRef.current) {
        webviewRef.current.removeEventListener('console-message', handleConsoleMessage);
      }
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      setResult('');
    };
  }, [isRecording, activeTimelineTab]);

  const getEventTitle = (event: RecordedEvent): string => {
    switch (event.type) {
      case 'click':
        return `Clicked ${event.text ? `"${event.text}"` : event.tagName}`;
      case 'input':
        return `Typed in ${event.tagName}`;
      case 'change':
        return `Changed ${event.tagName}`;
      default:
        return `${event.tagName} interaction`;
    }
  };

  const handleStartRecording = () => {
    console.log('Starting recording');
    testRecorder.clearEvents();
    // Clear all timeline tabs
    setTimelineTabs(prev => prev.map(tab => ({ ...tab, events: [] })));
    lastEventRef.current = null;
    setIsRecording(true);

    // Reset injection tracking
    isScriptInjectedRef.current = false;
    lastInjectedUrlRef.current = '';

    // Inject script if webview has content
    const webview = webviewRef.current;
    if (webview && webview.src && webview.src !== 'about:blank') {
      setTimeout(() => {
        injectRecorderScript();
      }, 500);
    }

    toast.success('Recording started');
  };

  const handleStopRecording = () => {
    console.log('Stopping recording');
    setIsRecording(false);
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    toast.success('Recording stopped');
  };

  const handleClearRecording = () => {
    console.log('Clearing recording');
    testRecorder.clearEvents();
    setSteps([]);
    // Clear all timeline tabs
    setTimelineTabs(prev => prev.map(tab => ({ ...tab, events: [] })));
    lastEventRef.current = null;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    toast.success('Recording cleared');
  };

  const handleSaveTest = () => {
    if (steps.length === 0) {
      toast.error('No steps to save');
      return;
    }

    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    const testName = prompt('Enter test name:');
    if (!testName?.trim()) return;

    const savedTest: SavedTest = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: testName.trim(),
      description: '',
      url: url,
      steps: steps,
      events: testRecorder.getEvents(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      testType: currentTest?.testType || "Exploratory",
      projectId: currentProject.id
    };

    testStorage.saveTest(savedTest);
    setCurrentTest(savedTest);
    toast.success(`Test "${testName}" saved successfully`);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setActiveTab('library');
  };

  const handleBackToProjects = () => {
    setCurrentProject(null);
    setActiveTab('projects');
    setShowTestTabs(false);
    setCurrentTest(null);
  };

  const handleLoadTest = (test: SavedTest) => {
    console.log(test);
    setCurrentTest(test);
    setUrl(test.url);
    setSteps(test.steps);

    // Recreate timeline events from test events and load into first tab
    const events: TimelineEvent[] = test.events.map((event, index) => ({
      id: `loaded-event-${index}`,
      type: event.type as TimelineEvent['type'],
      title: getEventTitle(event),
      timestamp: event.timestamp,
      details: event,
      icon: getEventIcon(event.type)
    }));

    // Load events into the first tab and clear others
    setTimelineTabs(prev => prev.map((tab, index) => 
      index === 0 
        ? { ...tab, events: events.sort((a, b) => b.timestamp - a.timestamp) }
        : { ...tab, events: [] }
    ));

    // Load events into test recorder
    testRecorder.clearEvents();
    test.events.forEach(event => testRecorder.addEvent(event));

    // Show test tabs and switch to timeline
    setShowTestTabs(true);
    setActiveTab('timeline');

    toast.success(`Test "${test.name}" loaded`);

    // Navigate to the test URL
    if (test.url && webviewRef.current) {
      const formattedUrl = formatUrl(test.url);
      if (formattedUrl) {
        setIsLoading(true);

        // Reset injection tracking for new URL
        isScriptInjectedRef.current = false;
        lastInjectedUrlRef.current = '';

        webviewRef.current.src = formattedUrl;
      } else {
        toast.error('Invalid URL format');
      }
    }
  };

  const handleBackToLibrary = () => {
    setShowTestTabs(false);
    setActiveTab('library');
    setCurrentTest(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const navigateWebview = () => {
    if (webviewRef.current) {
      const formattedUrl = formatUrl(url);
      if (formattedUrl) {
        console.log('Navigating to:', formattedUrl);
        setIsLoading(true);

        // Reset injection tracking for new URL
        isScriptInjectedRef.current = false;
        lastInjectedUrlRef.current = '';

        webviewRef.current.src = formattedUrl;
      } else {
        toast.error('Please enter a valid URL (e.g., example.com or https://example.com)');
      }
    }
  };

  const toggleDevTools = () => {
    window.electron?.ipcRenderer.send('toggle-dev-tools');
  };

  const handlePanelResize = (sizes: number[]) => {
    if (!isLeftPanelCollapsed) {
      setLeftPanelSize(sizes[0]);
    }
  };

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const deleteTimelineEvent = (tabId: string, eventId: string) => {
    setTimelineTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, events: tab.events.filter(event => event.id !== eventId) }
        : tab
    ));
  };

  // Get total events across all tabs
  const getTotalEvents = () => {
    return timelineTabs.reduce((total, tab) => total + tab.events.length, 0);
  };

  // Get events for active tab
  const getActiveTabEvents = () => {
    const activeTab = timelineTabs.find(tab => tab.id === activeTimelineTab);
    return activeTab ? activeTab.events : [];
  };

  return (
    <div className="flex h-screen bg-background">
      <PanelGroup direction="horizontal" onLayout={handlePanelResize}>
        <Panel
          defaultSize={isLeftPanelCollapsed ? 0 : leftPanelSize}
          collapsible
          collapsedSize={0}
          minSize={20}
          maxSize={70}
          collapsed={isLeftPanelCollapsed}
          onCollapse={setLeftPanelCollapsed}
          onExpand={() => setLeftPanelCollapsed(false)}
          className="transition-all duration-300 ease-in-out"
        >
          {/* Left Panel - Test Recorder */}
          <div className="h-full flex flex-col border-r bg-card/50 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b bg-background/80 backdrop-blur-sm">
              <div className="px-3 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isLeftPanelCollapsed && (
                    <>
                      <div className="flex items-center">
                        <h1 className="text-lg font-semibold">testNova </h1>
                        <img src='src/desktop-icons/test-nova-icon.png' className='ml-1 h-8 w-10' />
                      </div>
                      <Badge variant={isRecording ? "destructive" : "secondary"} className="ml-2 theme-badge-secondary">
                        {isRecording ? (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 animate-pulse" />
                            Recording
                          </div>
                        ) : (
                          'Idle'
                        )}
                      </Badge>
                    </>
                  )}
                </div>
                {!isLeftPanelCollapsed && (
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                  </div>
                )}
              </div>
            </div>

            {!isLeftPanelCollapsed && (
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="w-full justify-start border-b rounded-none p-0 h-10 bg-transparent">
                    {currentProject && (
                      <TabsTrigger
                        value="library"
                        className="flex items-center gap-2 theme-tab data-[state=active]:theme-tab-active rounded-none h-10"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        Library
                      </TabsTrigger>
                    )}
                    {showTestTabs && (
                      <>
                        <TabsTrigger
                          value="timeline"
                          className="flex items-center gap-2 theme-tab data-[state=active]:theme-tab-active rounded-none h-10"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Timeline
                        </TabsTrigger>
                        <TabsTrigger
                          value="scenarios"
                          className="flex items-center gap-2 theme-tab data-[state=active]:theme-tab-active rounded-none h-10"
                        >
                          <List className="h-3.5 w-3.5" />
                          Scenarios
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  {!isLeftPanelCollapsed && (
                    <>
                      <div className="p-2 space-y-3">
                        {/* Current Project & Test Info */}
                        {currentProject && (
                          <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg theme-card">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 pl-2">
                                <div className={`w-6 h-6 rounded ${currentProject.color || 'bg-blue-500'} flex items-center justify-center text-white text-xs font-semibold`}>
                                  {currentProject.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h2 className="text-lg font-semibold">{currentProject.name}</h2>
                                  <p className="text-xs text-muted-foreground">Test Library</p>
                                </div>
                              </div>
                              {currentTest && (
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-3 w-3 text-primary" />
                                  <span className="text-xs font-medium truncate">{currentTest.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recording Controls - Only show when test is loaded or recording */}
                        {(showTestTabs || isRecording) && (
                          <div className="flex gap-2">
                            {!isRecording ? (
                              <Button
                                onClick={handleStartRecording}
                                variant="default"
                                disabled={isLoading}
                                size="sm"
                                className="flex-1 theme-button-primary"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Recording
                                {isLoading && <LoaderIcon className="animate-spin ml-2" />}
                              </Button>
                            ) : (
                              <Button
                                onClick={handleStopRecording}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                              >
                                <Square className="mr-2 h-4 w-4" />
                                Stop Recording
                              </Button>
                            )}
                            <Button
                              onClick={handleClearRecording}
                              variant="outline"
                              size="sm"
                              className="theme-button-outline"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={handleGenerate}
                              variant="default"
                              disabled={getTotalEvents() === 0 || !currentProject || isLoading || isGenerateLoading}
                              className="bg-cyan-800 hover:bg-cyan-500"
                            >
                              {isGenerateLoading ? <> Generating <LoaderIcon className="animate-spin ml-2 h-4 w-4" /></> : <> Generate <Sparkles className="ml-2 h-4 w-4" /></>}
                            </Button>
                          </div>
                        )}

                        {/* URL Navigation - Only show when test is loaded */}
                        {showTestTabs && (
                          <div className="flex gap-2">
                            <Input
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder="Enter URL to test (e.g., example.com)"
                              className="flex-1 h-8 theme-input"
                              onKeyDown={(e) => e.key === 'Enter' && navigateWebview()}
                            />
                            <Button
                              onClick={navigateWebview}
                              variant="secondary"
                              disabled={isLoading || !url.trim()}
                              size="sm"
                              className="theme-button-secondary"
                            >
                              <Globe className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* Stats - Only show when test is loaded */}
                        {showTestTabs && (
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTotalEvents()} events
                            </div>
                            <div className="flex items-center gap-1">
                              <List className="h-3 w-3" />
                              {steps.length} steps
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <TabsContent value="projects" className="flex-1 m-0 overflow-hidden">
                    <ProjectLibrary onSelectProject={handleSelectProject} />
                  </TabsContent>

                  {currentProject && (
                    <TabsContent value="library" className="flex-1 m-0 overflow-hidden">
                      <TestLibrary
                        onLoadTest={handleLoadTest}
                        currentTest={currentTest}
                        currentProject={currentProject}
                        onBackToProjects={handleBackToProjects}
                      />
                    </TabsContent>
                  )}

                  {showTestTabs && (
                    <>
                      <TabsContent value="timeline" className="flex-1 m-0 overflow-hidden">
                        <div className="h-full flex flex-col">
                          {/* Timeline Tabs */}
                          <div className="border-b bg-background/95 backdrop-blur-sm">
                            <div className="flex items-center">
                              {/* Left scroll button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => scrollTabs('left')}
                                disabled={!canScrollLeft}
                                className="h-8 w-8 p-0 shrink-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              {/* Tabs container */}
                              <div 
                                ref={tabsContainerRef}
                                className="flex-1 overflow-x-auto scrollbar-none"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                              >
                                <div className="flex">
                                  {timelineTabs.map((tab) => (
                                    <button
                                      key={tab.id}
                                      onClick={() => setActiveTimelineTab(tab.id)}
                                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTimelineTab === tab.id
                                          ? 'border-primary text-primary bg-primary/5'
                                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                      }`}
                                    >
                                      <span>{tab.name}</span>
                                      {tab.events.length > 0 && (
                                        <Badge variant="secondary" className="text-xs h-4 px-1">
                                          {tab.events.length}
                                        </Badge>
                                      )}
                                      {timelineTabs.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTimelineTab(tab.id);
                                          }}
                                          className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Right scroll button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => scrollTabs('right')}
                                disabled={!canScrollRight}
                                className="h-8 w-8 p-0 shrink-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>

                              {/* Add tab button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addTimelineTab}
                                className="h-8 px-2 ml-2 shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Timeline content */}
                          <div className="flex-1 p-3 overflow-hidden">
                            <ScrollArea className="h-full">
                              <div className="space-y-3">
                                {getActiveTabEvents().length === 0 ? (
                                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                    <Clock className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">No events recorded yet</p>
                                    <p className="text-xs">Start recording to see timeline</p>
                                  </div>
                                ) : (
                                  getActiveTabEvents().map((event, index) => (
                                    <div
                                      key={event.id}
                                      className="relative group"
                                    >
                                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 theme-card">
                                        <div 
                                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${getEventColor(event.type)}`} 
                                          onClick={() => {
                                            if (event.details) {
                                              setSelectedEvent(event);
                                              setIsDetailsOpen(true);
                                            }
                                          }}
                                        >
                                          {event.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                            <p className="font-medium text-sm truncate">{event.title}</p>
                                            <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                              {new Date(event.timestamp).toLocaleTimeString()}
                                            </span>
                                          </div>
                                          <Badge variant="outline" className="text-xs theme-badge-outline">
                                            {event.type}
                                          </Badge>
                                        </div>
                                        {event.details && (
                                          <X 
                                            className="h-4 w-4 text-muted-foreground cursor-pointer" 
                                            onClick={() => deleteTimelineEvent(activeTimelineTab, event.id)} 
                                          />
                                        )}
                                      </div>
                                      {index !== getActiveTabEvents().length - 1 && (
                                        <div className="absolute left-7 top-14 bottom-0 w-[1px] bg-border" />
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="scenarios" className="flex-1 p-3 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="space-y-3">
                            {result.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                <List className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">No Tests generated yet</p>
                                <p className="text-xs">Record interactions and generate to see tests</p>
                              </div>
                            ) : (
                              <div>
                                <Button
                                  onClick={handleGenerateStepDefCode}
                                  variant="default"
                                  disabled={result.length === 0 || isSelenumCodeFetching}
                                  className="bg-green-800 hover:bg-green-500 mb-2"
                                >
                                  {isSelenumCodeFetching ? <> Generating Code <LoaderIcon className="animate-spin ml-2 h-4 w-4" /></> : <> Generate Step Definitions Code <Code className="ml-2 h-4 w-4" /></>}
                                </Button>
                                <pre className="text-xs p-2 bg-muted rounded overflow-x-auto theme-muted">
                                  {result}
                                </pre>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        </Panel>

        {!isLeftPanelCollapsed && (
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-all duration-200 group">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </PanelResizeHandle>
        )}

        {/* Right Panel - Simple Tab System */}
        <Panel>
          <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b bg-background/95 backdrop-blur-sm">
              <div className="flex">
                <button
                  onClick={() => setRightPanelTab('browser')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors theme-tab ${rightPanelTab === 'browser' ? 'theme-tab-active' : ''}`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Browser
                </button>
                <button
                  onClick={() => setRightPanelTab('code')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors theme-tab ${rightPanelTab === 'code' ? 'theme-tab-active' : ''}`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  Code
                </button>
                <button
                  onClick={() => setRightPanelTab('report')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors theme-tab ${rightPanelTab === 'report' ? 'theme-tab-active' : ''}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Test Report
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 relative">
              {/* Browser Tab */}
              {rightPanelTab === 'browser' && (
                <div className="absolute inset-0">
                  <BrowserPanel
                    webviewRef={webviewRef}
                    isLeftPanelCollapsed={isLeftPanelCollapsed}
                    toggleLeftPanel={toggleLeftPanel}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    onWebviewLoad={handleWebviewLoad}
                  />
                </div>
              )}

              {/* Code Tab */}
              {rightPanelTab === 'code' && (
                <div className="absolute inset-0 bg-background">
                  <CodePanel isActive={true} code={selenumCodeData?.result} handleRunInitiateTestRun={handleRunInitiateTestRun} isRunInitiateTestRun={isrunSeleniumCodeFetching} />
                </div>
              )}

              {/* Report Tab */}
              {rightPanelTab === 'report' && (
                <div className="absolute inset-0 bg-background">
                  <TestReportPanel isActive={true} htmlReport={testHTMLReport} isrunSeleniumCodeFetching={isrunSeleniumCodeFetching} isrunSeleniumCodeSuccess={isrunSeleniumCodeSuccess} isrunSeleniumCodeError={isrunSeleniumCodeError} />
                </div>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>

      {/* Event Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent?.details && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedEvent.details.type}</p>
                    <p><span className="font-medium">Element:</span> {selectedEvent.details.tagName}</p>
                    <p><span className="font-medium">Timestamp:</span> {new Date(selectedEvent.details.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Element Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-wrap whitespace-break-spaces">Xpath:</span> <code className="text-xs bg-muted p-1 rounded  break-all whitespace-pre-wrap theme-muted">{selectedEvent.details.xpath}</code></p>

                    {selectedEvent.details.value && (
                      <p><span className="font-medium">Value:</span> {selectedEvent.details.value}</p>
                    )}
                    {selectedEvent.details.text && (
                      <p><span className="font-medium">Text Content:</span> {selectedEvent.details.text}</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedEvent.details.context && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Context Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Context Type:</span> {selectedEvent.details.context.type}</p>
                    <p><span className="font-medium">Source:</span> {selectedEvent.details.context.src}</p>
                    <p><span className="font-medium">Context Selector:</span> <code className="text-xs bg-muted px-1 rounded theme-muted">{selectedEvent.details.context.selector}</code></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prompt Modal */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChatBubbleIcon className="h-5 w-5" />
              Prompt Test changes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 ">
              <div>
                <Textarea
                  id="test-description"
                  value={promptText || ''}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Prompt test case changes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleGenerate} disabled={result.length === 0}>
                  {'Re-Generate'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}