import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Hash, Search, ListFilter, X } from 'lucide-react';
import { OutlineItem } from '../../types';

interface SidebarProps {
  outline: OutlineItem[];
  activeHeadingId: string | null;
  onSelectHeading: (item: OutlineItem) => void;
  notebookTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  outline,
  activeHeadingId,
  onSelectHeading,
  notebookTitle,
}) => {
  const [filterText, setFilterText] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredOutline = outline.filter((item) =>
    item.text.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <aside className="w-64 h-full bg-[#FAF7F2] border-r border-[#E8DFD1] flex flex-col flex-shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#F0E9DF]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <ListFilter className="w-3.5 h-3.5 text-[#C97B63]" />
            <span className="text-xs font-semibold text-[#38332B]">长卷大纲目录</span>
          </div>
          <span className="text-[10px] text-[#A4A09A] font-mono px-1.5 py-0.5 rounded bg-[#F3EBDD]">
            {outline.length} 节
          </span>
        </div>

        {/* Outline Search Filter */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-[#A4A09A] absolute left-2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="在目录中过滤..."
            className="w-full bg-[#F3EBDD]/60 hover:bg-[#F3EBDD] focus:bg-white text-xs pl-7 pr-6 py-1 rounded-lg border border-[#E8DFD1] focus:border-[#C97B63] focus:outline-none transition-all placeholder-[#C4B8A5]"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2 text-[#A4A09A] hover:text-[#38332B]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Heading List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
        {filteredOutline.length === 0 ? (
          <div className="text-center py-8 text-[#A4A09A]">
            <Hash className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
            <p className="text-xs">
              {filterText ? '无匹配标题' : '暂无多级标题'}
            </p>
            <p className="text-[11px] mt-1 text-[#C4B8A5]">
              使用 Cmd+1~3 快速创建标题
            </p>
          </div>
        ) : (
          filteredOutline.map((item) => {
            const isActive = activeHeadingId === item.id;
            const isCollapsed = collapsedIds.has(item.id);
            const indentLevel = Math.max(0, item.level - 1);

            return (
              <div
                key={item.id}
                onClick={() => onSelectHeading(item)}
                style={{ paddingLeft: `${indentLevel * 12 + 6}px` }}
                className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#FAF0ED] text-[#C97B63] font-medium border-l-2 border-[#C97B63]'
                    : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#F3EBDD]/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {/* Heading Level Tag */}
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      item.level === 1
                        ? 'bg-[#E8DFD1] text-[#38332B] font-bold'
                        : item.level === 2
                        ? 'bg-[#F0E9DF] text-[#58544E]'
                        : 'text-[#A4A09A]'
                    }`}
                  >
                    H{item.level}
                  </span>

                  {/* Title text */}
                  <span className="truncate text-xs">{item.text || '未命名标题'}</span>
                </div>

                {/* Sub-level folding toggle for H1/H2 */}
                {item.level <= 2 && (
                  <button
                    onClick={(e) => toggleCollapse(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#E8DFD1]/60 text-[#A4A09A] hover:text-[#38332B] transition-opacity"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {notebookTitle && (
        <div className="p-2.5 border-t border-[#F0E9DF] bg-[#F3EBDD]/40 text-[11px] text-[#847D72] truncate">
          <span className="text-[#A4A09A]">当前笔记本：</span>
          <span className="font-medium text-[#38332B]">{notebookTitle}</span>
        </div>
      )}
    </aside>
  );
};
