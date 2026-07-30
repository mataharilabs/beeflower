"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, List, ListOrdered, Heading2, AlignLeft, AlignCenter,
  AlignRight, ImageIcon, LinkIcon, Unlink, Undo, Redo,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export function PopupEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("URL Gambar:");
    if (!url) return;
    const linkUrl = prompt("URL Link (opsional, kosongkan jika tidak ada):");
    if (linkUrl) {
      editor.chain().focus()
        .setImage({ src: url })
        .run();
      // Wrap inserted image with link
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = prompt("URL Link:", editor.getAttributes("link").href ?? "");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const btn = (onClick: () => void, active: boolean, children: React.ReactNode, title?: string) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? "bg-brand-gold text-white" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {btn(() => editor.chain().focus().undo().run(), false, <Undo className="w-4 h-4" />, "Undo")}
        {btn(() => editor.chain().focus().redo().run(), false, <Redo className="w-4 h-4" />, "Redo")}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), <Heading2 className="w-4 h-4" />, "Heading")}
        {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <Bold className="w-4 h-4" />, "Bold")}
        {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <Italic className="w-4 h-4" />, "Italic")}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }), <AlignLeft className="w-4 h-4" />, "Rata Kiri")}
        {btn(() => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }), <AlignCenter className="w-4 h-4" />, "Tengah")}
        {btn(() => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }), <AlignRight className="w-4 h-4" />, "Rata Kanan")}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), <List className="w-4 h-4" />, "Bullet List")}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), <ListOrdered className="w-4 h-4" />, "Numbered List")}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(addImage, false, <ImageIcon className="w-4 h-4" />, "Sisipkan Gambar")}
        {btn(setLink, editor.isActive("link"), <LinkIcon className="w-4 h-4" />, "Tambah Link")}
        {editor.isActive("link") && btn(() => editor.chain().focus().unsetLink().run(), false, <Unlink className="w-4 h-4" />, "Hapus Link")}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}
