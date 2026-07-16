"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogIn, ChevronDown } from "lucide-react";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const DEFAULT_NAV: NavLink[] = [
  { href: "/", label: "Home", newTab: false },
  { href: "/reseller", label: "Reseller", newTab: false },
  { href: "/toko", label: "Toko Reseller", newTab: false },
  { href: "/contact", label: "Contact", newTab: false },
];

const DEFAULT_CTA = { label: "BELANJA SEKARANG", href: "/toko", newTab: false };

interface NavLink {
  label: string;
  href: string;
  newTab?: boolean;
  children?: NavLink[];
}

interface UserInfo {
  name?: string | null;
  email?: string | null;
  id?: string;
  role?: string;
}

interface HeaderProps {
  logoUrl?: string | null;
  logoWidth?: number | null;
  siteName?: string | null;
  navLinks?: NavLink[];
  ctaButton?: NavLink | null;
  user?: UserInfo | null;
}

export function Header({ logoUrl, logoWidth, siteName, navLinks, ctaButton, user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpenSubmenus, setMobileOpenSubmenus] = useState<Set<string>>(new Set());

  const toggleMobileSubmenu = (key: string) => {
    setMobileOpenSubmenus((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const cartCount = totalItems();

  const links = navLinks ?? DEFAULT_NAV;
  const cta = ctaButton ?? DEFAULT_CTA;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        setLoginError("Email atau password salah");
      } else {
        window.location.href = "/member/orders";
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-beige/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName ?? "Bee & Flower Brand"}
                width={logoWidth ?? 240}
                height={96}
                quality={100}
                className="h-10 lg:h-12 w-auto object-contain"
                style={{ maxWidth: `${logoWidth ?? 240}px` }}
              />
            ) : (
              <span className="font-bold text-xl text-brand-brown tracking-wide leading-tight">
                .BEE <span className="text-brand-gold">&</span>FLOWER BRAND
                <span className="block text-[10px] font-medium tracking-widest text-brand-beige">
                  Since 1928
                </span>
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isActive = pathname === link.href || (hasChildren && link.children!.some((c) => pathname === c.href));
              return hasChildren ? (
                <div key={`${link.href}-${link.label}`} className="relative group">
                  <Link
                    href={link.href}
                    target={link.newTab ? "_blank" : undefined}
                    rel={link.newTab ? "noopener noreferrer" : undefined}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium tracking-wide transition-colors",
                      isActive ? "text-brand-gold" : "text-brand-brown hover:text-brand-gold"
                    )}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="absolute top-full left-0 pt-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                      {link.children!.map((child) => (
                        <Link
                          key={`${child.href}-${child.label}`}
                          href={child.href}
                          target={child.newTab ? "_blank" : undefined}
                          rel={child.newTab ? "noopener noreferrer" : undefined}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            pathname === child.href
                              ? "text-brand-gold bg-brand-cream font-medium"
                              : "text-brand-brown hover:bg-brand-cream hover:text-brand-gold"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors",
                    isActive
                      ? "text-brand-gold border-b-2 border-brand-gold pb-0.5"
                      : "text-brand-brown hover:text-brand-gold"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={cta.href}
              target={cta.newTab ? "_blank" : undefined}
              rel={cta.newTab ? "noopener noreferrer" : undefined}
              className="hidden lg:inline-flex items-center px-5 py-2.5 bg-brand-gold text-white text-sm font-semibold rounded tracking-wide hover:bg-brand-brown transition-colors"
            >
              {cta.label}
            </Link>

            {/* Account dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="relative p-2 text-brand-brown hover:text-brand-gold transition-colors"
                aria-label="Akun"
              >
                {user ? (
                  <div className="w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full pt-1 w-72 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {user ? (
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Halo,</p>
                            <p className="font-semibold text-brand-brown truncate">{user.name}</p>
                          </div>
                        </div>
                        <Link
                          href="/member"
                          onClick={() => setAccountOpen(false)}
                          className="block px-3 py-2 text-sm text-brand-brown hover:bg-brand-cream rounded-lg mb-1"
                        >
                          Area Member
                        </Link>
                        <Link
                          href="/member/orders"
                          onClick={() => setAccountOpen(false)}
                          className="block px-3 py-2 text-sm text-brand-brown hover:bg-brand-cream rounded-lg mb-2"
                        >
                          Pesanan Saya
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}
                          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Keluar
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleLogin} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <LogIn className="w-4 h-4 text-brand-gold" />
                          <p className="font-semibold text-brand-brown text-sm">Masuk ke Akun</p>
                        </div>
                        {loginError && (
                          <p className="text-xs text-red-500 mb-2 bg-red-50 px-2 py-1.5 rounded-lg">{loginError}</p>
                        )}
                        <div className="space-y-2 mb-3">
                          <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="w-full py-2 bg-brand-gold text-white text-sm font-semibold rounded-lg hover:bg-brand-brown transition-colors disabled:opacity-60"
                        >
                          {loginLoading ? "..." : "Masuk"}
                        </button>
                        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                          <Link
                            href="/login"
                            onClick={() => setAccountOpen(false)}
                            className="text-xs text-brand-beige hover:text-brand-gold transition-colors"
                          >
                            Halaman Login lengkap →
                          </Link>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-brand-brown hover:text-brand-gold transition-colors"
              aria-label="Keranjang belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-brand-brown hover:text-brand-gold transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-brand-beige/30 py-4">
            <nav className="flex flex-col gap-1">
              {links.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const key = `${link.href}-${link.label}`;
                const isOpen = mobileOpenSubmenus.has(key);
                const isActive = pathname === link.href || (hasChildren && link.children!.some((c) => pathname === c.href));
                return (
                  <div key={key}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.newTab ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex-1 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-brand-cream text-brand-gold"
                            : "text-brand-brown hover:bg-brand-cream hover:text-brand-gold"
                        )}
                      >
                        {link.label}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleMobileSubmenu(key)}
                          className="p-2 text-brand-brown hover:text-brand-gold transition-colors"
                        >
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    {hasChildren && isOpen && (
                      <div className="ml-4 pl-3 border-l-2 border-brand-gold/20 mt-1 mb-1 flex flex-col gap-0.5">
                        {link.children!.map((child) => (
                          <Link
                            key={`${child.href}-${child.label}`}
                            href={child.href}
                            target={child.newTab ? "_blank" : undefined}
                            rel={child.newTab ? "noopener noreferrer" : undefined}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "px-3 py-2 text-sm rounded-md transition-colors",
                              pathname === child.href
                                ? "text-brand-gold bg-brand-cream"
                                : "text-brand-brown hover:bg-brand-cream hover:text-brand-gold"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {user ? (
                <>
                  <Link
                    href="/member"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium rounded-md text-brand-brown hover:bg-brand-cream hover:text-brand-gold transition-colors"
                  >
                    Area Member ({user.name})
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-md text-brand-brown hover:bg-brand-cream hover:text-brand-gold transition-colors"
                >
                  Masuk
                </Link>
              )}
              <Link
                href={cta.href}
                target={cta.newTab ? "_blank" : undefined}
                rel={cta.newTab ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className="mt-2 mx-3 text-center px-5 py-2.5 bg-brand-gold text-white text-sm font-semibold rounded tracking-wide"
              >
                {cta.label}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
