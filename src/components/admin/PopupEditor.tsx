"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BaseImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, List, ListOrdered, Heading2, AlignLeft, AlignCenter,
  AlignRight, ImageIcon, LinkIcon, Unlink, Undo, Redo, Upload, Loader2,
} from "lucide-react";

// Extend Image to support resizable width via inline style
const Image = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML(attrs) {
          if (!attrs.width) return {};
          return { style: `width: ${attrs.width}; max-width: 100%;` };
        },
        parseHTML(el) {
          const style = el.getAttribute("style") ?? "";
          const m = style.match(/width:\s*([^;]+)/);
          return m ? m[1].trim() : null;
        },
      },
    };
  },
});

const SIZE_PRESETS = ["25%", "50%", "75%", "100%"];

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export function PopupEditor({ content, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState(0);

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
    // Tiptap v3 tidak auto re-render saat selection berubah,
    // sehingga isActive("image") tidak reaktif tanpa ini.
    onSelectionUpdate() {
      forceUpdate((n) => n + 1);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const addImageByUrl = () => {
    const url = prompt("URL Gambar:");
    if (!url) return;
    const linkUrl = prompt("URL Link (opsional, kosongkan jika tidak ada):");
    if (linkUrl) {
      editor.chain().focus().setImage({ src: url }).run();
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "beeflower/popups");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload gagal");
      const { url } = await res.json();
      editor?.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("Gagal upload gambar. Pastikan Cloudinary sudah dikonfigurasi.");
    } finally {
      setUploading(false);
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

  const imageActive = editor.isActive("image");
  const currentWidth = editor.getAttributes("image").width as string | null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Main toolbar */}
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
        {btn(addImageByUrl, false, <ImageIcon className="w-4 h-4" />, "Sisipkan Gambar via URL")}
        <button
          type="button"
          title="Upload Gambar"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded transition-colors text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </button>
        {btn(setLink, editor.isActive("link"), <LinkIcon className="w-4 h-4" />, "Tambah Link")}
        {editor.isActive("link") && btn(() => editor.chain().focus().unsetLink().run(), false, <Unlink className="w-4 h-4" />, "Hapus Link")}
      </div>

      {/* Image resize toolbar — muncul saat gambar dipilih */}
      {imageActive && (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border-b border-amber-100">
          <span className="text-xs text-gray-500 mr-1">Ukuran gambar:</span>
          {SIZE_PRESETS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => editor.chain().focus().updateAttributes("image", { width: w }).run()}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                currentWidth === w
                  ? "bg-brand-gold text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold"
              }`}
            >
              {w}
            </button>
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().updateAttributes("image", { width: null }).run()}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              !currentWidth
                ? "bg-brand-gold text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            Asli
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}
