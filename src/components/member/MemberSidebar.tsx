"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Package, Settings, LogOut, ChevronRight } from "lucide-react";

interface Props {
  userName?: string | null;
  userEmail?: string | null;
}

const MENU = [
  { href: "/member/orders", label: "Pesanan Saya", icon: Package },
  { href: "/member/settings", label: "Pengaturan Akun", icon: Settings },
];

export function MemberSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-brand-brown text-white">
          <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-bold mb-2 text-sm">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <p className="font-semibold text-sm truncate">{userName ?? "Member"}</p>
          <p className="text-xs text-white/60 truncate">{userEmail ?? ""}</p>
        </div>
        <nav className="p-2">
          {MENU.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${
                  isActive
                    ? "bg-brand-cream text-brand-brown font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-gold" />}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-500 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
