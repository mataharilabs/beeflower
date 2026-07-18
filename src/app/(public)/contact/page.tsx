import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { HeroProps, Block } from "@/types/pageBlocks";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us - Bee & Flower Brand",
  description:
    "Hubungi kami untuk informasi produk, pemesanan, atau kerja sama reseller.",
};

export default async function ContactPage() {
  const [settings, contactPage] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.page.findUnique({ where: { slug: "contact" } }).catch(() => null),
  ]);

  const blocks: Block[] = ((contactPage?.craftJson as { blocks?: Block[] })?.blocks) ?? [];
  const heroBlock = blocks.find((b) => b.type === "Hero");
  const heroProps = heroBlock?.props as HeroProps | undefined;

  const heroHeadline = heroProps?.headline || "Hubungi Kami";
  const heroSubheadline =
    heroProps?.subheadline || "Kami siap membantu kebutuhan informasi produk maupun kerja sama reseller.";

  const heroBgStyle = getBlockBgStyle(heroProps ?? {});
  const heroShowOverlay = shouldShowOverlay(heroProps ?? {});
  const heroOverlayStyle = getOverlayStyle(heroProps ?? {});

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[300px] lg:min-h-[380px] overflow-hidden bg-brand-cream flex items-center" style={heroBgStyle}>
        {heroShowOverlay && (
          <div className="absolute inset-0 pointer-events-none" style={heroOverlayStyle} />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
          <div className="max-w-xl">
            <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-3">
              Contact Us
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-brand-brown leading-tight mb-4">
              {heroHeadline}
            </h1>
            <p className="text-brand-brown/60 text-base leading-relaxed max-w-sm">
              {heroSubheadline}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info Card */}
            <div className="border border-brand-beige/30 rounded-2xl p-6 lg:p-8">
              <h2 className="font-bold text-brand-brown text-center tracking-widest uppercase text-sm mb-8">
                Informasi Kontak
              </h2>

              <div className="space-y-6">
                {settings?.whatsapp && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">WhatsApp</p>
                      <a
                        href={`https://wa.me/${settings.whatsapp}`}
                        className="text-brand-brown/70 text-sm hover:text-brand-gold transition-colors"
                      >
                        {settings.whatsapp.replace("62", "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3")}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">E-mail</p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-brand-brown/70 text-sm hover:text-brand-gold transition-colors"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">Alamat</p>
                      <p className="text-brand-brown/70 text-sm whitespace-pre-line">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {settings?.businessHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm mb-1">
                        Jam Operasional
                      </p>
                      <p className="text-brand-brown/70 text-sm whitespace-pre-line leading-relaxed">
                        {settings.businessHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="border border-brand-beige/30 rounded-2xl p-6 lg:p-8">
              <h2 className="font-bold text-brand-brown text-center tracking-widest uppercase text-sm mb-8">
                Formulir Kontak
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      {settings?.googleMapsEmbed && (
        <section className="h-[400px] w-full overflow-hidden">
          <iframe
            src={settings.googleMapsEmbed}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Bee & Flower Brand"
          />
        </section>
      )}
    </>
  );
}
