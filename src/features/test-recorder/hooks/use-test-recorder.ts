import { useCallback } from 'react';
import { testRecorder } from '../api';
import { RecordedEvent } from '@/shared/types';

export const useTestRecorder = () => {
  const addEvent = useCallback((event: RecordedEvent) => {
    testRecorder.addEvent(event);
  }, []);

  const clearEvents = useCallback(() => {
    testRecorder.clearEvents();
  }, []);

  const getEvents = useCallback(() => {
    return testRecorder.getEvents();
  }, []);

  const generateTest = useCallback(() => {
    return testRecorder.generateTest();
  }, []);

  return {
    addEvent,
    clearEvents,
    getEvents,
    generateTest,
  };
};