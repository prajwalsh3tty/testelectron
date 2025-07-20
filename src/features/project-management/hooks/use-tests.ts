import { useState, useCallback } from 'react';
import { testStorage } from '@/shared/api';
import { SavedTest } from '@/shared/types';

export const useTests = (projectId?: string) => {
  const [tests, setTests] = useState<SavedTest[]>([]);

  const loadTests = useCallback(() => {
    if (projectId) {
      const projectTests = testStorage.getTestsByProject(projectId);
      setTests(projectTests.sort((a, b) => b.updatedAt - a.updatedAt));
    } else {
      const allTests = testStorage.getAllTests();
      setTests(allTests.sort((a, b) => b.updatedAt - a.updatedAt));
    }
  }, [projectId]);

  const saveTest = useCallback((test: SavedTest) => {
    testStorage.saveTest(test);
    loadTests();
  }, [loadTests]);

  const deleteTest = useCallback((testId: string) => {
    testStorage.deleteTest(testId);
    loadTests();
  }, [loadTests]);

  const duplicateTest = useCallback((testId: string) => {
    const duplicated = testStorage.duplicateTest(testId);
    if (duplicated) {
      loadTests();
    }
    return duplicated;
  }, [loadTests]);

  const searchTests = useCallback((query: string) => {
    return testStorage.searchTests(query, projectId);
  }, [projectId]);

  const getTestsByStatus = useCallback((status: SavedTest['status']) => {
    return testStorage.getTestsByStatus(status, projectId);
  }, [projectId]);

  const getTestsByTag = useCallback((tag: string) => {
    return testStorage.getTestsByTag(tag, projectId);
  }, [projectId]);

  return {
    tests,
    loadTests,
    saveTest,
    deleteTest,
    duplicateTest,
    searchTests,
    getTestsByStatus,
    getTestsByTag,
  };
};