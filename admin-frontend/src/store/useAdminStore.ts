import { create } from 'zustand';
import type { User } from '../types';

const ADMIN_STORAGE_KEY = 'ai-library-admin-user';
const SECTION_STORAGE_KEY = 'ai-library-admin-section';

const loadAdmin = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveAdmin = (admin: User | null) => {
  if (typeof window === 'undefined') return;
  if (!admin) {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
};

const loadSection = (): string => {
  if (typeof window === 'undefined') return 'dashboard';
  return localStorage.getItem(SECTION_STORAGE_KEY) || 'dashboard';
};

const saveSection = (section: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SECTION_STORAGE_KEY, section);
  }
};

interface AdminStore {
  currentAdmin: User | null;
  activeSection: string;
  sidebarOpen: boolean;
  setCurrentAdmin: (admin: User | null) => void;
  setActiveSection: (section: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  currentAdmin: loadAdmin(),
  activeSection: loadSection(),
  sidebarOpen: true,
  setCurrentAdmin: (admin) => {
    saveAdmin(admin);
    set({ currentAdmin: admin });
  },
  setActiveSection: (section) => {
    saveSection(section);
    set({ activeSection: section });
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
