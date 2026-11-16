import { create } from 'zustand';

interface TabState {
  activeView: 'bookshelf' | 'editor';
  openTabIds: string[];
  activeTabId: string | null;
  isOutlineOpen: boolean;
  isSearchOpen: boolean;

  openNotebook: (id: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  goToBookshelf: () => void;
  toggleOutline: () => void;
  setOutlineOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  activeView: 'editor',
  openTabIds: ['nb-java-concurrency', 'nb-transformer-paper'],
  activeTabId: 'nb-java-concurrency',
  isOutlineOpen: true,
  isSearchOpen: false,

  openNotebook: (id) => {
    const { openTabIds } = get();
    if (!openTabIds.includes(id)) {
      set({
        openTabIds: [...openTabIds, id],
        activeTabId: id,
        activeView: 'editor',
      });
    } else {
      set({
        activeTabId: id,
        activeView: 'editor',
      });
    }
  },

  closeTab: (id) => {
    const { openTabIds, activeTabId } = get();
    const newTabs = openTabIds.filter((tabId) => tabId !== id);
    
    if (newTabs.length === 0) {
      set({
        openTabIds: [],
        activeTabId: null,
        activeView: 'bookshelf',
      });
      return;
    }

    if (activeTabId === id) {
      // Switch to previous or first tab
      const closedIndex = openTabIds.indexOf(id);
      const nextActive = newTabs[Math.max(0, closedIndex - 1)];
      set({
        openTabIds: newTabs,
        activeTabId: nextActive,
      });
    } else {
      set({ openTabIds: newTabs });
    }
  },

  setActiveTab: (id) => {
    set({
      activeTabId: id,
      activeView: 'editor',
    });
  },

  goToBookshelf: () => {
    set({ activeView: 'bookshelf' });
  },

  toggleOutline: () => {
    set((state) => ({ isOutlineOpen: !state.isOutlineOpen }));
  },

  setOutlineOpen: (open) => {
    set({ isOutlineOpen: open });
  },

  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  setSearchOpen: (open) => {
    set({ isSearchOpen: open });
  },
}));
