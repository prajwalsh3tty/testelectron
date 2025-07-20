import { useState, useCallback } from 'react';
import { generateSeleniumCode, runSeleniumCode, SeleniumCodeResponse } from '../api';

export const useSeleniumCode = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateCode = useCallback(async (uniqueId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await generateSeleniumCode(uniqueId);
      if (response.result) {
        setGeneratedCode(response.result);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const runCode = useCallback(async (uniqueId: string) => {
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await runSeleniumCode(uniqueId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCode = useCallback(() => {
    setGeneratedCode('');
  }, []);

  return {
    isGenerating,
    isRunning,
    generatedCode,
    error,
    generateCode,
    runCode,
    clearError,
    clearCode,
  };
};