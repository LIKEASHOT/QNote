import React from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code2,
  Table as TableIcon,
  Image as ImageIcon,
  Sigma,
  Quote,
  Minus,
  Plus,
  ListOrdered,
  List,
  MoveVertical,
} from 'lucide-react';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  fontSize: number;
  onFontSizeChange: (newSize: number) => void;
  lineHeight: number;
  onLineHeightChange: (newLineHeight: number) => void;
  onInsertImage: () => void;
  onInsertMath: () => void;
  onInsertCallout: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  onInsertImage,
  onInsertMath,
  onInsertCallout,
}) => {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E8DFD1] px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs select-none">
      {/* Left: Headings & Typography */}
      <div className="flex items-center space-x-1">
        {/* H1 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD] font-bold'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="一级标题 (Cmd+1)"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        {/* H2 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD] font-bold'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="二级标题 (Cmd+2)"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        {/* H3 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD] font-bold'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="三级标题 (Cmd+3)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#E8DFD1] mx-1" />

        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('bold')
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="粗体 (Cmd+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('italic')
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="斜体 (Cmd+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#E8DFD1] mx-1" />

        {/* Alignment */}
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { alignment: 'left' });
            } else {
              editor.chain().focus().setTextAlign('left').run();
            }
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive({ textAlign: 'left' }) || editor.isActive('image', { alignment: 'left' })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="居左对齐"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (editor.isActive('image')) {
              const currentAlign = editor.getAttributes('image').alignment || 'center';
              const nextAlign = currentAlign === 'center' ? 'left' : 'center';
              editor.commands.updateAttributes('image', { alignment: nextAlign });
            } else {
              const isCentered = editor.isActive({ textAlign: 'center' });
              if (isCentered) {
                editor.chain().focus().setTextAlign('left').run();
              } else {
                editor.chain().focus().setTextAlign('center').run();
              }
            }
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive({ textAlign: 'center' }) || editor.isActive('image', { alignment: 'center' })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="居中 / 靠左切换 (Cmd+E)"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { alignment: 'right' });
            } else {
              editor.chain().focus().setTextAlign('right').run();
            }
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive({ textAlign: 'right' }) || editor.isActive('image', { alignment: 'right' })
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="居右对齐"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#E8DFD1] mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('orderedList')
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="有序编号列表 (1. 2. 3.)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg border transition-all ${
            editor.isActive('bulletList')
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="无序圆点列表 (• • •)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Middle: Font size & Line height adjusters */}
      <div className="flex items-center space-x-2">
        {/* Font size */}
        <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-lg border border-[#E8DFD1] shadow-2xs">
          <button
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
            className="p-1 hover:bg-[#FAF7F2] rounded text-[#847D72] hover:text-[#38332B]"
            title="减小字号"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-[#38332B]">
            {fontSize}px
          </span>
          <button
            onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
            className="p-1 hover:bg-[#FAF7F2] rounded text-[#847D72] hover:text-[#38332B]"
            title="增大字号"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Line spacing / Line height adjuster */}
        <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-lg border border-[#E8DFD1] shadow-2xs" title="调整行间距与段落间隔">
          <MoveVertical className="w-3 h-3 text-[#A4A09A] mr-0.5" />
          <button
            onClick={() => onLineHeightChange(Math.max(1.3, Math.round((lineHeight - 0.1) * 10) / 10))}
            className="p-1 hover:bg-[#FAF7F2] rounded text-[#847D72] hover:text-[#38332B]"
            title="减小行距"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-mono px-1 text-[#38332B] min-w-[32px] text-center">
            {lineHeight.toFixed(1)}x
          </span>
          <button
            onClick={() => onLineHeightChange(Math.min(2.4, Math.round((lineHeight + 0.1) * 10) / 10))}
            className="p-1 hover:bg-[#FAF7F2] rounded text-[#847D72] hover:text-[#38332B]"
            title="增大行距"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right: Rich Inserts (Code, Table, LaTeX, Callout, Image) */}
      <div className="flex items-center space-x-1">
        {/* Code Block */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg border transition-all ${
            editor.isActive('codeBlock')
              ? 'bg-[#FAF0ED] text-[#C97B63] border-[#F0D5CD]'
              : 'text-[#58544E] hover:bg-[#F3EBDD] border-transparent'
          }`}
          title="插入代码块"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">代码</span>
        </button>

        {/* Table */}
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-transparent hover:bg-[#F3EBDD] text-[#58544E] transition-all"
          title="插入暖纸表格"
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span className="text-[11px]">表格</span>
        </button>

        {/* LaTeX Math */}
        <button
          onClick={onInsertMath}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-transparent hover:bg-[#F3EBDD] text-[#58544E] transition-all"
          title="插入数学公式 (KaTeX)"
        >
          <Sigma className="w-3.5 h-3.5" />
          <span className="text-[11px]">公式</span>
        </button>

        {/* Callout */}
        <button
          onClick={onInsertCallout}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-transparent hover:bg-[#F3EBDD] text-[#58544E] transition-all"
          title="插入陶土橙高亮注记块 (Cmd+> 或输入 > 加空格)"
        >
          <Quote className="w-3.5 h-3.5" />
          <span className="text-[11px]">注记</span>
        </button>

        {/* Image */}
        <button
          onClick={onInsertImage}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#FAF0ED] hover:bg-[#F5E5E0] text-[#A45842] border border-[#F0D5CD] transition-all"
          title="插入或粘贴图片"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[11px]">图片</span>
        </button>
      </div>
    </div>
  );
};
