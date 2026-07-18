"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Trash2, Plus, ChevronDown, ChevronUp,
  Image as ImageIcon, AlignLeft, Grid, HelpCircle, Zap, LayoutGrid, Minus,
} from "lucide-react";
import { Block, BlockType, PageDocument, defaultProps, HeroProps, TextBlockProps, ImageTextProps, CTABannerProps, FAQSectionProps, FeatureIconsProps, SpacerProps, ProductGridProps } from "@/types/pageBlocks";
import { ImageUploader } from "./ImageUploader";

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "Hero", label: "Hero Banner", icon: <ImageIcon className="w-4 h-4" /> },
  { type: "TextBlock", label: "Teks", icon: <AlignLeft className="w-4 h-4" /> },
  { type: "ImageText", label: "Gambar + Teks", icon: <LayoutGrid className="w-4 h-4" /> },
  { type: "CTABanner", label: "CTA Banner", icon: <Zap className="w-4 h-4" /> },
  { type: "ProductGrid", label: "Grid Produk", icon: <Grid className="w-4 h-4" /> },
  { type: "FAQSection", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
  { type: "FeatureIcons", label: "Feature Icons", icon: <LayoutGrid className="w-4 h-4" /> },
  { type: "Spacer", label: "Spacer", icon: <Minus className="w-4 h-4" /> },
];

interface Props {
  initialJson: object;
  onChange: (json: object) => void;
}

function parseDocument(json: object): Block[] {
  const doc = json as PageDocument;
  return Array.isArray(doc?.blocks) ? doc.blocks : [];
}

export default function CraftEditor({ initialJson, onChange }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseDocument(initialJson));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const update = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange({ blocks: newBlocks });
  }, [onChange]);

  const addBlock = (type: BlockType) => {
    const block: Block = {
      id: nanoid(),
      type,
      props: { ...defaultProps[type] } as any,
    };
    const newBlocks = [...blocks, block];
    update(newBlocks);
    setSelectedId(block.id);
  };

  const removeBlock = (id: string) => {
    update(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateProps = (id: string, props: object) => {
    update(blocks.map((b) => b.id === id ? { ...b, props: { ...b.props, ...props } as any } : b));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = blocks.findIndex((b) => b.id === active.id);
      const newIdx = blocks.findIndex((b) => b.id === over.id);
      update(arrayMove(blocks, oldIdx, newIdx));
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Left: Block Palette */}
      <div className="w-48 bg-white border-r border-gray-200 p-3 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Blok</p>
        <div className="space-y-1">
          {BLOCK_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-brand-cream hover:text-brand-brown transition-colors text-left"
            >
              {icon}
              <span className="truncate">{label}</span>
              <Plus className="w-3 h-3 ml-auto shrink-0 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {blocks.length === 0 && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
            Klik blok di kiri untuk menambahkan konten
          </div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedId === block.id}
                  onSelect={() => setSelectedId(block.id === selectedId ? null : block.id)}
                  onRemove={() => removeBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Right: Properties Panel */}
      <div className="w-72 bg-white border-l border-gray-200 p-4 shrink-0 overflow-y-auto">
        {!selectedBlock ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            Pilih blok untuk mengedit propertinya
          </div>
        ) : (
          <BlockPropsEditor block={selectedBlock} onUpdate={(props) => updateProps(selectedBlock.id, props)} />
        )}
      </div>
    </div>
  );
}

function SortableBlock({
  block, isSelected, onSelect, onRemove,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const BLOCK_LABELS: Record<BlockType, string> = {
    Hero: "Hero Banner", TextBlock: "Teks", ImageText: "Gambar + Teks",
    CTABanner: "CTA Banner", ProductGrid: "Grid Produk", FAQSection: "FAQ",
    FeatureIcons: "Feature Icons", Spacer: "Spacer",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 bg-white rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
        isSelected ? "border-brand-gold shadow-sm" : "border-transparent hover:border-gray-200"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">{BLOCK_LABELS[block.type]}</p>
        <p className="text-xs text-gray-400 truncate">
          {(block.props as any).headline ?? (block.props as any).content?.slice(0, 40) ?? block.type}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function BackgroundSection({ props, onUpdate }: { props: any; onUpdate: (p: object) => void }) {
  const bgType = props.bgType ?? "color";
  const overlayEnabled = props.overlayEnabled ?? false;

  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Background</p>

      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => onUpdate({ bgType: "color" })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${bgType === "color" ? "bg-brand-gold text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          Warna
        </button>
        <button
          onClick={() => onUpdate({ bgType: "image" })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${bgType === "image" ? "bg-brand-gold text-white" : "text-gray-600 hover:bg-gray-50"}`}
        >
          Gambar
        </button>
      </div>

      {bgType === "color" ? (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Warna Background</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.bgColor || "#ffffff"}
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
            />
            <input
              value={props.bgColor ?? ""}
              placeholder="#ffffff"
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gambar Background</label>
            <ImageUploader value={props.bgImage ?? ""} onChange={(url) => onUpdate({ bgImage: url })} folder="beeflower/pages" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ukuran Gambar</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {([
                { value: "cover", label: "Penuh" },
                { value: "contain", label: "Fit" },
                { value: "original", label: "Original" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({ bgImageFit: value })}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${(props.bgImageFit ?? "cover") === value ? "bg-brand-gold text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Posisi Gambar</label>
            <div className="grid grid-cols-3 gap-1 w-24">
              {([
                { value: "top left",     dot: "rounded-tl-lg" },
                { value: "top center",   dot: "" },
                { value: "top right",    dot: "rounded-tr-lg" },
                { value: "center left",  dot: "" },
                { value: "center",       dot: "" },
                { value: "center right", dot: "" },
                { value: "bottom left",  dot: "rounded-bl-lg" },
                { value: "bottom center",dot: "" },
                { value: "bottom right", dot: "rounded-br-lg" },
              ] as const).map(({ value }) => {
                const active = (props.bgImagePosition ?? "center") === value;
                return (
                  <button
                    key={value}
                    title={value}
                    onClick={() => onUpdate({ bgImagePosition: value })}
                    className={`w-7 h-7 flex items-center justify-center border rounded transition-colors ${active ? "bg-brand-gold border-brand-gold" : "border-gray-200 hover:border-brand-gold/50"}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-gray-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={overlayEnabled}
            onChange={(e) => onUpdate({ overlayEnabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-600">Aktifkan Overlay</span>
        </label>

        {overlayEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-brand-gold/20">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warna Overlay</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={props.overlayColor ?? "#000000"}
                  onChange={(e) => onUpdate({ overlayColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  value={props.overlayColor ?? "#000000"}
                  onChange={(e) => onUpdate({ overlayColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Transparansi Overlay: {props.overlayOpacity ?? 40}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={props.overlayOpacity ?? 40}
                onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
                className="w-full accent-brand-gold"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorPickerRow({ label, propKey, props, onUpdate, defaultColor = "#000000" }: {
  label: string; propKey: string; props: any; onUpdate: (p: object) => void; defaultColor?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={props[propKey] || defaultColor}
          onChange={(e) => onUpdate({ [propKey]: e.target.value })}
          className="w-8 h-8 rounded border border-gray-200 cursor-pointer flex-shrink-0"
        />
        <input
          value={props[propKey] ?? ""}
          placeholder="Default"
          onChange={(e) => onUpdate({ [propKey]: e.target.value })}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:border-brand-gold min-w-0"
        />
        {props[propKey] && (
          <button onClick={() => onUpdate({ [propKey]: "" })} className="text-gray-300 hover:text-red-500 flex-shrink-0 text-xs">✕</button>
        )}
      </div>
    </div>
  );
}

function TextColorSection({ props, onUpdate, fields }: {
  props: any; onUpdate: (p: object) => void; fields: { key: string; label: string }[];
}) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Warna Teks</p>
      {fields.map(({ key, label }) => (
        <ColorPickerRow key={key} label={label} propKey={key} props={props} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function ButtonColorSection({ props, onUpdate }: { props: any; onUpdate: (p: object) => void }) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Warna Tombol</p>
      <ColorPickerRow label="Background Tombol" propKey="buttonBgColor" props={props} onUpdate={onUpdate} defaultColor="#AF8442" />
      <ColorPickerRow label="Warna Teks Tombol" propKey="buttonTextColor" props={props} onUpdate={onUpdate} defaultColor="#ffffff" />
    </div>
  );
}

function BlockPropsEditor({ block, onUpdate }: { block: Block; onUpdate: (props: object) => void }) {
  const p = block.props as any;

  const field = (key: string, label: string, type: "text" | "textarea" | "url" = "text") => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={p[key] ?? ""}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          rows={3}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold resize-none"
        />
      ) : (
        <input
          type={type}
          value={p[key] ?? ""}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold"
        />
      )}
    </div>
  );

  const imageField = (key: string, label: string) => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <ImageUploader value={p[key] ?? ""} onChange={(url) => onUpdate({ [key]: url })} folder="beeflower/pages" />
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-900">{block.type}</p>

      {block.type === "Hero" && (
        <>
          {field("headline", "Judul")}
          {field("subheadline", "Sub Judul", "textarea")}
          {field("buttonText", "Teks Tombol")}
          {field("buttonLink", "Link Tombol", "url")}
          <TextColorSection props={p} onUpdate={onUpdate} fields={[
            { key: "headlineColor", label: "Warna Judul" },
            { key: "subheadlineColor", label: "Warna Sub Judul" },
          ]} />
          <ButtonColorSection props={p} onUpdate={onUpdate} />
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "TextBlock" && (
        <>
          {field("content", "Konten", "textarea")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
            <select value={p.align ?? "left"} onChange={(e) => onUpdate({ align: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold">
              <option value="left">Kiri</option>
              <option value="center">Tengah</option>
              <option value="right">Kanan</option>
            </select>
          </div>
          <TextColorSection props={p} onUpdate={onUpdate} fields={[{ key: "contentColor", label: "Warna Konten" }]} />
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "ImageText" && (
        <>
          {field("headline", "Judul")}
          {field("content", "Konten", "textarea")}
          {imageField("imageUrl", "Gambar")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Posisi Gambar</label>
            <select value={p.imagePosition ?? "left"} onChange={(e) => onUpdate({ imagePosition: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold">
              <option value="left">Kiri</option>
              <option value="right">Kanan</option>
            </select>
          </div>
          {field("buttonText", "Teks Tombol")}
          {field("buttonLink", "Link Tombol", "url")}
          <TextColorSection props={p} onUpdate={onUpdate} fields={[
            { key: "headlineColor", label: "Warna Judul" },
            { key: "contentColor", label: "Warna Konten" },
          ]} />
          <ButtonColorSection props={p} onUpdate={onUpdate} />
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "CTABanner" && (
        <>
          {field("headline", "Judul")}
          {field("subheadline", "Sub Judul")}
          {field("buttonText", "Teks Tombol")}
          {field("buttonLink", "Link Tombol", "url")}
          <TextColorSection props={p} onUpdate={onUpdate} fields={[
            { key: "headlineColor", label: "Warna Judul" },
            { key: "subheadlineColor", label: "Warna Sub Judul" },
          ]} />
          <ButtonColorSection props={p} onUpdate={onUpdate} />
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "ProductGrid" && (
        <>
          {field("headline", "Judul Section")}
          {field("categorySlug", "Slug Kategori (kosongkan = semua)")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Produk</label>
            <input type="number" min={1} max={12} value={p.count ?? 4} onChange={(e) => onUpdate({ count: parseInt(e.target.value) })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
          </div>
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "FAQSection" && (
        <>
          {field("headline", "Judul Section")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Item FAQ</label>
            <div className="space-y-3">
              {(p.items ?? []).map((item: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <input value={item.question} placeholder="Pertanyaan"
                    onChange={(e) => {
                      const items = [...(p.items ?? [])];
                      items[i] = { ...items[i], question: e.target.value };
                      onUpdate({ items });
                    }}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold" />
                  <textarea value={item.answer} placeholder="Jawaban" rows={2}
                    onChange={(e) => {
                      const items = [...(p.items ?? [])];
                      items[i] = { ...items[i], answer: e.target.value };
                      onUpdate({ items });
                    }}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold resize-none" />
                  <button onClick={() => {
                    const items = (p.items ?? []).filter((_: any, j: number) => j !== i);
                    onUpdate({ items });
                  }} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                </div>
              ))}
            </div>
            <button onClick={() => onUpdate({ items: [...(p.items ?? []), { question: "", answer: "" }] })}
              className="mt-2 flex items-center gap-1 text-xs text-brand-gold hover:text-brand-brown">
              <Plus className="w-3 h-3" /> Tambah FAQ
            </button>
          </div>
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "FeatureIcons" && (
        <>
          {field("headline", "Judul Section")}
          <TextColorSection props={p} onUpdate={onUpdate} fields={[
            { key: "headlineColor", label: "Warna Judul Section" },
            { key: "itemTitleColor", label: "Warna Judul Item" },
            { key: "itemDescColor", label: "Warna Deskripsi Item" },
          ]} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Item</label>
            <div className="space-y-3">
              {(p.items ?? []).map((item: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <input value={item.title} placeholder="Judul"
                    onChange={(e) => {
                      const items = [...(p.items ?? [])];
                      items[i] = { ...items[i], title: e.target.value };
                      onUpdate({ items });
                    }}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold" />
                  <textarea value={item.description} placeholder="Deskripsi" rows={2}
                    onChange={(e) => {
                      const items = [...(p.items ?? [])];
                      items[i] = { ...items[i], description: e.target.value };
                      onUpdate({ items });
                    }}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold resize-none" />
                  <button onClick={() => {
                    const items = (p.items ?? []).filter((_: any, j: number) => j !== i);
                    onUpdate({ items });
                  }} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                </div>
              ))}
            </div>
            <button onClick={() => onUpdate({ items: [...(p.items ?? []), { icon: "Star", title: "", description: "" }] })}
              className="mt-2 flex items-center gap-1 text-xs text-brand-gold hover:text-brand-brown">
              <Plus className="w-3 h-3" /> Tambah Item
            </button>
          </div>
          <BackgroundSection props={p} onUpdate={onUpdate} />
        </>
      )}

      {block.type === "Spacer" && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tinggi (px)</label>
          <input type="number" min={8} max={200} step={8} value={p.height ?? 40}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
        </div>
      )}
    </div>
  );
}
