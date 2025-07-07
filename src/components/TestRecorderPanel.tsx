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
  ChevronLeft,
  Plus
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

export function TestRecorderPanel() {
  // ... rest of the component code ...
}