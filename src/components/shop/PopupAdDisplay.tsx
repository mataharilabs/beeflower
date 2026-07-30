"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface PopupData {
  id: string;
  content: string;
  useCookies: boolean;
  cookieDays: number;
  delaySeconds: number;
  width: number;
  height: number | null;
}

interface Props {
  popup: PopupData;
}

const COOKIE_PREFIX = "popup_closed_";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=1; expires=${expires}; path=/; SameSite=Lax`;
}

export function PopupAdDisplay({ popup }: Props) {
  const [visible, setVisible] = useState(false);
  const tracked = useRef(false);

  const show = useCallback(() => {
    if (popup.useCookies && getCookie(COOKIE_PREFIX + popup.id)) return;
    setVisible(true);
    if (!tracked.current) {
      tracked.current = true;
      fetch(`/api/popups/${popup.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view" }),
      }).catch(() => {});
    }
  }, [popup.id, popup.useCookies]);

  useEffect(() => {
    if (popup.delaySeconds > 0) {
      const t = setTimeout(show, popup.delaySeconds * 1000);
      return () => clearTimeout(t);
    } else {
      show();
    }
  }, [show, popup.delaySeconds]);

  const close = () => {
    setVisible(false);
    if (popup.useCookies) {
      setCookie(COOKIE_PREFIX + popup.id, popup.cookieDays);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      fetch(`/api/popups/${popup.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click" }),
      }).catch(() => {});
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          width: `min(${popup.width}px, 100%)`,
          ...(popup.height ? { height: popup.height } : { maxHeight: "90vh" }),
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-gray-500 hover:text-gray-900 rounded-full shadow transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div
          className="overflow-y-auto flex-1 popup-content"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: popup.content }}
        />
      </div>
    </div>
  );
}
