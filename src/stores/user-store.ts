import { create } from 'zustand';

interface UserState {
  email: string | null;
  setEmail: (email: string) => void;
  clear: () => void;
}

const getInitialEmail = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-email');
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  email: getInitialEmail(),
  setEmail: (email) => {
    set({ email });
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-email', email);
    }
  },
  clear: () => {
    set({ email: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-email');
    }
  },
}));

// Sync Zustand store with localStorage on startup
if (typeof window !== 'undefined') {
  const email = localStorage.getItem('user-email');
  if (email) {
    useUserStore.getState().setEmail(email);
  }
} 