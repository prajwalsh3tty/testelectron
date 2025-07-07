Here's the fixed script with all missing closing brackets added:

```typescript
import { useState, useEffect, useRef } from 'react';
// ... (all imports remain the same)

export function TestRecorderPanel() {
  // ... (all state and ref declarations remain the same)

  const deleteTimelineEvent = (id: string) => {
    setTimelineEvents(prev => prev.filter(event => event.id !== id));
      
    // Update current timeline tab events
    const currentEvents = getCurrentTimelineEvents();
    const updatedEvents = currentEvents.filter(event => event.id !== id);
    
    updateCurrentTimelineEvents(updatedEvents);
  };

  // ... (all other functions and effects remain the same)

  return (
    <div className="flex h-screen bg-background">
      <PanelGroup direction="horizontal" onLayout={handlePanelResize}>
        {/* ... (panel content remains the same) */}
                      <TabsContent value="timeline" className="flex-1 p-3 m-0 overflow-hidden">
                        <div className="h-full flex flex-col">
                          {/* ... (timeline content remains the same) */}
                        </div>
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        </Panel>

        {/* ... (rest of the panels and dialogs remain the same) */}

      </PanelGroup>

      {/* Event Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        {/* ... (dialog content remains the same) */}
      </Dialog>

      {/* Prompt Modal */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        {/* ... (dialog content remains the same) */}
      </Dialog>
    </div>
  );
}
```