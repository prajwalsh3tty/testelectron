import { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import * as monaco from 'monaco-editor';
import { LoaderIcon } from 'lucide-react';

interface CodePanelProps {
  isActive: boolean;
}

export function CodePanel({ isActive }: CodePanelProps) {
  const [javaCode, setJavaCode] = useState('');
  const [monacoEditor, setMonacoEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isMonacoLoading, setIsMonacoLoading] = useState(true);
  const editorContainerRef = useRef<HTMLDivElement>(null);
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

  // Initialize Monaco Editor only when tab is active
  useEffect(() => {
    const initializeMonaco = async () => {
      if (editorContainerRef.current && isActive && !monacoEditor) {
        try {
          setIsMonacoLoading(true);
          
          // Configure Monaco environment for Electron
          self.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
              if (label === 'json') {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                  self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                  };
                  importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/json/json.worker.js');
                `)}`;
              }
              if (label === 'css' || label === 'scss' || label === 'less') {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                  self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                  };
                  importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/css/css.worker.js');
                `)}`;
              }
              if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                  self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                  };
                  importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/language/html/html.worker.js');
                `)}`;
              }
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

          // Create the editor
          const editor = monaco.editor.create(editorContainerRef.current, {
            value: javaCode,
            language: 'java',
            theme: theme === 'dark' ? 'vs-dark' : 'vs',
            automaticLayout: true,
            minimap: { enabled: true },
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
            detectIndentation: true,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            mouseWheelZoom: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            parameterHints: {
              enabled: true
            },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoSurround: 'languageDefined',
            formatOnPaste: true,
            formatOnType: true
          });

          // Listen for content changes
          editor.onDidChangeModelContent(() => {
            setJavaCode(editor.getValue());
          });

          setMonacoEditor(editor);
          setIsMonacoLoading(false);
          
          console.log('Monaco Editor initialized successfully');
        } catch (error) {
          console.error('Error initializing Monaco Editor:', error);
          setIsMonacoLoading(false);
        }
      }
    };

    if (isActive && !monacoEditor) {
      // Small delay to ensure the container is rendered
      setTimeout(initializeMonaco, 100);
    }
  }, [isActive, theme, monacoEditor, javaCode]);

  // Update Monaco theme when theme changes
  useEffect(() => {
    if (monacoEditor) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme, monacoEditor]);

  // Cleanup Monaco editor
  useEffect(() => {
    return () => {
      if (monacoEditor) {
        monacoEditor.dispose();
        setMonacoEditor(null);
      }
    };
  }, []);

  // Handle layout when tab becomes active
  useEffect(() => {
    if (isActive && monacoEditor) {
      // Trigger layout recalculation when tab becomes active
      setTimeout(() => {
        monacoEditor.layout();
      }, 100);
    }
  }, [isActive, monacoEditor]);

  return (
    <div className="h-full relative">
      {isMonacoLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading Monaco Editor...</span>
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