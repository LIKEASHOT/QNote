import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ArrowRight, X } from 'lucide-react';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useTabStore } from '../../stores/useTabStore';
import { NATURAL_PALETTES } from '../../constants/theme';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, openNotebook } = useTabStore();
  const { notebooks } = useNotebookStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Global shortcut Cmd+K / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  // Filter notebooks and headings
  const results = notebooks
    .map((nb) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        return {
          notebook: nb,
          matchType: 'recent' as const,
          snippet: nb.description || '无描述',
        };
      }
      const titleMatch = nb.title.toLowerCase().includes(q);
      const descMatch = nb.description?.toLowerCase().includes(q);
      const contentIndex = nb.content.toLowerCase().indexOf(q);

      if (titleMatch || descMatch || contentIndex !== -1) {
        let snippet = nb.description || '';
        if (contentIndex !== -1) {
          const rawText = nb.content.replace(/<[^>]*>/g, ' ');
          const textIdx = rawText.toLowerCase().indexOf(q);
          const start = Math.max(0, textIdx - 30);
          const end = Math.min(rawText.length, textIdx + 60);
          snippet = (start > 0 ? '...' : '') + rawText.substring(start, end) + (end < rawText.length ? '...' : '');
        }
        return {
          notebook: nb,
          matchType: titleMatch ? ('title' as const) : ('content' as const),
          snippet,
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{
    notebook: (typeof notebooks)[0];
    matchType: 'recent' | 'title' | 'content';
    snippet: string;
  }>;

  const handleSelect = (notebookId: string) => {
    openNotebook(notebookId);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].notebook.id);
    }
  };

  return (
    <div
      onClick={() => setSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{
        backgroundColor: 'rgba(44, 39, 35, 0.4)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl bg-white rounded-2xl border border-[#E8DFD1] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#F0E9DF] bg-[#FAF7F2]/80">
          <Search className="w-4 h-4 text-[#C97B63] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="搜索笔记本标题、论文摘录或知识点 (按 Esc 退出)..."
            className="w-full bg-transparent text-sm text-[#38332B] placeholder-[#C4B8A5] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#A4A09A] hover:text-[#38332B] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-[#A4A09A]">
              <p className="text-sm">未找到与 “{query}” 相关的笔记本或内容</p>
            </div>
          ) : (
            results.map((res, index) => {
              const isSelected = index === selectedIndex;
              const palette =
                NATURAL_PALETTES[res.notebook.colorKey] || NATURAL_PALETTES.clay;

              return (
                <div
                  key={res.notebook.id}
                  onClick={() => handleSelect(res.notebook.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FAF0ED] border border-[#F0D5CD]'
                      : 'hover:bg-[#FAF7F2] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                    {/* Cover Color Pill */}
                    <div
                      className="w-8 h-10 rounded-md flex-shrink-0 flex items-center justify-center border shadow-2xs"
                      style={{
                        backgroundColor: palette.bgColor,
                        borderColor: palette.borderColor,
                      }}
                    >
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: palette.textColor }}
                      />
                    </div>

                    {/* Title and snippet */}
                    <div className="truncate flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-[#38332B] truncate">
                          {res.notebook.title}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.2 rounded-full font-medium"
                          style={{
                            backgroundColor: palette.bgColor,
                            color: palette.textColor,
                          }}
                        >
                          {palette.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#847D72] truncate mt-0.5">
                        {res.snippet}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 text-[#C97B63] flex-shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-[#F0E9DF] bg-[#FAF7F2]/50 flex items-center justify-between text-[11px] text-[#A4A09A]">
          <div className="flex items-center space-x-3">
            <span>↑↓ 切换</span>
            <span>↵ 确认打开</span>
            <span>Esc 退出</span>
          </div>
          <span>QNote 暖纸全局检索</span>
        </div>
      </div>
    </div>
  );
};
