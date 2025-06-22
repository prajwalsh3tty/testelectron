import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const SAMPLE_JAVA_CODE = `package com.example.tests;

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
        // Initialize Chrome driver
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }
    
    @Test
    public void testUserLogin() {
        // Navigate to the application
        driver.get("https://example.com/login");
        
        // Find and fill username field
        WebElement usernameField = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("username"))
        );
        usernameField.clear();
        usernameField.sendKeys("testuser@example.com");
        
        // Find and fill password field
        WebElement passwordField = driver.findElement(By.id("password"));
        passwordField.clear();
        passwordField.sendKeys("securePassword123");
        
        // Click login button
        WebElement loginButton = driver.findElement(By.xpath("//button[@type='submit']"));
        loginButton.click();
        
        // Verify successful login
        WebElement welcomeMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.className("welcome-message")
            )
        );
        
        assert welcomeMessage.isDisplayed() : "Welcome message should be visible after login";
        assert welcomeMessage.getText().contains("Welcome") : "Welcome message should contain 'Welcome'";
    }
    
    @Test
    public void testFormSubmission() {
        // Navigate to form page
        driver.get("https://example.com/contact");
        
        // Fill out contact form
        driver.findElement(By.name("firstName")).sendKeys("John");
        driver.findElement(By.name("lastName")).sendKeys("Doe");
        driver.findElement(By.name("email")).sendKeys("john.doe@example.com");
        
        // Select dropdown option
        WebElement dropdown = driver.findElement(By.id("subject"));
        dropdown.click();
        driver.findElement(By.xpath("//option[@value='support']")).click();
        
        // Fill textarea
        WebElement messageArea = driver.findElement(By.name("message"));
        messageArea.sendKeys("This is a test message for automated testing purposes.");
        
        // Submit form
        driver.findElement(By.xpath("//button[contains(text(), 'Send Message')]")).click();
        
        // Verify submission success
        WebElement successMessage = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.className("success-notification")
            )
        );
        
        assert successMessage.isDisplayed() : "Success message should be displayed";
    }
    
    @Test
    public void testNavigationMenu() {
        driver.get("https://example.com");
        
        // Test navigation links
        String[] menuItems = {"Home", "About", "Services", "Contact"};
        
        for (String menuItem : menuItems) {
            WebElement menuLink = driver.findElement(
                By.xpath("//nav//a[contains(text(), '" + menuItem + "')]")
            );
            menuLink.click();
            
            // Verify page loaded correctly
            wait.until(ExpectedConditions.titleContains(menuItem));
            
            // Go back to home for next iteration
            if (!menuItem.equals("Home")) {
                driver.navigate().back();
            }
        }
    }
    
    @AfterEach
    public void tearDown() {
        // Clean up and close browser
        if (driver != null) {
            driver.quit();
        }
    }
}`;

const CODE_TEMPLATES = {
  java: SAMPLE_JAVA_CODE,
  javascript: `// Cypress Test Example
describe('Automated Test Suite', () => {
  beforeEach(() => {
    cy.visit('https://example.com');
  });

  it('should login successfully', () => {
    cy.get('#username').type('testuser@example.com');
    cy.get('#password').type('securePassword123');
    cy.get('button[type="submit"]').click();
    cy.get('.welcome-message').should('be.visible');
  });

  it('should submit contact form', () => {
    cy.visit('/contact');
    cy.get('[name="firstName"]').type('John');
    cy.get('[name="lastName"]').type('Doe');
    cy.get('[name="email"]').type('john.doe@example.com');
    cy.get('#subject').select('support');
    cy.get('[name="message"]').type('Test message');
    cy.contains('Send Message').click();
    cy.get('.success-notification').should('be.visible');
  });
});`,
  python: `# Selenium Python Test Example
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

class AutomatedTest(unittest.TestCase):
    
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 10)
    
    def test_user_login(self):
        self.driver.get("https://example.com/login")
        
        username_field = self.wait.until(
            EC.element_to_be_clickable((By.ID, "username"))
        )
        username_field.clear()
        username_field.send_keys("testuser@example.com")
        
        password_field = self.driver.find_element(By.ID, "password")
        password_field.clear()
        password_field.send_keys("securePassword123")
        
        login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        welcome_message = self.wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "welcome-message"))
        )
        
        self.assertTrue(welcome_message.is_displayed())
        self.assertIn("Welcome", welcome_message.text)
    
    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()`
};

export function CodeEditor() {
  const [language, setLanguage] = useState<keyof typeof CODE_TEMPLATES>('java');
  const [code, setCode] = useState(CODE_TEMPLATES.java);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    setCode(CODE_TEMPLATES[language]);
  }, [language]);

  const handleEditorDidMount = () => {
    setIsLoading(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCode = () => {
    const extensions = { java: 'java', javascript: 'js', python: 'py' };
    const extension = extensions[language];
    const filename = `test.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Code downloaded as ${filename}`);
  };

  const handleRunCode = () => {
    toast.info('Code execution simulation started');
    // Simulate code execution
    setTimeout(() => {
      toast.success('Code executed successfully');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Card className="flex-1 m-4 border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Test Code Generator</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(value: keyof typeof CODE_TEMPLATES) => setLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCode}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="default" size="sm" onClick={handleRunCode}>
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-sm text-muted-foreground">Loading editor...</div>
            </div>
          )}
          <Editor
            height="100%"
            language={language === 'javascript' ? 'javascript' : language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              glyphMargin: false,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}