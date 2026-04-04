import { create } from 'zustand';
import type { Notification, Floor, User } from '../types';

const STORAGE_KEY = 'ai-library-bookmarks';
const USER_STORAGE_KEY = 'ai-library-current-user';
const TAB_STORAGE_KEY = 'ai-library-active-tab';

// Load bookmarks from localStorage
const loadBookmarks = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save bookmarks to localStorage
const saveBookmarks = (bookmarks: string[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
};

const loadUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const loadActiveTab = (): string => {
  if (typeof window === 'undefined') return 'search';
  return localStorage.getItem(TAB_STORAGE_KEY) || 'search';
};

const saveActiveTab = (tab: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  }
};

interface AppState {
  // Current active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;

  // Seats
  selectedFloor: Floor | null;
  setSelectedFloor: (floor: Floor) => void;

  // Bookmarks (offline favorites)
  bookmarks: string[];
  toggleBookmark: (bookId: string) => void;
  isBookmarked: (bookId: string) => boolean;
  clearBookmarks: () => void;

  // UI states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: loadActiveTab(),
  setActiveTab: (tab) => {
    saveActiveTab(tab);
    set({ activeTab: tab });
  },

  currentUser: loadUser(),
  setCurrentUser: (user) => {
    saveUser(user);
    set({ currentUser: user });
  },

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
  }),
  markAsRead: (id) => {
    const notifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  },

  selectedFloor: null,
  setSelectedFloor: (floor) => set({ selectedFloor: floor }),

  // Bookmarks
  bookmarks: loadBookmarks(),
  toggleBookmark: (bookId) => {
    const current = get().bookmarks;
    let newBookmarks: string[];

    if (current.includes(bookId)) {
      newBookmarks = current.filter(id => id !== bookId);
    } else {
      newBookmarks = [...current, bookId];
    }

    saveBookmarks(newBookmarks);
    set({ bookmarks: newBookmarks });
  },
  isBookmarked: (bookId) => {
    return get().bookmarks.includes(bookId);
  },
  clearBookmarks: () => {
    saveBookmarks([]);
    set({ bookmarks: [] });
  },

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
