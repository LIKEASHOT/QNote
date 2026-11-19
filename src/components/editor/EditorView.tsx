import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { ResizableImage } from './extensions/ImageExtension';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import { Sidebar } from '../layout/Sidebar';
import { EditorToolbar } from './EditorToolbar';
import { BubbleMenuToolbar } from './BubbleMenuToolbar';
import { MathModal } from './MathModal';
import { MathBlock, MathInline } from './extensions/MathExtension';
import { useTabStore } from '../../stores/useTabStore';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { OutlineItem } from '../../types';
import { lowlight } from '../../utils/lowlightSetup';
import { detectCode, detectTable } from '../../utils/pasteDetector';
import { Undo2, X, Code2 } from 'lucide-react';

interface EditorViewProps {
  notebookId: string;
}

export const EditorView: React.FC<EditorViewProps> = ({ notebookId }) => {
  const { isOutlineOpen, toggleOutline } = useTabStore();
  const { getNotebook, updateNotebookContent, updateNotebookSettings } = useNotebookStore();
  const notebook = getNotebook(notebookId);

  const [fontSize, setFontSize] = useState<number>(notebook?.fontSize || 16);
  const [lineHeight, setLineHeight] = useState<number>(notebook?.lineHeight || 1.65);
  const [zoomLevel, setZoomLevel] = useState<number>(notebook?.zoomLevel || 1.0);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isMathOpen, setIsMathOpen] = useState(false);
  const [detectedCodeToast, setDetectedCodeToast] = useState<{
    language: string;
    rawText: string;
  } | null>(null);

  // Auto-dismiss code detection toast after 3 seconds
  useEffect(() => {
    if (!detectedCodeToast) return;
    const timer = setTimeout(() => {
      setDetectedCodeToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [detectedCodeToast]);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const paperCardRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<number>(notebook?.zoomLevel || 1.0);
  const rafIdRef = useRef<number | null>(null);

  // Extract headings from editor HTML or DOM
  const updateOutline = useCallback((editorInstance: any) => {
    if (!editorInstance) return;
    const items: OutlineItem[] = [];
    editorInstance.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        const level = node.attrs.level;
        const text = node.textContent;
        const id = `heading-${pos}-${text.substring(0, 10).replace(/\s+/g, '-')}`;
        items.push({ id, text, level, pos });
      }
    });
    setOutline(items);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: {
          HTMLAttributes: {
            spellcheck: 'false',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          spellcheck: 'false',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      MathBlock,
      MathInline,
      Placeholder.configure({
        placeholder: '在此书写你的长卷笔记... (支持 Cmd+1~3 标题，代码/表格/图片直接粘贴)',
      }),
    ],
    content: notebook?.content || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      updateNotebookContent(notebookId, html);
      updateOutline(ed);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-none',
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
      handleKeyDown: (view, event) => {
        // 1. Shortcut Cmd + > for quote / terracotta callout block
        const isCmd = event.metaKey || event.ctrlKey;
        if (
          isCmd &&
          (event.key === '>' ||
            event.key === '》' ||
            (event.shiftKey && (event.key === '.' || event.key === '。' || event.code === 'Period')))
        ) {
          event.preventDefault();
          editor?.chain().focus().toggleBlockquote().run();
          return true;
        }

        // 2. Shortcut Cmd + E for Center / Left Align Toggle (Image or Text)
        if (isCmd && (event.key === 'e' || event.key === 'E') && !event.shiftKey) {
          event.preventDefault();
          if (editor?.isActive('image')) {
            const currentAlign = editor.getAttributes('image').alignment || 'center';
            const nextAlign = currentAlign === 'center' ? 'left' : 'center';
            editor.commands.updateAttributes('image', { alignment: nextAlign });
          } else {
            const isCentered = editor?.isActive({ textAlign: 'center' });
            if (isCentered) {
              editor?.chain().focus().setTextAlign('left').run();
            } else {
              editor?.chain().focus().setTextAlign('center').run();
            }
          }
          return true;
        }

        // 3. Auto Ordered List recognition on Enter:
        // When the user writes "1. 文字" or "1.文字" or "1、文字" and presses Enter,
        // automatically convert to native ordered list, create item 2, and support Cmd+Z undo
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          const node = $from.parent;

          if (node.type.name === 'paragraph' && $from.depth === 1) {
            const text = node.textContent;
            const match = text.match(/^(\d+)[.、]\s*(.*)$/);
            if (match) {
              event.preventDefault();
              const num = parseInt(match[1], 10);
              const prefixMatch = text.match(/^(\d+)[.、]\s*/);
              const prefixLength = prefixMatch ? prefixMatch[0].length : 2;

              const { tr } = state;
              const start = $from.before();
              const end = $from.after();
              const { orderedList, listItem, paragraph } = state.schema.nodes;

              if (orderedList && listItem && paragraph) {
                const cursorOffset = $from.parentOffset;
                let item1Content;
                let item2Content;

                if (cursorOffset >= node.content.size) {
                  // Cursor is at the end of the line
                  item1Content = node.content.cut(Math.min(prefixLength, node.content.size));
                  item2Content = undefined;
                } else if (cursorOffset <= prefixLength) {
                  // Cursor is before or inside the prefix
                  item1Content = undefined;
                  item2Content = node.content.cut(Math.min(prefixLength, node.content.size));
                } else {
                  // Cursor is in the middle of content
                  item1Content = node.content.cut(prefixLength, cursorOffset);
                  item2Content = node.content.cut(cursorOffset);
                }

                const item1 = listItem.create(null, paragraph.create(null, item1Content));
                const item2 = listItem.create(null, paragraph.create(null, item2Content));
                const list = orderedList.create({ order: num }, [item1, item2]);

                tr.replaceWith(start, end, list);
                const pos = start + item1.nodeSize + 2;
                tr.setSelection(TextSelection.create(tr.doc, pos));
                view.dispatch(tr.scrollIntoView());
                return true;
              }
            }
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        // 1. Check Image
        const items = clipboard.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              event.preventDefault();
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src && editor) {
                  editor.chain().focus().setImage({ src, alignment: 'center', width: '100%' } as any).run();
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }

        const plainText = clipboard.getData('text/plain');
        const htmlText = clipboard.getData('text/html');

        // 2. Check Table paste
        const tableResult = detectTable(plainText, htmlText);
        if (tableResult.isTable && tableResult.rows && tableResult.rows.length > 0) {
          event.preventDefault();
          const rows = tableResult.rows;
          const rowsCount = rows.length;
          const colsCount = rows[0].length;

          // Insert table
          editor?.chain().focus().insertTable({ rows: rowsCount, cols: colsCount, withHeaderRow: true }).run();
          return true;
        }

        // 3. Check Code paste
        const codeResult = detectCode(plainText);
        if (codeResult.isCode && editor) {
          event.preventDefault();
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'codeBlock',
              attrs: { language: codeResult.language },
              content: [{ type: 'text', text: plainText }],
            })
            .run();

          // Show floating capsule
          setDetectedCodeToast({
            language: codeResult.language.toUpperCase(),
            rawText: plainText,
          });
          return true;
        }

        return false;
      },
    },
  });

  // Keep outline updated on notebook load
  useEffect(() => {
    if (editor && notebook) {
      if (editor.getHTML() !== notebook.content) {
        editor.commands.setContent(notebook.content);
      }
      updateOutline(editor);
      setFontSize(notebook.fontSize || 16);
      if (notebook.lineHeight) {
        setLineHeight(notebook.lineHeight);
      }
      if (notebook.zoomLevel) {
        setZoomLevel(notebook.zoomLevel);
      }
    }
  }, [notebookId, editor, notebook, updateOutline]);

  // Sync zoomRef and DOM when zoomLevel state changes (e.g. from buttons or initial load)
  useEffect(() => {
    zoomRef.current = zoomLevel;
    if (paperCardRef.current) {
      paperCardRef.current.style.zoom = String(zoomLevel);
    }
  }, [zoomLevel]);

  // Handle Trackpad Two-Finger Pinch-to-Zoom with smooth 120Hz continuous response
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // macOS trackpad pinch emits wheel event with ctrlKey = true
      if (e.ctrlKey) {
        e.preventDefault();

        // Continuous stepless exponential scaling
        // e.deltaY is typically -1 to -8 (zoom in) or 1 to 8 (zoom out)
        const scaleFactor = Math.pow(0.9985, e.deltaY);
        const nextZoom = Math.min(2.5, Math.max(0.6, zoomRef.current * scaleFactor));
        zoomRef.current = nextZoom;

        // Apply immediately to DOM for direct hardware responsiveness without transition delay
        if (paperCardRef.current) {
          paperCardRef.current.style.zoom = String(nextZoom);
        }

        // Batch React state update to animation frame so UI percentage indicator syncs smoothly
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            setZoomLevel(Math.round(zoomRef.current * 100) / 100);
            rafIdRef.current = null;
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Global Keyboard shortcuts: Cmd+1~6 for headings, Cmd+\ for outline toggle, Cmd +/-/0 for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (!isCmd) return;

      if (e.key >= '1' && e.key <= '6') {
        const level = parseInt(e.key, 10) as 1 | 2 | 3 | 4 | 5 | 6;
        if (editor?.isFocused) {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level }).run();
        }
      } else if (e.key === '0') {
        e.preventDefault();
        if (isCmd && !editor?.isFocused) {
          setZoomLevel(1.0);
        } else if (editor?.isFocused) {
          // If in editor, reset zoom or set paragraph
          setZoomLevel(1.0);
        }
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(2.5, Math.round((prev + 0.1) * 10) / 10));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10));
      } else if (e.key === '\\') {
        e.preventDefault();
        toggleOutline();
      } else if (
        e.key === '>' ||
        e.key === '》' ||
        (e.shiftKey && (e.key === '.' || e.key === '。' || e.code === 'Period'))
      ) {
        e.preventDefault();
        editor?.chain().focus().toggleBlockquote().run();
      } else if (isCmd && (e.key === 'e' || e.key === 'E') && !e.shiftKey) {
        e.preventDefault();
        if (editor?.isActive('image')) {
          const currentAlign = editor.getAttributes('image').alignment || 'center';
          const nextAlign = currentAlign === 'center' ? 'left' : 'center';
          editor.commands.updateAttributes('image', { alignment: nextAlign });
        } else {
          const isCentered = editor?.isActive({ textAlign: 'center' });
          if (isCentered) {
            editor?.chain().focus().setTextAlign('left').run();
          } else {
            editor?.chain().focus().setTextAlign('center').run();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, toggleOutline]);

  const handleSelectHeading = (item: OutlineItem) => {
    if (!editorContainerRef.current) return;
    const headings = editorContainerRef.current.querySelectorAll('h1, h2, h3, h4');
    const target = Array.from(headings).find((h) => h.textContent?.trim() === item.text.trim());
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    updateNotebookSettings(notebookId, { fontSize: newSize });
  };

  const handleLineHeightChange = (newLineHeight: number) => {
    setLineHeight(newLineHeight);
    updateNotebookSettings(notebookId, { lineHeight: newLineHeight });
  };

  const handleInsertImage = () => {
    const url = prompt('请输入图片 URL (或直接截图 Cmd+V 粘贴至笔记内):');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, alignment: 'center', width: '100%' } as any).run();
    }
  };

  const handleInsertMath = () => {
    setIsMathOpen(true);
  };

  const handleInsertCallout = () => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const handleUndoCodeBlock = () => {
    if (editor && detectedCodeToast) {
      // Revert code block back to plain paragraph
      editor.commands.undo();
      setDetectedCodeToast(null);
    }
  };

  if (!notebook) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#A4A09A]">
        笔记本不存在或已被移除
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#FAF7F2]">
      {/* Left Outline Sidebar (collapsible) */}
      {isOutlineOpen && (
        <Sidebar
          outline={outline}
          onSelectHeading={handleSelectHeading}
          notebookTitle={notebook.title}
        />
      )}

      {/* Main Continuous Document Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Delicate Formatting Toolbar */}
        <EditorToolbar
          editor={editor}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          lineHeight={lineHeight}
          onLineHeightChange={handleLineHeightChange}
          onInsertImage={handleInsertImage}
          onInsertMath={handleInsertMath}
          onInsertCallout={handleInsertCallout}
        />

        {/* Floating Code Detection Toast (auto-dismisses after 3s) */}
        {detectedCodeToast && (
          <div className="absolute top-12 right-6 z-30 flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#F0D5CD] shadow-lg text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <Code2 className="w-4 h-4 text-[#C97B63]" />
            <span className="text-[#38332B]">
              已智能识别并包裹为 <strong>{detectedCodeToast.language}</strong> 代码块
            </span>
            <button
              onClick={handleUndoCodeBlock}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#FAF0ED] hover:bg-[#F5E5E0] text-[#A45842] font-medium border border-[#F0D5CD] transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              <span>还原为纯文本</span>
            </button>
            <button
              onClick={() => setDetectedCodeToast(null)}
              className="p-1 text-[#A4A09A] hover:text-[#38332B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Continuous Canvas Scrollable Area */}
        <div
          ref={editorContainerRef}
          className="flex-1 overflow-auto px-6 sm:px-12 md:px-20 py-10 relative"
        >
          {/* Centered Parchment Paper Document Layout */}
          <div
            ref={paperCardRef}
            className="max-w-[860px] mx-auto min-h-[85vh] bg-white rounded-2xl p-8 sm:p-14 border border-[#E8DFD1] shadow-2xs origin-top"
            style={{
              fontSize: `${fontSize}px`,
              zoom: zoomLevel,
              transition: 'none',
              ['--editor-line-height' as any]: lineHeight,
              ['--editor-p-gap' as any]: `${Math.round(lineHeight * 0.25 * 100) / 100}em`,
            }}
          >
            {/* Bubble Menu for text selection */}
            {editor && <BubbleMenuToolbar editor={editor} />}

            {/* TipTap Continuous Rich Editor Content */}
            <EditorContent editor={editor} />
          </div>

          {/* Bottom Zen Space */}
          <div className="h-32 flex items-center justify-center text-[11px] text-[#C4B8A5]">
            ~ QNote 暖纸长卷·笔耕不辍 ~
          </div>
        </div>

        {/* Floating Zoom Indicator & Control Pill */}
        <div className="absolute bottom-5 right-6 z-20 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl border border-[#E8DFD1] shadow-md text-xs select-none transition-all hover:bg-white">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10))}
            className="w-5 h-5 flex items-center justify-center rounded text-[#847D72] hover:text-[#38332B] hover:bg-[#F3EBDD] font-bold"
            title="缩小 (Cmd - / 触控板捏合)"
          >
            -
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
              zoomLevel !== 1.0
                ? 'bg-[#FAF0ED] text-[#C97B63] font-semibold hover:bg-[#F5E5E0]'
                : 'text-[#58544E] hover:text-[#38332B]'
            }`}
            title="点击重置为 100% (Cmd 0 / 触控板双指缩放)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(2.5, Math.round((prev + 0.1) * 10) / 10))}
            className="w-5 h-5 flex items-center justify-center rounded text-[#847D72] hover:text-[#38332B] hover:bg-[#F3EBDD] font-bold"
            title="放大 (Cmd + / 触控板张开)"
          >
            +
          </button>
        </div>
      </div>

      {/* LaTeX Math Modal */}
      <MathModal
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        onInsert={(formula, isBlock) => {
          if (editor) {
            if (isBlock) {
              editor.chain().focus().insertContent({
                type: 'mathBlock',
                attrs: { latex: formula },
              }).run();
            } else {
              editor.chain().focus().insertContent({
                type: 'mathInline',
                attrs: { latex: formula },
              }).run();
            }
          }
        }}
      />
    </div>
  );
};
