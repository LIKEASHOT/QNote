import React, { useState } from 'react';
import { Plus, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useTabStore } from '../../stores/useTabStore';
import { NATURAL_PALETTES } from '../../constants/theme';
import { CreateNotebookModal } from './CreateNotebookModal';

export const BookshelfView: React.FC = () => {
  const { notebooks, deleteNotebook } = useNotebookStore();
  const { openNotebook } = useTabStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8 md:p-12 select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8DFD1] pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF0ED] text-[#A45842] border border-[#F0D5CD] text-[11px] font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C97B63]" />
              <span>QNote 暖纸手帐书架</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#38332B] tracking-tight">
              我的学习笔记本
            </h1>
            <p className="text-xs md:text-sm text-[#847D72] mt-1">
              轻量、抗臃肿、无干扰的长卷书写空间。每个笔记本均为无限延展的知识画布。
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#C97B63] hover:bg-[#B66B54] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>新建笔记本</span>
          </button>
        </div>

        {/* Notebooks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <div
            onClick={() => setIsCreateOpen(true)}
            className="group flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed border-[#E8DFD1] hover:border-[#C97B63] bg-white/40 hover:bg-white cursor-pointer transition-all p-6 text-center shadow-2xs hover:shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F3EBDD] group-hover:bg-[#FAF0ED] flex items-center justify-center text-[#847D72] group-hover:text-[#C97B63] transition-colors mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#38332B] group-hover:text-[#C97B63] transition-colors">
              创建新的笔记本
            </h4>
            <p className="text-xs text-[#A4A09A] mt-1 max-w-[200px]">
              设定手帐封面颜色，开启论文研读或专业知识长卷
            </p>
          </div>

          {/* List of Notebooks */}
          {notebooks.map((nb) => {
            const palette = NATURAL_PALETTES[nb.colorKey] || NATURAL_PALETTES.clay;

            return (
              <div
                key={nb.id}
                onClick={() => openNotebook(nb.id)}
                className="group relative flex flex-col justify-between min-h-[220px] rounded-2xl border border-[#E8DFD1] bg-white hover:border-[#F0D5CD] hover:shadow-xs transition-all overflow-hidden cursor-pointer p-5"
              >
                {/* Book Spine Bar & Top Meta */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                      style={{
                        backgroundColor: palette.bgColor,
                        color: palette.textColor,
                        borderColor: palette.borderColor,
                      }}
                    >
                      {palette.label}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除笔记本《${nb.title}》吗？`)) {
                          deleteNotebook(nb.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#A4A09A] hover:text-[#C97B63] hover:bg-[#FAF0ED] transition-all"
                      title="删除笔记本"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Notebook Title & Desc */}
                  <div className="space-y-1.5">
                    <div className="flex items-start space-x-2">
                      <div
                        className="w-1.5 h-6 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: palette.color }}
                      />
                      <h3 className="text-sm font-bold text-[#38332B] group-hover:text-[#C97B63] transition-colors line-clamp-2">
                        {nb.title}
                      </h3>
                    </div>
                    {nb.description && (
                      <p className="text-xs text-[#847D72] line-clamp-2 pl-3.5 leading-relaxed">
                        {nb.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-[#F0E9DF] flex items-center justify-between text-[11px] text-[#A4A09A]">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#A4A09A]" />
                    <span>更新于 {formatTime(nb.updatedAt)}</span>
                  </div>

                  <span className="flex items-center space-x-0.5 font-medium text-[#C97B63] group-hover:translate-x-0.5 transition-transform">
                    <span>打开</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      <CreateNotebookModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
