import React, { useState, useEffect } from 'react';
import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { Edit3, Check, Copy, X } from 'lucide-react';

/* ==========================================================================
   Math Block Component (Interactive KaTeX Card)
   ========================================================================== */
export const MathBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latexInput, setLatexInput] = useState(node.attrs.latex || '');
  const [copied, setCopied] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLatexInput(node.attrs.latex || '');
  }, [node.attrs.latex]);

  useEffect(() => {
    const raw = (isEditing ? latexInput : node.attrs.latex) || '\\text{点击输入 LaTeX 公式}';
    try {
      const html = katex.renderToString(raw, {
        displayMode: true,
        throwOnError: true,
      });
      setRenderedHtml(html);
      setHasError(false);
    } catch {
      try {
        const fallbackHtml = katex.renderToString(raw, {
          displayMode: true,
          throwOnError: false,
        });
        setRenderedHtml(fallbackHtml);
      } catch {
        setRenderedHtml(`<div class="text-red-600 font-mono text-xs">${raw}</div>`);
      }
      setHasError(true);
    }
  }, [node.attrs.latex, latexInput, isEditing]);

  const handleSave = () => {
    updateAttributes({ latex: latexInput.trim() });
    setIsEditing(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(node.attrs.latex || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <NodeViewWrapper className="my-5 select-none relative group">
      <div
        className={`relative rounded-xl border p-4 transition-all ${
          selected
            ? 'border-[#C97B63] bg-[#FAF0ED]/50 ring-1 ring-[#C97B63]'
            : 'border-[#E8DFD1] bg-[#FAF7F2]/60 hover:border-[#D5C7B5] hover:bg-[#FAF7F2]'
        }`}
      >
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-[#847D72]">
              <span className="font-medium text-[#38332B]">编辑 LaTeX 公式源码</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:text-[#38332B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              className="w-full font-mono text-sm p-3 bg-white border border-[#E8DFD1] rounded-lg focus:border-[#C97B63] focus:outline-none"
              rows={3}
              placeholder="输入 LaTeX 公式代码，例如 \text{Attention}(Q, K, V)..."
              autoFocus
            />
            {/* Live Render Preview in Edit Mode */}
            <div className="bg-white/80 p-3 rounded-lg border border-[#F0E9DF] overflow-x-auto text-center min-h-[50px] flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            </div>
            {hasError && (
              <div className="text-[11px] text-amber-700">公式包含语法告警，已进入安全容错渲染</div>
            )}
            <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 rounded text-[#847D72] hover:bg-[#E8DFD1]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1 rounded-lg bg-[#C97B63] text-white hover:bg-[#B36B55] font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="cursor-pointer overflow-x-auto py-2 text-center"
            title="双击编辑公式"
          >
            <div
              className="inline-block"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}

        {/* Hover Action Bar */}
        {!isEditing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white/90 backdrop-blur-xs px-1.5 py-1 rounded-lg border border-[#E8DFD1] shadow-2xs text-[11px] text-[#847D72]">
            <button
              onClick={handleCopy}
              className="p-1 hover:text-[#38332B] hover:bg-[#F3EBDD] rounded transition-colors"
              title="复制 LaTeX 源码"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-[#38332B] hover:bg-[#F3EBDD] rounded transition-colors"
              title="双击或点击编辑公式"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

/* ==========================================================================
   Math Block TipTap Node Definition
   ========================================================================== */
export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => {
          return element.getAttribute('data-latex') || element.textContent || '';
        },
        renderHTML: (attributes: Record<string, any>) => ({
          'data-latex': attributes.latex,
          'data-katex-display': 'block',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-katex-display="block"]',
      },
      {
        tag: 'p',
        getAttrs: (element: HTMLElement | string) => {
          const text = (typeof element === 'string' ? element : element.textContent)?.trim() || '';
          if (text.startsWith('$$') && text.endsWith('$$') && text.length >= 4) {
            return { latex: text.slice(2, -2).trim() };
          }
          const match = text.match(/^\$\$\s*([\s\S]+?)\s*\$\$$/);
          if (match) {
            return { latex: match[1].trim() };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-katex-display': 'block', class: 'math-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockComponent);
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^\$\$\s?$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.replaceWith(range.from - 1, range.to, this.type.create({ latex: '\\text{Formula}' }));
        },
      }),
    ];
  },
});

/* ==========================================================================
   Math Inline Component (KaTeX Inline)
   ========================================================================== */
export const MathInlineComponent: React.FC<NodeViewProps> = ({ node, selected, updateAttributes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latexInput, setLatexInput] = useState(node.attrs.latex || '');
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  useEffect(() => {
    setLatexInput(node.attrs.latex || '');
  }, [node.attrs.latex]);

  useEffect(() => {
    const raw = node.attrs.latex || '?';
    try {
      const html = katex.renderToString(raw, {
        displayMode: false,
        throwOnError: false,
      });
      setRenderedHtml(html);
    } catch {
      setRenderedHtml(`<span class="font-mono text-xs">${raw}</span>`);
    }
  }, [node.attrs.latex]);

  return (
    <NodeViewWrapper as="span" className="inline-block mx-0.5 align-middle select-none">
      {isEditing ? (
        <span className="inline-flex items-center bg-white border border-[#C97B63] rounded px-1.5 py-0.5 shadow-xs">
          <input
            value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            onBlur={() => {
              updateAttributes({ latex: latexInput.trim() });
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateAttributes({ latex: latexInput.trim() });
                setIsEditing(false);
              } else if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            className="font-mono text-xs outline-none bg-transparent w-28"
            autoFocus
          />
        </span>
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`px-1 py-0.5 rounded cursor-pointer transition-colors ${
            selected ? 'bg-[#FAF0ED] ring-1 ring-[#C97B63]' : 'hover:bg-[#F3EBDD]/60'
          }`}
          title="行内公式 (双击编辑)"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
    </NodeViewWrapper>
  );
};

/* ==========================================================================
   Math Inline TipTap Node Definition
   ========================================================================== */
export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') || element.textContent || '',
        renderHTML: (attributes: Record<string, any>) => ({
          'data-latex': attributes.latex,
          'data-katex-display': 'inline',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-katex-display="inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-katex-display': 'inline', class: 'math-inline' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineComponent);
  },
});
