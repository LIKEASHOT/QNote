import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { NATURAL_PALETTES } from '../../constants/theme';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useTabStore } from '../../stores/useTabStore';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNotebookModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorKey, setSelectedColorKey] = useState('clay');
  const { createNotebook } = useNotebookStore();
  const { openNotebook } = useTabStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook = createNotebook(title.trim(), selectedColorKey, description.trim());
    openNotebook(newBook.id);
    onClose();
    setTitle('');
    setDescription('');
  };

  const activePalette = NATURAL_PALETTES[selectedColorKey] || NATURAL_PALETTES.clay;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(44, 39, 35, 0.4)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-[#E8DFD1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activePalette.color }}
            />
            <h3 className="text-sm font-semibold text-[#38332B]">创建新的学习笔记本</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#A4A09A] hover:text-[#38332B] p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#58544E] mb-1.5">
              笔记本名称 <span className="text-[#C97B63]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Java 核心并发模型 / 深度学习论文笔记..."
              className="w-full px-3 py-2 bg-[#FAF7F2] text-[#38332B] text-xs rounded-xl border border-[#E8DFD1] focus:bg-white focus:border-[#C97B63] focus:outline-none transition-all placeholder-[#C4B8A5]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#58544E] mb-1.5">
              简介或学习目标 (可选)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="写下本笔记本的记录宗旨、核心考点或参考书目..."
              className="w-full px-3 py-2 bg-[#FAF7F2] text-[#38332B] text-xs rounded-xl border border-[#E8DFD1] focus:bg-white focus:border-[#C97B63] focus:outline-none transition-all placeholder-[#C4B8A5] resize-none"
            />
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-semibold text-[#58544E] mb-2">
              自定义手帐封面配色 (Claude 自然系莫兰迪)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(NATURAL_PALETTES).map(([key, palette]) => {
                const isSelected = selectedColorKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedColorKey(key)}
                    className={`flex items-center space-x-1.5 p-1.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-[#C97B63] bg-[#FAF0ED] shadow-2xs'
                        : 'border-[#E8DFD1] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: palette.color }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="text-[11px] text-[#58544E] truncate">
                      {palette.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F0E9DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#58544E] hover:text-[#38332B] rounded-xl border border-[#E8DFD1] hover:bg-[#FAF7F2] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-[#C97B63] hover:bg-[#B66B54] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xs transition-colors"
            >
              创建并开启
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
