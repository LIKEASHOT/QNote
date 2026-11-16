import React from 'react';
import { BookOpen, X, Plus, Search, PanelLeft, Check } from 'lucide-react';
import { useTabStore } from '../../stores/useTabStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { NATURAL_PALETTES } from '../../constants/theme';

export const TitleBar: React.FC = () => {
  const {
    activeView,
    openTabIds,
    activeTabId,
    setActiveTab,
    closeTab,
    goToBookshelf,
    isOutlineOpen,
    toggleOutline,
    toggleSearch,
  } = useTabStore();

  const { notebooks } = useNotebookStore();

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only toggle maximize if double-clicking on draggable area, not on buttons or tabs
    const target = e.target as HTMLElement;
    if (target.closest('.app-no-drag')) return;

    if ((window as any).electronAPI?.toggleMaximize) {
      (window as any).electronAPI.toggleMaximize();
    }
  };

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="h-11 bg-[#F3EBDD]/90 border-b border-[#E8DFD1] flex items-center justify-between px-3 select-none z-30 flex-shrink-0 backdrop-blur-md app-drag"
    >
      {/* Left: macOS Native Traffic Lights Reserved Space + Bookshelf Home Icon */}
      <div className="flex items-center space-x-2">
        {/* Reserved space for macOS Native Traffic Lights (draggable area) */}
        <div className="w-[74px] h-full flex-shrink-0" />

        {/* Bookshelf Home Button */}
        <button
          onClick={goToBookshelf}
          className={`app-no-drag flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            activeView === 'bookshelf'
              ? 'bg-[#C97B63] text-white shadow-2xs'
              : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]/80'
          }`}
          title="返回我的书架"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>书架</span>
        </button>
      </div>

      {/* Middle: Tab List (container is draggable, only tabs and buttons are no-drag) */}
      <div className="flex-1 flex items-center space-x-1 overflow-x-auto no-scrollbar mx-2 h-full py-1">
        {openTabIds.map((tabId) => {
          const nb = notebooks.find((n) => n.id === tabId);
          if (!nb) return null;

          const isActive = activeView === 'editor' && activeTabId === tabId;
          const palette = NATURAL_PALETTES[nb.colorKey] || NATURAL_PALETTES.clay;

          return (
            <div
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`app-no-drag group relative flex items-center space-x-2 px-3 py-1.5 h-8 rounded-lg text-xs cursor-pointer transition-all max-w-[200px] border ${
                isActive
                  ? 'bg-white text-[#38332B] border-[#E8DFD1] shadow-2xs font-medium'
                  : 'text-[#847D72] hover:text-[#38332B] hover:bg-[#FAF7F2]/60 border-transparent'
              }`}
            >
              {/* Notebook Color Indicator */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: palette.color }}
              />

              {/* Title */}
              <span className="truncate flex-1">{nb.title}</span>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className={`p-0.5 rounded hover:bg-[#E8DFD1] text-[#A4A09A] hover:text-[#38332B] transition-colors ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="关闭此标签 (Cmd+W)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Plus Button to go to Bookshelf */}
        <button
          onClick={goToBookshelf}
          className="app-no-drag p-1 rounded-lg text-[#847D72] hover:text-[#38332B] hover:bg-[#FAF7F2]/80 transition-colors"
          title="新建或打开笔记本"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Quick Search + Outline Toggle + Save Status */}
      <div className="flex items-center space-x-2">
        <span className="hidden md:flex items-center space-x-1 text-[11px] text-[#A4A09A] pr-1">
          <Check className="w-3 h-3 text-[#9EAD90]" />
          <span>已保存</span>
        </span>

        {/* Search Pill */}
        <button
          onClick={toggleSearch}
          className="app-no-drag flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#58544E] hover:text-[#38332B] border border-[#E8DFD1] text-xs transition-all shadow-2xs"
          title="全局快速搜索 (Cmd+K)"
        >
          <Search className="w-3 h-3 text-[#847D72]" />
          <span className="hidden sm:inline text-[11px] text-[#847D72]">搜索</span>
          <kbd className="hidden sm:inline-block text-[9px] bg-[#F3EBDD] px-1 py-0.2 rounded text-[#847D72] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Outline Toggle (only shown when in editor view) */}
        {activeView === 'editor' && (
          <button
            onClick={toggleOutline}
            className={`app-no-drag p-1.5 rounded-lg border transition-all ${
              isOutlineOpen
                ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
                : 'bg-white/70 text-[#847D72] hover:text-[#38332B] border-[#E8DFD1]'
            }`}
            title="显示/隐藏大纲目录 (Cmd+\)"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
