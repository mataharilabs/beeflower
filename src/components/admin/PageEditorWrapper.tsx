"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

const CraftEditor = dynamic(() => import("./CraftEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 text-gray-400 text-sm">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat editor...
    </div>
  ),
});

interface Props {
  pageId: string;
  initialTitle: string;
  initialSlug: string;
  initialCraftJson: object;
  initialPublished: boolean;
  initialMeta: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}

export function PageEditorWrapper({
  pageId,
  initialTitle,
  initialSlug,
  initialCraftJson,
  initialPublished,
  initialMeta,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [meta, setMeta] = useState(initialMeta);
  const [craftJson, setCraftJson] = useState<object>(initialCraftJson);
  const [saving, setSaving] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          craftJson,
          isPublished,
          ...meta,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push("/admin/pages")} className="text-sm text-gray-400 hover:text-gray-600">
          ← Halaman
        </button>
        <div className="flex-1 flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMeta(!showMeta)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            SEO
          </button>
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              isPublished
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {isPublished ? "Published" : "Draft"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Simpan
          </button>
        </div>
      </div>

      {/* SEO Panel */}
      {showMeta && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-2xl grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug URL</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
              <input value={meta.metaTitle} onChange={(e) => setMeta({ ...meta, metaTitle: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
              <input value={meta.metaDescription} onChange={(e) => setMeta({ ...meta, metaDescription: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <CraftEditor initialJson={craftJson} onChange={setCraftJson} />
      </div>
    </div>
  );
}
