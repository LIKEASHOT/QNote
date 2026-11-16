import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  GripVertical,
  Minus,
  Plus,
} from 'lucide-react';

/* ==========================================================================
   Interactive Resizable Image Component (NodeView)
   ========================================================================== */
export const ImageComponent: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, selected, deleteNode, getPos, editor } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragWidthPercent, setDragWidthPercent] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const parentWidthRef = useRef<number>(800);
  const dirRef = useRef<'left' | 'right'>('right');

  const alignment = (node.attrs.alignment || 'center') as 'left' | 'center' | 'right';
  const widthAttr = node.attrs.width || '100%';

  // Parse width attribute to numeric percent (e.g. "50%" -> 50)
  const currentPercent = (() => {
    if (typeof widthAttr === 'string' && widthAttr.endsWith('%')) {
      const parsed = parseInt(widthAttr, 10);
      return isNaN(parsed) ? 100 : parsed;
    }
    return 100;
  })();

  // Select node in editor when clicked
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const pos = getPos();
      if (typeof pos === 'number' && editor) {
        editor.commands.setNodeSelection(pos);
      }
    },
    [getPos, editor]
  );

  // Keyboard shortcuts when image is selected
  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;

      // Cmd + E: Toggle Center / Left alignment
      if (isCmd && (e.key === 'e' || e.key === 'E') && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const nextAlign = alignment === 'center' ? 'left' : 'center';
        updateAttributes({ alignment: nextAlign });
        return;
      }

      // Cmd + Shift + L: Left alignment
      if (isCmd && (e.key === 'l' || e.key === 'L') && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        updateAttributes({ alignment: 'left' });
        return;
      }

      // Cmd + Shift + R: Right alignment
      if (isCmd && (e.key === 'r' || e.key === 'R') && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        updateAttributes({ alignment: 'right' });
        return;
      }

      // Backspace or Delete: remove image
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        deleteNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, updateAttributes, deleteNode]);

  // Handle Drag Resizing
  const handleResizeStart = (e: React.MouseEvent, dir: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    dirRef.current = dir;
    startXRef.current = e.clientX;

    const parentEl = containerRef.current?.closest('.tiptap') || containerRef.current?.parentElement;
    const pWidth = parentEl?.clientWidth || 800;
    parentWidthRef.current = pWidth;
    startWidthRef.current = containerRef.current?.offsetWidth || pWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx =
        dirRef.current === 'left'
          ? startXRef.current - moveEvent.clientX
          : moveEvent.clientX - startXRef.current;

      let newPx: number;
      if (alignment === 'center') {
        newPx = Math.max(100, Math.min(parentWidthRef.current, startWidthRef.current + dx * 2));
      } else {
        newPx = Math.max(100, Math.min(parentWidthRef.current, startWidthRef.current + dx));
      }

      const pct = Math.min(100, Math.max(15, Math.round((newPx / parentWidthRef.current) * 100)));
      setDragWidthPercent(pct);

      if (containerRef.current) {
        containerRef.current.style.width = `${pct}%`;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);

      setDragWidthPercent((finalPct) => {
        if (finalPct !== null) {
          updateAttributes({ width: `${finalPct}%` });
        }
        return null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Adjust width by percentage step
  const handleStepWidth = (delta: number) => {
    const nextPct = Math.min(100, Math.max(15, currentPercent + delta));
    updateAttributes({ width: `${nextPct}%` });
  };

  const handleSetPresetWidth = (pct: number) => {
    updateAttributes({ width: `${pct}%` });
  };

  const showControls = selected || isHovered || isResizing;

  return (
    <NodeViewWrapper
      className={`image-resizer-wrapper my-5 select-none relative group flex w-full ${
        alignment === 'left'
          ? 'justify-start'
          : alignment === 'right'
          ? 'justify-end'
          : 'justify-center'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="relative inline-block"
        style={{
          width: dragWidthPercent !== null ? `${dragWidthPercent}%` : widthAttr,
          maxWidth: '100%',
          transition: isResizing ? 'none' : 'width 0.15s ease',
        }}
        onClick={handleSelect}
      >
        {/* Floating Quick Action Pill */}
        {showControls && (
          <div
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl border border-[#E8DFD1] shadow-xl text-xs z-30 select-none animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Drag & Drop Reposition Handle */}
            <div
              data-drag-handle
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#FAF7F2] text-[#847D72] hover:text-[#38332B] transition-colors"
              title="按住拖拽移动图片在长卷中的位置"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className="w-[1px] h-3.5 bg-[#E8DFD1] mx-0.5" />

            {/* 2. Alignment Buttons */}
            <button
              type="button"
              onClick={() => updateAttributes({ alignment: 'left' })}
              className={`p-1.5 rounded-lg transition-colors ${
                alignment === 'left'
                  ? 'bg-[#FAF0ED] text-[#C97B63]'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="靠左对齐 (Cmd+Shift+L)"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => updateAttributes({ alignment: alignment === 'center' ? 'left' : 'center' })}
              className={`p-1.5 rounded-lg transition-colors ${
                alignment === 'center'
                  ? 'bg-[#FAF0ED] text-[#C97B63]'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="居中 / 靠左切换 (Cmd+E)"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => updateAttributes({ alignment: 'right' })}
              className={`p-1.5 rounded-lg transition-colors ${
                alignment === 'right'
                  ? 'bg-[#FAF0ED] text-[#C97B63]'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="靠右对齐 (Cmd+Shift+R)"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3.5 bg-[#E8DFD1] mx-0.5" />

            {/* 3. Width Presets (25%, 50%, 75%, 100%) */}
            <button
              type="button"
              onClick={() => handleSetPresetWidth(25)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                currentPercent === 25
                  ? 'bg-[#FAF0ED] text-[#C97B63] font-bold'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="缩放为 25% 宽度"
            >
              25%
            </button>

            <button
              type="button"
              onClick={() => handleSetPresetWidth(50)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                currentPercent === 50
                  ? 'bg-[#FAF0ED] text-[#C97B63] font-bold'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="缩放为 50% 宽度"
            >
              50%
            </button>

            <button
              type="button"
              onClick={() => handleSetPresetWidth(75)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                currentPercent === 75
                  ? 'bg-[#FAF0ED] text-[#C97B63] font-bold'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="缩放为 75% 宽度"
            >
              75%
            </button>

            <button
              type="button"
              onClick={() => handleSetPresetWidth(100)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                currentPercent === 100
                  ? 'bg-[#FAF0ED] text-[#C97B63] font-bold'
                  : 'text-[#58544E] hover:bg-[#FAF7F2]'
              }`}
              title="缩放为 100% 满宽"
            >
              100%
            </button>

            <div className="w-[1px] h-3.5 bg-[#E8DFD1] mx-0.5" />

            {/* 4. Fine-tuning Minus / Plus */}
            <button
              type="button"
              onClick={() => handleStepWidth(-10)}
              className="p-1 rounded text-[#847D72] hover:text-[#38332B] hover:bg-[#FAF7F2]"
              title="缩小 10%"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleStepWidth(10)}
              className="p-1 rounded text-[#847D72] hover:text-[#38332B] hover:bg-[#FAF7F2]"
              title="放大 10%"
            >
              <Plus className="w-3 h-3" />
            </button>

            <div className="w-[1px] h-3.5 bg-[#E8DFD1] mx-0.5" />

            {/* 5. Delete Button */}
            <button
              type="button"
              onClick={() => deleteNode()}
              className="p-1.5 rounded-lg text-[#847D72] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="删除图片 (Delete/Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* The Image Element */}
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          className={`w-full h-auto block rounded-xl transition-all cursor-pointer ${
            selected
              ? 'ring-2 ring-[#C97B63] ring-offset-2 ring-offset-[#FAF7F2] shadow-md'
              : 'border border-[#E8DFD1] shadow-2xs hover:border-[#C4B8A5]'
          }`}
          draggable={false}
        />

        {/* Corner Resize Handles */}
        {showControls && (
          <>
            {/* Bottom-right Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'right')}
              className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-[#C97B63] rounded-full shadow-md cursor-nwse-resize z-20 flex items-center justify-center hover:scale-125 transition-transform"
              title="拖拽缩放图片大小"
            >
              <div className="w-1.5 h-1.5 bg-[#C97B63] rounded-full" />
            </div>

            {/* Bottom-left Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'left')}
              className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-[#C97B63] rounded-full shadow-md cursor-nesw-resize z-20 flex items-center justify-center hover:scale-125 transition-transform"
              title="拖拽缩放图片大小"
            >
              <div className="w-1.5 h-1.5 bg-[#C97B63] rounded-full" />
            </div>
          </>
        )}

        {/* Live Resizing Tooltip Badge */}
        {isResizing && dragWidthPercent !== null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#38332B]/85 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md font-mono pointer-events-none z-30">
            {dragWidthPercent}%
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

/* ==========================================================================
   TipTap ResizableImage Extension Definition
   ========================================================================== */
export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) =>
          element.getAttribute('data-width') ||
          element.getAttribute('width') ||
          element.style.width ||
          '100%',
        renderHTML: (attributes) => ({
          'data-width': attributes.width,
          width: attributes.width,
        }),
      },
      alignment: {
        default: 'center',
        parseHTML: (element) =>
          element.getAttribute('data-alignment') ||
          element.style.textAlign ||
          'center',
        renderHTML: (attributes) => ({
          'data-alignment': attributes.alignment,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, width, ...rest } = HTMLAttributes;
    const align = alignment || 'center';
    const justify =
      align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

    return [
      'div',
      {
        class: `image-wrapper alignment-${align}`,
        style: `display: flex; justify-content: ${justify}; margin: 1.5rem 0;`,
        'data-alignment': align,
      },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, rest, {
          style: `width: ${width || '100%'}; max-width: 100%; height: auto; border-radius: 12px;`,
          width: width || '100%',
          'data-alignment': align,
          'data-width': width || '100%',
        }),
      ],
    ];
  },

  parseHTML() {
    return [
      {
        tag: 'div.image-wrapper',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const img = el.querySelector('img');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width:
              img.getAttribute('data-width') ||
              img.getAttribute('width') ||
              img.style.width ||
              '100%',
            alignment:
              el.getAttribute('data-alignment') ||
              img.getAttribute('data-alignment') ||
              'center',
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt'),
            title: el.getAttribute('title'),
            width:
              el.getAttribute('data-width') ||
              el.getAttribute('width') ||
              el.style.width ||
              '100%',
            alignment: el.getAttribute('data-alignment') || 'center',
          };
        },
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
