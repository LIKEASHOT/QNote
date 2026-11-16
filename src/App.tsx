import React, { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { BookshelfView } from './components/bookshelf/BookshelfView';
import { EditorView } from './components/editor/EditorView';
import { SearchModal } from './components/layout/SearchModal';
import { useTabStore } from './stores/useTabStore';

export const App: React.FC = () => {
  const { activeView, activeTabId, closeTab, goToBookshelf } = useTabStore();

  // Global window keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === 'w') {
        // Close current tab
        if (activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
      } else if (isCmd && e.key.toLowerCase() === 't') {
        e.preventDefault();
        goToBookshelf();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab, goToBookshelf]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FAF7F2] text-[#38332B] font-sans">
      {/* macOS Native-styled TitleBar with Traffic Lights & Tabs */}
      <TitleBar />

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeView === 'bookshelf' || !activeTabId ? (
          <BookshelfView />
        ) : (
          <EditorView notebookId={activeTabId} />
        )}
      </main>

      {/* Global Spotlight Search Modal */}
      <SearchModal />
    </div>
  );
};

export default App;
