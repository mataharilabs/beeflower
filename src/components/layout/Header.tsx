"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const DEFAULT_NAV = [
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
}

interface HeaderProps {
  logoUrl?: string | null;
  siteName?: string | null;
  navLinks?: NavLink[];
  ctaButton?: NavLink | null;
}

export function Header({ logoUrl, siteName, navLinks, ctaButton }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const cartCount = totalItems();

  const links = navLinks ?? DEFAULT_NAV;
  const cta = ctaButton ?? DEFAULT_CTA;

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
                width={240}
                height={96}
                quality={100}
                className="h-12 w-auto object-contain"
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
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors",
                  pathname === link.href
                    ? "text-brand-gold border-b-2 border-brand-gold pb-0.5"
                    : "text-brand-brown hover:text-brand-gold"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={cta.href}
              target={cta.newTab ? "_blank" : undefined}
              rel={cta.newTab ? "noopener noreferrer" : undefined}
              className="hidden lg:inline-flex items-center px-5 py-2.5 bg-brand-gold text-white text-sm font-semibold rounded tracking-wide hover:bg-brand-brown transition-colors"
            >
              {cta.label}
            </Link>

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
              {links.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    pathname === link.href
                      ? "bg-brand-cream text-brand-gold"
                      : "text-brand-brown hover:bg-brand-cream hover:text-brand-gold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
