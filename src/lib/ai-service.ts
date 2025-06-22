// AI Service for generating test scenarios
export interface AITestRequest {
  description: string;
  testType: 'Monkey' | 'Functional';
  url: string;
  context?: {
    projectName: string;
    existingTests?: string[];
  };
}

export interface AITestResponse {
  success: boolean;
  events: any[];
  suggestions?: string[];
  error?: string;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateTestScenario(request: AITestRequest): Promise<AITestResponse> {
    try {
      // If no API key is set, use mock data
      if (!this.apiKey) {
        return this.generateMockScenario(request);
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert test automation engineer. Generate realistic web test scenarios based on user descriptions. Return test steps as JSON with the following structure:
              {
                "events": [
                  {
                    "type": "click|input|change|submit",
                    "selector": "CSS selector",
                    "xpath": "XPath selector",
                    "tagName": "element tag",
                    "value": "input value if applicable",
                    "text": "element text",
                    "placeholder": "placeholder text if applicable"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `Generate a ${request.testType.toLowerCase()} test for: "${request.description}"
              Target URL: ${request.url}
              
              Create realistic user interactions including clicks, form inputs, and navigation.
              Use proper CSS selectors and XPath expressions.
              For Monkey testing, include more random interactions.
              For Functional testing, focus on specific user workflows.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from AI service');
      }

      const parsedContent = JSON.parse(content);
      
      return {
        success: true,
        events: parsedContent.events || [],
        suggestions: parsedContent.suggestions
      };
    } catch (error) {
      console.error('AI service error:', error);
      
      // Fallback to mock data on error
      return this.generateMockScenario(request);
    }
  }

  private generateMockScenario(request: AITestRequest): AITestResponse {
    const { description, testType, url } = request;
    
    // Generate mock scenarios based on keywords in description
    const scenarios = this.getMockScenarios(description, testType);
    
    return {
      success: true,
      events: scenarios,
      suggestions: [
        'Consider adding error handling tests',
        'Test with different browser sizes',
        'Add accessibility checks',
        'Test with slow network conditions'
      ]
    };
  }

  private getMockScenarios(description: string, testType: 'Monkey' | 'Functional') {
    const baseTimestamp = Date.now();
    
    // Login scenario
    if (description.toLowerCase().includes('login') || description.toLowerCase().includes('auth')) {
      return [
        {
          type: 'click',
          selector: '#login-button',
          xpath: '/html[1]/body[1]/div[1]/nav[1]/button[1]',
          tagName: 'button',
          timestamp: baseTimestamp,
          value: null,
          text: 'Login',
          placeholder: null
        },
        {
          type: 'input',
          selector: 'input[name="email"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/input[1]',
          tagName: 'input',
          timestamp: baseTimestamp + 1000,
          value: 'test@example.com',
          text: '',
          placeholder: 'Enter your email'
        },
        {
          type: 'input',
          selector: 'input[name="password"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/input[2]',
          tagName: 'input',
          timestamp: baseTimestamp + 2000,
          value: 'password123',
          text: '',
          placeholder: 'Enter your password'
        },
        {
          type: 'click',
          selector: 'button[type="submit"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/button[1]',
          tagName: 'button',
          timestamp: baseTimestamp + 3000,
          value: null,
          text: 'Sign In',
          placeholder: null
        }
      ];
    }

    // Form scenario
    if (description.toLowerCase().includes('form') || description.toLowerCase().includes('contact')) {
      return [
        {
          type: 'click',
          selector: 'nav a[href="/contact"]',
          xpath: '/html[1]/body[1]/nav[1]/a[4]',
          tagName: 'a',
          timestamp: baseTimestamp,
          value: null,
          text: 'Contact',
          placeholder: null
        },
        {
          type: 'input',
          selector: 'input[name="firstName"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/input[1]',
          tagName: 'input',
          timestamp: baseTimestamp + 1000,
          value: 'John',
          text: '',
          placeholder: 'First Name'
        },
        {
          type: 'input',
          selector: 'input[name="lastName"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/input[2]',
          tagName: 'input',
          timestamp: baseTimestamp + 2000,
          value: 'Doe',
          text: '',
          placeholder: 'Last Name'
        },
        {
          type: 'input',
          selector: 'input[name="email"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/input[3]',
          tagName: 'input',
          timestamp: baseTimestamp + 3000,
          value: 'john.doe@example.com',
          text: '',
          placeholder: 'Email Address'
        },
        {
          type: 'input',
          selector: 'textarea[name="message"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/textarea[1]',
          tagName: 'textarea',
          timestamp: baseTimestamp + 4000,
          value: 'This is a test message generated by AI for testing purposes.',
          text: '',
          placeholder: 'Your message'
        },
        {
          type: 'click',
          selector: 'button[type="submit"]',
          xpath: '/html[1]/body[1]/div[1]/form[1]/button[1]',
          tagName: 'button',
          timestamp: baseTimestamp + 5000,
          value: null,
          text: 'Send Message',
          placeholder: null
        }
      ];
    }

    // Navigation scenario
    if (description.toLowerCase().includes('nav') || description.toLowerCase().includes('menu')) {
      const events = [
        {
          type: 'click',
          selector: 'nav a[href="/about"]',
          xpath: '/html[1]/body[1]/nav[1]/a[2]',
          tagName: 'a',
          timestamp: baseTimestamp,
          value: null,
          text: 'About',
          placeholder: null
        },
        {
          type: 'click',
          selector: 'nav a[href="/services"]',
          xpath: '/html[1]/body[1]/nav[1]/a[3]',
          tagName: 'a',
          timestamp: baseTimestamp + 2000,
          value: null,
          text: 'Services',
          placeholder: null
        },
        {
          type: 'click',
          selector: 'nav a[href="/contact"]',
          xpath: '/html[1]/body[1]/nav[1]/a[4]',
          tagName: 'a',
          timestamp: baseTimestamp + 4000,
          value: null,
          text: 'Contact',
          placeholder: null
        }
      ];

      // Add monkey testing events
      if (testType === 'Monkey') {
        events.push(
          {
            type: 'click',
            selector: 'button:nth-child(1)',
            xpath: '/html[1]/body[1]/div[1]/button[1]',
            tagName: 'button',
            timestamp: baseTimestamp + 6000,
            value: null,
            text: 'Random Button',
            placeholder: null
          },
          {
            type: 'input',
            selector: 'input[type="search"]',
            xpath: '/html[1]/body[1]/div[1]/input[1]',
            tagName: 'input',
            timestamp: baseTimestamp + 7000,
            value: 'random search query',
            text: '',
            placeholder: 'Search...'
          }
        );
      }

      return events;
    }

    // Default scenario
    return [
      {
        type: 'click',
        selector: 'body',
        xpath: '/html[1]/body[1]',
        tagName: 'body',
        timestamp: baseTimestamp,
        value: null,
        text: '',
        placeholder: null
      }
    ];
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();