"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact-messages")
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/contact-messages/${id}`, { method: "PATCH", body: JSON.stringify({ isRead: true }), headers: { "Content-Type": "application/json" } });
    setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, isRead: true } : msg));
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-sm text-gray-400">{messages.filter((m) => !m.isRead).length} belum dibaca</p>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[600px]">
        {/* Message List */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Memuat...</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Belum ada pesan</div>
          )}
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                selected?.id === msg.id ? "bg-brand-cream" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.isRead ? (
                  <MailOpen className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                ) : (
                  <Mail className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm truncate ${msg.isRead ? "text-gray-600" : "font-semibold text-gray-900"}`}>
                    {msg.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{msg.message.slice(0, 50)}...</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(msg.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Message Detail */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Pilih pesan untuk melihat isi
            </div>
          ) : (
            <div>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.email}</p>
                {selected.phone && <p className="text-sm text-gray-500">{selected.phone}</p>}
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(selected.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
                >
                  Balas via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
