export const INJECT_SCRIPT = `
  // Ensure the script only runs once
  if (!window.__testRecorder) {
    class WebviewTestRecorder {
      constructor() {
        this.attachEventListeners();
        console.log('Test recorder initialized');
        // Add visual indicator
        const style = document.createElement('style');
        style.textContent = \`
          .recording-highlight { outline: 2px solid red !important; }
        \`;
        document.head.appendChild(style);

        // Handle iframes and popups
        this.observeIframes();
        this.handlePopups();
      }

      // --- UPDATED: Full XPath Generation Logic ---
      // This function now generates the full, unabbreviated XPath from the root.
      _generateXPath(element) {
        // If the element is invalid, return an empty string.
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
          return '';
        }
        
        const path = [];
        // Traverse up the DOM tree from the element to the HTML root.
        while (element && element.nodeType === Node.ELEMENT_NODE) {
          let index = 1;
          // Count preceding siblings with the same tag name to determine the index.
          for (let sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
            if (sibling.nodeName === element.nodeName) {
              index++;
            }
          }

          const tagName = element.nodeName.toLowerCase();
          // Create the path segment with the tag name and its calculated index.
          const pathIndex = \`[\${index}]\`;
          
          // Prepend the segment to the path array.
          path.unshift(tagName + pathIndex);
          
          // Move up to the next parent element.
          element = element.parentNode;
        }

        // Join all segments to form the final, full XPath string, starting with a '/'.
        return path.length ? '/' + path.join('/') : '';
      }

      // --- NEW: Extract ID attribute ---
      getElementId(element) {
        return element.id || null;
      }

      // --- NEW: Extract name attribute ---
      getElementName(element) {
        return element.getAttribute('name') || null;
      }

      // --- MODIFIED: Event Handler ---
      // Now captures selector, full XPath, and separate id/name fields.
      handleEvent(type, event, context = null) {
        const target = event.target;
        if (!(target instanceof Element)) return;

        // Generate all identifiers
        const selector = this.generateSelector(target, context);
        const xpath = this._generateXPath(target); // Generate the full XPath
        const id = this.getElementId(target); // Extract ID
        const name = this.getElementName(target); // Extract name
        const value = this.getElementValue(target);
        const placeholder = this.getElementPlaceholder(target); // Get placeholder text
        const tagName = target.tagName.toLowerCase();
        
        const recordedEvent = {
          type,
          selector,
          xpath, // Include full XPath in the event payload
          id, // Include ID as separate field
          name, // Include name as separate field
          tagName,
          timestamp: Date.now(),
          value,
          placeholder, // Include placeholder text in the event payload
          text: target.textContent?.trim() || '',
          context: context ? {
            type: context.type,
            src: context.src || '',
            selector: context.selector || ''
          } : null
        };

        // Visual feedback
        target.style.outline = '2px solid green';
        setTimeout(() => {
          target.style.outline = '';
        }, 500);

        // Send event to host app via console.log
        console.log(JSON.stringify({
          type: 'RECORDED_EVENT',
          event: recordedEvent
        }));
      }
      
      // --- NEW: Get placeholder text from input elements ---
      getElementPlaceholder(element) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.placeholder || null;
        }
        return null;
      }
      
      // All other methods from your script remain the same...
      // (handlePopups, observeIframes, generateSelector, etc.)
      handlePopups() {
        const originalOpen = window.open;
        window.open = (...args) => {
          const popup = originalOpen.apply(window, args);
          if (popup) {
            try {
              setTimeout(() => this.injectIntoPopup(popup), 500);
            } catch (error) { console.error('Error handling popup:', error); }
          }
          return popup;
        };
      }
      injectIntoPopup(popup) {
        try {
          const style = popup.document.createElement('style');
          style.textContent = \`.recording-highlight { outline: 2px solid red !important; }\`;
          popup.document.head.appendChild(style);
          this.attachEventListenersToDocument(popup.document, { type: 'popup', src: popup.location.href });
          this.observeIframesInWindow(popup);
        } catch (error) { console.error('Error injecting into popup:', error); }
      }
      observeIframes() {
        this.attachToIframes();
        this.observeIframesInWindow(window);
      }
      observeIframesInWindow(win) {
        try {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node instanceof win.HTMLIFrameElement) { this.attachToIframe(node); }
                if (node instanceof win.Element) {
                  const iframes = node.getElementsByTagName('iframe');
                  Array.from(iframes).forEach(iframe => this.attachToIframe(iframe));
                }
              });
            });
          });
          observer.observe(win.document.body, { childList: true, subtree: true });
        } catch (error) { console.error('Error observing iframes:', error); }
      }
      attachToIframes() {
        document.querySelectorAll('iframe').forEach(iframe => this.attachToIframe(iframe));
      }
      attachToIframe(iframe) {
        try {
          const handleIframeLoad = () => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                const style = iframeDoc.createElement('style');
                style.textContent = \`.recording-highlight { outline: 2px solid red !important; }\`;
                iframeDoc.head.appendChild(style);
                this.attachEventListenersToDocument(iframeDoc, { type: 'iframe', src: iframe.src, selector: this.generateSelector(iframe) });
                this.observeIframesInWindow(iframe.contentWindow);
              }
            } catch (error) { console.error('Error accessing iframe content:', error); }
          };
          iframe.addEventListener('load', handleIframeLoad);
          if (iframe.contentDocument?.readyState === 'complete') { handleIframeLoad(); }
        } catch (error) { console.error('Error attaching to iframe:', error); }
      }
      attachEventListenersToDocument(doc, context = null) {
        const events = ['click', 'input', 'change', 'submit'];
        events.forEach(eventType => {
          doc.addEventListener(eventType, (e) => {
            if (e.target instanceof Element) {
              this.handleEvent(eventType, e, context);
            }
          }, true);
        });
        doc.addEventListener('mouseover', (e) => { if (e.target instanceof Element) e.target.classList.add('recording-highlight'); }, true);
        doc.addEventListener('mouseout', (e) => { if (e.target instanceof Element) e.target.classList.remove('recording-highlight'); }, true);
      }
      attachEventListeners() { this.attachEventListenersToDocument(document); }
      getElementValue(element) {
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
          return element.value;
        }
        return null;
      }
      generateSelector(element, context = null) {
        let selector = '';
        if (context) {
          if (context.type === 'iframe' && context.selector) { selector = context.selector + ' '; }
        }
        if (element.getAttribute('data-testid')) { return selector + \`[data-testid="\${element.getAttribute('data-testid')}"]\`; }
        if (element.id) { return selector + '#' + element.id; }
        if (element.getAttribute('name')) { return selector + \`[name="\${element.getAttribute('name')}"]\`; }
        if (element.getAttribute('aria-label')) { return selector + \`[aria-label="\${element.getAttribute('aria-label')}"]\`; }
        
        let path = '';
        let current = element;
        while(current && current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() !== 'body') {
            let elementSelector = current.tagName.toLowerCase();
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const sameTagSiblings = siblings.filter(sibling => sibling.tagName === current.tagName);
                if (sameTagSiblings.length > 1) {
                    const index = sameTagSiblings.indexOf(current);
                    elementSelector += \`:nth-of-type(\${index + 1})\`;
                }
            }
            path = elementSelector + (path ? ' > ' + path : '');
            current = current.parentElement;
        }
        return selector + path;
      }
    }
    window.__testRecorder = new WebviewTestRecorder();
    console.log('Test recorder script injected and initialized successfully');
  } else {
    console.log('Test recorder already initialized');
  }
`;