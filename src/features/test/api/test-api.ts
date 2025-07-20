import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@/lib/api-base';

export interface Test {
  id: string;
  projectId: string;
  testType: number;
  testName: string;
  url: string;
  description: string;
  tags: string[];
}

// Get all tests for a project
export function useTests(projectId: string) {
  return useQuery({
    queryKey: ['tests', projectId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}TestSuite/getAllTests/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch tests');
      return res.json() as Promise<Test[]>;
    },
    enabled: !!projectId,
  });
}

// Add a test
export function useAddTest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Test, 'id'>) => {
      const res = await fetch(`${API_BASE}TestSuite/addTest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add test');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', projectId] });
    },
  });
}

// Update a test
export function useUpdateTest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, ...data }: { testId: string; testType: number; testName: string; url: string; description: string; tags: string[] }) => {
      const res = await fetch(`${API_BASE}TestSuite/updateTest/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update test');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', projectId] });
    },
  });
}

// Delete a test
export function useDeleteTest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      const res = await fetch(`${API_BASE}TestSuite/deleteTest/${testId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete test');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', projectId] });
    },
  });
} 
