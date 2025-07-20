import { useQuery, useMutation } from '@tanstack/react-query';
import { API_BASE } from '@/lib/api-base';

export const generateSeleniumCode = async (uniqueId: string) => {
  const response = await fetch(
    `${API_BASE}/generateseleniumcode?uniqueId=${uniqueId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const runSeleniumCode = async (uniqueId: string) => {
  const response = await fetch(
    `${API_BASE}/initiatetestrun?uniqueId=${uniqueId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export function useGenerateSeleniumCode(fileId: string, enabled = false) {
  return useQuery({
    queryKey: ['seleniumCode', fileId],
    queryFn: () => generateSeleniumCode(fileId),
    enabled,
  });
}

export function useRunSeleniumCode(fileId: string, enabled = false) {
  return useQuery({
    queryKey: ['runSeleniumCode', fileId],
    queryFn: () => runSeleniumCode(fileId),
    enabled,
  });
}

export function useInitProcessMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${API_BASE}/initprocess`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error(`Init process failed: ${response.statusText}`);
      return response.json();
    },
  });
}

export function useGenerateFeatureMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${API_BASE}/generatefeature`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error(`Generate feature failed: ${response.statusText}`);
      return response.json();
    },
  });
} 