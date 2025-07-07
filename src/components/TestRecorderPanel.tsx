Here's the fixed version with all missing closing brackets added:

```typescript
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
```