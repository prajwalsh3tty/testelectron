import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { LoaderIcon } from 'lucide-react';

interface CodePanelProps {
  isActive: boolean;
}

export function CodePanel({ isActive }: CodePanelProps) {
  const [javaCode, setJavaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  // Sample Java code
  const sampleJavaCode = `package com.example.test;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class AutomatedTest {
    
    private WebDriver driver;
    private WebDriverWait wait;
    
    @BeforeEach
    public void setUp() {
        // Initialize ChromeDriver
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
    }
    
    @Test
    public void testUserLogin() {
        // Navigate to the application
        driver.get("https://example.com/login");
        
        // Find and interact with login elements
        WebElement usernameField = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("username"))
        );
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.xpath("//button[@type='submit']"));
        
        // Perform login actions
        usernameField.sendKeys("testuser@example.com");
        passwordField.sendKeys("password123");
        loginButton.click();
        
        // Verify successful login
        WebElement dashboard = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.className("dashboard"))
        );
        
        assert dashboard.isDisplayed() : "Dashboard should be visible after login";
    }
    
    @Test
    public void testFormSubmission() {
        driver.get("https://example.com/form");
        
        // Fill out form fields
        driver.findElement(By.name("firstName")).sendKeys("John");
        driver.findElement(By.name("lastName")).sendKeys("Doe");
        driver.findElement(By.name("email")).sendKeys("john.doe@example.com");
        
        // Select dropdown option
        WebElement dropdown = driver.findElement(By.id("country"));
        dropdown.click();
        driver.findElement(By.xpath("//option[@value='US']")).click();
        
        // Submit form
        driver.findElement(By.xpath("//button[contains(text(), 'Submit')]")).click();
        
        // Verify success message
        WebElement successMessage = wait.until(
            ExpectedConditions.presenceOfElementLocated(
                By.xpath("//div[contains(@class, 'success')]")
            )
        );
        
        assert successMessage.getText().contains("Form submitted successfully");
    }
    
    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}`;

  // Initialize Java code state
  useEffect(() => {
    setJavaCode(sampleJavaCode);
  }, []);

  // Initialize Monaco Editor with memory-efficient configuration
  useEffect(() => {
    const initializeMonaco = async () => {
      if (!isActive || !editorContainerRef.current || editorRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to reduce initial bundle size
        const monaco = await import('monaco-editor');

        // Configure Monaco environment with minimal workers
        if (!window.MonacoEnvironment) {
          window.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
              // Use minimal worker configuration to reduce memory usage
              if (label === 'typescript' || label === 'javascript') {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                  self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                  };
                  importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/typescript/ts.worker.js');
                `)}`;
              }
              return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                self.MonacoEnvironment = {
                  baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                };
                importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.worker.js');
              `)}`;
            }
          };
        }

        // Create editor with memory-efficient options
        const editor = monaco.editor.create(editorContainerRef.current, {
          value: javaCode,
          language: 'java',
          theme: theme === 'dark' ? 'vs-dark' : 'vs',
          automaticLayout: true,
          
          // Memory-efficient options
          minimap: { enabled: false }, // Disable minimap to save memory
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          tabSize: 4,
          insertSpaces: true,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          mouseWheelZoom: false, // Disable zoom to prevent memory issues
          
          // Disable resource-intensive features
          quickSuggestions: false,
          parameterHints: { enabled: false },
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          wordBasedSuggestions: 'off',
          
          // Reduce rendering overhead
          renderWhitespace: 'none',
          renderControlCharacters: false,
          renderIndentGuides: false,
          
          // Limit model options
          maxTokenizationLineLength: 1000,
          
          // Basic editing features only
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          formatOnPaste: false,
          formatOnType: false
        });

        // Listen for content changes
        editor.onDidChangeModelContent(() => {
          setJavaCode(editor.getValue());
        });

        editorRef.current = editor;
        setIsLoading(false);
        
        console.log('Monaco Editor initialized successfully with memory-efficient configuration');
      } catch (error) {
        console.error('Error initializing Monaco Editor:', error);
        setError('Failed to load code editor. Using fallback text area.');
        setIsLoading(false);
      }
    };

    if (isActive) {
      // Add delay to ensure container is ready
      const timer = setTimeout(initializeMonaco, 200);
      return () => clearTimeout(timer);
    }
  }, [isActive, theme, javaCode]);

  // Update Monaco theme when theme changes
  useEffect(() => {
    if (editorRef.current) {
      const monaco = require('monaco-editor');
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  // Cleanup Monaco editor
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Handle layout when tab becomes active
  useEffect(() => {
    if (isActive && editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 100);
    }
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  // Fallback to textarea if Monaco fails
  if (error) {
    return (
      <div className="h-full p-4">
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
        <textarea
          value={javaCode}
          onChange={(e) => setJavaCode(e.target.value)}
          className="w-full h-[calc(100%-80px)] p-4 border rounded-md font-mono text-sm bg-background text-foreground resize-none"
          placeholder="Enter Java code here..."
        />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading Code Editor...</span>
          </div>
        </div>
      )}
      <div 
        ref={editorContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
}