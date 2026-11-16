import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { X, Sigma, Check } from 'lucide-react';

interface MathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (formula: string, isBlock: boolean) => void;
}

export const MathModal: React.FC<MathModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [formula, setFormula] = useState('\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V');
  const [isBlock, setIsBlock] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    try {
      katex.render(formula || '\\text{请输入 LaTeX 公式}', previewRef.current, {
        displayMode: isBlock,
        throwOnError: true,
      });
      setRenderError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRenderError(err.message);
      } else {
        setRenderError(String(err));
      }
    }
  }, [formula, isBlock]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formula.trim()) return;
    onInsert(formula.trim(), isBlock);
    onClose();
  };

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
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E8DFD1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center space-x-2">
            <Sigma className="w-4 h-4 text-[#C97B63]" />
            <h3 className="text-sm font-semibold text-[#38332B]">
              插入学术数学公式 (KaTeX)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#A4A09A] hover:text-[#38332B] p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Preview Box */}
          <div>
            <label className="block text-xs font-semibold text-[#58544E] mb-1.5">
              实时渲染预览
            </label>
            <div className="min-h-[80px] p-4 bg-[#FAF7F2] border border-[#E8DFD1] rounded-xl flex items-center justify-center overflow-x-auto text-[#38332B]">
              <div ref={previewRef} />
            </div>
            {renderError && (
              <p className="text-[11px] text-[#C97B63] mt-1 font-mono">
                {renderError}
              </p>
            )}
          </div>

          {/* Formula Input */}
          <div>
            <label className="block text-xs font-semibold text-[#58544E] mb-1.5">
              LaTeX 源码
            </label>
            <textarea
              rows={3}
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="例如：\sum_{i=1}^{n} x_i"
              className="w-full px-3 py-2 bg-[#FAF7F2] text-[#38332B] font-mono text-xs rounded-xl border border-[#E8DFD1] focus:bg-white focus:border-[#C97B63] focus:outline-none transition-all placeholder-[#C4B8A5]"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-[#A4A09A]">常用：</span>
            <button
              type="button"
              onClick={() => setFormula('O(n^2 \\cdot d)')}
              className="px-2 py-0.5 rounded bg-[#F3EBDD] text-[#58544E] hover:bg-[#FAF0ED]"
            >
              时间复杂度
            </button>
            <button
              type="button"
              onClick={() => setFormula('\\frac{1}{\\sqrt{d_k}}')}
              className="px-2 py-0.5 rounded bg-[#F3EBDD] text-[#58544E] hover:bg-[#FAF0ED]"
            >
              分式开方
            </button>
            <button
              type="button"
              onClick={() => setFormula('\\text{softmax}(z_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}')}
              className="px-2 py-0.5 rounded bg-[#F3EBDD] text-[#58544E] hover:bg-[#FAF0ED]"
            >
              Softmax
            </button>
          </div>

          {/* Block vs Inline toggle */}
          <div className="flex items-center space-x-3 text-xs text-[#58544E]">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="displayMode"
                checked={isBlock}
                onChange={() => setIsBlock(true)}
                className="text-[#C97B63] focus:ring-[#C97B63]"
              />
              <span>独立行公式 (Display Mode)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="displayMode"
                checked={!isBlock}
                onChange={() => setIsBlock(false)}
                className="text-[#C97B63] focus:ring-[#C97B63]"
              />
              <span>行内公式 (Inline)</span>
            </label>
          </div>

          {/* Footer */}
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
              disabled={!!renderError || !formula.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-[#C97B63] hover:bg-[#B66B54] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>插入公式</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
