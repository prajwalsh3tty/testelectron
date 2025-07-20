import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@/lib/api-base';

// Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  tags: string[];
  colorCode: string;
}

// Get all projects for a user
export function useProjects(userId: string) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}Projects/getAllProjects/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
  });
}

// Add a project
export function useAddProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Project, 'id'>) => {
      const res = await fetch(`${API_BASE}Projects/addProject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add project');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.userId] });
    },
  });
}

// Update a project
export function useUpdateProject(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: { projectId: string; name: string; description: string; tags: string[]; colorCode: string }) => {
      const res = await fetch(`${API_BASE}Projects/updateProject/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
    },
  });
}

// Delete a project
export function useDeleteProject(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`${API_BASE}Projects/deleteProject/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
    },
  });
}