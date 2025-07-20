import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { LoaderIcon, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface CodePanelProps {
  isActive: boolean;
  code?: string;
  isRunInitiateTestRun: boolean;
  handleRunInitiateTestRun: () => void;
}

export function CodePanel({ isActive, code, isRunInitiateTestRun, handleRunInitiateTestRun }: CodePanelProps) {
  const [javaCode, setJavaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  const sampleJavaCode = `package stepdefinitions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.junit.Assert;

public class StepDefinitions_1 {
    private WebDriver driver;

    @Before
    public void setup() {
        // Assuming chromedriver is in PATH
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @After
    public void teardown() {
        driver.quit();
    }

    @Given("I navigate to login page {string}")
    public void i_navigate_to_login_page(String url) {
        driver.get(url);
    }

    @When("I enter {string} into the {string} input field on login page")
    public void i_enter_into_input_field_on_login_page(String value, String fieldName) {
        WebElement inputField;
        if (fieldName.equals("username")) {
            inputField = driver.findElement(By.id("username"));
        } else if (fieldName.equals("password")) {
            inputField = driver.findElement(By.id("password"));
        } else {
            throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }
        inputField.sendKeys(value);
    }

    @When("I click the {string} button on login page")
    public void i_click_button_on_login_page(String buttonId) {
        if (buttonId.equals("submit")) {
            driver.findElement(By.id("submit")).click();
        } else {
            throw new IllegalArgumentException("Invalid button ID: " + buttonId);
        }
    }

    @Then("I should see the dashboard page after a successful login")
    public void i_should_see_dashboard_page_after_successful_login() {
        // Example validation; modify according to actual expected dashboard element
        Assert.assertTrue("Dashboard page not displayed", driver.getCurrentUrl().contains("dashboard"));
    }

    @Then("I should be redirected to a welcome message on the dashboard page")
    public void i_should_be_redirected_to_welcome_message_on_dashboard_page() {
        // Example validation; modify according to actual expected message element
        WebElement welcomeMessage = driver.findElement(By.xpath("//h2[contains(text(), 'Welcome')]"));
        Assert.assertTrue("Welcome message not displayed", welcomeMessage.isDisplayed());
    }

    @Then("I should see an error message indicating that the username is required")
    public void i_should_see_error_message_for_required_username() {
        WebElement errorMessage = driver.findElement(By.xpath("//*[contains(text(), 'username is required')]"));
        Assert.assertTrue("Error message for username required not displayed", errorMessage.isDisplayed());
    }

    @Then("I should see an error message indicating that the password is required")
    public void i_should_see_error_message_for_required_password() {
        WebElement errorMessage = driver.findElement(By.xpath("//*[contains(text(), 'password is required')]"));
        Assert.assertTrue("Error message for password required not displayed", errorMessage.isDisplayed());
    }

    @Then("I should see an error message indicating that the username or password is incorrect")
    public void i_should_see_error_message_for_incorrect_credentials() {
        WebElement errorMessage = driver.findElement(By.xpath("//*[contains(text(), 'username or password is incorrect')]"));
        Assert.assertTrue("Error message for incorrect credentials not displayed", errorMessage.isDisplayed());
    }

    @Then("the {string} button should be disabled")
    public void the_button_should_be_disabled(String buttonId) {
        WebElement button = driver.findElement(By.id(buttonId));
        Assert.assertFalse("Button " + buttonId + " is not disabled", button.isEnabled());
    }

    @When("I click the {string} link on login page")
    public void i_click_link_on_login_page(String linkId) {
        // Sample link element
        WebElement link = driver.findElement(By.xpath("//*[@id='" + linkId + "']/a"));
        link.click();
    }

    @Then("I should be redirected to the relevant section for {string}")
    public void i_should_be_redirected_to_relevant_section(String linkId) {
        // Example validation; modify according to actual expected URL or content
        Assert.assertTrue("Redirect for " + linkId + " not valid", driver.getCurrentUrl().contains(linkId));
    }

    @When("I click the {string} button to open the mobile menu")
    public void i_click_mobile_menu_button(String buttonId) {
        if (buttonId.equals("toggle-navigation")) {
            driver.findElement(By.id("toggle-navigation")).click();
        } else {
            throw new IllegalArgumentException("Invalid button ID: " + buttonId);
        }
    }

    @Then("the mobile menu should not be visible")
    public void the_mobile_menu_should_not_be_visible() {
        // Example validation; modify according to actual logic
        WebElement mobileMenu = driver.findElement(By.id("mobile-menu")); // Replace with correct ID
        Assert.assertFalse("Mobile menu is still visible", mobileMenu.isDisplayed());
    }
}
`;

  // Initialize Java code state
  useEffect(() => {
    setJavaCode(code || sampleJavaCode);
  }, [code]);

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
          theme: 'vs-dark',
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
      <Button
        onClick={handleRunInitiateTestRun}
        variant="default"
        disabled={isLoading}
        className="bg-green-800 hover:bg-green-500 mb-2"
      >
        {isRunInitiateTestRun ? <> Running <LoaderIcon className="animate-spin ml-2 h-4 w-4" /></> : <> Run <Play className="ml-2 h-4 w-4" /></>}
      </Button>
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