import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import { Sidebar } from '../layout/Sidebar';
import { EditorToolbar } from './EditorToolbar';
import { BubbleMenuToolbar } from './BubbleMenuToolbar';
import { MathModal } from './MathModal';
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
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [isMathOpen, setIsMathOpen] = useState(false);
  const [detectedCodeToast, setDetectedCodeToast] = useState<{
    language: string;
    rawText: string;
  } | null>(null);

  const editorContainerRef = useRef<HTMLDivElement>(null);

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
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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
        class: 'focus:outline-none max-w-none transition-all',
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
                  editor.chain().focus().setImage({ src }).run();
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
    }
  }, [notebookId, editor, notebook, updateOutline]);

  // Global Keyboard shortcuts: Cmd+1~6 for headings, Cmd+\ for outline toggle
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
        if (editor?.isFocused) {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        }
      } else if (e.key === '\\') {
        e.preventDefault();
        toggleOutline();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, toggleOutline]);

  // Scroll spy: highlight current visible heading in outline
  const handleScroll = useCallback(() => {
    if (!editorContainerRef.current) return;
    const headings = editorContainerRef.current.querySelectorAll('h1, h2, h3, h4');
    const containerTop = editorContainerRef.current.scrollTop + 60;

    let currentId: string | null = null;
    headings.forEach((heading, idx) => {
      const el = heading as HTMLElement;
      if (el.offsetTop <= containerTop) {
        const item = outline[idx];
        if (item) currentId = item.id;
      }
    });

    if (currentId) setActiveHeadingId(currentId);
  }, [outline]);

  const handleSelectHeading = (item: OutlineItem) => {
    setActiveHeadingId(item.id);
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

  const handleInsertImage = () => {
    const url = prompt('请输入图片 URL (或直接截图 Cmd+V 粘贴至笔记内):');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
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
          activeHeadingId={activeHeadingId}
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
          onInsertImage={handleInsertImage}
          onInsertMath={handleInsertMath}
          onInsertCallout={handleInsertCallout}
        />

        {/* Floating Code Detection Toast */}
        {detectedCodeToast && (
          <div className="absolute top-12 right-6 z-30 flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#F0D5CD] shadow-lg text-xs animate-in slide-in-from-top-2">
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
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-10"
        >
          {/* Centered Parchment Paper Document Layout */}
          <div
            className="max-w-[860px] mx-auto min-h-[85vh] bg-white rounded-2xl p-8 sm:p-14 border border-[#E8DFD1] shadow-2xs transition-all"
            style={{ fontSize: `${fontSize}px` }}
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
      </div>

      {/* LaTeX Math Modal */}
      <MathModal
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        onInsert={(formula, isBlock) => {
          if (editor) {
            if (isBlock) {
              editor.chain().focus().insertContent(`<p>$$\n${formula}\n$$</p>`).run();
            } else {
              editor.chain().focus().insertContent(`$${formula}$`).run();
            }
          }
        }}
      />
    </div>
  );
};
