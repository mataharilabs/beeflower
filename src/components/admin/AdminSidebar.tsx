"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  LayoutList,
  Store,
  Tag,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/banners", icon: ImageIcon, label: "Banner" },
  { href: "/admin/menus", icon: LayoutList, label: "Menus" },
  { href: "/admin/pages", icon: FileText, label: "Pages" },
  { href: "/admin/reseller-stores", icon: Store, label: "Toko Reseller" },
  { href: "/admin/categories", icon: Tag, label: "Kategori" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/payment-proof", icon: CreditCard, label: "Bukti Transfer" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/contact-messages", icon: MessageSquare, label: "Pesan" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminSidebarProps {
  onClose?: () => void;
  logoUrl?: string | null;
  logoWidth?: number | null;
  siteName?: string | null;
}

export function AdminSidebar({ onClose, logoUrl, logoWidth, siteName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-brown text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-2">
        <Link href="/admin" onClick={onClose}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName ?? "Admin Panel"}
              width={logoWidth ?? 160}
              height={48}
              quality={100}
              className="h-9 w-auto object-contain brightness-0 invert"
              style={{ maxWidth: `${Math.min(logoWidth ?? 160, 160)}px` }}
            />
          ) : (
            <span className="font-bold text-sm tracking-wide leading-tight">
              .BEE <span className="text-brand-gold">&</span>FLOWER
              <span className="block text-[10px] font-medium tracking-widest text-brand-beige mt-0.5">
                Admin Panel
              </span>
            </span>
          )}
        </Link>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-brand-beige hover:text-white transition-colors flex-shrink-0"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-brand-gold text-white"
                  : "text-brand-beige hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-xs text-brand-beige hover:text-white transition-colors"
        >
          Lihat Website →
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-beige hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
