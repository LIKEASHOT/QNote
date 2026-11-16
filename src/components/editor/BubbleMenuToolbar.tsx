import React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
} from 'lucide-react';

interface BubbleMenuProps {
  editor: Editor;
}

export const BubbleMenuToolbar: React.FC<BubbleMenuProps> = ({ editor }) => {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150 }}
      className="flex items-center space-x-0.5 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-[#E8DFD1] shadow-xl text-xs select-none"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('bold')
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="加粗 (Cmd+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('italic')
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="斜体 (Cmd+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('strike')
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="删除线"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('code')
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="行内代码"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[#E8DFD1] mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="一级标题 (Cmd+1)"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="二级标题 (Cmd+2)"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="三级标题 (Cmd+3)"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-[#FAF0ED] text-[#C97B63]'
            : 'text-[#58544E] hover:text-[#38332B] hover:bg-[#FAF7F2]'
        }`}
        title="引用/提示块"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
    </BubbleMenu>
  );
};
