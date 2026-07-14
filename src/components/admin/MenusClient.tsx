"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, X, Check } from "lucide-react";

type NavLocation = "HEADER_NAV" | "HEADER_CTA" | "FOOTER_MAIN" | "FOOTER_INFO";

interface NavItem {
  id: string;
  label: string;
  href: string;
  location: NavLocation;
  newTab: boolean;
  order: number;
  isActive: boolean;
}

type FormState = {
  label: string;
  href: string;
  newTab: boolean;
  isActive: boolean;
};

const EMPTY_FORM: FormState = { label: "", href: "", newTab: false, isActive: true };

const TABS: { key: NavLocation; label: string; note?: string }[] = [
  { key: "HEADER_NAV", label: "Header Nav" },
  { key: "HEADER_CTA", label: "Header CTA", note: "Hanya item pertama yang aktif dipakai sebagai tombol CTA" },
  { key: "FOOTER_MAIN", label: "Footer Menu" },
  { key: "FOOTER_INFO", label: "Footer Info" },
];

export function MenusClient({ initialItems }: { initialItems: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<NavLocation>("HEADER_NAV");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const tabItems = items.filter((i) => i.location === activeTab);
  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  const startEdit = (item: NavItem) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, href: item.href, newTab: item.newTab, isActive: item.isActive });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const saveEdit = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        setEditingId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Hapus item menu ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item: NavItem) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!addForm.label || !addForm.href) return;
    setLoading(true);
    try {
      const order = tabItems.length;
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, location: activeTab, order }),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        setAddForm(EMPTY_FORM);
        setShowAddForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (item: NavItem, direction: "up" | "down") => {
    const sorted = [...tabItems].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapItem = sorted[swapIdx];
    setLoading(true);
    try {
      await Promise.all([
        fetch(`/api/menus/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: swapItem.order }),
        }),
        fetch(`/api/menus/${swapItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: item.order }),
        }),
      ]);
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === item.id) return { ...i, order: swapItem.order };
          if (i.id === swapItem.id) return { ...i, order: item.order };
          return i;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setEditingId(null);
              setShowAddForm(false);
              setAddForm(EMPTY_FORM);
            }}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-brand-gold border-b-2 border-brand-gold bg-brand-cream/30"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">
              ({items.filter((i) => i.location === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTabInfo.note && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            ℹ️ {activeTabInfo.note}
          </p>
        )}

        {/* Item List */}
        <div className="space-y-2 mb-4">
          {[...tabItems].sort((a, b) => a.order - b.order).map((item, idx) => (
            <div
              key={item.id}
              className={`border rounded-lg ${item.isActive ? "border-gray-200" : "border-gray-100 opacity-50"}`}
            >
              {editingId === item.id ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input
                        value={editForm.label}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                      <input
                        value={editForm.href}
                        onChange={(e) => setEditForm({ ...editForm, href: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-brand-gold"
                        placeholder="/halaman atau https://..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.newTab}
                        onChange={(e) => setEditForm({ ...editForm, newTab: e.target.checked })}
                        className="rounded"
                      />
                      Buka di tab baru
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="rounded"
                      />
                      Aktif
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-white text-xs font-medium rounded-md hover:bg-brand-brown transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Simpan
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    <span className="text-xs text-gray-400 truncate">
                      {item.href}
                      {item.newTab && <span className="ml-1 text-brand-gold">↗</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Up/Down */}
                    <button
                      onClick={() => moveItem(item, "up")}
                      disabled={loading || idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                      title="Naikan"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveItem(item, "down")}
                      disabled={loading || idx === tabItems.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                      title="Turunkan"
                    >
                      ↓
                    </button>
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(item)}
                      disabled={loading}
                      className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-brand-gold transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={loading}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm ? (
          <div className="border border-dashed border-brand-gold/40 rounded-lg p-4 bg-brand-cream/20 space-y-3">
            <p className="text-xs font-medium text-gray-600">Item Baru</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                <input
                  value={addForm.label}
                  onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                  placeholder="Nama menu"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                <input
                  value={addForm.href}
                  onChange={(e) => setAddForm({ ...addForm, href: e.target.value })}
                  placeholder="/halaman atau https://..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.newTab}
                  onChange={(e) => setAddForm({ ...addForm, newTab: e.target.checked })}
                  className="rounded"
                />
                Buka di tab baru
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addItem}
                disabled={loading || !addForm.label || !addForm.href}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-white text-xs font-medium rounded-md hover:bg-brand-brown transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Tambah
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-brand-gold hover:text-brand-gold transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Tambah Item Menu
          </button>
        )}
      </div>
    </div>
  );
}
