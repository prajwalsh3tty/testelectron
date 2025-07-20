import { useState, useCallback } from 'react';
import { testStorage } from '@/shared/api';
import { Project } from '@/shared/types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(() => {
    const allProjects = testStorage.getAllProjects();
    setProjects(allProjects.sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const saveProject = useCallback((project: Project) => {
    testStorage.saveProject(project);
    loadProjects();
  }, [loadProjects]);

  const deleteProject = useCallback((projectId: string) => {
    testStorage.deleteProject(projectId);
    loadProjects();
  }, [loadProjects]);

  const duplicateProject = useCallback((projectId: string) => {
    const duplicated = testStorage.duplicateProject(projectId);
    if (duplicated) {
      loadProjects();
    }
    return duplicated;
  }, [loadProjects]);

  const searchProjects = useCallback((query: string) => {
    return testStorage.searchProjects(query);
  }, []);

  const getProjectStats = useCallback((projectId: string) => {
    return testStorage.getProjectStats(projectId);
  }, []);

  const getGlobalStats = useCallback(() => {
    return testStorage.getGlobalStats();
  }, []);

  const exportProject = useCallback((projectId: string) => {
    return testStorage.exportProject(projectId);
  }, []);

  const exportAllProjects = useCallback(() => {
    return testStorage.exportAllData();
  }, []);

  const importProjects = useCallback((jsonData: string) => {
    const result = testStorage.importAllData(jsonData);
    if (result.success) {
      loadProjects();
    }
    return result;
  }, [loadProjects]);

  return {
    projects,
    loadProjects,
    saveProject,
    deleteProject,
    duplicateProject,
    searchProjects,
    getProjectStats,
    getGlobalStats,
    exportProject,
    exportAllProjects,
    importProjects,
  };
};