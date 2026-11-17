import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Hash,
  Search,
  ListFilter,
  X,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
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

  // 1. Determine which headings have direct child sub-headings
  const hasChildrenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (let i = 0; i < outline.length; i++) {
      const current = outline[i];
      const next = outline[i + 1];
      map.set(current.id, Boolean(next && next.level > current.level));
    }
    return map;
  }, [outline]);

  // 2. Toggle collapse for a specific heading
  const toggleCollapse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 3. One-click Expand All / Collapse All
  const areAllCollapsed = useMemo(() => {
    if (outline.length === 0) return false;
    let parentCount = 0;
    let collapsedParentCount = 0;
    for (const item of outline) {
      if (hasChildrenMap.get(item.id)) {
        parentCount++;
        if (collapsedIds.has(item.id)) collapsedParentCount++;
      }
    }
    return parentCount > 0 && collapsedParentCount === parentCount;
  }, [outline, hasChildrenMap, collapsedIds]);

  const toggleAllCollapse = () => {
    if (areAllCollapsed) {
      // Expand all
      setCollapsedIds(new Set());
    } else {
      // Collapse all headings that have children
      const allParents = new Set<string>();
      outline.forEach((item) => {
        if (hasChildrenMap.get(item.id)) {
          allParents.add(item.id);
        }
      });
      setCollapsedIds(allParents);
    }
  };

  // 4. Calculate items to display based on hierarchical folding & search filter
  const displayItems = useMemo(() => {
    // If user is searching, bypass collapse to show matching results
    if (filterText.trim()) {
      return outline.filter((item) =>
        item.text.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    const result: OutlineItem[] = [];
    let hidingBelowLevel: number | null = null;

    for (const item of outline) {
      if (hidingBelowLevel !== null) {
        if (item.level > hidingBelowLevel) {
          // Descendant of a collapsed parent, skip rendering
          continue;
        } else {
          // Reached a sibling or higher-level heading, stop hiding
          hidingBelowLevel = null;
        }
      }

      result.push(item);

      // If this heading is collapsed and has children, start hiding its descendants
      if (collapsedIds.has(item.id) && hasChildrenMap.get(item.id)) {
        hidingBelowLevel = item.level;
      }
    }

    return result;
  }, [outline, filterText, collapsedIds, hasChildrenMap]);

  return (
    <aside className="w-64 h-full bg-[#FAF7F2] border-r border-[#E8DFD1] flex flex-col flex-shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#F0E9DF]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <ListFilter className="w-3.5 h-3.5 text-[#C97B63]" />
            <span className="text-xs font-semibold text-[#38332B]">长卷大纲目录</span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Collapse / Expand All Button */}
            {outline.length > 0 && (
              <button
                type="button"
                onClick={toggleAllCollapse}
                className="p-1 rounded hover:bg-[#E8DFD1]/60 text-[#847D72] hover:text-[#38332B] transition-colors"
                title={areAllCollapsed ? '全部展开目录' : '全部收起目录'}
              >
                {areAllCollapsed ? (
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <span className="text-[10px] text-[#A4A09A] font-mono px-1.5 py-0.5 rounded bg-[#F3EBDD]">
              {outline.length} 节
            </span>
          </div>
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
        {displayItems.length === 0 ? (
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
          displayItems.map((item) => {
            const isActive = activeHeadingId === item.id;
            const hasChildren = Boolean(hasChildrenMap.get(item.id));
            const isCollapsed = collapsedIds.has(item.id);

            // Indentation by level:
            // H1: 4px
            // H2: 18px
            // H3: 32px
            // H4+: 44px
            const indentPx =
              item.level === 1 ? 4 : item.level === 2 ? 18 : item.level === 3 ? 32 : 44;

            return (
              <div
                key={item.id}
                onClick={() => onSelectHeading(item)}
                style={{ paddingLeft: `${indentPx}px` }}
                className={`group relative flex items-center py-1.5 pr-2 rounded-lg cursor-pointer transition-colors ${
                  item.level === 1 ? 'mt-1.5 first:mt-0' : 'mt-0.5'
                } ${
                  isActive
                    ? 'bg-[#FAF0ED] text-[#C97B63] border-l-2 border-[#C97B63]'
                    : 'hover:bg-[#F3EBDD]/60 border-l-2 border-transparent'
                }`}
              >
                {/* 1. Left Arrow (IDE style: permanently visible for parent headings) */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={(e) => toggleCollapse(item.id, e)}
                    className="w-4 h-4 flex items-center justify-center rounded hover:bg-[#E8DFD1] text-[#787168] hover:text-[#26221D] mr-1 flex-shrink-0 transition-colors"
                    title={isCollapsed ? '展开子节' : '折叠子节'}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center mr-1 flex-shrink-0">
                    <span
                      className={`w-1 h-1 rounded-full transition-colors ${
                        isActive
                          ? 'bg-[#C97B63]'
                          : 'bg-[#D5C7B5] group-hover:bg-[#A49C90]'
                      }`}
                    />
                  </div>
                )}

                {/* 2. Title Text with clear H1 vs H2 vs H3 typographic hierarchy */}
                <span
                  className={`truncate flex-1 ${
                    isActive
                      ? item.level === 1
                        ? 'text-[13px] font-bold text-[#C97B63]'
                        : item.level === 2
                        ? 'text-[12px] font-semibold text-[#C97B63]'
                        : 'text-[11.5px] font-medium text-[#C97B63]'
                      : item.level === 1
                      ? 'text-[13px] font-bold text-[#26221D] group-hover:text-[#181412]'
                      : item.level === 2
                      ? 'text-[12px] font-medium text-[#554E46] group-hover:text-[#26221D]'
                      : 'text-[11.5px] font-normal text-[#7E776E] group-hover:text-[#38332B]'
                  }`}
                >
                  {item.text || '未命名标题'}
                </span>
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
